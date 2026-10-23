import React, { useState } from "react";
import {
  ShieldCheck,
  Sparkles,
  UploadCloud,
  FileText,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { sendChatMessage } from "@/lib/api";
import { UserProfile } from "@/types";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface ATSCheckerProps {
  profile: UserProfile;
}

export const ATSChecker: React.FC<ATSCheckerProps> = ({ profile }) => {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState(profile.target_role || "AI Engineer");
  const [fileName, setFileName] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultContent, setResultContent] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setResumeText(text);
      }
    };
    reader.onerror = () => {
      setError("Failed to read the document file. You can paste plain text directly.");
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError("Please paste your resume text or upload a document.");
      return;
    }

    setLoading(true);
    setError(null);
    setResultContent(null);

    try {
      const prompt = `Perform an ATS quality assessment on the following resume for the target role: "${targetRole}".
${jobDescription ? `Target Job Description to match against:\n${jobDescription}\n` : ""}
Resume Text:
${resumeText}

Please evaluate:
1. Estimated CV Quality Score (clearly noted as a heuristic estimate)
2. Keyword matching & terminology alignment
3. Section completeness (contact, summary, experience, education, skills, projects)
4. Achievement quality & quantifiable metric usage
5. Readability feedback & missing critical details
6. Recommended improvements to maximize ATS parsing.`;

      const res = await sendChatMessage({
        message: prompt,
        profile: {
          ...profile,
          target_role: targetRole,
        },
      });

      setResultContent(res.message);
    } catch (err: any) {
      setError(err?.message || "Failed to conduct ATS evaluation.");
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
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <span>ATS Resume Checker</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Heuristic ATS compatibility screening. Check keyword density, section parsing, and achievement impact.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Resume Text */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Resume Content
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="ats-resume-upload"
                  accept=".txt,.pdf,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="ats-resume-upload"
                  className="cursor-pointer text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </label>
              </div>
            </div>

            {fileName && (
              <div className="flex items-center justify-between p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-indigo-950 truncate">{fileName}</span>
                </div>
                <button
                  onClick={() => {
                    setFileName(null);
                    setResumeText("");
                  }}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste the full text of your resume here..."
              rows={10}
              className="w-full p-3.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white leading-relaxed resize-y"
            />
          </div>

          {/* Right: Target Role & Job Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Role
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
                Target Job Description (Optional for Keyword Match)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job posting requirements here to check keyword alignment..."
                rows={7}
                className="w-full p-3.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white leading-relaxed resize-y"
              />
            </div>

            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-900">
              Scores are simulated heuristic estimates based on industry ATS practices, not proprietary ATS algorithms.
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 flex justify-end pt-4 border-t border-slate-100">
          <button
            onClick={handleAnalyze}
            disabled={loading || !resumeText.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running ATS Heuristics...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Resume Quality</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Card */}
      {resultContent && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">
              ATS Assessment Results: {targetRole}
            </h2>
          </div>
          <MarkdownRenderer content={resultContent} />
        </div>
      )}
    </div>
  );
};
