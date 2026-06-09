"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChatMessage, MessageSender, URLGroup, LocalFile } from "@/types";
import ChatInterface from "@/components/ChatInterface";
import KnowledgeBaseManager from "@/components/KnowledgeBaseManager";
import { LogOut, User } from "lucide-react";

const INITIAL_URL_GROUPS: URLGroup[] = [
  {
    id: "gemini-overview",
    name: "Gemini API 문서 개요",
    urls: [
      "https://ai.google.dev/gemini-api/docs",
      "https://ai.google.dev/gemini-api/docs/quickstart",
      "https://ai.google.dev/gemini-api/docs/api-key",
      "https://ai.google.dev/gemini-api/docs/libraries",
      "https://ai.google.dev/gemini-api/docs/models",
      "https://ai.google.dev/gemini-api/docs/pricing",
    ],
    files: [],
  },
  {
    id: "model-capabilities",
    name: "Gemini 모델 주요 기능",
    urls: [
      "https://ai.google.dev/gemini-api/docs/text-generation",
      "https://ai.google.dev/gemini-api/docs/image-generation",
      "https://ai.google.dev/gemini-api/docs/long-context",
      "https://ai.google.dev/gemini-api/docs/structured-output",
      "https://ai.google.dev/gemini-api/docs/function-calling",
    ],
    files: [],
  },
];

const MAX_URLS = 20;

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoggedIn = !!session?.user;

  const [urlGroups, setUrlGroups] = useState<URLGroup[]>(INITIAL_URL_GROUPS);
  const [activeGroupId, setActiveGroupId] = useState(INITIAL_URL_GROUPS[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [groupsLoaded, setGroupsLoaded] = useState(false);

  const activeGroup = urlGroups.find((g) => g.id === activeGroupId);
  const currentUrls = activeGroup?.urls || [];
  const currentFiles = activeGroup?.files || [];
  const docCount = currentUrls.length + currentFiles.length;

  // Load saved groups from Redis on login
  useEffect(() => {
    if (!isLoggedIn || groupsLoaded) return;
    (async () => {
      try {
        const res = await fetch("/api/groups");
        const data = await res.json();
        if (data.groups && data.groups.length > 0) {
          const restored: URLGroup[] = data.groups.map(
            (g: { id: string; name: string; urls: string[]; fileNames?: string[] }) => ({
              id: g.id,
              name: g.name,
              urls: g.urls,
              files: [],
            })
          );
          setUrlGroups(restored);
          setActiveGroupId(restored[0].id);
        }
      } catch { /* ignore */ }
      setGroupsLoaded(true);
    })();
  }, [isLoggedIn, groupsLoaded]);

  // Auto-save groups to Redis when they change (logged in only)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (!isLoggedIn || !groupsLoaded) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const toSave = urlGroups.map((g) => ({
        id: g.id,
        name: g.name,
        urls: g.urls,
        fileNames: g.files.map((f) => f.name),
      }));
      fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groups: toSave }),
      }).catch(() => {});
    }, 1000);
    return () => clearTimeout(saveTimerRef.current);
  }, [urlGroups, isLoggedIn, groupsLoaded]);

  // Welcome message on group change
  useEffect(() => {
    if (!activeGroupId) return;
    const group = urlGroups.find((g) => g.id === activeGroupId);
    setMessages([
      {
        id: `system-welcome-${activeGroupId}-${Date.now()}`,
        text: `"${group?.name || "없음"}" 문서 그룹이 선택되었습니다. 궁금한 점을 질문해 주세요.`,
        sender: MessageSender.SYSTEM,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [activeGroupId, urlGroups]);

  // Fetch suggestions on group change
  const fetchSuggestions = useCallback(async (urls: string[]) => {
    if (urls.length === 0) {
      setSuggestions([]);
      return;
    }
    setIsFetchingSuggestions(true);
    setSuggestions([]);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch {
      setSuggestions([]);
    } finally {
      setIsFetchingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    if (currentUrls.length > 0) {
      fetchSuggestions(currentUrls);
    } else {
      setSuggestions([]);
    }
  }, [activeGroupId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSendMessage = async (query: string) => {
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setSuggestions([]);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      text: query,
      sender: MessageSender.USER,
      timestamp: new Date().toISOString(),
    };

    const placeholderId = `model-${Date.now()}`;
    const placeholderMsg: ChatMessage = {
      id: placeholderId,
      text: "답변을 생성하는 중입니다...",
      sender: MessageSender.MODEL,
      timestamp: new Date().toISOString(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMsg, placeholderMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query,
          urls: currentUrls,
          files: currentFiles,
        }),
      });
      const data = await res.json();

      if (data.error) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId
              ? { ...m, text: `오류: ${data.error}`, sender: MessageSender.SYSTEM, isLoading: false }
              : m
          )
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId
              ? {
                  ...m,
                  text: data.text || "빈 답변이 반환되었습니다.",
                  isLoading: false,
                  urlContext: data.urlContextMetadata,
                }
              : m
          )
        );
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "알 수 없는 오류";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? { ...m, text: `오류: ${errMsg}`, sender: MessageSender.SYSTEM, isLoading: false }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUrl = (url: string) => {
    setUrlGroups((prev) =>
      prev.map((g) =>
        g.id === activeGroupId && g.urls.length < MAX_URLS && !g.urls.includes(url)
          ? { ...g, urls: [...g.urls, url] }
          : g
      )
    );
  };

  const handleRemoveUrl = (url: string) => {
    setUrlGroups((prev) =>
      prev.map((g) =>
        g.id === activeGroupId ? { ...g, urls: g.urls.filter((u) => u !== url) } : g
      )
    );
  };

  const handleAddFile = (file: LocalFile) => {
    setUrlGroups((prev) =>
      prev.map((g) =>
        g.id === activeGroupId ? { ...g, files: [...g.files, file] } : g
      )
    );
  };

  const handleRemoveFile = (fileId: string) => {
    setUrlGroups((prev) =>
      prev.map((g) =>
        g.id === activeGroupId ? { ...g, files: g.files.filter((f) => f.id !== fileId) } : g
      )
    );
  };

  const placeholderText =
    docCount > 0
      ? `"${activeGroup?.name || ""}" 관련 질문을 입력하세요...`
      : "문서 그룹에 URL이나 파일을 추가하여 시작하세요.";

  if (status === "loading") {
    return (
      <div className="h-screen w-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-900 flex items-center justify-center overflow-hidden p-0 sm:p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0f172a] bg-[radial-gradient(ellipse_at_center,rgba(51,65,85,0.18),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415510_1px,transparent_1px),linear-gradient(to_bottom,#33415510_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Device Frame */}
      <div className="relative w-full h-full sm:max-w-[420px] sm:h-[880px] sm:max-h-[96vh] sm:rounded-[42px] sm:border-[12px] sm:border-slate-950 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] bg-slate-100 flex flex-col overflow-hidden">
        {/* Notch */}
        <div className="hidden sm:flex absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-950 rounded-b-2xl z-50 items-center justify-center">
          <div className="w-14 h-1 bg-slate-800 rounded-full mb-1" />
        </div>

        {/* Status Bar */}
        <div className="h-10 px-4 pt-3 bg-white flex justify-between items-center text-[11px] font-bold text-slate-500 select-none z-10 shrink-0 border-b border-slate-100">
          <span className="font-semibold text-xs text-slate-700">Chat with Docs</span>
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <span className="text-[10px] text-slate-500 font-medium">
                  {session.user?.name}
                </span>
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="w-5 h-5 rounded-full border border-slate-200"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <User size={10} className="text-white" />
                  </div>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="p-0.5 text-slate-400 hover:text-red-500 transition-colors"
                  title="로그아웃"
                >
                  <LogOut size={12} />
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="text-[10px] text-blue-600 font-bold hover:underline"
              >
                로그인
              </button>
            )}
          </div>
        </div>

        {/* Guest banner */}
        {!isLoggedIn && (
          <div className="px-3 py-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
            <span className="text-[11px] text-amber-800 font-medium">
              게스트 모드 — 로그인하면 설정이 저장됩니다
            </span>
            <button
              onClick={() => router.push("/login")}
              className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded border border-amber-300 hover:bg-amber-200 transition-colors"
            >
              로그인
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-grow flex flex-col relative overflow-hidden bg-slate-100">
          {/* Sidebar Backdrop */}
          {sidebarOpen && (
            <div
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs z-[45] transition-opacity duration-300"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar Drawer */}
          <div
            className={`absolute top-0 left-0 h-full w-[86%] z-50 transform transition-transform ease-out duration-300 bg-white shadow-2xl ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <KnowledgeBaseManager
              activeGroup={activeGroup}
              urlGroups={urlGroups}
              activeGroupId={activeGroupId}
              onSetGroupId={setActiveGroupId}
              onAddUrl={handleAddUrl}
              onRemoveUrl={handleRemoveUrl}
              onAddFile={handleAddFile}
              onRemoveFile={handleRemoveFile}
              onClose={() => setSidebarOpen(false)}
              maxUrls={MAX_URLS}
            />
          </div>

          {/* Chat */}
          <div className="flex-grow flex flex-col h-full overflow-hidden w-full">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholderText={placeholderText}
              suggestions={suggestions}
              onSuggestionClick={handleSendMessage}
              isFetchingSuggestions={isFetchingSuggestions}
              onToggleSidebar={() => setSidebarOpen(true)}
              docCount={docCount}
              activeGroupName={activeGroup?.name || "문서 그룹을 선택하세요"}
            />
          </div>
        </div>

        {/* Home Indicator */}
        <div className="hidden sm:flex h-5 bg-slate-50 justify-center items-center shrink-0 z-10 pb-1">
          <div className="w-28 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}
