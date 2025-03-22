'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-sm font-medium text-red-600 hover:text-red-500"
    >
      ログアウト
    </button>
  );
}