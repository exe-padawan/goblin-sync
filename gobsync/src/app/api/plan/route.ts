import { NextRequest, NextResponse } from "next/server";
import { planMicrotasks, planRequestSchema } from "@/lib/planner";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = planRequestSchema.parse(body);

    const plan = await planMicrotasks(parsed);
    return NextResponse.json(plan, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}