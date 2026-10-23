import React, { useState } from "react";
import {
  Sparkles,
  Search,
  FileSearch,
  GitCompare,
  Milestone,
  ArrowRight,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Bot,
} from "lucide-react";
import { ActiveTab, UserProfile } from "@/types";

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onQuickPrompt: (prompt: string) => void;
  backendOnline: boolean | null;
  modelUsed?: string;
  profile: UserProfile;
}

const examplePrompts = [
  "Help me become an AI engineer.",
  "Find AI engineer jobs in Faisalabad.",
  "Analyze my skills for a backend developer role.",
  "Create an eight-week learning roadmap.",
  "Prepare me for a Python interview.",
  "Check my CV for ATS issues.",
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onQuickPrompt,
  backendOnline,
  modelUsed,
  profile,
}) => {
  const [quickInput, setQuickInput] = useState("");

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onQuickPrompt(quickInput.trim());
    setActiveTab("mentor");
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 p-8 sm:p-12 text-white shadow-xl shadow-indigo-950/20 border border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-5 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-spin" />
            <span>AI Career Assistant • Powered by Gemma 4</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Build Your Future with{" "}
            <span className="bg-gradient-to-r from-blue-300 via-indigo-200 to-white bg-clip-text text-transparent">
              SkillBridge AI
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed max-w-2xl font-normal">
            Your personal AI career mentor to discover jobs, master in-demand skills, improve your CV,
            and prepare for interviews.
          </p>

          {/* Prominent Chat Input */}
          <form onSubmit={handleQuickSubmit} className="relative max-w-2xl">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Ask anything (e.g. 'How do I become an AI Engineer?', 'Find backend jobs')..."
              className="w-full pl-5 pr-28 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/15 transition-all shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <span>Ask AI</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Backend status pill */}
          <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Backend Status:</span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium ${
                  backendOnline === true
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : backendOnline === false
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    backendOnline === true
                      ? "bg-emerald-400 animate-pulse"
                      : backendOnline === false
                      ? "bg-rose-400"
                      : "bg-amber-400"
                  }`}
                />
                {backendOnline === true
                  ? "FastAPI Connected"
                  : backendOnline === false
                  ? "Backend Offline (localhost:8000)"
                  : "Detecting..."}
              </span>
            </div>

            <div className="text-slate-400">
              Model: <span className="text-slate-200 font-semibold">{modelUsed || "Gemma 4 via Gemini"}</span>
            </div>
            <div className="text-slate-400">
              Storage: <span className="text-slate-200 font-semibold">100% Stateless & Private</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Feature Shortcuts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Career Acceleration Tools</h2>
          <span className="text-xs text-slate-500">Integrated with FastAPI & RapidAPI</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Shortcut 1: Job Finder */}
          <div
            onClick={() => setActiveTab("job-finder")}
            className="group cursor-pointer bg-white border border-slate-200/80 hover:border-indigo-400 rounded-2xl p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-indigo-600 transition-colors">
                Live Job Finder
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Search verified jobs through RapidAPI with natural queries like city aliases (FSD, LHR, KHI).
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
              <span>Find Openings</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Shortcut 2: CV Analyzer */}
          <div
            onClick={() => setActiveTab("cv-analyzer")}
            className="group cursor-pointer bg-white border border-slate-200/80 hover:border-indigo-400 rounded-2xl p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileSearch className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-indigo-600 transition-colors">
                CV Analyzer
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Extract skills, detect degree qualifications, and audit weaknesses without data fabrication.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
              <span>Analyze Resume</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Shortcut 3: Skill-Gap Analysis */}
          <div
            onClick={() => setActiveTab("skill-gap")}
            className="group cursor-pointer bg-white border border-slate-200/80 hover:border-indigo-400 rounded-2xl p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <GitCompare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-indigo-600 transition-colors">
                Skill-Gap Analysis
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Compare your current abilities against target roles and discover missing high-priority skills.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
              <span>Audit Skills</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Shortcut 4: Learning Roadmap */}
          <div
            onClick={() => setActiveTab("learning-roadmap")}
            className="group cursor-pointer bg-white border border-slate-200/80 hover:border-indigo-400 rounded-2xl p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Milestone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-indigo-600 transition-colors">
                Learning Roadmap
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Generate weekly curriculum from 4 to 16 weeks with deliverables, exercises, and capstones.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
              <span>View Roadmap</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Example Prompts Grid */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Try Instant Career Inquiries</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Click any prompt below to immediately trigger Gemma 4 career reasoning:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {examplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                onQuickPrompt(prompt);
                setActiveTab("mentor");
              }}
              className="text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-xs font-medium text-slate-700 hover:text-indigo-900 transition-all group flex items-start justify-between gap-2"
            >
              <span className="line-clamp-2">“{prompt}”</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform shrink-0 mt-0.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Architecture & Ethics Note */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Stateless & Ethical Career Advising</p>
            <p className="text-slate-500 text-[11px]">
              No user resumes, credentials, or chats are recorded to disk or server databases. Real RapidAPI listings are sourced directly.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab("mentor")}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
        >
          <Bot className="w-4 h-4" />
          <span>Launch AI Mentor</span>
        </button>
      </div>
    </div>
  );
};
