'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEvents } from '@/lib/hooks/use-events';

type EventFormProps = {
  initialData?: {
    id?: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
  };
  isEditing?: boolean;
};

export default function EventForm({ initialData, isEditing = false }: EventFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [startTime, setStartTime] = useState(initialData?.startTime || '');
  const [endTime, setEndTime] = useState(initialData?.endTime || '');

  const router = useRouter();
  const { createEvent, updateEvent, isLoading, error: apiError } = useEvents();
  const [localError, setLocalError] = useState<string | null>(null);

  // フォームの現在日時をデフォルト値に設定
  useEffect(() => {
    if (!initialData) {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

      setStartTime(formatDateTimeForInput(now));
      setEndTime(formatDateTimeForInput(oneHourLater));
    }
  }, [initialData]);

  // 日時をフォーム入力用に整形（ブラウザ互換性向上）
  const formatDateTimeForInput = (date: Date) => {
    // YYYY-MM-DDThh:mm 形式に変換
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const validateForm = () => {
    setLocalError(null);

    if (!title.trim()) {
      setLocalError('タイトルは必須です');
      return false;
    }

    if (!startTime) {
      setLocalError('開始時間は必須です');
      return false;
    }

    if (!endTime) {
      setLocalError('終了時間は必須です');
      return false;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      setLocalError('終了時間は開始時間より後である必要があります');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // 日時をISO 8601形式に確実に変換
    const formatToISOString = (dateTimeStr: string): string => {
      // datetime-localから取得した値が既にISO形式に近い場合は、そのままDate変換
      try {
        const dateObj = new Date(dateTimeStr);
        if (isNaN(dateObj.getTime())) {
          throw new Error('Invalid date');
        }
        return dateObj.toISOString();
      } catch (e) {
        // フォールバック：手動でパース
        // 例: "2025/03/21 13:32" → "2025-03-21T13:32:00.000Z"
        console.error('日付解析エラー:', e);
        const parts = dateTimeStr.split(/[\/\s:]/);
        if (parts.length >= 5) {
          const [year, month, day, hour, minute] = parts;
          const isoStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00.000Z`;
          return isoStr;
        }
        return dateTimeStr; // パースできなければそのまま返す（エラーハンドリングはサーバー側で）
      }
    };

    const eventData = {
      title,
      description,
      startTime: formatToISOString(startTime),
      endTime: formatToISOString(endTime),
    };

    try {
      console.log('送信データ:', eventData); // デバッグ用
      if (isEditing && initialData?.id) {
        await updateEvent(initialData.id, eventData);
      } else {
        await createEvent(eventData);
      }
    } catch (error) {
      // エラーハンドリングはuseEvents内で行われるので、ここでは何もしない
      console.error('Error submitting form:', error);
    }
  };

  // 表示するエラーメッセージ
  // APIエラーがあれば文字列に変換して表示（オブジェクトの場合は文字列化）
  const errorMessage = localError || (apiError ? (typeof apiError === 'string' ? apiError : JSON.stringify(apiError)) : null);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? 'イベントを編集' : '新規イベント作成'}
      </h2>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            タイトル
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            説明
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows={4}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startTime">
            開始時間
          </label>
          <input
            id="startTime"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endTime">
            終了時間
          </label>
          <input
            id="endTime"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            キャンセル
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {isLoading ? '保存中...' : (isEditing ? '更新する' : '作成する')}
          </button>
        </div>
      </form>
    </div>
  );
}