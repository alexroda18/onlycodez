import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Check if we have a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // If we have a session, redirect to the home page
      if (session) {
        router.push('/templates');
      } else {
        // If we don't have a session, redirect to the login page
        router.push('/login');
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] text-white">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Authenticating...</h2>
        <p className="text-gray-400">Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
} 