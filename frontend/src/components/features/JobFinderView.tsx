import React, { useState } from "react";
import {
  Search,
  MapPin,
  Briefcase,
  Globe,
  Loader2,
  AlertCircle,
  Building,
  Sparkles,
} from "lucide-react";
import { sendChatMessage } from "@/lib/api";
import { UserProfile, JobListing } from "@/types";
import { JobCard } from "@/components/JobCard";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface JobFinderViewProps {
  profile: UserProfile;
}

const exampleQueries = [
  "I am a ythondeveloper jobs in fsd",
  "Find entry-level AI engineer jobs in Faisalabad.",
  "Find remote Python developer jobs.",
  "Find React developer vacancies in Lahore.",
  "Find FastAPI backend developer jobs in Pakistan.",
];

export const JobFinderView: React.FC<JobFinderViewProps> = ({ profile }) => {
  const [query, setQuery] = useState(profile.target_role || "AI Engineer");
  const [location, setLocation] = useState(profile.target_location || "Remote");
  const [experienceLevel, setExperienceLevel] = useState(profile.experience_level || "Beginner");
  const [isRemoteOnly, setIsRemoteOnly] = useState(false);
  const [companyFilter, setCompanyFilter] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [advisoryMessage, setAdvisoryMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (overrideQuery?: string) => {
    const activeQuery = overrideQuery || query;
    if (!activeQuery.trim()) {
      setError("Please specify a job title, skill keyword, or natural query.");
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setJobs([]);
    setAdvisoryMessage(null);

    try {
      // Craft query payload leveraging backend alias parser and RapidAPI
      let constructedPrompt = activeQuery;
      if (!overrideQuery) {
        const parts = [activeQuery];
        if (location) parts.push(`in ${location}`);
        if (isRemoteOnly && !activeQuery.toLowerCase().includes("remote")) parts.push("remote");
        if (companyFilter) parts.push(`at ${companyFilter}`);
        constructedPrompt = `Find ${parts.join(" ")} jobs for ${experienceLevel} level.`;
      }

      const res = await sendChatMessage({
        message: constructedPrompt,
        profile: {
          ...profile,
          target_role: activeQuery,
          target_location: location,
          experience_level: experienceLevel,
        },
      });

      if (res.job_results && Array.isArray(res.job_results)) {
        setJobs(res.job_results);
      }
      setAdvisoryMessage(res.message);
    } catch (err: any) {
      setError(err?.message || "Failed to retrieve job listings from backend RapidAPI service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Search Header Form */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-indigo-600" />
            <span>Live Job Market Finder</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time job search powered by RapidAPI (JSearch). Supports typo correction and Pakistani city aliases (FSD, LHR, ISB, KHI).
          </p>
        </div>

        {/* Form Inputs */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Title / Keyword / Natural Query
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="e.g. AI Engineer, Python Developer, 'FastAPI jobs in LHR'"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location / City Alias
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. FSD, Lahore, Remote, PK"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              />
            </div>
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
              <option value="Internship">Internship / Student</option>
              <option value="Beginner">Entry-Level / Beginner</option>
              <option value="Intermediate">Intermediate (1-3 yrs)</option>
              <option value="Senior">Senior (3+ yrs)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Specific Company (Optional)
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                placeholder="e.g. Google, Microsoft, Systems Ltd"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={isRemoteOnly}
                onChange={(e) => setIsRemoteOnly(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-indigo-600" /> Remote Roles Only
              </span>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Powered by Gemma 4 intelligent query normalization & RapidAPI live jobs.
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Querying RapidAPI...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Search Verified Jobs</span>
              </>
            )}
          </button>
        </div>

        {/* Example Queries */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Try Natural Language Queries:
          </span>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((eq, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(eq);
                  handleSearch(eq);
                }}
                className="text-left text-xs bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 rounded-lg px-2.5 py-1.5 transition-colors"
              >
                “{eq}”
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to fetch live jobs</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Advisory Message from Gemma 4 */}
      {advisoryMessage && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Career Market Analysis</h3>
          </div>
          <MarkdownRenderer content={advisoryMessage} />
        </div>
      )}

      {/* Job Results List */}
      {jobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <span>Available Verified Openings ({jobs.length})</span>
            </h2>
            <span className="text-xs text-slate-500">Live RapidAPI Data</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job, idx) => (
              <JobCard key={idx} job={job} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {hasSearched && !loading && jobs.length === 0 && !error && (
        <div className="text-center py-12 bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Direct Listings Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            The external RapidAPI search returned no immediate vacancies for this specific query.
            Review the advisor notes above for related roles and recommendations.
          </p>
        </div>
      )}
    </div>
  );
};
