import OpenAI from "openai";
import { addDays, format, parseISO, startOfDay } from "date-fns";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

export type Microtask = {
  id: string;
  date: string; // yyyy-MM-dd
  title: string;
  detail?: string;
};

export type PlanResponse = {
  task: string;
  startDate: string; // yyyy-MM-dd
  days: number;
  microtasks: Microtask[];
};

export const planRequestSchema = z.object({
  task: z.string().min(3, "Task is too short").max(5000),
  days: z.number().int().min(7).max(120).default(30),
  startDate: z
    .string()
    .optional()
    .transform((s) => (s ? format(startOfDay(parseISO(s)), "yyyy-MM-dd") : undefined)),
});

async function tryPlanWithOpenAI(task: string, days: number, start: Date): Promise<Microtask[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const client = new OpenAI({ apiKey });

  // We ask for strict JSON; we will validate with Zod and fall back on failure
  const system =
    "You are an expert planning assistant. Break a user task into SMALL, atomic microtasks that can be done in about 20-40 minutes each, one per day. Return strict JSON only.";
  const user = `Task: ${task}\nDays: ${days}\nStart date (yyyy-MM-dd): ${format(start, "yyyy-MM-dd")}\n\nReturn JSON with an array 'microtasks' of length Days. Each item: { title, detail }. Titles must be imperative and specific.`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const content = completion.choices?.[0]?.message?.content || "";

    const json = JSON.parse(content);
    const arraySchema = z.object({
      microtasks: z
        .array(
          z.object({
            title: z.string().min(1).max(180),
            detail: z.string().optional(),
          })
        )
        .min(days)
        .max(days),
    });

    const parsed = arraySchema.safeParse(json);
    if (!parsed.success) return null;

    const result = parsed.data.microtasks as Array<{ title: string; detail?: string }>;

    return result.map((item, idx) => {
      const date = format(addDays(start, idx), "yyyy-MM-dd");
      return {
        id: uuidv4(),
        date,
        title: item.title,
        detail: item.detail,
      } satisfies Microtask;
    });
  } catch {
    return null;
  }
}

function chunkDays(totalDays: number, weights: number[]): number[] {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (w / totalWeight) * totalDays);
  const floored = raw.map((n) => Math.max(1, Math.floor(n)));
  let sum = floored.reduce((a, b) => a + b, 0);
  // Adjust to match exactly totalDays
  while (sum < totalDays) {
    // increment the largest remainder slot
    let maxIdx = 0;
    let maxRem = -Infinity;
    for (let i = 0; i < raw.length; i++) {
      const rem = raw[i] - floored[i];
      if (rem > maxRem) {
        maxRem = rem;
        maxIdx = i;
      }
    }
    floored[maxIdx] += 1;
    sum += 1;
  }
  while (sum > totalDays) {
    // decrement the smallest remainder slot but keep >=1
    let minIdx = 0;
    let minRem = Infinity;
    for (let i = 0; i < raw.length; i++) {
      const rem = raw[i] - floored[i];
      if (rem < minRem && floored[i] > 1) {
        minRem = rem;
        minIdx = i;
      }
    }
    floored[minIdx] -= 1;
    sum -= 1;
  }
  return floored;
}

function titleCase(text: string): string {
  return text
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function generateFallbackMicrotasks(task: string, days: number, start: Date): Microtask[] {
  // Simple phase-based plan: Discover, Plan, Execute, Review, Iterate
  const phases = [
    { name: "Discover", weight: 1 },
    { name: "Plan", weight: 1 },
    { name: "Execute", weight: 5 },
    { name: "Review", weight: 1 },
    { name: "Iterate", weight: 1 },
  ];

  const daySplits = chunkDays(days, phases.map((p) => p.weight));

  const microtasks: Microtask[] = [];
  let dayIndex = 0;

  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    const count = daySplits[i];
    for (let j = 0; j < count; j++) {
      const date = format(addDays(start, dayIndex), "yyyy-MM-dd");
      let title: string;
      let detail: string | undefined;

      if (phase.name === "Discover") {
        title = `Research: ${task}`;
        detail = "Scan resources, gather examples, and note constraints (20-30 min).";
      } else if (phase.name === "Plan") {
        title = `Outline plan for: ${task}`;
        detail = "Draft milestones, risks, and success criteria (20-30 min).";
      } else if (phase.name === "Execute") {
        title = `Execute small step toward: ${task}`;
        detail = "Ship one small, testable improvement (20-40 min).";
      } else if (phase.name === "Review") {
        title = `Review progress on: ${task}`;
        detail = "Assess outcomes, note learnings, and backlog next steps (20-30 min).";
      } else {
        title = `Iterate: ${task}`;
        detail = "Refine or expand on a previous step; aim for 1% improvement (20-30 min).";
      }

      microtasks.push({ id: uuidv4(), date, title: titleCase(title), detail });
      dayIndex += 1;
    }
  }

  // Ensure exact days by trimming or padding execute tasks
  if (microtasks.length > days) {
    return microtasks.slice(0, days);
  }
  while (microtasks.length < days) {
    const date = format(addDays(start, microtasks.length), "yyyy-MM-dd");
    microtasks.push({
      id: uuidv4(),
      date,
      title: `Execute incremental step: ${task}`,
      detail: "Complete a tiny, verifiable improvement (20-30 min).",
    });
  }

  return microtasks;
}

export async function planMicrotasks(input: z.infer<typeof planRequestSchema>): Promise<PlanResponse> {
  const parsed = planRequestSchema.parse(input);
  const start = parsed.startDate ? startOfDay(parseISO(parsed.startDate)) : startOfDay(new Date());

  // Try OpenAI first, then fallback
  const ai = await tryPlanWithOpenAI(parsed.task, parsed.days, start);
  const microtasks = ai ?? generateFallbackMicrotasks(parsed.task, parsed.days, start);

  return {
    task: parsed.task,
    startDate: format(start, "yyyy-MM-dd"),
    days: parsed.days,
    microtasks,
  };
}