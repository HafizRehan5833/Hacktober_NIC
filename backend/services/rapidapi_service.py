import logging
from typing import Dict, Any, List, Optional
import httpx
from config import settings

logger = logging.getLogger("skillbridge.rapidapi")

class RapidAPIService:
    """
    RapidAPI integration service for real-time job and salary queries.
    Uses configured API keys and endpoint hosts safely without persisting queries.
    """

    def __init__(self):
        self.base_url = f"https://{settings.rapidapi_host}"

    def _get_headers(self) -> Dict[str, str]:
        if not settings.rapidapi_key or not settings.rapidapi_key.strip():
            logger.warning("RAPIDAPI_KEY is not configured in .env.")
            return {}
        return {
            "X-RapidAPI-Key": settings.rapidapi_key or "",
            "X-RapidAPI-Host": settings.rapidapi_host,
            "Content-Type": "application/json"
        }

    async def search_jobs(
        self,
        query: str,
        location: Optional[str] = None,
        num_pages: int = 1,
        page: int = 1,
        employment_types: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Executes a job search using the configured RapidAPI provider (e.g. JSearch).
        Normalizes results cleanly so the AI agent and frontend receive standard keys.
        Never fabricates listings.
        """
        search_term = query
        if location:
            search_term = f"{query} in {location}"

        url = f"{self.base_url}/search"
        params = {
            "query": search_term,
            "page": str(page),
            "num_pages": str(num_pages),
        }
        if employment_types:
            params["employment_types"] = employment_types

        try:
            headers = self._get_headers()
            if not headers:
                return [{"error": "RapidAPI key is not configured in .env. Please set RAPIDAPI_KEY to retrieve live jobs."}]

            async with httpx.AsyncClient(timeout=settings.request_timeout_seconds) as client:
                response = await client.get(url, headers=headers, params=params)
                
                if response.status_code == 401 or response.status_code == 403:
                    logger.error("RapidAPI authentication failed. Check RAPIDAPI_KEY.")
                    return [{"error": "RapidAPI authentication failed. Please verify API key."}]
                
                if response.status_code == 429:
                    logger.warning("RapidAPI rate limit reached.")
                    return [{"error": "RapidAPI rate limit reached. Please retry in a few moments."}]

                response.raise_for_status()
                data = response.json()
                
                raw_jobs = data.get("data", [])
                if not raw_jobs:
                    return []

                # Normalize job listings
                normalized_jobs = []
                for item in raw_jobs[:10]: # Return top 10 items
                    normalized_jobs.append({
                        "job_id": item.get("job_id", ""),
                        "title": item.get("job_title", "Unknown Title"),
                        "company": item.get("employer_name", "Unknown Employer"),
                        "location": f"{item.get('job_city', '')}, {item.get('job_country', '')}".strip(", "),
                        "is_remote": item.get("job_is_remote", False),
                        "employment_type": item.get("job_employment_type", "FULLTIME"),
                        "description": (item.get("job_description") or "")[:400] + "...",
                        "apply_link": item.get("job_apply_link", ""),
                        "posted_at": item.get("job_posted_at_datetime_utc", ""),
                        "source": item.get("job_publisher", "RapidAPI/JSearch"),
                        "min_salary": item.get("job_min_salary"),
                        "max_salary": item.get("job_max_salary"),
                        "salary_currency": item.get("job_salary_currency"),
                        "salary_period": item.get("job_salary_period"),
                    })
                return normalized_jobs

        except httpx.TimeoutException:
            logger.error("RapidAPI request timed out.")
            return [{"error": "RapidAPI connection timed out."}]
        except httpx.HTTPStatusError as e:
            logger.error(f"RapidAPI HTTP error status: {e.response.status_code}")
            return [{"error": f"RapidAPI HTTP error: {e.response.status_code}"}]
        except Exception as e:
            logger.error(f"RapidAPI request failed: {type(e).__name__}")
            return [{"error": f"Failed to retrieve jobs from RapidAPI: {str(e)}"}]

    async def search_salaries(self, job_title: str, location: Optional[str] = "United States") -> Dict[str, Any]:
        """
        Retrieves salary benchmark statistics from RapidAPI (e.g. /estimated-salary or normalized search).
        """
        url = f"{self.base_url}/estimated-salary"
        params = {
            "job_title": job_title,
            "location": location or "United States",
            "radius": "100"
        }

        try:
            headers = self._get_headers()
            async with httpx.AsyncClient(timeout=settings.request_timeout_seconds) as client:
                response = await client.get(url, headers=headers, params=params)
                
                if response.status_code == 401 or response.status_code == 403:
                    return {"error": "RapidAPI authentication failed. Check credentials."}
                if response.status_code == 429:
                    return {"error": "RapidAPI rate limit reached."}

                if response.status_code != 200:
                    # Fallback gracefully
                    return {
                        "job_title": job_title,
                        "location": location,
                        "note": f"Estimated salary endpoint returned status {response.status_code}.",
                        "data": []
                    }

                data = response.json()
                return {
                    "job_title": job_title,
                    "location": location,
                    "data": data.get("data", [])
                }
        except Exception as e:
            logger.error(f"Salary query failed: {type(e).__name__}")
            return {
                "job_title": job_title,
                "location": location,
                "error": f"Salary information service unavailable: {str(e)}"
            }

rapidapi_service = RapidAPIService()
