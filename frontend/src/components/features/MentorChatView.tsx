import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Trash2,
  Wrench,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { ChatMessage, ChatResponse, UserProfile } from "@/types";
import { sendChatMessage } from "@/lib/api";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { JobCard } from "@/components/JobCard";

interface MentorChatViewProps {
  profile: UserProfile;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

interface MessageItem extends ChatMessage {
  id: string;
  toolsUsed?: string[];
  jobResults?: any[] | null;
  modelUsed?: string;
  isError?: boolean;
}

export const MentorChatView: React.FC<MentorChatViewProps> = ({
  profile,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am **SkillBridge AI**, your personal career mentor powered by **Gemma 4**.\n\nI can help you:\n- **Analyze your skills & build a roadmap** for roles like AI Engineer or Backend Developer.\n- **Search live job openings** via RapidAPI with natural queries (e.g. *'Find Python jobs in Faisalabad'*).\n- **Prepare for technical and behavioral interviews**.\n- **Review and audit CVs** for high-impact improvements.\n\nHow can I help advance your career today?",
      toolsUsed: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle incoming initialPrompt (e.g. from Dashboard quick prompts)
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendPrompt(initialPrompt.trim());
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "fresh-session",
        role: "assistant",
        content:
          "Conversation cleared. Your session remains completely stateless and private. What career challenge would you like to tackle?",
      },
    ]);
  };

  const handleSendPrompt = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      // Prepare backend payload with client-side conversation context
      const historyPayload = newHistory
        .filter((m) => !m.isError && m.id !== "welcome" && m.id !== "fresh-session")
        .slice(-10)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const response: ChatResponse = await sendChatMessage({
        message: messageText,
        profile: profile,
        conversation_history: historyPayload,
      });

      const assistantMsg: MessageItem = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.message,
        toolsUsed: response.tools_used || [],
        jobResults: response.job_results,
        modelUsed: response.model_used,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: MessageItem = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `⚠️ **Unable to complete career request**\n\n${
          err.message || "An unexpected network or server error occurred."
        }\n\nPlease check your backend connection or verify that the SkillBridge API service is reachable.`,
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt(input);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              AI Career Mentor
              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                Gemma 4
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Stateless conversation • RapidAPI job verification
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Reset conversation (stateless)"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-700 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                <div
                  className={`p-4 rounded-2xl text-sm relative group shadow-2xs ${
                    isUser
                      ? "bg-indigo-600 text-white rounded-tr-xs"
                      : msg.isError
                      ? "bg-rose-50 border border-rose-200 text-rose-900 rounded-tl-xs"
                      : "bg-slate-50/90 border border-slate-200/80 text-slate-800 rounded-tl-xs"
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : (
                    <MarkdownRenderer content={msg.content} />
                  )}

                  {/* Copy Button */}
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-white/80 hover:bg-white text-slate-400 hover:text-slate-700 shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Tool Usage badges */}
                {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 px-1">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-indigo-500" /> Tools used:
                    </span>
                    {msg.toolsUsed.map((tool, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                )}

                {/* Inline Job Results if returned directly with message */}
                {msg.jobResults && msg.jobResults.length > 0 && (
                  <div className="pt-2 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Briefcase className="w-4 h-4 text-indigo-600" />
                      <span>Matching Verified Job Openings ({msg.jobResults.length})</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {msg.jobResults.slice(0, 4).map((job, jIdx) => (
                        <JobCard key={jIdx} job={job} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3.5 justify-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-700 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-xs bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Gemma 4 is synthesizing career insights...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-slate-200/80 bg-slate-50/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(input);
          }}
          className="flex items-end gap-3"
        >
          <div className="flex-1 bg-white border border-slate-300 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-500/20 rounded-2xl shadow-inner transition-all overflow-hidden">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your career mentor anything... (Enter to send, Shift+Enter for new line)"
              rows={2}
              className="w-full px-4 py-3 outline-none resize-none text-sm text-slate-800 placeholder-slate-400 bg-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[11px] text-slate-400 mt-2 text-center">
          Context is maintained during this active session only. SkillBridge AI stores no personal data.
        </p>
      </div>
    </div>
  );
};
