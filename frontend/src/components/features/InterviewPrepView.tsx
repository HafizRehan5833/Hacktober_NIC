import React, { useState } from "react";
import {
  HelpCircle,
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  MessageSquare,
  Award,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { sendChatMessage } from "@/lib/api";
import { UserProfile } from "@/types";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface InterviewPrepViewProps {
  profile: UserProfile;
}

export const InterviewPrepView: React.FC<InterviewPrepViewProps> = ({ profile }) => {
  const [targetRole, setTargetRole] = useState(profile.target_role || "AI Engineer");
  const [experienceLevel, setExperienceLevel] = useState(profile.experience_level || "Beginner");
  const [interviewType, setInterviewType] = useState<"technical" | "behavioral" | "mixed">("mixed");
  const [topic, setTopic] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prepContent, setPrepContent] = useState<string | null>(null);

  // Mock Interview Mode States
  const [mockActive, setMockActive] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState<string | null>(null);

  const handleGenerateQuestions = async () => {
    if (!targetRole.trim()) {
      setError("Please specify a target role.");
      return;
    }

    setLoading(true);
    setError(null);
    setPrepContent(null);
    setFeedbackContent(null);

    try {
      const prompt = `Prepare me for an interview for the position: "${targetRole}".
Interview Type: ${interviewType}. Experience Level: ${experienceLevel}.
${topic ? `Focus Topic: ${topic}` : ""}
Please provide technical questions, expected answer points, evaluation criteria, and behavioral STAR scenario questions.`;

      const res = await sendChatMessage({
        message: prompt,
        profile: {
          ...profile,
          target_role: targetRole,
          experience_level: experienceLevel,
        },
      });

      setPrepContent(res.message);
    } catch (err: any) {
      setError(err?.message || "Failed to generate interview preparation materials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMockAnswer = async () => {
    if (!userAnswer.trim()) return;

    setFeedbackLoading(true);
    setError(null);

    try {
      const prompt = `Evaluate my interview response for a ${targetRole} role.
User Candidate Answer: "${userAnswer}"
Please evaluate: 1. Strengths 2. Areas for improvement 3. Optimal STAR or technical restructuring 4. Suggested follow-up question.`;

      const res = await sendChatMessage({
        message: prompt,
        profile: {
          ...profile,
          target_role: targetRole,
        },
      });

      setFeedbackContent(res.message);
    } catch (err: any) {
      setError(err?.message || "Failed to analyze interview response.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-indigo-600" />
            <span>Interview Preparation Workspace</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Simulate technical and behavioral STAR interviews with instant feedback criteria.
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
              placeholder="e.g. AI Engineer, Backend Developer"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
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
              <option value="Student">Student / Internship</option>
              <option value="Beginner">Entry-Level / Beginner</option>
              <option value="Intermediate">Intermediate (1-3 yrs)</option>
              <option value="Senior">Senior (3+ yrs)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Interview Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["mixed", "technical", "behavioral"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setInterviewType(type)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all border ${
                    interviewType === type
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Specific Topic Focus (Optional)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. FastAPI AsyncIO, RAG Architecture, System Design"
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
          <button
            onClick={() => setMockActive(!mockActive)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{mockActive ? "Switch to Guide View" : "Open Interactive Mock Practice"}</span>
          </button>

          <button
            onClick={handleGenerateQuestions}
            disabled={loading || !targetRole.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Preparing Questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Questions & Rubric</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Mock Practice Area */}
      {mockActive && (
        <div className="bg-gradient-to-br from-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Interactive Mock Answer Evaluation</h3>
          </div>
          <p className="text-xs text-slate-300 mb-4">
            Type your response to an interview question below to receive constructive grading from Gemma 4.
          </p>

          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer here using the STAR technique (Situation, Task, Action, Result) or technical reasoning..."
            rows={4}
            className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 leading-relaxed"
          />

          <div className="mt-3 flex justify-end">
            <button
              onClick={handleSubmitMockAnswer}
              disabled={feedbackLoading || !userAnswer.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2"
            >
              {feedbackLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Answer...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit for Critique</span>
                </>
              )}
            </button>
          </div>

          {feedbackContent && (
            <div className="mt-6 p-5 rounded-2xl bg-white/10 border border-white/15 text-slate-100">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
                Mentor Feedback & Suggestions
              </h4>
              <div className="text-white text-xs leading-relaxed prose prose-invert">
                <MarkdownRenderer content={feedbackContent} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generated Questions & Rubric */}
      {prepContent && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Interview Evaluation Framework: {targetRole}
            </h2>
          </div>
          <MarkdownRenderer content={prepContent} />
        </div>
      )}
    </div>
  );
};
