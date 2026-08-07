# AI Interview Agent Platform

An enterprise-grade, personalized AI technical interview system powered by **FastAPI**, **LangGraph**, and **React**. The system dynamically adapts technical interview questions based on candidate performance history, evaluates responses in real-time, asks targeted follow-ups, and synthesizes structured performance feedback.

---

## 📁 Repository Architecture

```
AB_talks/
├── frontend/             # Modern React + TypeScript + Vite web interface
├── backend/              # FastAPI + LangGraph state machine & LLM engine
├── team/                 # Dedicated workspaces for team members
│   ├── ai_engineer/      # Track A: Prompt engineering, LangGraph nodes, benchmarks
│   ├── backend_engineer/ # Track B: API contract, session store, loaders, load tests
│   └── devops_engineer/  # Track C: Docker, CI/CD, deployment, observability
├── docs/                 # Centralized documentation & prompt repository
│   ├── prompts/          # Versioned prompt templates implemented by team members
│   │   ├── templates/    # Production-ready prompt templates (Intro, Ask, Eval, Feedback)
│   │   ├── changelog.md  # Prompt version history & benchmark notes
│   │   └── prompt_engineering_guide.md
│   ├── architecture/     # System architecture & sequence diagrams
│   └── team_workflow.md  # Branching strategy, PR guidelines, Definition of Done
├── docker-compose.yml    # Full-stack container orchestration
└── .env.example          # Environment variable template
```

---

## 👥 3-Person Team Ownership & Tracks

| Role / Track | Directory & Workspace | Responsibilities |
|---|---|---|
| **Frontend & DevOps Engineer** *(Your Role)* | [`frontend/`](file:///d:/Project/AB_talks/frontend/), [`team/devops_engineer/`](file:///d:/Project/AB_talks/team/devops_engineer/) & [`.github/`](file:///d:/Project/AB_talks/.github/) | Modern React UI, design system, API integration, containerization (Docker & Compose), CI/CD automation, cloud deployment, logging/observability, and load testing. |
| **AI / Prompt Engineer** *(Track A)* | [`team/ai_engineer/`](file:///d:/Project/AB_talks/team/ai_engineer/) & [`backend/app/graph/`](file:///d:/Project/AB_talks/backend/app/graph/) | LangGraph state flow, prompt templates, day planner personalization logic, LLM client abstraction, answer evaluation, and feedback synthesis. |
| **Backend Engineer** *(Track B)* | [`team/backend_engineer/`](file:///d:/Project/AB_talks/team/backend_engineer/) & [`backend/app/`](file:///d:/Project/AB_talks/backend/app/) | FastAPI REST endpoints (`POST /api/interview`), Pydantic v2 schemas, session store (in-memory/Redis), data loaders, and contract tests. |

---

## 🚀 Quick Start

### 1. Setup Environment
```bash
cp .env.example .env
# Add your ANTHROPIC_API_KEY, GROQ_API_KEY, or OPENAI_API_KEY to .env
```

### 2. Run with Docker Compose
```bash
docker-compose up --build
```
- Frontend UI: `http://localhost:5173`
- Backend API Docs: `http://localhost:8000/docs`
- Healthcheck: `http://localhost:8000/health`

### 3. Run Locally for Development

**Backend:**
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📝 Prompt Management (`docs/prompts/`)
All prompt templates implemented by team members are versioned in [`docs/prompts/templates/`](file:///d:/Project/AB_talks/docs/prompts/templates/). For guidance on prompt grounding and JSON schema enforcement, see [`docs/prompts/prompt_engineering_guide.md`](file:///d:/Project/AB_talks/docs/prompts/prompt_engineering_guide.md).
