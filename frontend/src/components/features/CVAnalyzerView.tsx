import React, { useState } from "react";
import {
  UploadCloud,
  FileText,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Search,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { sendChatMessage, extractResumeText } from "@/lib/api";
import { UserProfile, ChatResponse, JobListing } from "@/types";
import { JobCard } from "@/components/JobCard";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface CVAnalyzerViewProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export const CVAnalyzerView: React.FC<CVAnalyzerViewProps> = ({ profile, setProfile }) => {
  const [cvText, setCvText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState(profile.target_role || "");
  const [preferredLocation, setPreferredLocation] = useState(profile.target_location || "");
  const [autoSearchJobs, setAutoSearchJobs] = useState(true);

  const [loading, setLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ChatResponse | null>(null);

  // File upload handler (extracts text from PDF/TXT documents)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    setError(null);
    setIsExtracting(true);

    try {
      if (file.name.toLowerCase().endsWith(".pdf")) {
        const extracted = await extractResumeText(file);
        setCvText(extracted);
      } else {
        // Plain text files
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result;
          if (typeof text === "string") {
            setCvText(text);
          }
        };
        reader.onerror = () => {
          setError("Failed to read the uploaded document. You can paste plain text directly.");
        };
        reader.readAsText(file);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to extract text from the uploaded document.");
    } finally {
      setIsExtracting(false);
    }
  };


  const handleClearFile = () => {
    setCvText("");
    setFileName(null);
    setFileSize(null);
    setAnalysisResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!cvText.trim()) {
      setError("Please paste your CV text or upload a document before running the audit.");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const payload = {
        message: targetRole
          ? `Please analyze my CV for the target role of ${targetRole} in ${preferredLocation || "any location"} and find matching jobs.`
          : "Please extract my degree, detect my skills, and evaluate my career opportunities.",
        cv_text: cvText,
        auto_search_jobs: autoSearchJobs,
        profile: {
          ...profile,
          target_role: targetRole || profile.target_role,
          target_location: preferredLocation || profile.target_location,
        },
      };

      const res = await sendChatMessage(payload);
      setAnalysisResult(res);

      // Auto-update local profile target role if suggested
      if (targetRole && !profile.target_role) {
        setProfile((prev) => ({ ...prev, target_role: targetRole }));
      }
    } catch (err: any) {
      setError(err?.message || "Failed to analyze CV. Please verify backend connectivity.");
    } finally {
      setLoading(false);
    }
  };

  const loadSampleCV = () => {
    const sample = `Muhammad Rehan
Email: rehan@example.com | Location: Faisalabad, Pakistan

EDUCATION:
BS Computer Science, National Textile University (2020 - 2024)
CGPA: 3.6/4.0

TECHNICAL SKILLS:
Languages: Python, JavaScript, TypeScript, SQL
Frameworks: FastAPI, Django, React, Next.js
Tools: Docker, Git, PostgreSQL, Redis, REST APIs, LangChain

EXPERIENCE:
Junior Backend Developer Intern — TechSolutions (2023 - 2024)
- Developed and maintained high-throughput REST APIs using FastAPI and PostgreSQL.
- Implemented rate limiting and token authentication microservice.
- Integrated automated testing with pytest covering 85% of critical endpoints.

PROJECTS:
1. SkillBridge AI Career Advisor
- Full-stack career mentoring engine using Gemma 4, FastAPI, and RapidAPI job data.
- Built stateless resume parsing and automated skill gap analysis algorithm.`;

    setCvText(sample);
    setFileName("Sample_Resume.txt");
    setFileSize("1.4 KB");
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              CV & Resume Analyzer
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Extract technical skills, verify degree qualifications, and audit for weaknesses without server data storage.
            </p>
          </div>
          <button
            onClick={loadSampleCV}
            className="px-4 py-2 border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-semibold self-start sm:self-auto transition-colors"
          >
            Load Sample CV
          </button>
        </div>

        {/* Input Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* File Upload / Paste Area */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-6 text-center transition-all bg-slate-50/50">
              <input
                type="file"
                id="cv-file-input"
                accept=".txt,.pdf,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="cv-file-input"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  {isExtracting ? (
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  ) : (
                    <UploadCloud className="w-6 h-6" />
                  )}
                </div>
                <span className="text-sm font-bold text-slate-800">
                  {isExtracting ? "Extracting text from PDF..." : "Click to browse or drag & drop CV"}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Supports PDF, plain text, TXT, or markdown (or paste below)
                </span>
              </label>
            </div>

            {fileName && (
              <div className="flex items-center justify-between p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-indigo-950 truncate">{fileName}</span>
                  <span className="text-indigo-500 text-[11px] shrink-0">({fileSize})</span>
                </div>
                <button
                  onClick={handleClearFile}
                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                  title="Remove document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Extracted CV Text Content
              </label>
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Or paste your resume / CV text directly here..."
                rows={9}
                className="w-full p-3.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/70">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Target Alignment
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Job Role (Optional)
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. AI Engineer, Backend Developer, Data Scientist"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Location (Optional)
                </label>
                <input
                  type="text"
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  placeholder="e.g. Faisalabad, Remote, Lahore, United States"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={autoSearchJobs}
                    onChange={(e) => setAutoSearchJobs(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span>Automatically search matching RapidAPI jobs for extracted skills</span>
                </label>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading || !cvText.trim()}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Resume with Gemma 4...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Audit CV & Discover Opportunities</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">Resume Audit Synthesis</h2>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full border border-indigo-100">
                Model: {analysisResult.model_used}
              </span>
            </div>

            <MarkdownRenderer content={analysisResult.message} />
          </div>

          {/* Matched Live Jobs Section */}
          {analysisResult.job_results && analysisResult.job_results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <span>Matching RapidAPI Job Opportunities</span>
                </h3>
                <span className="text-xs text-slate-500">
                  {analysisResult.job_results.length} verified listings retrieved
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisResult.job_results.map((job, idx) => (
                  <JobCard key={idx} job={job} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
