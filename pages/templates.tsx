import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { getUserTemplates } from '@/lib/supabase';
import { useTemplateStore } from '@/lib/store';
import type { UserTemplate } from '@/lib/supabase';
import TemplateCard from '@/components/TemplateCard';

export default function Templates() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { templates, setTemplates } = useTemplateStore();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const { user, error: userError } = await getUser();
        
        if (userError || !user) {
          setError('Failed to authenticate user');
          router.push('/login');
          return;
        }

        setUserName(user.email || null);
        
        const userTemplates = await getUserTemplates(user.id);
        setTemplates(userTemplates);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('Failed to load templates');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTemplates();
  }, [router, setTemplates]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#111111] text-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading templates...</h2>
          <p className="text-gray-400">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Dark Sidebar */}
      <div className="w-[220px] bg-[#222222] text-white flex flex-col">
        <div className="px-4 py-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold">OnlyCodez</h2>
        </div>
        <div className="overflow-y-auto flex-1">
          <Link 
            href="/templates" 
            className="flex items-center px-4 py-3 bg-gray-700 hover:bg-gray-700 transition-colors"
          >
            <span className="inline-block w-6 h-6 mr-3 flex items-center justify-center rounded text-white bg-blue-500">
              📋
            </span>
            <span>Templates</span>
          </Link>
          {/* Add additional navigation items here if needed */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#111111] text-white">
        <div className="flex flex-col p-4 gap-3">
          {/* Top area with heading */}
          <div className="bg-[#2a2a2a] rounded-lg overflow-hidden flex flex-col">
            <div className="p-3 border-b border-gray-700 bg-[#333] flex justify-between items-center">
              <h1 className="text-xl font-semibold">Your Templates</h1>
              {userName && (
                <div className="text-sm text-gray-300">
                  {userName}
                </div>
              )}
            </div>
          
            <div className="p-4">
              {error && (
                <div className="bg-red-900/30 text-red-300 p-4 rounded-md mb-6">
                  {error}
                </div>
              )}

              {templates.length === 0 ? (
                <div className="bg-yellow-900/30 p-6 rounded-lg text-center">
                  <h3 className="text-lg font-medium text-yellow-300 mb-2">No templates found</h3>
                  <p className="text-yellow-200">
                    You haven&apos;t purchased any templates yet. Templates you purchase from our store will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((userTemplate: UserTemplate) => (
                    userTemplate.template && (
                      <div key={userTemplate.id}>
                        <TemplateCard template={userTemplate.template} />
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 