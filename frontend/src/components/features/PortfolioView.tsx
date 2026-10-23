import React, { useState } from "react";
import {
  FolderGit2,
  Sparkles,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Code,
  Layers,
  FileCode,
  Terminal,
} from "lucide-react";
import { sendChatMessage } from "@/lib/api";
import { UserProfile, ActiveTab } from "@/types";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface PortfolioViewProps {
  profile: UserProfile;
  setActiveTab: (tab: ActiveTab) => void;
  onAskMentor: (prompt: string) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  profile,
  setActiveTab,
  onAskMentor,
}) => {
  const [targetRole, setTargetRole] = useState(profile.target_role || "AI Engineer");
  const [currentSkills, setCurrentSkills] = useState(
    profile.skills && profile.skills.length > 0 ? profile.skills.join(", ") : "Python, FastAPI, Docker"
  );
  const [skillLevel, setSkillLevel] = useState(profile.experience_level || "Beginner");
  const [interests, setInterests] = useState(
    profile.interests && profile.interests.length > 0 ? profile.interests.join(", ") : "LLMs, System Architecture"
  );
  const [techStack, setTechStack] = useState("Python, FastAPI, Next.js, Vector DB");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectSpec, setProjectSpec] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!targetRole.trim()) {
      setError("Please specify a target role.");
      return;
    }

    setLoading(true);
    setError(null);
    setProjectSpec(null);

    try {
      const prompt = `Recommend a high-impact, standout portfolio project specification for a "${targetRole}" candidate.
Current Skills: ${currentSkills}.
Skill Level: ${skillLevel}.
Interests: ${interests}.
Preferred Tech Stack: ${techStack}.
Please provide:
1. Project Title & Problem Statement
2. Objectives & Architecture Overview
3. Core Features & Implementation Milestones
4. Testing Plan & Error Handling
5. GitHub Repository Directory Structure
6. Professional README Presentation Guidance (badges, demo gif, setup instructions).
(Note: Do not claim the project has been deployed, formulate it as a production-grade blueprint).`;

      const res = await sendChatMessage({
        message: prompt,
        profile: {
          ...profile,
          target_role: targetRole,
        },
      });

      setProjectSpec(res.message);
    } catch (err: any) {
      setError(err?.message || "Failed to generate portfolio project blueprint.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!projectSpec) return;
    navigator.clipboard.writeText(projectSpec);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestGuidance = () => {
    if (!projectSpec) return;
    onAskMentor(
      `I want to start building this portfolio project for my ${targetRole} career:\n\nCan you give me step-by-step guidance on setting up the initial repository structure and architecture boilerplate?`
    );
    setActiveTab("mentor");
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FolderGit2 className="w-6 h-6 text-indigo-600" />
            <span>Portfolio Project Blueprints</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate impressive, resume-worthy capstones with detailed system architectures and GitHub README templates.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Career Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. AI Engineer, Full Stack Engineer"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Experience Level
            </label>
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white text-slate-700"
            >
              <option value="Student">Student / Academic</option>
              <option value="Beginner">Entry-Level / Junior</option>
              <option value="Intermediate">Mid-Level</option>
              <option value="Senior">Advanced / Senior</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Featured Skills to Showcase
            </label>
            <input
              type="text"
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
              placeholder="e.g. Python, FastAPI, Docker, PyTorch"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Preferred Tech Stack
            </label>
            <input
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="e.g. FastAPI, PostgreSQL, Next.js, Redis"
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
            Designs production-grade project specifications that showcase real software engineering skills.
          </p>

          <button
            onClick={handleGenerate}
            disabled={loading || !targetRole.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Designing Capstone Architecture...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Project Spec</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Project Spec Display */}
      {projectSpec && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recommended Project Specification
              </h2>
              <span className="text-xs text-slate-500">
                Tailored for {targetRole} • {techStack}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                title="Copy Specification"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Spec"}</span>
              </button>

              <button
                onClick={handleRequestGuidance}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Ask Mentor for Guidance</span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <MarkdownRenderer content={projectSpec} />
          </div>
        </div>
      )}
    </div>
  );
};
