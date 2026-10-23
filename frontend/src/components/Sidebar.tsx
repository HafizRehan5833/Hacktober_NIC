import React from "react";
import {
  LayoutDashboard,
  Bot,
  FileSearch,
  Briefcase,
  GitCompare,
  Milestone,
  HelpCircle,
  FolderGit2,
  DollarSign,
  ShieldCheck,
  FileEdit,
  TrendingUp,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { ActiveTab } from "@/types";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  backendOnline: boolean | null;
  modelUsed?: string;
}

const navItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "mentor", label: "AI Career Mentor", icon: Bot, badge: "Gemma 4" },
  { id: "cv-analyzer", label: "CV Analyzer", icon: FileSearch },
  { id: "job-finder", label: "Job Finder", icon: Briefcase, badge: "Live" },
  { id: "skill-gap", label: "Skill-Gap Analysis", icon: GitCompare },
  { id: "learning-roadmap", label: "Learning Roadmap", icon: Milestone },
  { id: "portfolio", label: "Portfolio Projects", icon: FolderGit2 },
  { id: "ats-checker", label: "ATS Resume Checker", icon: ShieldCheck },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  backendOnline,
  modelUsed,
}) => {
  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen transition-all duration-300 ease-in-out border-r border-slate-200/80 bg-white/95 backdrop-blur-md flex flex-col justify-between shadow-sm ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Top Header / Branding */}
      <div>
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-100">
          <div
            onClick={() => setActiveTab("dashboard")}
            className="flex items-center gap-3 cursor-pointer group select-none overflow-hidden"
          >
            <div className="h-10 w-10 min-w-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            {!collapsed && (
              <div className="transition-opacity duration-200">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 bg-clip-text text-transparent">
                  SkillBridge<span className="text-indigo-600 font-extrabold">.AI</span>
                </span>
                <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                  Your AI Career Mentor
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)] scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/70"
                }`}
              >
                <Icon
                  className={`w-5 h-5 min-w-5 transition-colors ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600"
                  }`}
                />
                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Backend Status</span>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium ${
                  backendOnline === true
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                    : backendOnline === false
                    ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                    : "bg-amber-50 text-amber-700 border border-amber-200/60"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    backendOnline === true
                      ? "bg-emerald-500 animate-pulse"
                      : backendOnline === false
                      ? "bg-rose-500"
                      : "bg-amber-500"
                  }`}
                />
                {backendOnline === true ? "Connected" : backendOnline === false ? "Offline" : "Checking..."}
              </span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              <Cpu className="w-4 h-4 text-indigo-600 min-w-4" />
              <div className="text-[11px] leading-tight overflow-hidden">
                <p className="font-semibold text-slate-800">Powered by Gemma 4</p>
                <p className="text-slate-400 truncate">Stateless AI Engine</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span
              title={backendOnline ? "Backend Connected" : "Backend Offline"}
              className={`w-2.5 h-2.5 rounded-full ${
                backendOnline ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            <div title="Powered by Gemma 4"><Cpu className="w-5 h-5 text-indigo-600" /></div>
          </div>
        )}
      </div>
    </aside>
  );
};
