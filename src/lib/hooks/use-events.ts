// src/hooks/use-events.ts
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/hono';
import { EventClient } from '@/lib/db/schema'; // スキーマから型をインポート

// APIレスポンスの型
type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

/**
 * イベント操作のためのカスタムフック
 */
export function useEvents() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // イベント一覧を取得
  const getEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await client.api.events.$get();
      const data = await response.json() as ApiResponse<EventClient[]>;

      if (!data.success) {
        setError(data.error);
        return null;
      }

      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期せぬエラーが発生しました';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 特定のイベントを取得
  const getEvent = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await client.api.events[':id'].$get({
        param: { id }
      });

      const data = await response.json() as ApiResponse<EventClient>;

      if (!data.success) {
        setError(data.error);
        return null;
      }

      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期せぬエラーが発生しました';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 新しいイベントを作成
  const createEvent = useCallback(async (eventData: {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await client.api.events.$post({
        json: eventData
      });

      const data = await response.json() as ApiResponse<EventClient>;

      if (!data.success) {
        setError(data.error);
        return null;
      }

      router.push('/dashboard');
      router.refresh();
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期せぬエラーが発生しました';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // イベントを更新
  const updateEvent = useCallback(async (
    id: string,
    eventData: {
      title: string;
      description?: string;
      startTime: string;
      endTime: string;
    }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await client.api.events[':id'].$put({
        param: { id },
        json: eventData
      });

      const data = await response.json() as ApiResponse<EventClient>;

      if (!data.success) {
        setError(data.error);
        return null;
      }

      router.push('/dashboard');
      router.refresh();
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期せぬエラーが発生しました';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // イベントを削除
  const deleteEvent = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await client.api.events[':id'].$delete({
        param: { id }
      });

      const data = await response.json() as ApiResponse<{ message: string }>;

      if (!data.success) {
        setError(data.error);
        return false;
      }

      router.refresh();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期せぬエラーが発生しました';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return {
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    isLoading,
    error
  };
}