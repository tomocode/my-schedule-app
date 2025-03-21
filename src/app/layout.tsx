import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import { createClient } from "@/utils/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "スケジュール管理アプリ",
  description: "イベントとスケジュールを簡単に管理できるアプリケーション",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // サーバーサイドでSupabaseクライアントを作成
  const supabase = await createClient();

  // ユーザーセッションを取得
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header user={session?.user || null} />
        <div className="flex-grow">
          {children}
        </div>
      </body>
    </html>
  );
}
