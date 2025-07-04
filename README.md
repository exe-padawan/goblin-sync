# GoblinSync 🧠📆

> Smart task breakdown and calendar sync, powered by AI
> > ⚠️ Note: This project currently uses Goblin Tools' unofficial endpoint. We are not affiliated with Goblin Tools and will replace this with our own local/in-house AI logic in future versions.


## 🧩 What is GoblinSync?

GoblinSync takes a single task and breaks it down into actionable subtasks using AI logic. It then syncs those subtasks with your calendar or productivity apps (Google Calendar, Notion, etc.).

This repo is my personal mission to build a full-stack system from scratch — backend, AI logic, frontend UI, and integrations.

---

## 🛠️ Tech Stack

- **Backend**: Python + Flask
- **AI Brain**: GoblinTools (temporary) → My own LLM (Day 5+)
- **Database**: SQLite → Azure Postgres (later)
- **Calendar Sync**: Google Calendar API
- **Frontend**: Flutter (mobile/web) or Blender UI
- **Hosting**: Azure App Services

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/<your-username>/goblin-sync.git
cd goblin-sync

# Setup virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Run backend
python app.py

