'use client';

import { useSession, signOut } from 'next-auth/react';
import MetricsTicker from './MetricsTicker';

export default function Header() {
  const { data: session } = useSession();

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {session?.user?.name && (
            <p className="text-gray-700">
              Welcome, <span className="font-semibold">{session.user.name}</span>
            </p>
          )}
          <MetricsTicker />
        </div>
        {session && (
          <button
            onClick={() => signOut()}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
}