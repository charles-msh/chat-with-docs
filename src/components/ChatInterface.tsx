"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage, MessageSender } from "@/types";
import MessageItem from "./MessageItem";
import { Send } from "lucide-react";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (query: string) => void;
  isLoading: boolean;
  placeholderText: string;
  suggestions: string[];
  onSuggestionClick: (query: string) => void;
  isFetchingSuggestions: boolean;
  onToggleSidebar: () => void;
  docCount: number;
  activeGroupName: string;
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isLoading,
  placeholderText,
  suggestions,
  onSuggestionClick,
  isFetchingSuggestions,
  onToggleSidebar,
  docCount,
  activeGroupName,
}: ChatInterfaceProps) {
  const [query, setQuery] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setQuery("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 128) + "px";
  };

  const userMessageCount = messages.filter((m) => m.sender === MessageSender.USER).length;
  const showSuggestions = suggestions.length > 0 && userMessageCount === 0;

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
        <div className="min-w-0">
          <h1 className="text-base font-extrabold text-slate-800 tracking-tight leading-tight truncate">
            {activeGroupName}
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
              연동됨
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              참조 문서 {docCount}개
            </span>
          </div>
        </div>
        <button
          onClick={onToggleSidebar}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 transition-all shadow-sm active:scale-95 h-9 shrink-0"
        >
          참조 관리
        </button>
      </div>

      {/* Messages */}
      <div className="flex-grow p-3 overflow-y-auto bg-slate-50/40">
        <div className="max-w-4xl mx-auto w-full space-y-4">
          {messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} />
          ))}

          {isFetchingSuggestions && (
            <div className="flex justify-center items-center p-3 bg-white/50 rounded-lg border border-slate-100 max-w-sm mx-auto">
              <div className="flex items-center gap-1.5 text-slate-500">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                <span className="text-xs font-medium">추천 질문 탐색 중...</span>
              </div>
            </div>
          )}

          {showSuggestions && (
            <div className="my-4 p-3 bg-white border border-slate-200/80 rounded-xl shadow-sm">
              <p className="text-xs text-slate-500 mb-2 font-bold flex items-center gap-1">
                연동된 정보와 관련해 이런 내용을 물어보세요:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => onSuggestionClick(s)}
                    className="bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 hover:border-blue-200 p-2.5 rounded-lg text-left text-xs transition-colors shadow-sm inline-flex items-center gap-2"
                  >
                    <span className="text-blue-500 font-bold min-w-[14px]">Q.</span>
                    <span className="text-slate-700 font-medium line-clamp-2">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 shrink-0">
        <div className="max-w-4xl mx-auto w-full flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={handleTextareaInput}
            placeholder={placeholderText}
            className="flex-grow min-h-[44px] max-h-32 py-3 px-4 border border-slate-300 bg-white text-slate-800 placeholder-slate-400 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow resize-none text-sm outline-none shadow-inner leading-relaxed"
            rows={1}
            disabled={isLoading || isFetchingSuggestions}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || isFetchingSuggestions || !query.trim()}
            className="h-11 w-11 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-full transition-all flex items-center justify-center shrink-0 shadow-md active:scale-95"
            aria-label="메시지 전송"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
