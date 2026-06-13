"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChatMessage, MessageSender, URLGroup, LocalFile } from "@/types";
import ChatInterface from "@/components/ChatInterface";
import KnowledgeBaseManager from "@/components/KnowledgeBaseManager";
import { LogOut, User, ChevronLeft } from "lucide-react";

const MAX_URLS = 20;

export default function ChatPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="h-dvh w-full bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ChatPage />
    </Suspense>
  );
}

function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoggedIn = !!session?.user;

  const [urlGroups, setUrlGroups] = useState<URLGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [groupsLoaded, setGroupsLoaded] = useState(false);
  const [initialQuery, setInitialQuery] = useState<string | null>(null);

  const activeGroup = urlGroups.find((g) => g.id === activeGroupId);
  const currentUrls = activeGroup?.urls || [];
  const currentFiles = activeGroup?.files || [];
  const docCount = currentUrls.length + currentFiles.length;

  // Load public group from URL params or user groups
  useEffect(() => {
    const groupId = searchParams.get("group");
    const query = searchParams.get("q");
    if (query) setInitialQuery(query);

    if (groupId) {
      (async () => {
        try {
          const res = await fetch("/api/public-groups");
          const data = await res.json();
          const pubGroup = data.groups?.find((g: { id: string }) => g.id === groupId);
          if (pubGroup) {
            const converted: URLGroup = {
              id: pubGroup.id,
              name: pubGroup.name,
              urls: pubGroup.urls,
              files: [],
            };
            setUrlGroups([converted]);
            setActiveGroupId(converted.id);
            setGroupsLoaded(true);
            fetch("/api/stats", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ groupId }),
            }).catch(() => {});
            return;
          }
        } catch {}
        setGroupsLoaded(true);
      })();
    } else {
      const defaultGroup: URLGroup = {
        id: `custom-${Date.now()}`,
        name: "새 문서 그룹",
        urls: [],
        files: [],
      };
      setUrlGroups([defaultGroup]);
      setActiveGroupId(defaultGroup.id);
      setGroupsLoaded(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load saved groups from Redis on login
  useEffect(() => {
    if (!isLoggedIn || !groupsLoaded) return;
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
          setUrlGroups((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newGroups = restored.filter((r: URLGroup) => !existingIds.has(r.id));
            return [...prev, ...newGroups];
          });
        }
      } catch {}
    })();
  }, [isLoggedIn, groupsLoaded]);

  // Auto-save groups to Redis
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

  // Welcome message
  useEffect(() => {
    if (!activeGroupId || !groupsLoaded) return;
    const group = urlGroups.find((g) => g.id === activeGroupId);
    setMessages([
      {
        id: `system-welcome-${activeGroupId}-${Date.now()}`,
        text: `"${group?.name || "없음"}" 문서 그룹이 선택되었습니다. 궁금한 점을 질문해 주세요.`,
        sender: MessageSender.SYSTEM,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [activeGroupId, groupsLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-send initial query
  const initialSent = useRef(false);
  useEffect(() => {
    if (initialQuery && groupsLoaded && activeGroupId && !initialSent.current) {
      initialSent.current = true;
      handleSendMessage(initialQuery);
    }
  }, [initialQuery, groupsLoaded, activeGroupId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch suggestions
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
    if (currentUrls.length > 0 && !initialQuery) {
      fetchSuggestions(currentUrls);
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
      const history = messages
        .filter((m) => m.sender === MessageSender.USER || m.sender === MessageSender.MODEL)
        .filter((m) => !m.isLoading)
        .map((m) => ({
          role: m.sender === MessageSender.USER ? ("user" as const) : ("model" as const),
          text: m.text,
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query, urls: currentUrls, files: currentFiles, history }),
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
              ? { ...m, text: data.text || "빈 답변이 반환되었습니다.", isLoading: false, urlContext: data.urlContextMetadata }
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

  const handleAddGroup = (name: string) => {
    const newId = `group-${Date.now()}`;
    const newGroup: URLGroup = { id: newId, name, urls: [], files: [] };
    setUrlGroups((prev) => [...prev, newGroup]);
    setActiveGroupId(newId);
  };

  const handleRemoveGroup = (id: string) => {
    setUrlGroups((prev) => prev.filter((g) => g.id !== id));
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
      prev.map((g) => (g.id === activeGroupId ? { ...g, urls: g.urls.filter((u) => u !== url) } : g))
    );
  };

  const handleAddFile = (file: LocalFile) => {
    setUrlGroups((prev) =>
      prev.map((g) => (g.id === activeGroupId ? { ...g, files: [...g.files, file] } : g))
    );
  };

  const handleRemoveFile = (fileId: string) => {
    setUrlGroups((prev) =>
      prev.map((g) => (g.id === activeGroupId ? { ...g, files: g.files.filter((f) => f.id !== fileId) } : g))
    );
  };

  const placeholderText =
    docCount > 0
      ? `"${activeGroup?.name || ""}" 관련 질문을 입력하세요...`
      : "문서 그룹에 URL이나 파일을 추가하여 시작하세요.";

  if (status === "loading" || !groupsLoaded) {
    return (
      <div className="h-dvh w-full bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-dvh w-full bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-12 px-3 bg-white flex items-center justify-between border-b border-slate-100 shrink-0 safe-top">
        <button onClick={() => router.push("/")} className="p-1 text-slate-500 hover:text-slate-800 transition-colors">
          <ChevronLeft size={22} />
        </button>
        <span className="text-sm font-semibold text-slate-800 truncate mx-2 flex-1 text-center">
          {activeGroup?.name || "Chat with Docs"}
        </span>
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {session.user?.image ? (
                <img src={session.user.image} alt="" className="w-6 h-6 rounded-full border border-slate-200" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <User size={12} className="text-white" />
                </div>
              )}
              <button onClick={() => signOut({ callbackUrl: "/login" })} className="p-1 text-slate-400 hover:text-red-500">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <button onClick={() => router.push("/login")} className="text-xs text-blue-600 font-semibold">
              로그인
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow flex flex-col relative overflow-hidden">
        {sidebarOpen && (
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs z-[45]"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div
          className={`absolute top-0 left-0 h-full w-[86%] max-w-[340px] z-50 transform transition-transform ease-out duration-300 bg-white shadow-2xl ${
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
            onAddGroup={handleAddGroup}
            onRemoveGroup={handleRemoveGroup}
            onClose={() => setSidebarOpen(false)}
            maxUrls={MAX_URLS}
          />
        </div>

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
    </div>
  );
}
