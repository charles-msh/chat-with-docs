"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, ChevronDown, X, Upload, File, Globe, HardDrive, FolderPlus } from "lucide-react";
import { URLGroup, LocalFile } from "@/types";

interface KnowledgeBaseManagerProps {
  activeGroup: URLGroup | undefined;
  urlGroups: URLGroup[];
  activeGroupId: string;
  onSetGroupId: (id: string) => void;
  onAddUrl: (url: string) => void;
  onRemoveUrl: (url: string) => void;
  onAddFile: (file: LocalFile) => void;
  onRemoveFile: (fileId: string) => void;
  onAddGroup: (name: string) => void;
  onRemoveGroup: (id: string) => void;
  onClose: () => void;
  maxUrls: number;
}

export default function KnowledgeBaseManager({
  activeGroup,
  urlGroups,
  activeGroupId,
  onSetGroupId,
  onAddUrl,
  onRemoveUrl,
  onAddFile,
  onRemoveFile,
  onAddGroup,
  onRemoveGroup,
  onClose,
  maxUrls,
}: KnowledgeBaseManagerProps) {
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState<"url" | "file">("url");
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const urls = activeGroup?.urls || [];
  const files = activeGroup?.files || [];

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setError("URL을 입력해 주세요.");
      return;
    }
    try {
      new URL(trimmed);
    } catch {
      setError("올바르지 않은 URL 형식입니다. http:// 또는 https://를 포함해주세요.");
      return;
    }
    if (urls.length >= maxUrls) {
      setError(`최대 URL 개수(${maxUrls}개)에 도달했습니다.`);
      return;
    }
    if (urls.includes(trimmed)) {
      setError("이미 등록된 URL입니다.");
      return;
    }
    onAddUrl(trimmed);
    setUrlInput("");
    setError(null);
  };

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError("파일 용량이 너무 큽니다. (최대 5MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      onAddFile({
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        data: base64,
      });
      setError(null);
    };
    reader.onerror = () => setError("파일 읽기 실패");
    reader.readAsDataURL(file);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="p-4 bg-white shadow-sm h-full flex flex-col border-r border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
        <h2 className="text-lg font-bold text-slate-800">참조 문서 관리</h2>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100 transition-colors"
          aria-label="닫기"
        >
          <X size={24} />
        </button>
      </div>

      {/* Group Selector */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-slate-500 mb-1">
          문서 그룹 선택
        </label>
        <div className="flex items-center gap-1.5">
          <div className="relative flex-grow">
            <select
              value={activeGroupId}
              onChange={(e) => onSetGroupId(e.target.value)}
              className="w-full py-2 pl-3 pr-8 appearance-none border border-slate-300 bg-white text-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none cursor-pointer"
            >
              {urlGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
          </div>
          <button
            onClick={() => setShowNewGroup(!showNewGroup)}
            className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-colors"
            title="새 그룹 추가"
          >
            <FolderPlus size={16} />
          </button>
          {urlGroups.length > 1 && (
            <button
              onClick={() => {
                const next = urlGroups.find((g) => g.id !== activeGroupId);
                if (next) {
                  onRemoveGroup(activeGroupId);
                  onSetGroupId(next.id);
                }
              }}
              className="h-9 w-9 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-300 rounded-lg flex items-center justify-center shrink-0 transition-colors"
              title="현재 그룹 삭제"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {showNewGroup && (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="새 그룹 이름"
              className="flex-grow h-9 px-3 border border-slate-300 bg-white text-slate-800 placeholder-slate-400 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newGroupName.trim()) {
                  onAddGroup(newGroupName.trim());
                  setNewGroupName("");
                  setShowNewGroup(false);
                }
              }}
            />
            <button
              onClick={() => {
                if (newGroupName.trim()) {
                  onAddGroup(newGroupName.trim());
                  setNewGroupName("");
                  setShowNewGroup(false);
                }
              }}
              disabled={!newGroupName.trim()}
              className="h-9 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-lg text-xs font-bold shrink-0 transition-colors"
            >
              추가
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-3 gap-1">
        <button
          onClick={() => { setActiveTab("url"); setError(null); }}
          className={`flex-1 pb-2 pt-1 text-xs font-semibold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === "url"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Globe size={14} /> URL 연동
        </button>
        <button
          onClick={() => { setActiveTab("file"); setError(null); }}
          className={`flex-1 pb-2 pt-1 text-xs font-semibold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === "file"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <HardDrive size={14} /> 파일 업로드
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "url" ? (
        <div className="mb-3">
          <label className="block text-xs font-bold text-slate-500 mb-1">새 URL 추가</label>
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => { setUrlInput(e.target.value); setError(null); }}
              placeholder="https://docs.example.com"
              className="flex-grow h-10 px-3 border border-slate-300 bg-white text-slate-800 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
            />
            <button
              onClick={handleAddUrl}
              disabled={urls.length >= maxUrls}
              className="h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center shrink-0 shadow-sm"
              aria-label="URL 추가"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-3">
          <label className="block text-xs font-bold text-slate-500 mb-1">로컬 문서 업로드</label>
          <div
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
              dragActive
                ? "border-indigo-500 bg-indigo-50/50"
                : "border-slate-300 hover:border-indigo-400 bg-slate-50/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => {
                if (e.target.files?.[0]) processFile(e.target.files[0]);
              }}
              accept=".pdf,.txt,.md,.png,.jpg,.jpeg,.doc,.docx"
              className="hidden"
            />
            <Upload className="mx-auto h-6 w-6 text-indigo-500 mb-1" />
            <p className="text-xs font-medium text-slate-700">파일을 끌어다 놓거나 클릭</p>
            <p className="text-[10px] text-slate-400 mt-0.5">PDF, TXT, PNG, MD 등 (최대 5MB)</p>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600 mb-2 font-medium">{error}</p>}

      {/* Reference List */}
      <div className="flex-grow overflow-y-auto space-y-3 pr-1 mt-2">
        {urls.length === 0 && files.length === 0 && (
          <div className="text-slate-400 text-center py-8 border-2 border-dashed border-slate-200 rounded-lg bg-slate-100/50 p-4">
            <p className="text-sm font-semibold">등록된 참조 문서가 없습니다.</p>
            <p className="text-xs mt-1">URL을 연동하거나 파일을 올려 시작하세요.</p>
          </div>
        )}

        {urls.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
              <Globe size={12} className="text-blue-500" /> URL ({urls.length})
            </div>
            {urls.map((url) => (
              <div
                key={url}
                className="flex items-center justify-between p-2.5 bg-blue-50/40 hover:bg-blue-50/80 border border-blue-100 rounded-lg transition-all"
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline truncate mr-2"
                >
                  {url}
                </a>
                <button
                  onClick={() => onRemoveUrl(url)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        {files.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
              <HardDrive size={12} className="text-indigo-500" /> 파일 ({files.length})
            </div>
            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between p-2.5 bg-indigo-50/40 hover:bg-indigo-50/80 border border-indigo-100 rounded-lg transition-all"
              >
                <div className="flex items-center gap-2 truncate mr-2">
                  <File size={16} className="text-indigo-600 shrink-0" />
                  <div className="truncate">
                    <p className="text-xs text-slate-700 font-semibold truncate">{f.name}</p>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                      {formatBytes(f.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveFile(f.id)}
                  className="p-1 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
