// src/lib/api/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 初期のレスポンスを作成（リクエストヘッダーをそのまま引き継ぐ）
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Supabase クライアントの作成
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // cookies() を非同期に取得するための関数
        getAll() {
          return request.cookies.getAll();
        },
        // 取得したクッキーをレスポンスに設定する処理
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // セッションの更新（必要に応じてこれでクッキーの更新が行われる）
  await supabase.auth.getSession();

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
