import logging
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routes.health_routes import router as health_router
from routes.chat_routes import router as chat_router

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger("skillbridge.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    logger.info("=" * 60)
    logger.info("Starting SkillBridge AI Stateless Career Backend")
    logger.info(f"Target Gemma 4 Model: {settings.gemini_model}")
    logger.info(f"RapidAPI Host: {settings.rapidapi_host}")
    logger.info("Database Persistence: NONE (Pure Stateless Operation)")
    logger.info("=" * 60)
    
    yield
    logger.info("SkillBridge AI Backend shutting down safely.")

# Create FastAPI application
app = FastAPI(
    title="SkillBridge AI Backend",
    description="Stateless AI Career Mentor Backend powered by Gemini & Gemma 4 with RapidAPI integrations.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware to support frontend clients seamlessly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health_router)
app.include_router(chat_router)

# Also expose GET / as a welcome endpoint
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to SkillBridge AI Career Advisor Backend",
        "documentation": "/docs",
        "health": "/health",
        "chat_endpoint": "/chat/chat",
        "model": settings.gemini_model,
        "database": "not_used"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=(settings.environment == "development")
    )
