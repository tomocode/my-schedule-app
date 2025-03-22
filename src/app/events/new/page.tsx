import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import EventForm from '@/components/events/EventForm';

export default async function NewEventPage() {
  // 認証チェック
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">新規イベント作成</h1>
      <EventForm />
    </div>
  );
}