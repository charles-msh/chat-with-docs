"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Search, ArrowUp, User } from "lucide-react";
import ExampleCards from "@/components/home/ExampleCards";
import PopularDocs from "@/components/home/PopularDocs";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const isLoggedIn = !!session?.user;

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/chat?q=${encodeURIComponent(trimmed)}`);
  };

  const handleExampleClick = (q: string) => {
    router.push(`/chat?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="h-dvh w-full bg-white flex flex-col">
      {/* Header */}
      <div className="px-5 pt-safe-top flex items-center justify-between h-12 shrink-0">
        <span className="text-base font-bold text-slate-800">Chat with Docs</span>
        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            {session.user?.image ? (
              <img src={session.user.image} alt="" className="w-7 h-7 rounded-full border border-slate-200" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-blue-600 font-semibold hover:underline"
          >
            로그인
          </button>
        )}
      </div>

      {/* Main Content - scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero + Search */}
        <div className="px-5 pt-10 pb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1 text-center">
            무엇이든 물어보세요
          </h1>
          <p className="text-sm text-slate-500 text-center mb-6">
            URL이나 문서를 연결하면 AI가 답변합니다
          </p>

          {/* Search Bar */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Search size={18} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="질문을 입력하세요..."
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
              />
              <button
                onClick={handleSubmit}
                disabled={!query.trim()}
                className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 flex items-center justify-center transition-colors shrink-0"
              >
                <ArrowUp size={16} className={query.trim() ? "text-white" : "text-slate-400"} />
              </button>
            </div>
          </div>
        </div>

        {/* Example Cards */}
        <ExampleCards onQueryClick={handleExampleClick} />

        {/* Popular Docs */}
        <PopularDocs />

        {/* Footer */}
        <div className="text-center py-6 pb-safe-bottom">
          <p className="text-xs text-slate-400">Chat with Docs beta</p>
        </div>
      </div>
    </div>
  );
}
