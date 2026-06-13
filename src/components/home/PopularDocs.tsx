"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Flame } from "lucide-react";

interface PopularGroup {
  id: string;
  name: string;
  emoji: string;
  description: string;
  weeklyUsage: number;
}

export default function PopularDocs() {
  const router = useRouter();
  const [groups, setGroups] = useState<PopularGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/public-groups");
        const data = await res.json();
        const sorted = (data.groups || [])
          .sort((a: PopularGroup, b: PopularGroup) => b.weeklyUsage - a.weeklyUsage)
          .slice(0, 5);
        setGroups(sorted);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="px-5 pb-6">
        <div className="flex items-center gap-1.5 mb-3">
          <Flame size={16} className="text-orange-500" />
          <span className="text-sm font-semibold text-slate-700">이번 주 인기 문서</span>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="px-5 pb-6">
        <div className="flex items-center gap-1.5 mb-3">
          <Flame size={16} className="text-orange-500" />
          <span className="text-sm font-semibold text-slate-700">이번 주 인기 문서</span>
        </div>
        <div className="text-center py-6 text-slate-400 text-sm">
          아직 등록된 문서가 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pb-6">
      <div className="flex items-center gap-1.5 mb-3">
        <Flame size={16} className="text-orange-500" />
        <span className="text-sm font-semibold text-slate-700">이번 주 인기 문서</span>
      </div>
      <div className="space-y-2">
        {groups.map((g, i) => (
          <button
            key={g.id}
            onClick={() => router.push(`/chat?group=${g.id}`)}
            className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors active:scale-[0.98] text-left"
          >
            <span className="text-sm font-bold text-blue-500 w-5 text-center shrink-0">
              {i + 1}
            </span>
            <span className="text-lg shrink-0">{g.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{g.name}</p>
              <p className="text-xs text-slate-400">
                이번 주 {g.weeklyUsage}회 질문
              </p>
            </div>
            <svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
