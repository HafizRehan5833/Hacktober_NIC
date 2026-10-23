import React, { useState } from "react";
import {
  FileEdit,
  Sparkles,
  Copy,
  Printer,
  Download,
  Check,
  RotateCcw,
  Loader2,
  AlertCircle,
  Eye,
  Edit3,
} from "lucide-react";
import { sendChatMessage } from "@/lib/api";
import { UserProfile } from "@/types";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface ResumeWriterProps {
  profile: UserProfile;
}

export const ResumeWriter: React.FC<ResumeWriterProps> = ({ profile }) => {
  const [fullName, setFullName] = useState("Muhammad Rehan");
  const [targetRole, setTargetRole] = useState(profile.target_role || "AI Engineer");
  const [education, setEducation] = useState(profile.education || "BS Computer Science (2020-2024)");
  const [skills, setSkills] = useState(
    profile.skills && profile.skills.length > 0 ? profile.skills.join(", ") : "Python, FastAPI, PyTorch, Docker, Git"
  );
  const [experience, setExperience] = useState(
    "Junior Backend Developer Intern at TechCorp (6 mos): Built FastAPI REST endpoints, optimized queries, wrote unit tests."
  );
  const [projects, setProjects] = useState(
    "1. SkillBridge AI: Career mentoring application with Gemma 4 & RapidAPI.\n2. RAG Document Assistant: Vector search engine with ChromaDB and LangChain."
  );
  const [certifications, setCertifications] = useState("DeepLearning.AI AI Developer Certificate");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedResume, setGeneratedResume] = useState<string | null>(null);
  const [editableResume, setEditableResume] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!fullName.trim() || !targetRole.trim()) {
      setError("Please provide your full name and target role.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const prompt = `Write a professional, truthful, ATS-optimized resume using ONLY the following facts provided by the candidate.
Do NOT invent, fabricate, or hallucinate any work experience, degrees, certifications, or metrics not listed below.
Target Role: ${targetRole}
Full Name: ${fullName}
Education: ${education}
Technical Skills: ${skills}
Work Experience: ${experience}
Projects: ${projects}
Certifications: ${certifications}

Format with clear markdown sections: Summary, Technical Skills, Professional Experience, Featured Projects, Education, and Certifications. Use action verbs and highlight real provided achievements truthfully.`;

      const res = await sendChatMessage({
        message: prompt,
        profile: {
          ...profile,
          target_role: targetRole,
        },
      });

      setGeneratedResume(res.message);
      setEditableResume(res.message);
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.message || "Failed to generate resume draft.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([editableResume], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fullName.replace(/\s+/g, "_")}_Resume.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileEdit className="w-6 h-6 text-indigo-600" />
            <span>Truthful Resume Writer</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Build ATS-formatted resumes grounded strictly in your genuine skills and achievements without hallucinated metrics.
          </p>
        </div>

        {/* Inputs */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Job Role
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
              Education & Degrees
            </label>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g. BS Computer Science, National Textile University (2024)"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Technical & Soft Skills
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Python, FastAPI, Docker, PyTorch, SQL, Git"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Work Experience (Titles, Companies, Responsibilities)
            </label>
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Provide genuine experience points..."
              rows={3}
              className="w-full p-3.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Projects & Portfolios
            </label>
            <textarea
              value={projects}
              onChange={(e) => setProjects(e.target.value)}
              placeholder="Key projects with tech stacks..."
              rows={3}
              className="w-full p-3.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Certifications & Honors
            </label>
            <textarea
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
              placeholder="e.g. AWS Certified Developer, DeepLearning.AI"
              rows={3}
              className="w-full p-3.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white resize-y"
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
            Strict adherence to honesty: Gemma 4 organizes and structures only factual data provided above.
          </p>

          <button
            onClick={handleGenerate}
            disabled={loading || !fullName.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Composing ATS Resume...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate ATS Resume</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Resume Workspace */}
      {generatedResume && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Generated Resume: {fullName}
              </h2>
              <span className="text-xs text-slate-500">
                Ready for review, editing, and export
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  isEditing
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                <span>{isEditing ? "Preview Formatted" : "Edit Raw Text"}</span>
              </button>

              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                title="Copy Resume Content"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                title="Print-Friendly"
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

          {isEditing ? (
            <textarea
              value={editableResume}
              onChange={(e) => setEditableResume(e.target.value)}
              rows={20}
              className="w-full p-4 border border-slate-300 rounded-2xl font-mono text-xs leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50/50"
            />
          ) : (
            <div className="p-6 bg-slate-50/60 rounded-2xl border border-slate-200/80">
              <MarkdownRenderer content={editableResume} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
