import React, { useState } from "react";
import {
  Milestone,
  Sparkles,
  Calendar,
  Clock,
  Copy,
  Printer,
  Download,
  Check,
  CheckSquare,
  Square,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { sendChatMessage } from "@/lib/api";
import { UserProfile } from "@/types";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface LearningRoadmapViewProps {
  profile: UserProfile;
  inheritedRole?: string;
  inheritedSkills?: string[];
}

export const LearningRoadmapView: React.FC<LearningRoadmapViewProps> = ({
  profile,
  inheritedRole,
  inheritedSkills,
}) => {
  const [targetRole, setTargetRole] = useState(
    inheritedRole || profile.target_role || "AI Engineer"
  );
  const [currentSkills, setCurrentSkills] = useState(
    inheritedSkills && inheritedSkills.length > 0
      ? inheritedSkills.join(", ")
      : profile.skills && profile.skills.length > 0
      ? profile.skills.join(", ")
      : "Python, Git"
  );
  const [timeframeWeeks, setTimeframeWeeks] = useState("8");
  const [studyHours, setStudyHours] = useState("15");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roadmapContent, setRoadmapContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [completedItems, setCompletedItems] = useState<{ [key: string]: boolean }>({});

  const handleGenerate = async () => {
    if (!targetRole.trim()) {
      setError("Please specify a target role for the roadmap.");
      return;
    }

    setLoading(true);
    setError(null);
    setRoadmapContent(null);
    setCompletedItems({});

    try {
      const skillsArray = currentSkills
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const prompt = `Create a structured ${timeframeWeeks}-week actionable learning roadmap for: "${targetRole}".
Current skills: ${skillsArray.join(", ") || "Beginner"}.
Available study time: ${studyHours} hours per week.
Please structure week by week with learning topics, practical exercises, mini-projects, capstone milestone, expected deliverables, and completion criteria.`;

      const res = await sendChatMessage({
        message: prompt,
        profile: {
          ...profile,
          target_role: targetRole,
          skills: skillsArray,
        },
      });

      setRoadmapContent(res.message);
    } catch (err: any) {
      setError(err?.message || "Failed to generate learning roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!roadmapContent) return;
    navigator.clipboard.writeText(roadmapContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportMarkdown = () => {
    if (!roadmapContent) return;
    const blob = new Blob([roadmapContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${targetRole.replace(/\s+/g, "_")}_Learning_Roadmap.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleCheck = (idx: number) => {
    setCompletedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header & Inputs */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Milestone className="w-6 h-6 text-indigo-600" />
            <span>Interactive Learning Roadmap</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate custom weekly curricula from 4 to 16 weeks with deliverables, exercises, and capstone milestones.
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
              placeholder="e.g. AI Engineer, Backend Developer, Data Scientist"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Skills
            </label>
            <input
              type="text"
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
              placeholder="e.g. Python, SQL, Git"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Duration (Weeks)
            </label>
            <select
              value={timeframeWeeks}
              onChange={(e) => setTimeframeWeeks(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white text-slate-700"
            >
              <option value="4">4 Weeks (Intensive Bootcamp)</option>
              <option value="8">8 Weeks (Standard Acceleration)</option>
              <option value="12">12 Weeks (Comprehensive Track)</option>
              <option value="16">16 Weeks (Foundations to Production)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" /> Available Study Hours / Week
            </label>
            <select
              value={studyHours}
              onChange={(e) => setStudyHours(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white text-slate-700"
            >
              <option value="5">5 - 10 Hours (Part-time / Student)</option>
              <option value="15">15 - 20 Hours (Moderate Commitment)</option>
              <option value="30">30+ Hours (Full-time Immersion)</option>
            </select>
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
            Progress checkboxes are stored for the current session only.
          </p>

          <button
            onClick={handleGenerate}
            disabled={loading || !targetRole.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Designing Curriculum with Gemma 4...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Roadmap</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Roadmap Content */}
      {roadmapContent && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {timeframeWeeks}-Week Master Plan: {targetRole}
              </h2>
              <span className="text-xs text-slate-500">
                Weekly deliverables & project milestones
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                title="Copy Roadmap"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                title="Print Plan"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <button
                onClick={handleExportMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                title="Download Markdown"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export MD</span>
              </button>
            </div>
          </div>

          {/* Interactive Checkbox Tracker for Roadmap Weeks */}
          <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100">
            <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-2.5">
              Weekly Milestone Checklist (Current Session)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
              {Array.from({ length: parseInt(timeframeWeeks, 10) || 8 }, (_, i) => i + 1).map((week) => (
                <button
                  key={week}
                  onClick={() => toggleCheck(week)}
                  className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    completedItems[week]
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  {completedItems[week] ? (
                    <CheckSquare className="w-3.5 h-3.5" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>W{week}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <MarkdownRenderer content={roadmapContent} />
          </div>
        </div>
      )}
    </div>
  );
};
