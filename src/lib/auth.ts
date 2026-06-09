import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "kakao",
      name: "Kakao",
      type: "oauth",
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET || "unused",
      authorization: {
        url: "https://kauth.kakao.com/oauth/authorize",
        params: { scope: "profile_nickname profile_image" },
      },
      token: "https://kauth.kakao.com/oauth/token",
      userinfo: "https://kapi.kakao.com/v2/user/me",
      profile(profile) {
        const kakaoAccount = profile.kakao_account || {};
        const kakaoProfile = kakaoAccount.profile || {};
        return {
          id: String(profile.id),
          name: kakaoProfile.nickname || "카카오 사용자",
          image: kakaoProfile.profile_image_url || null,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }: { token: JWT; account?: unknown; profile?: unknown }) {
      if (account && profile) {
        const p = profile as { id?: number };
        token.kakaoId = String(p.id || token.sub);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { kakaoId?: string }).kakaoId = token.kakaoId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
