import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getSession } from '@/lib/auth';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { session, error } = await getSession();
      
      if (error) {
        console.error('Error checking auth:', error);
      }

      if (!session && router.pathname !== '/login' && router.pathname !== '/signup') {
        router.push('/login');
      } else {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (isLoading && router.pathname !== '/login' && router.pathname !== '/signup') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-gray-500">Please wait while we set things up</p>
        </div>
      </div>
    );
  }

  return <Component {...pageProps} />;
} 