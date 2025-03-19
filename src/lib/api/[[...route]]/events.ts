// src/app/api/[[...route]]/events.ts
import { db } from "@/lib/db";
import { events, toClientEvent } from "@/lib/db/schema"; // toClientEventをインポート
import { zValidator } from "@hono/zod-validator";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { Hono } from "hono";
import type { Context, MiddlewareHandler } from "hono";
import { z } from "zod";
import { cookies } from "next/headers";
import { eq, and } from "drizzle-orm";

// カスタムの変数型を定義
type Variables = {
  userId: string;
};

// バリデーションスキーマの定義
export const eventSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().optional(),
  startTime: z.string().datetime({ message: "有効な日時形式である必要があります" }),
  endTime: z.string().datetime({ message: "有効な日時形式である必要があります" }),
  userId: z.string().uuid().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
}).refine(
  data => new Date(data.startTime) < new Date(data.endTime),
  {
    message: "終了時間は開始時間より後である必要があります",
    path: ["endTime"],
  }
);

// 認証チェック用のミドルウェア
const authMiddleware: MiddlewareHandler<{
  Variables: Variables;
}> = async (c, next) => {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return c.json(
      { success: false, error: "認証が必要です" },
      { status: 401 }
    );
  }

  // ユーザーIDを変数として設定
  c.set('userId', session.user.id);
  await next();
};

// Honoインスタンスを作成（型パラメータを指定）
const app = new Hono<{
  Variables: Variables;
}>()
  // 認証ミドルウェアを全てのルートに適用
  .use("*", authMiddleware)

  // イベント一覧を取得
  .get("/", async (c) => {
    const userId = c.get('userId');

    try {
      const userEvents = await db.select()
        .from(events)
        .where(eq(events.userId, userId))
        .orderBy(events.startTime);

      // クライアント形式に変換
      const clientEvents = userEvents.map(toClientEvent);

      return c.json({ success: true, data: clientEvents });
    } catch (error) {
      console.error("Error fetching events:", error);
      return c.json(
        { success: false, error: "イベントの取得に失敗しました" },
        { status: 500 }
      );
    }
  })

  // 特定のイベントを取得
  .get("/:id", async (c) => {
    const userId = c.get('userId');
    const id = c.req.param("id");

    try {
      const [event] = await db.select()
        .from(events)
        .where(
          and(
            eq(events.id, id),
            eq(events.userId, userId)
          )
        );

      if (!event) {
        return c.json(
          { success: false, error: "イベントが見つかりません" },
          { status: 404 }
        );
      }

      // クライアント形式に変換
      const clientEvent = toClientEvent(event);

      return c.json({ success: true, data: clientEvent });
    } catch (error) {
      console.error("Error fetching event:", error);
      return c.json(
        { success: false, error: "イベントの取得に失敗しました" },
        { status: 500 }
      );
    }
  })

  // 新しいイベントを作成
  .post("/", zValidator("json", eventSchema), async (c) => {
    const userId = c.get('userId');
    const eventData = c.req.valid("json");

    try {
      // イベントをデータベースに保存
      const [newEvent] = await db.insert(events)
        .values({
          title: eventData.title,
          description: eventData.description || "",
          startTime: new Date(eventData.startTime),
          endTime: new Date(eventData.endTime),
          userId: userId
        })
        .returning();

      // クライアント形式に変換
      const clientEvent = toClientEvent(newEvent);

      return c.json({ success: true, data: clientEvent }, { status: 201 });
    } catch (error) {
      console.error("Error creating event:", error);
      return c.json(
        { success: false, error: "イベントの作成に失敗しました" },
        { status: 500 }
      );
    }
  })

  // イベントを更新
  .put("/:id", zValidator("json", eventSchema), async (c) => {
    const userId = c.get('userId');
    const id = c.req.param("id");
    const eventData = c.req.valid("json");

    try {
      // イベントが存在し、ユーザーに紐づいているか確認
      const [existingEvent] = await db.select()
        .from(events)
        .where(
          and(
            eq(events.id, id),
            eq(events.userId, userId)
          )
        );

      if (!existingEvent) {
        return c.json(
          { success: false, error: "イベントが見つかりません" },
          { status: 404 }
        );
      }

      // イベントを更新
      const [updatedEvent] = await db.update(events)
        .set({
          title: eventData.title,
          description: eventData.description || "",
          startTime: new Date(eventData.startTime),
          endTime: new Date(eventData.endTime),
          updatedAt: new Date()
        })
        .where(eq(events.id, id))
        .returning();

      // クライアント形式に変換
      const clientEvent = toClientEvent(updatedEvent);

      return c.json({ success: true, data: clientEvent });
    } catch (error) {
      console.error("Error updating event:", error);
      return c.json(
        { success: false, error: "イベントの更新に失敗しました" },
        { status: 500 }
      );
    }
  })

  // イベントを削除
  .delete("/:id", async (c) => {
    const userId = c.get('userId');
    const id = c.req.param("id");

    try {
      // イベントが存在し、ユーザーに紐づいているか確認
      const [existingEvent] = await db.select()
        .from(events)
        .where(
          and(
            eq(events.id, id),
            eq(events.userId, userId)
          )
        );

      if (!existingEvent) {
        return c.json(
          { success: false, error: "イベントが見つかりません" },
          { status: 404 }
        );
      }

      // イベントを削除
      await db.delete(events)
        .where(eq(events.id, id));

      return c.json({
        success: true,
        data: { message: "イベントを削除しました" }
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      return c.json(
        { success: false, error: "イベントの削除に失敗しました" },
        { status: 500 }
      );
    }
  });

export default app;