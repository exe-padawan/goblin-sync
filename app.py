from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
import os
from dotenv import load_dotenv
import json
from ai_service import AITaskBreakdown

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///gobsync.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Initialize AI service
ai_service = AITaskBreakdown()

# Database Models
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_date = db.Column(db.Date, nullable=False, default=date.today)
    completed = db.Column(db.Boolean, default=False)
    micro_tasks = db.relationship('MicroTask', backref='parent_task', lazy=True, cascade='all, delete-orphan')

class MicroTask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    completed = db.Column(db.Boolean, default=False)
    estimated_minutes = db.Column(db.Integer, default=15)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    assigned_date = db.Column(db.Date, nullable=False, default=date.today)

# API Routes
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks with their micro-tasks"""
    tasks = Task.query.all()
    return jsonify([{
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'created_date': task.created_date.isoformat(),
        'completed': task.completed,
        'micro_tasks': [{
            'id': mt.id,
            'title': mt.title,
            'description': mt.description,
            'completed': mt.completed,
            'estimated_minutes': mt.estimated_minutes,
            'assigned_date': mt.assigned_date.isoformat()
        } for mt in task.micro_tasks]
    } for task in tasks])

@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new task and break it down into micro-tasks using AI"""
    data = request.get_json()
    
    if not data or 'title' not in data:
        return jsonify({'error': 'Task title is required'}), 400
    
    # Create the main task
    task = Task(
        title=data['title'],
        description=data.get('description', '')
    )
    db.session.add(task)
    db.session.flush()  # Get the task ID
    
    # Use AI to break down the task
    try:
        micro_tasks_data = ai_service.breakdown_task(data['title'], data.get('description', ''))
        
        # Create micro-tasks
        for i, mt_data in enumerate(micro_tasks_data):
            micro_task = MicroTask(
                title=mt_data['title'],
                description=mt_data.get('description', ''),
                estimated_minutes=mt_data.get('estimated_minutes', 15),
                task_id=task.id,
                assigned_date=date.today()
            )
            db.session.add(micro_task)
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to break down task: {str(e)}'}), 500
    
    db.session.commit()
    
    return jsonify({
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'created_date': task.created_date.isoformat(),
        'completed': task.completed,
        'message': 'Task created and broken down successfully'
    }), 201

@app.route('/api/micro-tasks/<int:micro_task_id>/complete', methods=['PUT'])
def complete_micro_task(micro_task_id):
    """Mark a micro-task as completed"""
    micro_task = MicroTask.query.get_or_404(micro_task_id)
    micro_task.completed = True
    db.session.commit()
    
    return jsonify({'message': 'Micro-task completed successfully'})

@app.route('/api/micro-tasks/today', methods=['GET'])
def get_todays_micro_tasks():
    """Get all micro-tasks assigned for today"""
    today = date.today()
    micro_tasks = MicroTask.query.filter_by(assigned_date=today).all()
    
    return jsonify([{
        'id': mt.id,
        'title': mt.title,
        'description': mt.description,
        'completed': mt.completed,
        'estimated_minutes': mt.estimated_minutes,
        'parent_task_title': mt.parent_task.title
    } for mt in micro_tasks])

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    """Get dashboard statistics"""
    total_tasks = Task.query.count()
    completed_tasks = Task.query.filter_by(completed=True).count()
    today = date.today()
    todays_micro_tasks = MicroTask.query.filter_by(assigned_date=today).count()
    completed_today = MicroTask.query.filter_by(assigned_date=today, completed=True).count()
    
    return jsonify({
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'todays_micro_tasks': todays_micro_tasks,
        'completed_today': completed_today,
        'progress_percentage': (completed_today / todays_micro_tasks * 100) if todays_micro_tasks > 0 else 0
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)