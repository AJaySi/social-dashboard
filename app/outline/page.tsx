'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from 'antd';
import ContentOutlineGenerator, { OutlineSection } from '../components/ContentOutlineGenerator';
import ContentPreview from '../components/ContentPreview';
import { ContentPersonalizationPreferences } from '../components/ContentPersonalizationForm';

export default function OutlinePage() {
  const router = useRouter();
  const [generatedOutline, setGeneratedOutline] = useState<OutlineSection[]>([]);
  const [showContentPreview, setShowContentPreview] = useState(false);
  const [query, setQuery] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [gscInsights, setGscInsights] = useState<any[]>([]);

  useEffect(() => {
    // Get data from sessionStorage when component mounts
    if (typeof window !== 'undefined') {
      const storedQuery = sessionStorage.getItem('outlineQuery');
      const storedTitle = sessionStorage.getItem('outlineTitle');
      const storedGscInsights = sessionStorage.getItem('outlineGscInsights');
      const storedOutline = sessionStorage.getItem('outline');

      if (storedQuery) setQuery(storedQuery);
      if (storedTitle) setTitle(storedTitle);
      if (storedGscInsights) setGscInsights(JSON.parse(storedGscInsights));
      if (storedOutline) setGeneratedOutline(JSON.parse(storedOutline));
    }
  }, []);

  const handleBack = () => {
    router.push('/combined-results?query=' + encodeURIComponent(query || ''));
  };

  const handleOutlineGenerated = (outline: OutlineSection[], personalizationPreferences?: ContentPersonalizationPreferences) => {
    setGeneratedOutline(outline);
    // Store in sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('outline', JSON.stringify(outline));
    }
  };

  const handleGenerateContent = () => {
    if (generatedOutline.length === 0) {
      return;
    }
    
    setShowContentPreview(true);
  };

  const handleContentUpdate = async (sectionId: string, newContent: string) => {
    const updatedOutline = generatedOutline.map(section =>
      section.id === sectionId ? { ...section, content: newContent } : section
    );
    setGeneratedOutline(updatedOutline);
    
    // Update sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('outline', JSON.stringify(updatedOutline));
    }
    
    return Promise.resolve();
  };

  const handleContentGenerate = async (sectionId: string, context: any) => {
    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...context,
          estimatedWordCount: generatedOutline.find((sec) => sec.id === sectionId)?.estimatedWordCount,
          provider: (process.env.DEFAULT_AI_PROVIDER || 'gemini') as 'openai' | 'gemini'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          {query ? `Content Outline for "${query}"` : 'Content Outline Generator'}
        </h1>
        <Button 
          onClick={handleBack}
          className="hover:text-blue-600 transition-colors px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center space-x-2"
        >
          Back to Results
        </Button>
      </div>

      {!showContentPreview ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <ContentOutlineGenerator
            selectedTitle={title}
            selectedQuery={query}
            gscInsights={gscInsights}
            onOutlineGenerated={handleOutlineGenerated}
          />
          
          {generatedOutline.length > 0 && (
            <div className="mt-6 flex justify-end">
              <Button
                type="primary"
                onClick={handleGenerateContent}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:from-blue-600 hover:to-indigo-700 active:scale-95 transform transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Generate Content
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="content-preview-container w-full h-full">
          <ContentPreview
            outline={generatedOutline}
            onContentUpdate={handleContentUpdate}
            onGenerateContent={handleContentGenerate}
          />
        </div>
      )}
    </div>
  );
}