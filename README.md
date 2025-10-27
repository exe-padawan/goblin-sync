# GobSync 🧠📆

> AI-powered task breakdown for daily 1% improvement
> Break down any goal into manageable micro-tasks and track your progress on a beautiful visual board

## 🎯 What is GobSync?

GobSync takes any task or goal you want to accomplish and uses AI to break it down into small, actionable micro-tasks that take 15-30 minutes each. The app organizes these micro-tasks on a date-based board, helping you make consistent daily progress toward your goals.

**Key Features:**
- 🧠 **AI-Powered Breakdown**: Intelligent task decomposition using OpenAI or smart fallback logic
- 📅 **Date-Based Organization**: Visual board with tasks organized by date
- ⏱️ **Micro-Task Focus**: Each task is designed for 15-30 minute completion
- 📊 **Progress Tracking**: Real-time dashboard showing daily completion rates
- 🎨 **Beautiful UI**: Modern, clean interface built with React and Tailwind CSS

---

## 🛠️ Tech Stack

- **Backend**: Python + Flask + SQLAlchemy
- **AI**: OpenAI GPT-3.5 (with intelligent fallback)
- **Database**: SQLite (easily upgradeable to PostgreSQL)
- **Frontend**: React 18 + Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns

---

## 🚀 Quick Start

### Option 1: Use the startup scripts (Recommended)

```bash
# Start the backend (Terminal 1)
./start_backend.sh

# Start the frontend (Terminal 2)  
./start_frontend.sh
```

### Option 2: Manual setup

**Backend:**
```bash
# Setup virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Run backend
python app.py
```

**Frontend:**
```bash
# Install dependencies
npm install

# Start frontend
npm start
```

The backend will run on `http://localhost:5000` and the frontend on `http://localhost:3000`.

---

## 🎮 How to Use

1. **Create a Task**: Click "New Task" and enter what you want to accomplish
2. **AI Breakdown**: The AI automatically breaks your task into 3-7 micro-tasks
3. **Daily Progress**: Complete micro-tasks one by one to make daily progress
4. **Track Success**: Monitor your completion rate on the dashboard

**Example Task Breakdown:**
- Task: "Learn to play guitar"
- Micro-tasks: Research beginner tutorials → Set up practice space → Learn first chord → Practice chord transitions → Learn simple song

---

## 🌟 Features

### Dashboard
- Daily progress overview
- Completion statistics
- Today's micro-tasks list
- Motivational progress tracking

### Task Board
- Visual date-based organization
- Color-coded by date (today, tomorrow, past)
- Progress bars for each day
- One-click task completion

### AI Task Breakdown
- Smart analysis of task type
- Context-aware micro-task generation
- Optimal time estimation (15-30 min each)
- Fallback logic when API unavailable

---

## 🎪 Demo

Run the interactive demo to see GobSync in action:

```bash
# Make sure the backend is running first
source venv/bin/activate && python app.py

# In another terminal, run the demo
python demo.py
```

---

## 🌐 API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks with micro-tasks
- `POST /api/tasks` - Create new task (auto-generates micro-tasks)

### Micro-Tasks  
- `GET /api/micro-tasks/today` - Get today's micro-tasks
- `PUT /api/micro-tasks/{id}/complete` - Mark micro-task as complete

### Dashboard
- `GET /api/dashboard` - Get progress statistics

---

## 📝 Configuration

### Environment Variables
Create a `.env` file (optional):
```bash
# For enhanced AI features (optional)
OPENAI_API_KEY=your_openai_api_key_here

# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
```

**Note**: GobSync works perfectly without an OpenAI API key using intelligent fallback logic!

---

## 🎨 Screenshots

### Dashboard
- Real-time progress tracking
- Daily completion statistics  
- Motivational progress bars

### Task Board
- Visual date-based layout
- Color-coded by urgency
- One-click task completion

### Task Creation
- Simple, clean interface
- AI-powered breakdown preview
- Smart micro-task generation

---

## 🚀 Deployment

### Development
```bash
# Backend
./start_backend.sh

# Frontend  
./start_frontend.sh
```

### Production
```bash
# Build frontend
npm run build

# Run with Gunicorn
gunicorn --bind 0.0.0.0:5000 app:app
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- OpenAI for GPT-3.5 API
- React team for the amazing framework
- Tailwind CSS for beautiful styling
- Lucide for clean icons

