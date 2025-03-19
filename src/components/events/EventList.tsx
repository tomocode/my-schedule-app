// src/components/events/EventList.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useEvents } from '@/lib/hooks/use-events'; // 修正: パスを変更、Event型を削除
import { EventClient } from '@/lib/db/schema'; // 追加: スキーマから型をインポート

type EventListProps = {
  initialEvents: EventClient[]; // 修正: EventClient型を使用
};

export default function EventList({ initialEvents }: EventListProps) {
  const [events, setEvents] = useState<EventClient[]>(initialEvents); // 修正: EventClient型を使用
  const { deleteEvent, isLoading, error } = useEvents();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Hono APIでイベントの削除処理
  const handleDelete = async (id: string) => {
    if (confirm('このイベントを削除してもよろしいですか？')) {
      setDeletingId(id);

      try {
        const success = await deleteEvent(id);

        if (success) {
          // 成功したらリストから削除
          setEvents(events.filter(event => event.id !== id));
        } else {
          alert('イベントの削除に失敗しました');
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('エラーが発生しました');
      } finally {
        setDeletingId(null);
      }
    }
  };

  // 日付のフォーマットを整形
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // エラー表示
  useEffect(() => {
    if (error) {
      alert(`エラーが発生しました: ${error}`);
    }
  }, [error]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">イベント一覧</h2>
        <Link href="/events/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          新規イベント作成
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center p-6 bg-gray-100 rounded-lg">
          <p>イベントがありません。新しいイベントを作成してください。</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="p-4 border rounded-lg shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{event.title}</h3>

                  <div className="text-gray-600 text-sm mt-1">
                    <p>開始: {formatDateTime(event.startTime)}</p>
                    <p>終了: {formatDateTime(event.endTime)}</p>
                  </div>

                  {event.description && (
                    <p className="mt-2 text-gray-700">{event.description}</p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Link
                    href={`/events/edit/${event.id}`}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    編集
                  </Link>
                  <button
                    onClick={() => handleDelete(event.id)}
                    disabled={deletingId === event.id || isLoading}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    {deletingId === event.id ? '削除中...' : '削除'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}