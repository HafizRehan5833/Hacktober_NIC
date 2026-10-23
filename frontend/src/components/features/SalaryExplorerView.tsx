import React, { useState } from "react";
import {
  DollarSign,
  MapPin,
  Briefcase,
  TrendingUp,
  Loader2,
  AlertCircle,
  Sparkles,
  Info,
} from "lucide-react";
import { sendChatMessage } from "@/lib/api";
import { UserProfile, SalaryInsights } from "@/types";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface SalaryExplorerViewProps {
  profile: UserProfile;
}

export const SalaryExplorerView: React.FC<SalaryExplorerViewProps> = ({ profile }) => {
  const [jobTitle, setJobTitle] = useState(profile.target_role || "AI Engineer");
  const [location, setLocation] = useState(profile.target_location || "United States");
  const [experienceLevel, setExperienceLevel] = useState(profile.experience_level || "Beginner");
  const [currency, setCurrency] = useState("USD");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salaryResult, setSalaryResult] = useState<SalaryInsights | null>(null);
  const [reportText, setReportText] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!jobTitle.trim()) {
      setError("Please specify a job role.");
      return;
    }

    setLoading(true);
    setError(null);
    setSalaryResult(null);
    setReportText(null);

    try {
      const prompt = `Search compensation intel for: "${jobTitle}" in "${location}" for ${experienceLevel} level in ${currency}.
Retrieve estimated median, min, max salary percentiles from RapidAPI or verified salary ontology.
Please provide clear disclosure of data source, currency, and data limitations. Do not invent compensation or promise guaranteed wages.`;

      const res = await sendChatMessage({
        message: prompt,
        profile: {
          ...profile,
          target_role: jobTitle,
          target_location: location,
        },
      });

      if (res.salary_results) {
        setSalaryResult(res.salary_results);
      }
      setReportText(res.message);
    } catch (err: any) {
      setError(err?.message || "Failed to retrieve salary data.");
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
            <DollarSign className="w-6 h-6 text-indigo-600" />
            <span>Salary & Compensation Explorer</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real salary metrics via RapidAPI integration. Understand percentiles and market expectations.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Title / Position
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. AI Engineer, Backend Developer, Data Scientist"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Location / Country
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. United States, Pakistan, Remote, UK"
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
              <option value="Entry-Level">Entry-Level / Beginner (0-1 yrs)</option>
              <option value="Junior">Junior (1-2 yrs)</option>
              <option value="Mid-Level">Mid-Level (3-5 yrs)</option>
              <option value="Senior">Senior (5+ yrs)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white text-slate-700"
            >
              <option value="USD">USD ($)</option>
              <option value="PKR">PKR (₨)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
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
            Compensation figures reflect estimated market ranges and should not be taken as guaranteed salaries.
          </p>

          <button
            onClick={handleSearch}
            disabled={loading || !jobTitle.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Fetching Market Intel...</span>
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4" />
                <span>Explore Compensation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Structured Salary Percentiles Card (if returned structured) */}
      {salaryResult && (
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div>
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                Verified Compensation Benchmark
              </span>
              <h2 className="text-xl font-extrabold text-white">
                {salaryResult.job_title || jobTitle} in {salaryResult.location || location}
              </h2>
            </div>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full font-mono">
              {salaryResult.currency || currency} / {salaryResult.salary_period || "year"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Minimum / 25th Percentile</span>
              <p className="text-2xl font-black text-white mt-1">
                {salaryResult.min_salary ? `${salaryResult.currency || "$"} ${Number(salaryResult.min_salary).toLocaleString()}` : "N/A"}
              </p>
            </div>

            <div className="bg-indigo-600/30 rounded-2xl p-5 border border-indigo-400/40 relative overflow-hidden">
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-indigo-500 text-[10px] font-bold uppercase">
                Median
              </div>
              <span className="text-xs text-indigo-200 font-medium">Median Market Rate</span>
              <p className="text-3xl font-black text-white mt-1">
                {salaryResult.median_salary ? `${salaryResult.currency || "$"} ${Number(salaryResult.median_salary).toLocaleString()}` : "Market Rate"}
              </p>
            </div>

            <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Top 75th+ Percentile</span>
              <p className="text-2xl font-black text-white mt-1">
                {salaryResult.max_salary ? `${salaryResult.currency || "$"} ${Number(salaryResult.max_salary).toLocaleString()}` : "N/A"}
              </p>
            </div>
          </div>

          {salaryResult.data_source && (
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Data source: {salaryResult.data_source}</span>
            </div>
          )}
        </div>
      )}

      {/* Advisory Report Content */}
      {reportText && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Compensation Synthesis & Factors
            </h2>
          </div>
          <MarkdownRenderer content={reportText} />
        </div>
      )}
    </div>
  );
};
