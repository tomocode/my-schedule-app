// src/app/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { events, toClientEvent } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import EventList from '@/components/events/EventList';

export default async function Dashboard() {
  const supabase = await createClient();

  // 安全性を高めるために getUser() を使用
  const { data: { user } } = await supabase.auth.getUser();

  // ユーザーが取得できなければログインページにリダイレクト
  if (!user) {
    redirect('/login');
  }

  // ユーザーのイベントを取得
  const userEvents = await db.select()
    .from(events)
    .where(eq(events.userId, user.id))
    .orderBy(events.startTime);

  // クライアント形式に変換
  const clientEvents = userEvents.map(toClientEvent);

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <div className="space-x-4">
          <Link href="/calendar" className="text-blue-500 hover:text-blue-700">
            カレンダー表示
          </Link>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">ようこそ {user.email}</h2>
        <p className="text-gray-600">あなたのイベントを管理しましょう</p>
      </div>
      <div>
        <EventList initialEvents={clientEvents} />
      </div>
    </main>
  );
}
