// src/app/events/edit/[id]/page.tsx
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { events, toClientEvent } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import EventForm from '@/components/events/EventForm';
import { JSX } from 'react';

export default async function EditEventPage({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  // await して params を解決する
  const { id } = await params;

  // ログイン状態をチェック
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 未ログインの場合はログインページにリダイレクト
  if (!user) {
    redirect('/login');
  }

  // イベントを取得
  const [event] = await db.select()
    .from(events)
    .where(
      and(
        eq(events.id, id),
        eq(events.userId, user.id)
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
    startTime: clientEvent.startTime.slice(0, 16),
    endTime: clientEvent.endTime.slice(0, 16)
  };

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">イベント編集</h1>
      <EventForm initialData={formData} isEditing={true} />
    </main>
  );
}
