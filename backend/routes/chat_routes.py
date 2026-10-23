import io
import logging
from fastapi import APIRouter, HTTPException, UploadFile, File, status
from schemas.chat_schemas import ChatRequest, ChatResponse
from agents.career_agent import career_agent
from pypdf import PdfReader

logger = logging.getLogger("skillbridge.chat_routes")

router = APIRouter(prefix="/chat", tags=["Chat & Career Guidance"])


@router.post(
    "/extract-cv",
    summary="Extract text content from uploaded PDF or TXT resume"
)
async def extract_cv_file(file: UploadFile = File(...)):
    """Extract plain text from an uploaded resume file (PDF or TXT) without persisting to disk."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    filename = file.filename.lower()
    contents = await file.read()

    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")

    extracted_text = ""
    try:
        if filename.endswith(".pdf"):
            reader = PdfReader(io.BytesIO(contents))
            pages_text = []
            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    pages_text.append(text)
            extracted_text = "\n\n".join(pages_text).strip()
        else:
            # Fallback to UTF-8 / text decoding
            try:
                extracted_text = contents.decode("utf-8").strip()
            except UnicodeDecodeError:
                extracted_text = contents.decode("latin-1", errors="ignore").strip()

        if not extracted_text:
            raise HTTPException(
                status_code=400,
                detail="Could not extract readable text from the document. The PDF may be scanned or image-only."
            )

        return {
            "filename": file.filename,
            "text": extracted_text,
            "char_count": len(extracted_text)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to parse resume document: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail=f"Failed to read resume document: {str(e)}")


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Stateless Career Advisor Chat with Gemini & Gemma 4"
)
async def chat_endpoint(request: ChatRequest) -> ChatResponse:
    """
    Main Chat & AI Career Guidance Endpoint.
    
    Flow:
    Client -> Validate ChatRequest -> Gemini API with Gemma 4 -> Dispatch Internal Career Tools
    -> RapidAPI (if live jobs or salaries requested) -> Formatted ChatResponse
    
    Stateless:
    Does NOT persist chat history, user profiles, or CVs on server or any database.
    """
    try:
        has_message = bool(request.message and request.message.strip())
        has_cv = bool(request.cv_text and request.cv_text.strip())

        if not has_message and not has_cv:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Please provide either a 'message' query or upload your 'cv_text'."
            )

        if has_message:
            print(f"\n[USER MESSAGE]: {request.message}")
        if has_cv:
            print(f"[USER CV UPLOAD]: CV text provided ({len(request.cv_text)} chars)")
        if request.profile:
            role = request.profile.target_role or "Not specified"
            loc = request.profile.target_location or "Not specified"
            print(f"[USER CONTEXT]: Target Role: {role} | Location: {loc}")

        response = await career_agent.process_chat(request)
        print(f"[AI RESPONSE]: Tools used: {response.tools_used} | Model: {response.model_used}\n")
        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unhandled error in /chat/chat: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your career mentorship request."
        )
