import json
import logging
from typing import Dict, Any, List, Optional
import httpx
from config import settings

logger = logging.getLogger("skillbridge.gemini")

class GeminiService:
    """
    Stateless integration service for Google Gemini API with the Gemma 4 model.
    Supports function calling and tool execution via Gemini REST API / SDK endpoints.
    Never persists conversation state or user data.
    """

    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.model = settings.gemini_model

    def _get_api_url(self) -> str:
        # Standard v1beta generateContent endpoint
        return f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"

    async def generate_response_with_tools(
        self,
        contents: List[Dict[str, Any]],
        system_instruction: str,
        tools_declarations: List[Dict[str, Any]],
        timeout: float = 7.0
    ) -> Dict[str, Any]:
        """
        Calls Gemini API with tool definitions to allow model-driven function calling.
        """
        settings.validate_gemini_config()
        self.api_key = settings.gemini_api_key
        self.model = settings.gemini_model

        url = self._get_api_url()
        headers = {"Content-Type": "application/json"}

        # Format Gemini tool structure
        gemini_tools = [{"function_declarations": tools_declarations}] if tools_declarations else []

        payload = {
            "contents": contents,
            "system_instruction": {
                "parts": [{"text": system_instruction}]
            },
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 2048,
            }
        }
        if gemini_tools:
            payload["tools"] = gemini_tools

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(url, headers=headers, json=payload)
                
                if response.status_code == 400:
                    data = response.json()
                    err_msg = data.get("error", {}).get("message", "Bad request to Gemini API.")
                    logger.error(f"Gemini API 400 Error: {err_msg}")
                    return {"error": f"Gemini API request error: {err_msg}", "status_code": 400}

                if response.status_code == 403 or response.status_code == 401:
                    logger.error("Gemini API authentication failed.")
                    return {"error": "Gemini API authentication failed. Please verify your GEMINI_API_KEY.", "status_code": 401}

                if response.status_code == 404:
                    logger.error(f"Model {self.model} not found or unsupported on Gemini API.")
                    return {
                        "error": f"The configured model '{self.model}' was not found or is not accessible with the provided Gemini API credentials.",
                        "status_code": 404
                    }

                if response.status_code == 429:
                    logger.warning("Gemini API rate limit exceeded.")
                    return {"error": "Gemini API quota or rate limit exceeded. Please retry later.", "status_code": 429}

                response.raise_for_status()
                return response.json()

        except httpx.TimeoutException:
            logger.error("Gemini API request timed out.")
            return {"error": "Gemini API request timed out. Please try again.", "status_code": 504}
        except httpx.HTTPStatusError as e:
            logger.error(f"Gemini HTTP Error: {e.response.status_code}")
            return {"error": f"Gemini API returned status {e.response.status_code}.", "status_code": e.response.status_code}
        except Exception as e:
            logger.error(f"Gemini service exception: {str(e)}")
            return {"error": f"Gemini integration error: {str(e)}", "status_code": 500}

gemini_service = GeminiService()
