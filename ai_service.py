import openai
import os
import json
from typing import List, Dict
import requests

class AITaskBreakdown:
    def __init__(self):
        # Try to use OpenAI API if available, otherwise use a simple fallback
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
            self.use_openai = True
        else:
            self.use_openai = False
            print("Warning: No OpenAI API key found. Using fallback task breakdown.")

    def breakdown_task(self, task_title: str, task_description: str = "") -> List[Dict]:
        """
        Break down a main task into micro-tasks that help achieve 1% improvement daily
        """
        if self.use_openai:
            return self._breakdown_with_openai(task_title, task_description)
        else:
            return self._fallback_breakdown(task_title, task_description)

    def _breakdown_with_openai(self, task_title: str, task_description: str) -> List[Dict]:
        """Use OpenAI to intelligently break down tasks"""
        
        prompt = f"""
        You are a productivity expert who specializes in breaking down large tasks into small, manageable micro-tasks that promote daily 1% improvement.

        Task: {task_title}
        Description: {task_description}

        Please break this down into 3-7 micro-tasks that:
        1. Are small enough to complete in 15-30 minutes each
        2. Build momentum and create a sense of progress
        3. Are concrete and actionable (not vague)
        4. Follow a logical sequence when possible
        5. Help achieve 1% improvement toward the main goal

        Return the response as a JSON array with each micro-task having:
        - title: Clear, action-oriented title
        - description: Brief explanation of what to do
        - estimated_minutes: Time estimate (15-30 minutes)

        Example format:
        [
            {{
                "title": "Research the topic for 20 minutes",
                "description": "Gather basic information and create a simple outline",
                "estimated_minutes": 20
            }},
            {{
                "title": "Create initial draft structure",
                "description": "Set up the basic framework or outline",
                "estimated_minutes": 15
            }}
        ]
        """

        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful productivity assistant that breaks down tasks into micro-tasks. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=800,
                temperature=0.7
            )
            
            content = response.choices[0].message.content.strip()
            
            # Try to parse the JSON response
            try:
                micro_tasks = json.loads(content)
                return micro_tasks
            except json.JSONDecodeError:
                # If JSON parsing fails, use fallback
                return self._fallback_breakdown(task_title, task_description)
                
        except Exception as e:
            print(f"OpenAI API error: {e}")
            return self._fallback_breakdown(task_title, task_description)

    def _fallback_breakdown(self, task_title: str, task_description: str) -> List[Dict]:
        """
        Fallback method to break down tasks without AI
        Creates generic but useful micro-tasks
        """
        
        # Determine task type and create appropriate breakdown
        task_lower = task_title.lower()
        
        if any(word in task_lower for word in ['learn', 'study', 'research']):
            return self._learning_breakdown(task_title)
        elif any(word in task_lower for word in ['write', 'blog', 'article', 'document']):
            return self._writing_breakdown(task_title)
        elif any(word in task_lower for word in ['project', 'build', 'create', 'develop']):
            return self._project_breakdown(task_title)
        elif any(word in task_lower for word in ['organize', 'clean', 'declutter']):
            return self._organization_breakdown(task_title)
        elif any(word in task_lower for word in ['exercise', 'workout', 'fitness', 'health']):
            return self._fitness_breakdown(task_title)
        else:
            return self._generic_breakdown(task_title)

    def _learning_breakdown(self, task_title: str) -> List[Dict]:
        return [
            {"title": "Research and gather resources", "description": "Find 3-5 reliable sources or materials", "estimated_minutes": 20},
            {"title": "Create learning outline", "description": "Break down what you need to learn into topics", "estimated_minutes": 15},
            {"title": "Study first topic", "description": "Focus on the first major concept or section", "estimated_minutes": 25},
            {"title": "Take notes and summarize", "description": "Write down key points and create a summary", "estimated_minutes": 15},
            {"title": "Practice or apply knowledge", "description": "Do exercises or find ways to apply what you learned", "estimated_minutes": 20}
        ]

    def _writing_breakdown(self, task_title: str) -> List[Dict]:
        return [
            {"title": "Brainstorm and outline", "description": "Create a rough structure and key points", "estimated_minutes": 20},
            {"title": "Research supporting information", "description": "Gather facts, quotes, or references needed", "estimated_minutes": 25},
            {"title": "Write first draft", "description": "Focus on getting ideas down, don't worry about perfection", "estimated_minutes": 30},
            {"title": "Review and edit", "description": "Read through and make improvements", "estimated_minutes": 20},
            {"title": "Final polish", "description": "Check grammar, formatting, and final touches", "estimated_minutes": 15}
        ]

    def _project_breakdown(self, task_title: str) -> List[Dict]:
        return [
            {"title": "Define project scope", "description": "Clearly outline what needs to be accomplished", "estimated_minutes": 15},
            {"title": "Create project plan", "description": "Break down major milestones and dependencies", "estimated_minutes": 25},
            {"title": "Set up workspace/tools", "description": "Prepare environment and gather necessary tools", "estimated_minutes": 20},
            {"title": "Start first milestone", "description": "Begin work on the first major component", "estimated_minutes": 30},
            {"title": "Review and adjust plan", "description": "Assess progress and modify approach if needed", "estimated_minutes": 15}
        ]

    def _organization_breakdown(self, task_title: str) -> List[Dict]:
        return [
            {"title": "Assess current state", "description": "Take photos/notes of what needs organizing", "estimated_minutes": 15},
            {"title": "Sort into categories", "description": "Group similar items together", "estimated_minutes": 25},
            {"title": "Decide what to keep", "description": "Use the keep/donate/trash method", "estimated_minutes": 20},
            {"title": "Create organization system", "description": "Set up containers, labels, or storage solutions", "estimated_minutes": 20},
            {"title": "Put everything in place", "description": "Implement the new organization system", "estimated_minutes": 25}
        ]

    def _fitness_breakdown(self, task_title: str) -> List[Dict]:
        return [
            {"title": "Set specific fitness goals", "description": "Define measurable targets and timeline", "estimated_minutes": 15},
            {"title": "Research workout routines", "description": "Find appropriate exercises for your goals", "estimated_minutes": 20},
            {"title": "Plan first workout", "description": "Choose specific exercises and create a routine", "estimated_minutes": 15},
            {"title": "Do initial assessment", "description": "Record baseline measurements or fitness level", "estimated_minutes": 20},
            {"title": "Complete first workout", "description": "Start with a light session to build the habit", "estimated_minutes": 30}
        ]

    def _generic_breakdown(self, task_title: str) -> List[Dict]:
        return [
            {"title": "Plan and research", "description": f"Gather information and create a plan for: {task_title}", "estimated_minutes": 20},
            {"title": "Prepare materials", "description": "Get tools, resources, or materials needed", "estimated_minutes": 15},
            {"title": "Start first step", "description": "Begin the most important or foundational part", "estimated_minutes": 25},
            {"title": "Make initial progress", "description": "Complete the first concrete action or milestone", "estimated_minutes": 25},
            {"title": "Review and plan next steps", "description": "Assess progress and plan the next actions", "estimated_minutes": 15}
        ]