'use client';
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const userData = user ? JSON.parse(user) : null;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Mini Trello</h1>
            <div className="ml-10 flex items-baseline space-x-4">
              <a
                href="/boards"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                My Boards
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {userData && (
              <span className="text-gray-700 text-sm">
                Welcome, {userData.name}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}