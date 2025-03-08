import { useRouter } from 'next/router';
import Link from 'next/link';
import { signOut } from '@/lib/auth';

interface HeaderProps {
  userName?: string | null;
  showSignOut?: boolean;
}

export default function Header({ userName, showSignOut = true }: HeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header className="bg-white shadow">
      <div className="container-custom py-4 flex justify-between items-center">
        <Link href="/templates" className="text-2xl font-bold">
          OnlyCodez
        </Link>
        <div className="flex items-center gap-4">
          {userName && <span className="text-gray-600">{userName}</span>}
          {showSignOut && (
            <button 
              onClick={handleSignOut}
              className="btn-secondary text-sm"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </header>
  );
} 