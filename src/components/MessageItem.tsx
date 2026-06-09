"use client";

import { marked } from "marked";
import hljs from "highlight.js";
import { ChatMessage, MessageSender, UrlContextMetadataItem } from "@/types";

marked.setOptions({
  highlight(code: string, lang: string | undefined) {
    const language = hljs.getLanguage(lang || "") ? lang! : "plaintext";
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: "hljs language-",
} as object);

export default function MessageItem({ message }: { message: ChatMessage }) {
  const isUser = message.sender === MessageSender.USER;
  const isModel = message.sender === MessageSender.MODEL;

  if (message.isLoading) {
    return (
      <div className="flex justify-start mb-4">
        <div className="flex items-start gap-2 max-w-[85%]">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
            AI
          </div>
          <div className="p-3.5 rounded-lg rounded-bl-none bg-white border-2 border-slate-200 shadow-sm">
            <div className="flex items-center gap-1.5 py-1">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (message.sender === MessageSender.SYSTEM) {
    return (
      <div className="flex justify-start mb-4">
        <div className="flex items-start gap-2 max-w-[85%]">
          <div className="w-8 h-8 rounded-full bg-slate-400 text-slate-800 flex items-center justify-center text-sm font-medium shrink-0">
            !
          </div>
          <div className="p-3 rounded-lg rounded-bl-none bg-slate-100 border border-slate-200 shadow-inner text-xs text-slate-600 whitespace-pre-wrap">
            {message.text}
          </div>
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="flex items-start gap-2 max-w-[85%]">
          <div className="p-3.5 rounded-lg rounded-br-none bg-blue-600 text-white border border-blue-700/10 shadow-sm whitespace-pre-wrap text-sm">
            {message.text}
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
            나
          </div>
        </div>
      </div>
    );
  }

  const htmlContent = marked.parse(message.text || "") as string;

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start gap-2 max-w-[85%]">
        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
          AI
        </div>
        <div className="p-3.5 rounded-lg rounded-bl-none bg-white border-2 border-slate-200 shadow-sm w-full">
          <div
            className="prose prose-sm w-full min-w-0"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
          {isModel && message.urlContext && message.urlContext.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 mb-1.5">
                참조한 문서:
              </h4>
              <ul className="space-y-1">
                {message.urlContext.map((meta: UrlContextMetadataItem, i: number) => {
                  const isSuccess = meta.urlRetrievalStatus === "URL_RETRIEVAL_STATUS_SUCCESS";
                  return (
                    <li
                      key={i}
                      className="text-[11px] text-slate-500 flex items-center justify-between gap-2 bg-slate-50 p-1.5 rounded border border-slate-100"
                    >
                      <a
                        href={meta.retrievedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline break-all text-blue-600 font-medium truncate"
                      >
                        {meta.retrievedUrl}
                      </a>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                          isSuccess
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {isSuccess ? "성공" : "실패"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
