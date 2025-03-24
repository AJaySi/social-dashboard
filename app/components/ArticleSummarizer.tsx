'use client';

import { useState, useCallback } from 'react';
import ArticlePreview from './ArticlePreview';
import FirecrawlApp, { ScrapeResponse } from '@mendable/firecrawl-js';

interface ArticleSummarizerProps {
  onArticleSelect: (article: { title: string; summary: string } | null) => void;
}

interface SummaryCache {
  [key: string]: {
    title: string;
    summary: string;
  };
}

function ArticleSummarizer({ onArticleSelect }: ArticleSummarizerProps) {
  const [summaryCache, setSummaryCache] = useState<SummaryCache>({});
  const [isSummarizing, setIsSummarizing] = useState<{ [key: string]: boolean }>({});
  const [selectedArticle, setSelectedArticle] = useState<{ title: string; summary: string } | null>(null);

  const handleSummarize = useCallback(async (url: string, title: string) => {
    // Check if we already have the summary in cache
    if (summaryCache[url]) {
      const article = summaryCache[url];
      setSelectedArticle(article);
      onArticleSelect(article);
      return;
    }
    
    // Set loading state for this specific URL
    setIsSummarizing(prev => ({ ...prev, [url]: true }));
    
    try {
      // Use Firecrawl to scrape the URL content
      const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
      const response = await firecrawl.scrapeUrl(url, {
        formats: ['markdown']
      }) as ScrapeResponse;
      
      if (!response.success) {
        throw new Error(`Failed to scrape content : ${response.error}`);
      }
      
      // Validate that we have content before proceeding
      if (!response || !response.markdown || typeof response.markdown !== 'string' || response.markdown.trim() === '') {
        console.error('Scraped content is empty or invalid:', response);
        throw new Error('No valid content found on the page');
      }
      
      // Send the scraped content to our summarize API
      const summarizeResponse = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: response.markdown || '',
          url,
          title,
        }),
      });
      
      // Log the request for debugging
      console.log('Summarize request sent with content length:', response.markdown ? response.markdown.length : 0);
      
      if (!summarizeResponse.ok) {
        const errorData = await summarizeResponse.json().catch(() => ({}));
        const errorMessage = errorData.error || summarizeResponse.statusText;
        console.error('Summarize API error:', errorMessage, 'Status:', summarizeResponse.status);
        throw new Error(`Failed to summarize content: ${errorMessage}`);
      }
      
      // Process the summary response
      const summary = await summarizeResponse.json();
      const articleData = { title, summary: summary.summary };
      
      // Update cache and state
      setSummaryCache(prev => ({ ...prev, [url]: articleData }));
      setSelectedArticle(articleData);
      onArticleSelect(articleData);
      
    } catch (error) {
      console.error('Error summarizing article:', error);
      // Handle error appropriately
    } finally {
      setIsSummarizing(prev => ({ ...prev, [url]: false }));
    }
  }, [summaryCache, onArticleSelect]);

  return (
    <>
      {selectedArticle && (
        <ArticlePreview
          article={selectedArticle}
          onClose={() => {
            setSelectedArticle(null);
            onArticleSelect(null);
          }}
        />
      )}
    </>
  );
}

export default ArticleSummarizer;