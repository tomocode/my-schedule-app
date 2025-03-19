import Link from "next/link";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  // サーバーサイドでSupabaseクライアントを作成
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  // ユーザーセッションを取得
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // ログイン済みの場合はダッシュボードにリダイレクト
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-8">
      <main className="max-w-4xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-blue-600">
          スケジュール管理アプリ
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 text-gray-700">
          あなたのイベントとスケジュールを簡単に管理
        </p>
        
        <div className="bg-white p-6 rounded-lg shadow-lg mb-10 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">主な機能</h2>
          
          <ul className="text-left space-y-3 mb-6">
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>イベントの作成・編集・削除</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>カレンダー表示でスケジュールを一目で確認</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>通知機能でイベントを忘れない</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>セキュアな認証システムでデータを安全に保護</span>
            </li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/login" 
            className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            ログイン
          </Link>
          <Link 
            href="/signup" 
            className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-md text-lg font-medium hover:bg-blue-50 transition-colors"
          >
            新規登録
          </Link>
        </div>
      </main>
    </div>
  );
}
