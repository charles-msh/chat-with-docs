"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="h-dvh w-full bg-white flex flex-col items-center justify-center px-8">
      <div className="w-[72px] h-[72px] bg-gradient-to-br from-blue-500 to-indigo-500 rounded-[22px] flex items-center justify-center text-3xl mb-5 shadow-lg shadow-blue-500/30">
        💬
      </div>

      <h1 className="text-2xl font-extrabold text-slate-800 text-center mb-1.5">
        Chat with Docs
      </h1>
      <p className="text-sm text-slate-500 text-center mb-10 leading-relaxed">
        문서를 연동하고 AI와 대화하세요.
        <br />
        로그인하면 설정이 영구 저장됩니다.
      </p>

      <button
        onClick={() => signIn("kakao", { callbackUrl: "/" })}
        className="flex items-center justify-center gap-2.5 w-full max-w-[320px] bg-[#FEE500] text-[#191919] rounded-xl py-3.5 px-5 text-[15px] font-bold shadow-md hover:bg-[#F0D800] active:scale-[0.98] transition-all"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3C6.48 3 2 6.36 2 10.44c0 2.62 1.74 4.93 4.36 6.24-.14.52-.9 3.35-.93 3.56 0 0-.02.16.08.22.1.06.22.03.22.03.29-.04 3.37-2.2 3.9-2.57.77.11 1.57.17 2.37.17 5.52 0 10-3.36 10-7.65C22 6.36 17.52 3 12 3z" />
        </svg>
        카카오 로그인
      </button>

      <div className="flex items-center gap-3 w-full max-w-[320px] my-5">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400">또는</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <button
        onClick={() => router.push("/")}
        className="w-full max-w-[320px] bg-white text-slate-600 border border-slate-300 rounded-xl py-3 px-5 text-sm font-semibold hover:bg-slate-50 active:scale-[0.98] transition-all"
      >
        게스트로 시작하기
      </button>

      <p className="text-[11px] text-slate-400 text-center mt-4 leading-relaxed">
        게스트 모드에서는 새로고침 시<br />설정이 초기화됩니다.
      </p>
    </div>
  );
}
