'use client';

import { useState, useCallback } from 'react';
import { message } from 'antd';

interface Article {
  title: string;
  summary: string;
}

interface SummaryCache {
  [key: string]: Article;
}

export function useArticleSummarizer(onArticleSelect?: (article: Article | null) => void) {
  const [summaryCache, setSummaryCache] = useState<SummaryCache>({});
  const [isSummarizing, setIsSummarizing] = useState<Record<string, boolean>>({});
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [summaryProgress, setSummaryProgress] = useState<Record<string, number>>({});
  const [summaryStage, setSummaryStage] = useState<Record<string, string>>({});

  const handleSummarize = useCallback(async (url: string, title: string) => {
    if (isSummarizing[url]) return;
    
    // Check if we already have the summary in cache
    if (summaryCache[url]) {
      const article = summaryCache[url];
      setSelectedArticle(article);
      onArticleSelect?.(article);
      return;
    }

    try {
      setIsSummarizing((prev) => ({ ...prev, [url]: true }));
      setSummaryProgress((prev) => ({ ...prev, [url]: 10 }));
      setSummaryStage((prev) => ({ ...prev, [url]: 'Fetching URL content...' }));

      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      setSummaryProgress((prev) => ({ ...prev, [url]: 50 }));
      setSummaryStage((prev) => ({ ...prev, [url]: 'Summarizing with AI...' }));

      if (!response.ok) {
        throw new Error('Failed to summarize article');
      }

      const data = await response.json();
      setSummaryProgress((prev) => ({ ...prev, [url]: 100 }));
      setSummaryStage((prev) => ({ ...prev, [url]: 'Complete!' }));
      
      // Store in cache
      const articleData = { title, summary: data.summary };
      setSummaryCache((prev) => ({ ...prev, [url]: articleData }));
      setSelectedArticle(articleData);
      onArticleSelect?.(articleData);
    } catch (error) {
      console.error('Error summarizing article:', error);
      message.error('Failed to summarize article');
      setSummaryProgress((prev) => ({ ...prev, [url]: 0 }));
      setSummaryStage((prev) => ({ ...prev, [url]: '' }));
    } finally {
      // Clear progress after a short delay
      setTimeout(() => {
        setSummaryProgress((prev) => ({ ...prev, [url]: 0 }));
        setSummaryStage((prev) => ({ ...prev, [url]: '' }));
      }, 1000);
      setIsSummarizing((prev) => ({ ...prev, [url]: false }));
    }
  }, [isSummarizing, summaryCache, onArticleSelect]);

  return {
    selectedArticle,
    setSelectedArticle,
    isSummarizing,
    summaryProgress,
    summaryStage,
    handleSummarize
  };
}