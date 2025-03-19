// src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 環境変数から接続情報を取得
const connectionString = process.env.DATABASE_URL;

// 接続文字列が存在しない場合はエラー
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

// PostgreSQLクライアントの作成
const client = postgres(connectionString);

// Drizzle ORMのインスタンスを作成
export const db = drizzle(client, { schema });