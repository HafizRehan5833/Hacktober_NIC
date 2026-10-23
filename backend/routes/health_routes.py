from fastapi import APIRouter
from schemas.chat_schemas import HealthResponse
from config import settings

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Lightweight health and operational endpoint.
    Verifies the service is running in stateless mode without making expensive model calls.
    """
    return HealthResponse(
        status="ok",
        service="SkillBridge AI",
        database="not_used",
        stateless=True,
        gemini_model=settings.gemini_model
    )
