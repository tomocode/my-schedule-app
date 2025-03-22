'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

type HeaderProps = {
  user: User | null;
};

export default function Header({ user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/')
      ? 'text-blue-600'
      : 'text-gray-600 hover:text-gray-900';
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                スケジュール管理
              </Link>
            </div>
            {user && (
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                    isActive('/dashboard') ? 'border-blue-500' : 'border-transparent'
                  } ${isActive('/dashboard')} text-sm font-medium`}
                >
                  ダッシュボード
                </Link>
                <Link
                  href="/events/calendar"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                    isActive('/events/calendar') ? 'border-blue-500' : 'border-transparent'
                  } ${isActive('/events/calendar')} text-sm font-medium`}
                >
                  カレンダー
                </Link>
                <Link
                  href="/events/new"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                    isActive('/events/new') ? 'border-blue-500' : 'border-transparent'
                  } ${isActive('/events/new')} text-sm font-medium`}
                >
                  新規イベント
                </Link>
              </nav>
            )}
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-red-600 hover:text-red-500"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className={`${isActive('/login')} text-sm font-medium px-3 py-2`}
                >
                  ログイン
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-medium bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-500"
                >
                  新規登録
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">メニューを開く</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        {user ? (
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/dashboard"
              className={`block pl-3 pr-4 py-2 border-l-4 ${
                isActive('/dashboard') ? 'border-blue-500 bg-blue-50' : 'border-transparent'
              } ${isActive('/dashboard')} text-base font-medium`}
            >
              ダッシュボード
            </Link>
            <Link
              href="/events/calendar"
              className={`block pl-3 pr-4 py-2 border-l-4 ${
                isActive('/events/calendar') ? 'border-blue-500 bg-blue-50' : 'border-transparent'
              } ${isActive('/events/calendar')} text-base font-medium`}
            >
              カレンダー
            </Link>
            <Link
              href="/events/new"
              className={`block pl-3 pr-4 py-2 border-l-4 ${
                isActive('/events/new') ? 'border-blue-500 bg-blue-50' : 'border-transparent'
              } ${isActive('/events/new')} text-base font-medium`}
            >
              新規イベント
            </Link>
          </div>
        ) : null}
        <div className="pt-4 pb-3 border-t border-gray-200">
          {user ? (
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600">{user.email?.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user.email}</div>
              </div>
            </div>
          ) : null}
          <div className="mt-3 space-y-1">
            {user ? (
              <div className="px-4">
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:text-red-500 hover:bg-gray-100"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  ログイン
                </Link>
                <Link
                  href="/signup"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  新規登録
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}