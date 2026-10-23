import React, { useState } from "react";
import {
  GitCompare,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Target,
  Wrench,
  Milestone,
} from "lucide-react";
import { sendChatMessage } from "@/lib/api";
import { UserProfile, ActiveTab } from "@/types";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface SkillGapViewProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  setActiveTab: (tab: ActiveTab) => void;
  onSetRoadmapContext: (role: string, skills: string[]) => void;
}

const predefinedRoles = [
  "AI Engineer",
  "Machine Learning Engineer",
  "Backend Developer",
  "Full Stack Engineer",
  "Data Scientist",
  "Cybersecurity Analyst",
];

export const SkillGapView: React.FC<SkillGapViewProps> = ({
  profile,
  setProfile,
  setActiveTab,
  onSetRoadmapContext,
}) => {
  const [targetRole, setTargetRole] = useState(profile.target_role || "AI Engineer");
  const [currentSkills, setCurrentSkills] = useState(
    profile.skills && profile.skills.length > 0 ? profile.skills.join(", ") : "Python, Git, FastAPI"
  );
  const [education, setEducation] = useState(profile.education || "BS Computer Science");
  const [experienceLevel, setExperienceLevel] = useState(profile.experience_level || "Beginner");
  const [careerObjective, setCareerObjective] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisText, setAnalysisText] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!targetRole.trim()) {
      setError("Please specify a target role.");
      return;
    }

    const skillsArray = currentSkills
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    setLoading(true);
    setError(null);
    setAnalysisText(null);

    try {
      const prompt = `Conduct a rigorous skill gap analysis for the target role: "${targetRole}".
My current skills are: ${skillsArray.join(", ") || "None specified"}.
Education: ${education}. Experience Level: ${experienceLevel}.
${careerObjective ? `Career Objective: ${careerObjective}` : ""}
Please evaluate readiness score (as an estimated heuristic), list verified strengths, high-priority missing skills, medium-priority skills, and recommended projects.`;

      const res = await sendChatMessage({
        message: prompt,
        profile: {
          ...profile,
          target_role: targetRole,
          skills: skillsArray,
          education: education,
          experience_level: experienceLevel,
        },
      });

      setAnalysisText(res.message);

      // Keep active profile synced
      setProfile((prev) => ({
        ...prev,
        target_role: targetRole,
        skills: skillsArray,
        education: education,
        experience_level: experienceLevel,
      }));
    } catch (err: any) {
      setError(err?.message || "Failed to complete skill gap analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoadmap = () => {
    const skillsArray = currentSkills
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    onSetRoadmapContext(targetRole, skillsArray);
    setActiveTab("learning-roadmap");
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <GitCompare className="w-6 h-6 text-indigo-600" />
            <span>Skill-Gap Analysis</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Evaluate your technical proficiencies against industry benchmarks for target career roles.
          </p>
        </div>

        {/* Quick Role Selection Buttons */}
        <div className="mt-6">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Select or Customize Target Role:
          </label>
          <div className="flex flex-wrap gap-2">
            {predefinedRoles.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setTargetRole(role)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  targetRole === role
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200/80 text-slate-700"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-600" /> Target Job Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. AI Engineer, Full Stack Developer"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Education / Degree
            </label>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g. BS Computer Science"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-indigo-600" /> Current Skills (Comma Separated)
            </label>
            <textarea
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
              placeholder="e.g. Python, Git, FastAPI, Docker, SQL, Machine Learning"
              rows={3}
              className="w-full p-3.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white text-slate-700"
            >
              <option value="Student">Student</option>
              <option value="Beginner">Entry-Level / Beginner</option>
              <option value="Intermediate">Intermediate (1-3 yrs)</option>
              <option value="Senior">Senior (3+ yrs)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Career Objective (Optional)
            </label>
            <input
              type="text"
              value={careerObjective}
              onChange={(e) => setCareerObjective(e.target.value)}
              placeholder="e.g. Transition into Generative AI & LLM development"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Readiness scores represent estimated heuristic benchmarks and not guaranteed employment.
          </p>

          <button
            onClick={handleAnalyze}
            disabled={loading || !targetRole.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Auditing Competencies...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Skill Gaps</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Result */}
      {analysisText && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Skill Evaluation: {targetRole}
                </h2>
              </div>

              <button
                onClick={handleCreateRoadmap}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all self-start sm:self-auto"
              >
                <Milestone className="w-4 h-4" />
                <span>Create Learning Roadmap with this Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <MarkdownRenderer content={analysisText} />
          </div>
        </div>
      )}
    </div>
  );
};
