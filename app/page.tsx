'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Toaster, toast } from 'react-hot-toast';
import Image from 'next/image';
import RightSidebar from './components/RightSidebar';
import SearchConsoleData from './components/SearchConsoleData';
import BlogTitleSuggestions from './components/BlogTitleSuggestions';
import SearchQuerySuggestions from './components/SearchQuerySuggestions';
import CombinedResults from './components/CombinedResults';
import ContentPreview from './components/ContentPreview';
import ContentOutlineGenerator from './components/ContentOutlineGenerator';
import LoadingState from './components/LoadingState';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [showContextMenu, setShowContextMenu] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle image upload logic here
      console.log('Image uploaded:', file);
      // You can implement actual image upload functionality here
    }
  };

  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const { data: session } = useSession();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showAskButton, setShowAskButton] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isSearchQueryModalOpen, setIsSearchQueryModalOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [outline, setOutline] = useState<any[]>([]);
  const [gscInsights, setGscInsights] = useState<any[]>([]);
  const [showContentPreview, setShowContentPreview] = useState(false);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setShowAskButton(newContent.trim().length > 0);
  };

  const handleAskALwrity = async () => {
    try {
      setIsLoading(true);
      setLoadingError(null);
      setLoadingProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev < 30) {
            return prev + 5; // Initial processing
          } else if (prev < 60) {
            return prev + 3; // Analyzing content
          } else if (prev < 85) {
            return prev + 1; // Generating suggestions
          }
          return prev;
        });
      }, 300);
      
      const response = await fetch('/api/suggestions/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestions');
      }

      // Set progress to 100% when we get the response
      setLoadingProgress(100);
      clearInterval(progressInterval);
      
      const suggestions = await response.json();
      // Pass suggestions to the modal component
      setIsAskModalOpen(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      setLoadingError('Failed to get AI suggestions. Please try again.');
      toast.error('Failed to get AI suggestions. Please try again.');
      setIsLoading(false);
      setLoadingProgress(0);
    }
  };

  const handleSelectTitle = (title: string) => {
    setContent(title);
    setSelectedTitle(title);
    setIsAskModalOpen(false);
  };

  const handleSelectQuery = (query: string) => {
    setSelectedQuery(query);
    setIsSearchQueryModalOpen(false);
  };

  const router = useRouter();

  const handleNextClick = () => {
    if (content.trim().length > 0) {
      setIsSearchQueryModalOpen(true);
    } else {
      toast.error('Please enter a blog title first');
    }
  };

  const handleBackToEditor = () => {
    setSelectedQuery(null);
    setShowContentPreview(false);
  };

  const handleConfirmOutline = () => {
    setShowContentPreview(true);
  };

  const handleGenerateContent = async (sectionId: string, context: { 
    title: string, 
    keywords: string[], 
    type: string,
    previousContent?: string,
    nextContent?: string,
    globalContext?: {
      title: string,
      outline: Array<{ title: string, keywords: string[] }>
    }
  }) => {
    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...context,
          estimatedWordCount: outline.find(section => section.id === sectionId)?.estimatedWordCount
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      const updatedOutline = outline.map(section =>
        section.id === sectionId ? { ...section, content: data.content } : section
      );
      setOutline(updatedOutline);
      return data.content;
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  };

  return (
    <main className="flex min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 animate-gradient-shift">
      <Toaster position="top-right" />
      <div className="flex-1 p-8 max-w-[calc(100%-320px)] relative z-10">
        <div className="max-w-4xl mx-auto space-y-6 backdrop-blur-lg bg-white/10 rounded-xl p-8 shadow-2xl border border-white/20 animate-fade-in">
          {!selectedQuery ? (
            <div className="relative">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Start Your Blog Now</h1>
              <br></br>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  className="
                    w-full p-4 min-h-[200px] border border-gray-600 rounded-2xl shadow-md 
                    bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 text-white 
                    placeholder-gray-400 resize-none focus:outline-none focus:ring-4 
                    focus:ring-blue-400/70 focus:border-transparent relative 
                    before:content-[''] before:absolute before:inset-0 before:rounded-2xl 
                    before:border before:border-blue-400/30 before:animate-glow 
                    before:bg-gradient-to-r before:from-blue-500/10 before:via-purple-500/10 
                    before:to-pink-500/10
                    after:content-[''] after:absolute after:inset-0 after:rounded-2xl 
                    after:border after:border-blue-400/20 after:animate-shimmer 
                    after:bg-gradient-to-br after:from-blue-400/20 after:to-purple-400/20
                    hover:shadow-lg hover:shadow-blue-500/40 focus:shadow-xl 
                    focus:shadow-blue-500/60 transition-all duration-300 
                    [&:not(:focus)]:hover:border-blue-500/40 [&:not(:focus)]:hover:shadow-lg
                  "
                  placeholder="Write your blog or enter keywords and ask Alwrity..."
                  aria-label="Blog writing text area"
                  value={content}
                  onChange={handleContentChange}
                />
                <div className="absolute bottom-4 left-4 flex items-center space-x-4 text-gray-400">
                  <div className="relative">
                    <button 
                      className="flex items-center space-x-1 opacity-50 cursor-not-allowed"
                      disabled
                    >
                      <span># Context</span>
                      <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Beta</span>
                    </button>
                  </div>
                  <div className="relative">
                    <label className="flex items-center space-x-1 opacity-50 cursor-not-allowed">
                      <Image src="/favicon.ico" width={16} height={16} alt="Images" />
                      <span>Images</span>
                      <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Beta</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                {content.trim().length > 0 && (
                  <button
                    onClick={handleNextClick}
                    className="flex items-center px-6 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-md hover:from-green-500 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                  >
                    Next: Get Search Query Suggestions
                  </button>
                )}
                {showAskButton && (
                  <button
                    onClick={handleAskALwrity}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-md hover:from-blue-500 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 ml-auto"
                    disabled={isLoading}
                  >
                    <Image
                      src="/favicon.ico"
                      alt="ALwrity"
                      width={20}
                      height={20}
                      className="mr-2 opacity-90"
                    />
                    {isLoading ? 'Processing...' : 'Ask ALwrity'}
                  </button>
                )}
                
                {/* Loading State */}
                {isLoading && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
                      <LoadingState 
                        isLoading={isLoading} 
                        error={loadingError}
                        loadingMessage="Generating AI suggestions"
                        progress={loadingProgress}
                        tips={[
                          'Analyzing your content...',
                          'Searching for relevant topics...',
                          'Generating title suggestions...',
                          'Optimizing for engagement...',
                          'Almost there! Finalizing results...'
                        ]}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full">
              {selectedQuery && !showContentPreview ? (
                <CombinedResults
                  query={selectedQuery}
                  onBack={handleBackToEditor}
                />
              ) : showContentPreview ? (
                <div className="space-y-4">
                  <ContentOutlineGenerator
                    selectedTitle={selectedTitle}
                    selectedQuery={selectedQuery}
                    gscInsights={gscInsights}
                    onOutlineGenerated={setOutline}
                  />
                  <div className="flex justify-between mt-6">
                    <button
                      onClick={handleBackToEditor}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleConfirmOutline}
                      className="px-6 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-md hover:from-blue-500 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Confirm & Generate Content
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => setShowContentPreview(false)}
                      className="px-6 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-md hover:from-blue-500 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center"
                    >
                      <span className="mr-2">←</span> Back to Outline
                    </button>
                  </div>
                  <ContentPreview 
                    outline={outline} 
                    onGenerateContent={handleGenerateContent}
                    onContentUpdate={async (sectionId, newContent) => {
                      const updatedOutline = outline.map(section =>
                        section.id === sectionId ? { ...section, content: newContent } : section
                      );
                      setOutline(updatedOutline);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <SearchConsoleData insights={[]} />
      
      <BlogTitleSuggestions
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        onSelectTitle={handleSelectTitle}
        currentContent={content}
        gscInsights={[]}
      />
      
      <SearchQuerySuggestions
        isOpen={isSearchQueryModalOpen}
        onClose={() => setIsSearchQueryModalOpen(false)}
        onSelectQuery={handleSelectQuery}
        currentContent={content}
        gscInsights={[]}
      />
    </main>
  );
}