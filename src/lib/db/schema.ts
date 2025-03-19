// src/lib/db/schema.ts
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// プロフィールテーブル
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  username: text('username').notNull().unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// イベントテーブル
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// ========== プロフィール関連のスキーマと型 ==========

// プロフィール取得用スキーマ
export const selectProfileSchema = createSelectSchema(profiles);

// プロフィール挿入用スキーマ
export const insertProfileSchema = createInsertSchema(profiles, {
  id: z.string().uuid(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// プロフィールの型
export type ProfileSelect = z.infer<typeof selectProfileSchema>;
export type ProfileInsert = z.infer<typeof insertProfileSchema>;

// クライアント用プロフィール型
export type ProfileClient = Omit<ProfileSelect, 'createdAt' | 'updatedAt' | 'fullName' | 'avatarUrl'> & {
  createdAt?: string;
  updatedAt?: string;
  fullName?: string;
  avatarUrl?: string;
};

// プロフィールをクライアント形式に変換
export function toClientProfile(profile: ProfileSelect): ProfileClient {
  return {
    ...profile,
    fullName: profile.fullName || undefined,
    avatarUrl: profile.avatarUrl || undefined,
    createdAt: profile.createdAt?.toISOString(),
    updatedAt: profile.updatedAt?.toISOString(),
  };
}

// ========== イベント関連のスキーマと型 ==========

// イベント取得用スキーマ
export const selectEventSchema = createSelectSchema(events);

// イベント挿入用スキーマ
export const insertEventSchema = createInsertSchema(events, {
  id: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
}).extend({
  // 日付型のカスタム処理
  startTime: z.union([z.string().datetime(), z.date()]),
  endTime: z.union([z.string().datetime(), z.date()]),
}).refine(
  data => {
    const startTime = data.startTime instanceof Date
      ? data.startTime
      : new Date(data.startTime);

    const endTime = data.endTime instanceof Date
      ? data.endTime
      : new Date(data.endTime);

    return startTime < endTime;
  },
  {
    message: "終了時間は開始時間より後である必要があります",
    path: ["endTime"],
  }
);

// イベントの型
export type EventSelect = z.infer<typeof selectEventSchema>;
export type EventInsert = z.infer<typeof insertEventSchema>;

// クライアント用イベント型
export type EventClient = Omit<EventSelect, 'startTime' | 'endTime' | 'createdAt' | 'updatedAt' | 'description'> & {
  startTime: string;
  endTime: string;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
};

// イベントをクライアント形式に変換
export function toClientEvent(event: EventSelect): EventClient {
  return {
    ...event,
    description: event.description || undefined,
    startTime: event.startTime.toISOString(),
    endTime: event.endTime.toISOString(),
    createdAt: event.createdAt?.toISOString(),
    updatedAt: event.updatedAt?.toISOString(),
  };
}

// 日付文字列をDate型に変換するユーティリティ
export function parseDate(dateStr: string | Date): Date {
  return dateStr instanceof Date ? dateStr : new Date(dateStr);
}