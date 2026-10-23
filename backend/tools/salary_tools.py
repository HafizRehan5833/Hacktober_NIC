from typing import Dict, Any, Optional
from services.rapidapi_service import rapidapi_service

async def search_salaries(
    job_title: str,
    location: Optional[str] = "United States"
) -> Dict[str, Any]:
    """
    Retrieves real-time salary benchmarks from RapidAPI when supported by the provider.
    Never invents salary figures.
    """
    return await rapidapi_service.search_salaries(job_title=job_title, location=location)
