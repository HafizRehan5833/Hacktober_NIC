from typing import Dict, Any, List, Optional
from services.rapidapi_service import rapidapi_service

async def search_jobs(
    query: str,
    location: Optional[str] = None,
    num_pages: int = 1
) -> List[Dict[str, Any]]:
    """
    Retrieves live job listings from the configured RapidAPI provider.
    Returns normalized job data. Never invents jobs.
    """
    return await rapidapi_service.search_jobs(query=query, location=location, num_pages=num_pages)

async def search_jobs_by_company(
    company_name: str,
    query: Optional[str] = "Software Engineer",
    location: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Retrieves job openings for a specific employer/company via RapidAPI.
    """
    combined_query = f"{company_name} {query or ''}".strip()
    return await rapidapi_service.search_jobs(query=combined_query, location=location)

def match_jobs(
    user_skills: List[str],
    job_listings: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Compares supplied user profile/skills against actual RapidAPI job results.
    Computes a relevance score and explains alignment.
    """
    if not job_listings:
        return []

    user_skills_lower = [s.lower().strip() for s in user_skills if s.strip()]
    matched_results = []

    for job in job_listings:
        if "error" in job:
            continue
        
        description = (job.get("description") or "").lower()
        title = (job.get("title") or "").lower()
        content = f"{title} {description}"

        overlapping_skills = [s for s in user_skills_lower if s in content]
        relevance_score = min(100, len(overlapping_skills) * 20 + 20)

        matched_results.append({
            "job_id": job.get("job_id"),
            "title": job.get("title"),
            "company": job.get("company"),
            "location": job.get("location"),
            "is_remote": job.get("is_remote"),
            "apply_link": job.get("apply_link"),
            "relevance_score": relevance_score,
            "matching_skills": overlapping_skills,
            "analysis": f"Matches {len(overlapping_skills)} of your listed skills ({', '.join(overlapping_skills[:4]) if overlapping_skills else 'general technical fit'})."
        })

    matched_results.sort(key=lambda x: x["relevance_score"], reverse=True)
    return matched_results
