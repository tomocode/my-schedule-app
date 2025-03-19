// src/app/events/edit/[id]/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { events, toClientEvent } from '@/lib/db/schema'; // toClientEventをインポート
import { eq, and } from 'drizzle-orm';
import EventForm from '@/components/events/EventForm';
import { JSX } from 'react';

export default async function EditEventPage({
  params
}: {
    params: { id: string };
  }): Promise<JSX.Element> {
    const id = params.id;

  // ログイン状態をチェック
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  // 未ログインの場合はログインページにリダイレクト
  if (!session) {
    redirect('/login');
  }

  // イベントを取得
  const [event] = await db.select()
    .from(events)
    .where(
      and(
        eq(events.id, id),
        eq(events.userId, session.user.id)
      )
    );

  // イベントが見つからない場合はダッシュボードにリダイレクト
  if (!event) {
    redirect('/dashboard');
  }

  // イベントをクライアント形式に変換
  const clientEvent = toClientEvent(event);

  // フォームに渡すデータを整形
  const formData = {
    id: clientEvent.id,
    title: clientEvent.title,
    description: clientEvent.description || '',
    startTime: clientEvent.startTime.slice(0, 16), // ISO文字列の時刻部分のみを使用
    endTime: clientEvent.endTime.slice(0, 16)
  };

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">イベント編集</h1>
      <EventForm initialData={formData} isEditing={true} />
    </main>
  );
}