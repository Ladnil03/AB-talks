"""FastAPI entry point for the AI Interview Agent Platform."""
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.models.schemas import InterviewRequest, InterviewResponse, FeedbackSchema
from app.session.session_store import session_store
from app.data.loader import data_loader
from app.data.day_planner import select_day_plan
from app.graph.builder import run_turn
from app.graph.state import InterviewState


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan hook to load datasets on startup."""
    data_loader.load_all()
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Conversational AI Technical Interview Agent",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    """Health check endpoint for container uptime and load balancer probes."""
    return {"status": "healthy", "service": "interview-agent-backend"}


@app.post("/api/interview", response_model=InterviewResponse)
def handle_interview(req: InterviewRequest):
    """Main interview endpoint: handles session init and conversation turns."""
    session_id = req.sessionId

    # 1. New Session Initialization
    if not session_store.exists(session_id):
        if not req.candidate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New session requires candidate profile in request payload.",
            )

        candidate_data = data_loader.candidates.get(req.candidate.id, {})
        day_plan = select_day_plan(candidate_data)

        initial_state: InterviewState = {
            "session_id": session_id,
            "candidate_id": req.candidate.id,
            "candidate_name": req.candidate.name,
            "day_plan": day_plan,
            "current_day_index": 0,
            "follow_ups_on_current_day": 0,
            "questions_asked": 0,
            "days_covered": set(),
            "transcript": [],
            "phase": "INTRO",
            "feedback": None,
            "last_reply": None,
        }

        # Run initial intro turn
        updated_state = run_turn(initial_state)
        session_store.set(session_id, updated_state)

        return InterviewResponse(
            reply=updated_state.get("last_reply", "Welcome to your technical interview."),
            done=False,
            feedback=None,
        )

    # 2. Existing Session Turn
    current_state = session_store.get(session_id)
    if not current_state:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session expired or not found.",
        )

    message = req.message or ""
    updated_state = run_turn(current_state, incoming_message=message)
    session_store.set(session_id, updated_state)

    is_done = updated_state.get("phase") in ("CLOSING", "DONE")
    feedback_data = updated_state.get("feedback")
    feedback_obj = FeedbackSchema(**feedback_data) if feedback_data else None

    return InterviewResponse(
        reply=updated_state.get("last_reply", "Thank you."),
        done=is_done,
        feedback=feedback_obj,
    )
