#!/usr/bin/env python3
"""
GobSync Demo Script
Demonstrates the AI-powered task breakdown functionality
"""

import requests
import json
import time
from datetime import date

API_BASE = "http://localhost:5000/api"

def demo_gobsync():
    print("🧠 GobSync Demo - AI-Powered Task Breakdown")
    print("=" * 50)
    
    # Check initial dashboard
    print("\n1. Initial Dashboard State:")
    response = requests.get(f"{API_BASE}/dashboard")
    dashboard = response.json()
    print(f"   📊 Total Tasks: {dashboard['total_tasks']}")
    print(f"   ✅ Completed Today: {dashboard['completed_today']}")
    print(f"   📈 Progress: {dashboard['progress_percentage']:.1f}%")
    
    # Create sample tasks
    sample_tasks = [
        {
            "title": "Start exercising regularly",
            "description": "I want to build a sustainable exercise habit and improve my fitness"
        },
        {
            "title": "Write a technical blog post",
            "description": "Create a comprehensive guide about Python web development"
        },
        {
            "title": "Organize my home office",
            "description": "Clean up and organize my workspace for better productivity"
        }
    ]
    
    print("\n2. Creating Tasks with AI Breakdown:")
    created_tasks = []
    
    for i, task_data in enumerate(sample_tasks, 1):
        print(f"\n   🎯 Task {i}: {task_data['title']}")
        response = requests.post(f"{API_BASE}/tasks", json=task_data)
        
        if response.status_code == 201:
            task = response.json()
            created_tasks.append(task)
            print(f"   ✅ Created successfully (ID: {task['id']})")
        else:
            print(f"   ❌ Failed to create task")
        
        time.sleep(0.5)  # Brief pause for demo effect
    
    # Show breakdown results
    print("\n3. AI-Generated Micro-Tasks:")
    response = requests.get(f"{API_BASE}/tasks")
    all_tasks = response.json()
    
    for task in all_tasks:
        print(f"\n   📋 {task['title']}")
        print(f"   📝 {task['description']}")
        print("   🔧 Micro-tasks:")
        
        for mt in task['micro_tasks']:
            print(f"      • {mt['title']} ({mt['estimated_minutes']} min)")
            print(f"        {mt['description']}")
    
    # Show today's micro-tasks
    print("\n4. Today's Micro-Tasks:")
    response = requests.get(f"{API_BASE}/micro-tasks/today")
    todays_tasks = response.json()
    
    total_time = sum(mt['estimated_minutes'] for mt in todays_tasks)
    print(f"   📅 {len(todays_tasks)} micro-tasks scheduled for today")
    print(f"   ⏱️  Total estimated time: {total_time} minutes")
    
    # Simulate completing some tasks
    print("\n5. Simulating Daily Progress:")
    completed_count = 0
    
    for i, mt in enumerate(todays_tasks[:3]):  # Complete first 3 tasks
        print(f"   ✅ Completing: {mt['title']}")
        response = requests.put(f"{API_BASE}/micro-tasks/{mt['id']}/complete")
        
        if response.status_code == 200:
            completed_count += 1
            
        time.sleep(0.3)  # Brief pause for demo effect
    
    # Final dashboard
    print("\n6. Final Dashboard State:")
    response = requests.get(f"{API_BASE}/dashboard")
    dashboard = response.json()
    print(f"   📊 Total Tasks: {dashboard['total_tasks']}")
    print(f"   ✅ Completed Today: {dashboard['completed_today']}")
    print(f"   📈 Progress: {dashboard['progress_percentage']:.1f}%")
    print(f"   🎉 Today's micro-tasks: {dashboard['completed_today']}/{dashboard['todays_micro_tasks']}")
    
    print("\n" + "=" * 50)
    print("🎯 Demo Complete! GobSync successfully:")
    print("   • Created tasks with AI breakdown")
    print("   • Generated actionable micro-tasks")
    print("   • Tracked daily progress")
    print("   • Organized tasks by date")
    print("\n💡 Start the frontend with: npm start")
    print("🌐 Visit: http://localhost:3000")

if __name__ == "__main__":
    try:
        demo_gobsync()
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to GobSync backend")
        print("💡 Make sure the backend is running:")
        print("   source venv/bin/activate && python app.py")
    except Exception as e:
        print(f"❌ Error: {e}")