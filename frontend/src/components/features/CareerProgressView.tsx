import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  AlertCircle,
  Briefcase,
  HelpCircle,
  Award,
} from "lucide-react";
import { sendChatMessage } from "@/lib/api";
import { UserProfile } from "@/types";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface CareerProgressViewProps {
  profile: UserProfile;
}

interface ActivityItem {
  id: string;
  category: "milestone" | "task" | "project" | "job_application" | "interview_practice";
  title: string;
  completed: boolean;
}

export const CareerProgressView: React.FC<CareerProgressViewProps> = ({ profile }) => {
  const [careerGoal, setCareerGoal] = useState(
    profile.target_role ? `Secure a role as ${profile.target_role}` : "Secure an AI Engineer position"
  );

  const [items, setItems] = useState<ActivityItem[]>([
    { id: "1", category: "milestone", title: "Complete FastAPI backend microservices course", completed: true },
    { id: "2", category: "milestone", title: "Build SkillBridge AI portfolio project with Gemma 4", completed: true },
    { id: "3", category: "task", title: "Audit CV with ATS Checker", completed: true },
    { id: "4", category: "project", title: "Deploy RAG document search prototype", completed: false },
    { id: "5", category: "job_application", title: "Apply to 5 Entry-Level AI / Python roles", completed: false },
    { id: "6", category: "interview_practice", title: "Practice 10 STAR behavioral questions", completed: false },
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<ActivityItem["category"]>("task");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advisoryReport, setAdvisoryReport] = useState<string | null>(null);

  // Optional session storage helper clearly labeled as browser-local
  useEffect(() => {
    try {
      const saved = localStorage.getItem("skillbridge_career_activities");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // fallback to initial state
    }
  }, []);

  const saveToLocal = (newItems: ActivityItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem("skillbridge_career_activities", JSON.stringify(newItems));
    } catch {
      // ignore localstorage errors
    }
  };

  const toggleItem = (id: string) => {
    const updated = items.map((it) => (it.id === id ? { ...it, completed: !it.completed } : it));
    saveToLocal(updated);
  };

  const deleteItem = (id: string) => {
    const updated = items.filter((it) => it.id !== id);
    saveToLocal(updated);
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: ActivityItem = {
      id: `act-${Date.now()}`,
      category: newCategory,
      title: newTitle.trim(),
      completed: false,
    };

    saveToLocal([...items, newItem]);
    setNewTitle("");
  };

  const completedCount = items.filter((it) => it.completed).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const handleSynthesizeAdvisory = async () => {
    setLoading(true);
    setError(null);
    setAdvisoryReport(null);

    try {
      const completedList = items.filter((i) => i.completed).map((i) => `[${i.category}] ${i.title}`);
      const pendingList = items.filter((i) => !i.completed).map((i) => `[${i.category}] ${i.title}`);

      const prompt = `Synthesize career progress tracking for Goal: "${careerGoal}".
Completed Milestones & Tasks:
${completedList.join("\n") || "None yet"}

Pending Milestones & Tasks:
${pendingList.join("\n") || "None yet"}

Total Progress: ${progressPercent}%.
Please provide:
1. Milestone Progress Assessment
2. High-Impact Career Priorities for the coming week
3. Strategic suggestions to accelerate job readiness.
(Note: Do not invent completed tasks, analyze only the user-provided lists above).`;

      const res = await sendChatMessage({
        message: prompt,
        profile: profile,
      });

      setAdvisoryReport(res.message);
    } catch (err: any) {
      setError(err?.message || "Failed to generate progress evaluation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <span>Stateless Career Progress Tracker</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track goals, project accomplishments, and interview milestones for your active session with local browser cache.
          </p>
        </div>

        {/* Goal Input & Metric Header */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Career Goal
            </label>
            <input
              type="text"
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              placeholder="e.g. Land an AI Engineer job in Lahore or Remote"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-indigo-950 font-semibold block">Goal Velocity</span>
              <span className="text-2xl font-black text-indigo-700">{progressPercent}%</span>
              <span className="text-[11px] text-slate-500 block">
                {completedCount} of {items.length} completed
              </span>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 flex items-center justify-center font-bold text-xs text-indigo-800">
              {progressPercent}%
            </div>
          </div>
        </div>

        {/* Add Item Form */}
        <form onSubmit={addItem} className="mt-6 flex flex-col sm:flex-row gap-3">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as any)}
            className="px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="milestone">Milestone</option>
            <option value="task">Action Item / Task</option>
            <option value="project">Project Work</option>
            <option value="job_application">Job Application</option>
            <option value="interview_practice">Interview Prep</option>
          </select>

          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add new milestone or activity..."
            className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
          />

          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </form>

        {/* List of items */}
        <div className="mt-6 space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                item.completed
                  ? "bg-slate-50/70 border-slate-200 text-slate-400"
                  : "bg-white border-slate-200/90 text-slate-800 shadow-2xs"
              }`}
            >
              <div
                onClick={() => toggleItem(item.id)}
                className="flex items-center gap-3 cursor-pointer flex-1"
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                    item.completed ? "bg-emerald-500 text-white" : "border-2 border-slate-300"
                  }`}
                >
                  {item.completed && <CheckCircle2 className="w-4 h-4" />}
                </div>

                <div>
                  <span
                    className={`text-xs font-semibold ${
                      item.completed ? "line-through text-slate-400" : "text-slate-800"
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className="text-[10px] uppercase font-mono block text-slate-400">
                    {item.category.replace("_", " ")}
                  </span>
                </div>
              </div>

              <button
                onClick={() => deleteItem(item.id)}
                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                title="Remove Item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Stored in browser-local session. Zero data stored on server or database.
          </p>

          <button
            onClick={handleSynthesizeAdvisory}
            disabled={loading || items.length === 0}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating Trajectory with Gemma 4...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Synthesize Strategic Next Actions</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Advisory Report */}
      {advisoryReport && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
            <Award className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Career Trajectory & Velocity Analysis
            </h2>
          </div>
          <MarkdownRenderer content={advisoryReport} />
        </div>
      )}
    </div>
  );
};
