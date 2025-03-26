'use client';

import { useState, useCallback } from 'react';
import ArticlePreview from './ArticlePreview';
import FirecrawlApp, { ScrapeResponse } from '@mendable/firecrawl-js';
import { useArticleSummarizer } from '../hooks/useArticleSummarizer';

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
  const {
    selectedArticle,
    setSelectedArticle,
    isSummarizing,
    handleSummarize
  } = useArticleSummarizer(onArticleSelect);

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