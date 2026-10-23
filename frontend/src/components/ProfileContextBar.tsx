import React from "react";
import { UserProfile } from "@/types";
import { User, GraduationCap, MapPin, Target, Wrench, ChevronDown, ChevronUp } from "lucide-react";

interface ProfileContextBarProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

export const ProfileContextBar: React.FC<ProfileContextBarProps> = ({
  profile,
  setProfile,
  isExpanded,
  setIsExpanded,
}) => {
  const handleSkillInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = e.currentTarget.value.trim().replace(/,$/, "");
      if (val && !profile.skills?.includes(val)) {
        setProfile((prev) => ({
          ...prev,
          skills: [...(prev.skills || []), val],
        }));
        e.currentTarget.value = "";
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills?.filter((s) => s !== skillToRemove) || [],
    }));
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden mb-6 transition-all">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-5 py-3.5 bg-gradient-to-r from-slate-50 via-indigo-50/20 to-white flex items-center justify-between cursor-pointer select-none border-b border-slate-100"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Active Career Context (Stateless)
            </h4>
            <p className="text-xs text-slate-500">
              {profile.target_role || "No target role set"} • {profile.experience_level || "Beginner"} •{" "}
              {profile.skills?.length || 0} skills loaded
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
          <span>{isExpanded ? "Hide Details" : "Edit Profile Context"}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-600" /> Target Role
            </label>
            <input
              type="text"
              value={profile.target_role || ""}
              onChange={(e) => setProfile({ ...profile, target_role: e.target.value })}
              placeholder="e.g. AI Engineer, Backend Dev"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" /> Education
            </label>
            <input
              type="text"
              value={profile.education || ""}
              onChange={(e) => setProfile({ ...profile, education: e.target.value })}
              placeholder="e.g. BS Computer Science"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Location
            </label>
            <input
              type="text"
              value={profile.target_location || ""}
              onChange={(e) => setProfile({ ...profile, target_location: e.target.value })}
              placeholder="e.g. Remote, Lahore, Karachi, USA"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" /> Experience Level
            </label>
            <select
              value={profile.experience_level || "Beginner"}
              onChange={(e) => setProfile({ ...profile, experience_level: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50 text-slate-700"
            >
              <option value="Student">Student</option>
              <option value="Beginner">Beginner / Fresh Graduate</option>
              <option value="Intermediate">Intermediate (1-3 yrs)</option>
              <option value="Senior">Senior (3+ yrs)</option>
            </select>
          </div>

          <div className="md:col-span-2 lg:col-span-4 mt-2">
            <label className="block text-slate-700 font-semibold mb-1.5 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-indigo-600" /> Active Skills (Type & Press Enter)
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 border border-slate-300 rounded-xl bg-slate-50/40 min-h-[42px]">
              {profile.skills?.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-lg font-medium text-xs shadow-2xs"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSkill(s)}
                    className="hover:text-rose-600 transition-colors ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                onKeyDown={handleSkillInput}
                placeholder="Add skill (e.g. Python, Docker, React)..."
                className="flex-1 min-w-[150px] bg-transparent outline-none text-xs px-2 py-1 text-slate-800 placeholder-slate-400"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Context is managed locally in your session and passed with requests to Gemma 4. Not stored in any database.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
