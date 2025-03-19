'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      console.error('Authentication error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-6">
          {error === 'Configuration' && (
            <>The authentication provider is not properly configured. Please check your environment variables.</>
          )}
          {error === 'AccessDenied' && (
            <>You have denied access to your social media account. Please try again and grant the necessary permissions.</>
          )}
          {!error && (
            <>An unexpected error occurred during authentication. Please try again.</>
          )}
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}