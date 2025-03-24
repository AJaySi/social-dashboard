'use client';

import { useRouter } from 'next/navigation';
import ContentPreview from '../components/ContentPreview';

export default function ContentPreviewPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/combined-results');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ContentPreview
        outline={typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('outline') || '[]') : []}
        onContentUpdate={async (sectionId: string, newContent: string) => {
          const outline = JSON.parse(sessionStorage.getItem('outline') || '[]');
          const updatedOutline = outline.map((section: any) =>
            section.id === sectionId ? { ...section, content: newContent } : section
          );
          sessionStorage.setItem('outline', JSON.stringify(updatedOutline));
        }}
        onGenerateContent={async (sectionId: string, context: any) => {
          try {
            const response = await fetch('/api/content/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sectionId, context })
            });
            if (!response.ok) throw new Error('Failed to generate content');
            const data = await response.json();
            return data.content;
          } catch (error) {
            console.error('Error generating content:', error);
            throw error;
          }
        }}
      />
    </div>
  );
}