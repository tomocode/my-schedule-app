// src/app/api/[[...route]]/route.ts
import { Hono } from "hono";
import { handle } from "hono/vercel";

import events from "./events";

export const runtime = "edge";

// basePath は API ルートのベースパスを指定します
// 以降、新たに追加する API ルートはこのパスを基準に追加されます
const app = new Hono().basePath("/api");
app.route("/events", events);

export type AppType = typeof app & {
    api: {
      events: {
        $get: () => Promise<Response>;
        $post: (opts: { json: EventClient }) => Promise<Response>;
        ':id': {
          $get: (opts: { param: { id: string } }) => Promise<Response>;
          $put: (opts: { param: { id: string }, json: EventClient }) => Promise<Response>;
          $delete: (opts: { param: { id: string } }) => Promise<Response>;
        };
      };
    };
  };

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);