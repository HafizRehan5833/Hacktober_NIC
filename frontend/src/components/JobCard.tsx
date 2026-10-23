import React from "react";
import { Briefcase, MapPin, Building, ExternalLink, Globe, Sparkles } from "lucide-react";
import { JobListing } from "@/types";

interface JobCardProps {
  job: JobListing;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const isRemote =
    job.remote === true ||
    job.remote === "true" ||
    (typeof job.location === "string" && job.location.toLowerCase().includes("remote"));

  return (
    <div className="bg-white border border-slate-200/90 hover:border-indigo-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 text-base">
              {job.title || "Career Opening"}
            </h3>
            <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mt-1">
              <Building className="w-3.5 h-3.5 text-indigo-500" />
              {job.company || "Hiring Company"}
            </p>
          </div>
          {job.match_score && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              {job.match_score}% Match
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 my-3">
          <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
            <MapPin className="w-3 h-3 text-slate-400" />
            {job.location || "Location not stated"}
          </span>

          {isRemote && (
            <span className="flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200/60 px-2 py-0.5 rounded-md font-medium">
              <Globe className="w-3 h-3" />
              Remote
            </span>
          )}

          {job.employment_type && (
            <span className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200/60 px-2 py-0.5 rounded-md font-medium">
              <Briefcase className="w-3 h-3" />
              {job.employment_type}
            </span>
          )}
        </div>

        {job.summary && (
          <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
            {job.summary}
          </p>
        )}

        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.skills.slice(0, 5).map((sk, idx) => (
              <span
                key={idx}
                className="text-[11px] bg-indigo-50/70 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100"
              >
                {sk}
              </span>
            ))}
            {job.skills.length > 5 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{job.skills.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">
          Source: {job.source || "RapidAPI / Verified Listing"}
        </span>
        {job.apply_link ? (
          <a
            href={job.apply_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs hover:shadow transition-all"
          >
            Apply Now
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <span className="text-xs text-slate-400 italic">No direct link</span>
        )}
      </div>
    </div>
  );
};
