"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ProfileContextBar } from "@/components/ProfileContextBar";
import { DashboardView } from "@/components/features/DashboardView";
import { MentorChatView } from "@/components/features/MentorChatView";
import { CVAnalyzerView } from "@/components/features/CVAnalyzerView";
import { JobFinderView } from "@/components/features/JobFinderView";
import { SkillGapView } from "@/components/features/SkillGapView";
import { LearningRoadmapView } from "@/components/features/LearningRoadmapView";
import { InterviewPrepView } from "@/components/features/InterviewPrepView";
import { PortfolioView } from "@/components/features/PortfolioView";
import { SalaryExplorerView } from "@/components/features/SalaryExplorerView";
import { ATSChecker } from "@/components/features/ATSChecker";
import { ResumeWriter } from "@/components/features/ResumeWriter";
import { CareerProgressView } from "@/components/features/CareerProgressView";
import { checkBackendHealth } from "@/lib/api";
import { ActiveTab, UserProfile } from "@/types";
import { Cpu, Menu, ShieldCheck } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Connection and backend status
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [modelUsed, setModelUsed] = useState<string>("Gemma 4 via Gemini");

  // Client-managed profile context
  const [profile, setProfile] = useState<UserProfile>({
    education: "BS Computer Science",
    skills: ["Python", "FastAPI", "Docker", "Git"],
    experience_level: "Beginner",
    target_role: "AI Engineer",
    interests: ["LLMs", "Autonomous Agents", "Backend Systems"],
    target_location: "Remote",
  });
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);

  // Cross-feature message or context handoffs
  const [mentorInitialPrompt, setMentorInitialPrompt] = useState<string>("");
  const [roadmapRole, setRoadmapRole] = useState<string>("");
  const [roadmapSkills, setRoadmapSkills] = useState<string[]>([]);

  // Periodically check backend health
  useEffect(() => {
    let isMounted = true;
    const verifyHealth = async () => {
      try {
        const res = await checkBackendHealth();
        if (isMounted) {
          setBackendOnline(res.status === "ok");
          if (res.gemini_model) setModelUsed(res.gemini_model);
        }
      } catch {
        if (isMounted) setBackendOnline(false);
      }
    };

    verifyHealth();
    const interval = setInterval(verifyHealth, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleQuickPrompt = (prompt: string) => {
    setMentorInitialPrompt(prompt);
    setActiveTab("mentor");
  };

  const handleSetRoadmapContext = (role: string, skills: string[]) => {
    setRoadmapRole(role);
    setRoadmapSkills(skills);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 font-sans text-slate-800 flex">
      {/* Sidebar for Desktop */}
      <div className="hidden md:block">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          backendOnline={backendOnline}
          modelUsed={modelUsed}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 bg-white h-full shadow-2xl">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              collapsed={false}
              setCollapsed={() => setMobileMenuOpen(false)}
              backendOnline={backendOnline}
              modelUsed={modelUsed}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "md:ml-20" : "md:ml-72"
        }`}
      >
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm hidden sm:inline">
                SkillBridge AI
              </span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="text-xs sm:text-sm font-semibold text-indigo-600 capitalize">
                {activeTab.replace("-", " ")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100/80 rounded-full border border-slate-200 text-xs">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-slate-600 font-medium">Model:</span>
              <span className="text-slate-900 font-semibold">{modelUsed}</span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                backendOnline === true
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  : backendOnline === false
                  ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                  : "bg-amber-50 text-amber-700 border border-amber-200/60"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendOnline === true
                    ? "bg-emerald-500 animate-pulse"
                    : backendOnline === false
                    ? "bg-rose-500"
                    : "bg-amber-500"
                }`}
              />
              <span className="hidden sm:inline">
                {backendOnline === true
                  ? "FastAPI 8000"
                  : backendOnline === false
                  ? "Backend Offline"
                  : "Connecting..."}
              </span>
            </div>
          </div>
        </header>

        {/* Inner Page View */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {/* Active Context Bar (hidden on chat if preferred or accessible everywhere) */}
          {activeTab !== "mentor" && (
            <ProfileContextBar
              profile={profile}
              setProfile={setProfile}
              isExpanded={isProfileExpanded}
              setIsExpanded={setIsProfileExpanded}
            />
          )}

          {/* Conditional Screen Rendering */}
          {activeTab === "dashboard" && (
            <DashboardView
              setActiveTab={setActiveTab}
              onQuickPrompt={handleQuickPrompt}
              backendOnline={backendOnline}
              modelUsed={modelUsed}
              profile={profile}
            />
          )}

          {activeTab === "mentor" && (
            <MentorChatView
              profile={profile}
              initialPrompt={mentorInitialPrompt}
              onClearInitialPrompt={() => setMentorInitialPrompt("")}
            />
          )}

          {activeTab === "cv-analyzer" && (
            <CVAnalyzerView profile={profile} setProfile={setProfile} />
          )}

          {activeTab === "job-finder" && <JobFinderView profile={profile} />}

          {activeTab === "skill-gap" && (
            <SkillGapView
              profile={profile}
              setProfile={setProfile}
              setActiveTab={setActiveTab}
              onSetRoadmapContext={handleSetRoadmapContext}
            />
          )}

          {activeTab === "learning-roadmap" && (
            <LearningRoadmapView
              profile={profile}
              inheritedRole={roadmapRole}
              inheritedSkills={roadmapSkills}
            />
          )}

          {activeTab === "interview-prep" && <InterviewPrepView profile={profile} />}

          {activeTab === "portfolio" && (
            <PortfolioView
              profile={profile}
              setActiveTab={setActiveTab}
              onAskMentor={handleQuickPrompt}
            />
          )}

          {activeTab === "salary-explorer" && <SalaryExplorerView profile={profile} />}

          {activeTab === "ats-checker" && <ATSChecker profile={profile} />}

          {activeTab === "resume-writer" && <ResumeWriter profile={profile} />}

          {activeTab === "career-progress" && <CareerProgressView profile={profile} />}
        </main>
      </div>
    </div>
  );
}
