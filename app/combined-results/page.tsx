'use client';

import { useRouter } from 'next/navigation';
import CombinedResults from '../components/CombinedResults';

export default function CombinedResultsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CombinedResults
        query={typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('query') : null}
        onBack={handleBack}
      />
    </div>
  );
}