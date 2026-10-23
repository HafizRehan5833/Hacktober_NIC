from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class UserProfile(BaseModel):
    """
    Stateless profile submitted by client for individual request processing.
    Not persisted on server.
    """
    education: Optional[str] = Field(default=None, max_length=500, description="Highest qualification or field of study")
    skills: List[str] = Field(default_factory=list, max_length=100, description="List of user's current technical or soft skills")
    experience_level: Optional[str] = Field(default="Beginner", max_length=100, description="e.g., Student, Beginner, Intermediate, Senior")
    target_role: Optional[str] = Field(default=None, max_length=200, description="Target career role or job title")
    interests: List[str] = Field(default_factory=list, max_length=50, description="Career interests or preferred domains")
    target_location: Optional[str] = Field(default=None, max_length=150, description="Target job search location (e.g. Remote, US, PK)")

class ChatMessage(BaseModel):
    """
    Stateless conversation turn representation passed by client.
    """
    role: str = Field(..., pattern="^(user|assistant|model|system)$", description="Role of message author")
    content: str = Field(..., max_length=10000, description="Message text content")

class ChatRequest(BaseModel):
    """
    Incoming chat payload.
    Supports optional conversation history, profile context, and direct CV text upload.
    """
    message: Optional[str] = Field(default="", max_length=10000, description="User's query or instruction (optional if uploading CV)")
    profile: Optional[UserProfile] = Field(default=None, description="Client-managed user profile")
    conversation_history: List[ChatMessage] = Field(default_factory=list, max_length=30, description="Client-managed prior history")
    cv_text: Optional[str] = Field(default=None, max_length=100000, description="Direct resume/CV text content uploaded by user")
    auto_search_jobs: Optional[bool] = Field(default=True, description="Automatically find matching RapidAPI jobs based on extracted/provided skills")

class ChatResponse(BaseModel):
    """
    Final response returned to the client.
    """
    success: bool = True
    message: str = Field(..., description="Agent career advice or answer")
    tools_used: List[str] = Field(default_factory=list, description="Internal tools invoked during processing")
    model_used: str = Field(..., description="Configured Gemma/Gemini model identifier")
    job_results: Optional[List[Dict[str, Any]]] = Field(default=None, description="Normalized job listings if search was performed")
    salary_results: Optional[Dict[str, Any]] = Field(default=None, description="Salary insights if salary search was performed")

class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "SkillBridge AI"
    database: str = "not_used"
    stateless: bool = True
    gemini_model: str
