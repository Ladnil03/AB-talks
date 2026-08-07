from typing import Optional, List, Literal, Dict, Any
from pydantic import BaseModel, Field


class CandidateProfile(BaseModel):
    id: str
    name: str
    track: Optional[str] = None
    background: Optional[str] = None


class FeedbackSchema(BaseModel):
    summary: str = Field(..., description="Executive summary of candidate performance")
    strengths: List[str] = Field(default_factory=list, description="Demonstrated strengths with evidence")
    gaps: List[str] = Field(default_factory=list, description="Identified technical gaps")
    next: List[str] = Field(default_factory=list, description="Recommended next steps")


class InterviewRequest(BaseModel):
    sessionId: str = Field(..., description="Unique interview session identifier")
    candidate: Optional[CandidateProfile] = Field(None, description="Candidate details on first initialization")
    message: Optional[str] = Field(None, description="Candidate response in active conversation turns")


class InterviewResponse(BaseModel):
    reply: str = Field(..., description="Agent message or technical question to the candidate")
    done: bool = Field(False, description="Flag indicating if the interview has reached conclusion")
    feedback: Optional[FeedbackSchema] = Field(None, description="Final feedback synthesis when done=True")
