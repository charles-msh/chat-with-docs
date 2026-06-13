"use client";

import { useRef } from "react";
import { Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";

interface Example {
  emoji: string;
  title: string;
  description: string;
  query: string;
}

const EXAMPLES: Example[] = [
  {
    emoji: "📱",
    title: "아이폰 뒷면 탭",
    description: "뒷면 탭 동작 설정하는 방법",
    query: "아이폰 뒷면 탭 동작 설정하는 방법을 알려줘",
  },
  {
    emoji: "🚗",
    title: "쏘나타 계기판",
    description: "계기판 화면 변경하는 방법",
    query: "쏘나타 계기판 화면 변경하는 방법을 알려줘",
  },
  {
    emoji: "💻",
    title: "맥북 배터리 관리",
    description: "배터리 수명 늘리는 설정법",
    query: "맥북 배터리 수명을 늘리는 설정 방법을 알려줘",
  },
  {
    emoji: "📺",
    title: "LG TV 미러링",
    description: "스마트폰 화면 연결하기",
    query: "LG TV에 스마트폰 화면 미러링하는 방법을 알려줘",
  },
  {
    emoji: "🎮",
    title: "PS5 초기 설정",
    description: "처음 구매 후 설정 가이드",
    query: "PS5 처음 구매 후 초기 설정하는 방법을 알려줘",
  },
];

interface ExampleCardsProps {
  onQueryClick: (query: string) => void;
}

export default function ExampleCards({ onQueryClick }: ExampleCardsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <div className="px-5 pb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Lightbulb size={16} className="text-amber-500" />
          <span className="text-sm font-semibold text-slate-700">이렇게 물어보세요</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-1 px-1 pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {EXAMPLES.map((ex) => (
          <button
            key={ex.title}
            onClick={() => onQueryClick(ex.query)}
            className="snap-start min-w-[160px] max-w-[160px] bg-white border border-slate-200 rounded-2xl p-4 text-left hover:border-blue-300 hover:shadow-sm transition-all active:scale-[0.97] shrink-0"
          >
            <span className="text-2xl block mb-2">{ex.emoji}</span>
            <p className="text-sm font-semibold text-slate-800 mb-1 leading-tight">{ex.title}</p>
            <p className="text-xs text-slate-500 leading-snug">{ex.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
