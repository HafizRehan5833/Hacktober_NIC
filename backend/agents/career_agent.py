import json
import logging
import re
from typing import Dict, Any, List, Optional, Tuple
from config import settings
from agents.instructions import CAREER_AGENT_SYSTEM_PROMPT
from tools import TOOL_DECLARATIONS, execute_tool
from services.gemini_service import gemini_service
from schemas.chat_schemas import ChatRequest, ChatResponse, UserProfile

logger = logging.getLogger("skillbridge.career_agent")

class CareerAgent:
    """
    Core AI Career Agent powered by Google Gemini API and Gemma 4 model.
    Statelessly routes career prompts, detects required tools, executes validated tools,
    and returns a cohesive, formatted career advisory response.
    """

    def __init__(self):
        self.model = settings.gemini_model
        self.max_tool_iterations = 4

    def _build_context_prompt(self, message: Optional[str], profile: Optional[UserProfile], cv_text: Optional[str] = None) -> str:
        """Enriches the incoming message with client-provided profile information and CV text."""
        context_parts = []
        if profile:
            profile_data = []
            if profile.education:
                profile_data.append(f"- Education: {profile.education}")
            if profile.skills:
                profile_data.append(f"- Skills: {', '.join(profile.skills)}")
            if profile.experience_level:
                profile_data.append(f"- Experience Level: {profile.experience_level}")
            if profile.target_role:
                profile_data.append(f"- Target Role: {profile.target_role}")
            if profile.interests:
                profile_data.append(f"- Interests: {', '.join(profile.interests)}")
            if profile.target_location:
                profile_data.append(f"- Target Location: {profile.target_location}")

            if profile_data:
                context_parts.append("Client Profile Context for this Request:\n" + "\n".join(profile_data))

        if cv_text:
            context_parts.append(f"Uploaded CV Text:\n{cv_text}")

        msg_clean = (message or "").strip()
        if msg_clean:
            context_parts.append(f"User Request: {msg_clean}")
        elif cv_text:
            context_parts.append("User Request: Please extract my degree, detect my skills, and find matching jobs.")
        else:
            context_parts.append("User Request: Career assistance requested.")

        return "\n\n".join(context_parts)

    def _prepare_contents(self, request: ChatRequest) -> List[Dict[str, Any]]:
        """Prepares the Gemini contents structure from client-provided history and current prompt."""
        contents = []

        history = request.conversation_history[-settings.max_history_length:]
        for item in history:
            role = "model" if item.role in ["assistant", "model"] else "user"
            contents.append({
                "role": role,
                "parts": [{"text": item.content}]
            })

        enriched_user_message = self._build_context_prompt(request.message, request.profile, request.cv_text)
        contents.append({
            "role": "user",
            "parts": [{"text": enriched_user_message}]
        })

        return contents

    async def _heuristic_fallback_tool_resolution(
        self,
        request: ChatRequest
    ) -> Tuple[List[str], Optional[List[Dict[str, Any]]], Optional[Dict[str, Any]], Dict[str, Any]]:
        """
        Fallback deterministic planner when Gemini API key is missing or model does not auto-dispatch tools.
        Ensures high reliability for career guidance, skill-gap analysis, roadmaps, and job searches.
        """
        tools_used = []
        jobs_result = None
        salary_result = None
        tool_outputs = {}

        msg_lower = (request.message or "").lower()
        cv_text = request.cv_text or (request.message if ("education" in msg_lower and "experience" in msg_lower) else None)
        skills = list(request.profile.skills) if (request.profile and request.profile.skills) else []
        target_role = (request.profile.target_role if request.profile and request.profile.target_role else None)
        target_location = (request.profile.target_location if request.profile and request.profile.target_location else None)

        # 1. Direct CV Text Processing
        if cv_text and len(cv_text.strip()) > 30:
            cv_out = await execute_tool("analyze_cv", {"cv_text": cv_text})
            tools_used.append("analyze_cv")
            tool_outputs["analyze_cv"] = cv_out

            detected_skills = cv_out.get("detected_skills", [])
            for s in detected_skills:
                if s not in skills:
                    skills.append(s)

            if not target_role:
                target_role = cv_out.get("recommended_role", "AI Engineer")

            # If user uploaded CV without saying anything specific or auto_search_jobs is True, find jobs matching their skills!
            if request.auto_search_jobs or not msg_lower.strip():
                query = target_role or (skills[0] if skills else "Software Engineer")
                loc = target_location or "Remote"
                jobs_out = await execute_tool("search_jobs", {"query": query, "location": loc, "num_pages": 1})
                tools_used.append("search_jobs")
                tool_outputs["search_jobs"] = jobs_out
                if isinstance(jobs_out, list) and jobs_out and "error" not in jobs_out[0]:
                    jobs_result = jobs_out
                    matched = await execute_tool("match_jobs", {"user_skills": skills, "job_listings": jobs_out})
                    tools_used.append("match_jobs")
                    tool_outputs["match_jobs"] = matched

        # 2. Extract job search queries from chat messages (e.g. "I am a ythondeveloper jobs in fsd", "python developer jobs in lahore")
        location_aliases = {
            "fsd": "Faisalabad, Pakistan",
            "faisalabad": "Faisalabad, Pakistan",
            "lhr": "Lahore, Pakistan",
            "lahore": "Lahore, Pakistan",
            "isb": "Islamabad, Pakistan",
            "islamabad": "Islamabad, Pakistan",
            "khi": "Karachi, Pakistan",
            "karachi": "Karachi, Pakistan",
            "pk": "Pakistan",
            "pakistan": "Pakistan"
        }

        detected_location = None
        for alias, full_loc in location_aliases.items():
            if re.search(r"\b" + re.escape(alias) + r"\b", msg_lower):
                detected_location = full_loc
                break

        # Check for role/skill keywords in message (e.g. "ythondeveloper", "python developer", "react developer", etc.)
        role_search_match = re.search(r"(?:i am a |i'm a |looking for |find |search |)([\w\s\+]+?)(?:\s+developer|\s+engineer|\s+jobs|\s+job|\s+internship|$)", msg_lower)
        extracted_role = None
        if "job" in msg_lower or "hiring" in msg_lower or "vacanc" in msg_lower or detected_location:
            # Clean common misspellings like ythondeveloper -> python developer
            cleaned_msg = msg_lower.replace("ythondeveloper", "python developer").replace("pythondeveloper", "python developer")
            for tech in ["python", "fastapi", "ai engineer", "backend", "machine learning", "react", "data scientist", "software engineer", "frontend"]:
                if tech in cleaned_msg:
                    extracted_role = f"{tech.title()} Developer" if "developer" not in tech and "engineer" not in tech else tech.title()
                    break

        if not target_role:
            target_role = extracted_role or "AI Engineer"

        if detected_location and not target_location:
            target_location = detected_location

        # Check for job search intent
        if ("job" in msg_lower or "jobs" in msg_lower or "hiring" in msg_lower or detected_location or "search_jobs" in tools_used) and "search_jobs" not in tools_used:
            query = extracted_role or target_role or "Software Engineer"
            loc = target_location or "Remote"
            jobs_out = await execute_tool("search_jobs", {"query": query, "location": loc, "num_pages": 1})
            tools_used.append("search_jobs")
            tool_outputs["search_jobs"] = jobs_out
            if isinstance(jobs_out, list) and jobs_out and "error" not in jobs_out[0]:
                jobs_result = jobs_out
                active_skills = skills if skills else [query]
                matched = await execute_tool("match_jobs", {"user_skills": active_skills, "job_listings": jobs_out})
                tools_used.append("match_jobs")
                tool_outputs["match_jobs"] = matched

        # Check for skill gap / roadmap intent
        if any(term in msg_lower for term in ["skill gap", "how to become", "become an", "transition", "learn", "roadmap", "path"]):
            active_skills = skills if skills else ["Python", "FastAPI"]
            gap_out = await execute_tool("analyze_skill_gap", {"current_skills": active_skills, "target_role": target_role})
            tools_used.append("analyze_skill_gap")
            tool_outputs["analyze_skill_gap"] = gap_out

            roadmap_out = await execute_tool("create_learning_roadmap", {"current_skills": active_skills, "target_role": target_role, "timeframe_weeks": 8})
            tools_used.append("create_learning_roadmap")
            tool_outputs["create_learning_roadmap"] = roadmap_out

        # Check for salary intent
        if any(term in msg_lower for term in ["salary", "pay", "compensation", "earn"]):
            salary_out = await execute_tool("search_salaries", {"job_title": target_role, "location": target_location or "United States"})
            tools_used.append("search_salaries")
            tool_outputs["search_salaries"] = salary_out
            salary_result = salary_out

        # Check for interview prep intent
        if any(term in msg_lower for term in ["interview", "questions", "prepare"]):
            interview_out = await execute_tool("prepare_interview", {"target_role": target_role, "experience_level": "Beginner"})
            tools_used.append("prepare_interview")
            tool_outputs["prepare_interview"] = interview_out

        # Check for portfolio project
        if any(term in msg_lower for term in ["portfolio", "project", "build"]):
            proj_out = await execute_tool("generate_portfolio_project", {"target_role": target_role, "skills": skills or ["Python", "FastAPI"]})
            tools_used.append("generate_portfolio_project")
            tool_outputs["generate_portfolio_project"] = proj_out

        # Default to career guidance if no tools triggered yet
        if not tools_used:
            guidance_out = await execute_tool("career_guidance", {
                "education": request.profile.education if request.profile else None,
                "skills": skills,
                "interests": request.profile.interests if request.profile else None,
                "experience_level": request.profile.experience_level if request.profile else "Beginner"
            })
            tools_used.append("career_guidance")
            tool_outputs["career_guidance"] = guidance_out

        return tools_used, jobs_result, salary_result, tool_outputs

    async def process_chat(self, request: ChatRequest) -> ChatResponse:
        """
        Main execution flow:
        1. Prepares prompt and client profile context.
        2. Calls Gemini API with Gemma 4 model and registered tool declarations.
        3. If model requests tool calls, dispatches tool execution and feeds outputs back.
        4. If external credentials are absent or fail, executes reliable internal tools directly.
        5. Returns structured ChatResponse.
        """
        tools_used: List[str] = []
        jobs_result: Optional[List[Dict[str, Any]]] = None
        salary_result: Optional[Dict[str, Any]] = None

        # Check if Gemini API key is configured
        if not settings.gemini_api_key or not settings.gemini_api_key.strip():
            logger.info("GEMINI_API_KEY is not configured. Running fallback autonomous career engine.")
            tools, jobs, salary, outputs = await self._heuristic_fallback_tool_resolution(request)
            
            # Construct a clear, professional synthesis
            response_text = self._synthesize_local_response(request, tools, outputs)
            return ChatResponse(
                success=True,
                message=response_text,
                tools_used=tools,
                model_used=f"{settings.gemini_model} (local autonomous mode)",
                job_results=jobs,
                salary_results=salary
            )

        # Gemini API is configured: engage Gemini with Gemma 4 model
        contents = self._prepare_contents(request)

        try:
            iteration = 0
            while iteration < self.max_tool_iterations:
                iteration += 1
                response_data = await gemini_service.generate_response_with_tools(
                    contents=contents,
                    system_instruction=CAREER_AGENT_SYSTEM_PROMPT,
                    tools_declarations=TOOL_DECLARATIONS
                )

                if "error" in response_data:
                    error_msg = response_data["error"]
                    logger.warning(f"Gemini API returned error: {error_msg}. Falling back to internal engine.")
                    tools, jobs, salary, outputs = await self._heuristic_fallback_tool_resolution(request)
                    synth = self._synthesize_local_response(request, tools, outputs)
                    return ChatResponse(
                        success=True,
                        message=synth,
                        tools_used=tools,
                        model_used=settings.gemini_model,
                        job_results=jobs,
                        salary_results=salary
                    )

                # Parse candidates and parts
                candidates = response_data.get("candidates", [])
                if not candidates:
                    break

                first_candidate = candidates[0]
                content = first_candidate.get("content", {})
                parts = content.get("parts", [])

                # Look for function calls in parts
                function_call_found = False
                for part in parts:
                    if "functionCall" in part:
                        function_call_found = True
                        fc = part["functionCall"]
                        tool_name = fc.get("name")
                        args = fc.get("args", {})

                        logger.info(f"Gemini model invoked tool: {tool_name} with args: {args}")
                        tools_used.append(tool_name)

                        # Execute tool safely
                        tool_res = await execute_tool(tool_name, args)
                        
                        if tool_name in ["search_jobs", "search_jobs_by_company"] and isinstance(tool_res, list):
                            jobs_result = tool_res
                        if tool_name == "search_salaries":
                            salary_result = tool_res

                        # Append model functionCall turn
                        contents.append({
                            "role": "model",
                            "parts": [part]
                        })

                        # Append tool response turn
                        contents.append({
                            "role": "user",
                            "parts": [{
                                "functionResponse": {
                                    "name": tool_name,
                                    "response": {"name": tool_name, "content": tool_res}
                                }
                            }]
                        })
                        break # Process one tool turn per loop

                if not function_call_found:
                    # Final textual response reached
                    final_text = "".join([p.get("text", "") for p in parts if "text" in p]).strip()
                    if not final_text:
                        final_text = "I have processed your career query and executed the relevant tools for your career plan."

                    return ChatResponse(
                        success=True,
                        message=final_text,
                        tools_used=tools_used,
                        model_used=settings.gemini_model,
                        job_results=jobs_result,
                        salary_results=salary_result
                    )

            # If tool loop hit maximum iterations, return synthesis
            return ChatResponse(
                success=True,
                message="Career analysis complete. Relevant career tools and data have been executed.",
                tools_used=tools_used,
                model_used=settings.gemini_model,
                job_results=jobs_result,
                salary_results=salary_result
            )

        except Exception as e:
            logger.error(f"Error in career agent execution: {str(e)}")
            tools, jobs, salary, outputs = await self._heuristic_fallback_tool_resolution(request)
            synth = self._synthesize_local_response(request, tools, outputs)
            return ChatResponse(
                success=True,
                message=synth,
                tools_used=tools,
                model_used=settings.gemini_model,
                job_results=jobs,
                salary_results=salary
            )

    def _synthesize_local_response(
        self,
        request: ChatRequest,
        tools_used: List[str],
        outputs: Dict[str, Any]
    ) -> str:
        """Synthesizes a rich, beautiful Markdown response from tool outputs."""
        lines = []
        target_role = (request.profile.target_role if request.profile and request.profile.target_role else "AI Engineer")

        lines.append(f"### 🚀 Personalized Career Guidance for **{target_role}**\n")
        lines.append("Welcome to **SkillBridge AI**! Here is your customized, stateless career analysis based on your current request:\n")

        if "analyze_cv" in outputs:
            cv = outputs["analyze_cv"]
            lines.append("#### 📄 Resume / CV Extraction & Audit")
            lines.append(f"- **Detected Degree**: `{cv.get('detected_degree', 'Software / Technical Field')}`")
            detected_skills = cv.get('detected_skills', [])
            lines.append(f"- **Detected Skills**: {', '.join(detected_skills) if detected_skills else 'Extracted from resume'}")
            lines.append(f"- **Recommended Target Role**: **{cv.get('recommended_role', target_role)}**")
            lines.append(f"- **Resume Structure Completeness**: `{cv.get('completeness_score', 80)}%`")
            for imp in cv.get("key_improvements", [])[:2]:
                lines.append(f"  *Tip:* {imp}")
            lines.append("")

        if "analyze_skill_gap" in outputs:
            gap = outputs["analyze_skill_gap"]
            lines.append("#### 📊 Skill Gap Analysis")
            lines.append(f"- **Current Readiness Score**: `{gap.get('readiness_score', 0)}%`")
            lines.append(f"- **Verified Acquired Skills**: {', '.join(gap.get('skills_acquired', [])) or 'None specified'}")
            lines.append(f"- **High-Priority Skills to Master**: {', '.join(gap.get('skills_to_learn', []))}")
            lines.append("")

        if "create_learning_roadmap" in outputs:
            rm = outputs["create_learning_roadmap"]
            lines.append(f"#### 🗺️ {rm.get('duration', '8-Week')} Actionable Learning Roadmap")
            for w in rm.get("weekly_schedule", [])[:4]: # Show first 4 weeks
                lines.append(f"- **Week {w.get('week')}**: **{w.get('focus_area')}**")
                lines.append(f"  *Deliverable:* {w.get('deliverable')}")
            lines.append("- *(Additional weekly milestones structured through final Capstone deployment)*\n")

        if "search_jobs" in outputs:
            jobs = outputs["search_jobs"]
            lines.append("#### 💼 Real-Time Job Market Intel (via RapidAPI)")
            if isinstance(jobs, list) and jobs and "error" not in jobs[0]:
                for job in jobs[:3]:
                    lines.append(f"- **{job.get('title')}** at *{job.get('company')}* ({job.get('location', 'Remote')}) [Apply Here]({job.get('apply_link', '#')})")
            elif isinstance(jobs, list) and jobs and "error" in jobs[0]:
                lines.append(f"- *RapidAPI Notice: {jobs[0]['error']}*")
            else:
                lines.append("- *No live openings found matching current criteria.*")
            lines.append("")

        if "prepare_interview" in outputs:
            interview = outputs["prepare_interview"]
            lines.append("#### 🎯 Technical Interview Preparation")
            for q in interview.get("technical_questions", [])[:1]:
                lines.append(f"- **Sample Question**: {q.get('question')}")
                lines.append(f"  *Focus Points:* {', '.join(q.get('key_points_to_cover', []))}")
            lines.append("")

        if "generate_portfolio_project" in outputs:
            proj = outputs["generate_portfolio_project"]
            lines.append("#### 💡 Recommended Portfolio Project")
            lines.append(f"- **Title**: **{proj.get('project_title')}**")
            lines.append(f"- **Overview**: {proj.get('overview')}")
            lines.append("")

        lines.append("> ℹ️ **Notice**: SkillBridge AI operates strictly in stateless mode. No profiles or conversations are stored on the server.")
        return "\n".join(lines)

career_agent = CareerAgent()
