import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/templates');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">OnlyCodez</h1>
        <p className="text-gray-600">Redirecting to your templates...</p>
      </div>
    </div>
  );
} 