import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import CalendarView from '@/components/events/CalendarView';
import Link from 'next/link';
import { EventClient } from '@/lib/db/schema';

// イベントを取得する関数
async function getEvents(): Promise<EventClient[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/api/events`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status === 401) {
      // 認証エラーの場合
      return [];
    }
    throw new Error('イベントの取得に失敗しました');
  }

  const data = await res.json();
  return data.success ? data.data : [];
}

export default async function CalendarPage() {
  // 認証チェック
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // イベントデータ取得
  const events = await getEvents();

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">カレンダー</h1>
        <div className="flex space-x-4">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            ダッシュボードへ戻る
          </Link>
          <Link
            href="/events/new"
            className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
          >
            イベント作成
          </Link>
        </div>
      </div>

      <Suspense fallback={<div className="text-center p-12">イベントを読み込み中...</div>}>
        <CalendarView events={events.map(event => ({
          ...event,
          description: event.description || ''
        }))} />
      </Suspense>
    </div>
  );
}