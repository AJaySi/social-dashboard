'use client';

import { useEffect, useState } from 'react';
import { metricsTracker } from '../services/metrics-tracker';

interface Metrics {
  gsc: number;
  openai: number;
  gemini: number;
  cache_hit: number;
  cache_miss: number;
  rate_limit: number;
}

export default function MetricsTicker() {
  const [metrics, setMetrics] = useState<Metrics>({
    gsc: 0,
    openai: 0,
    gemini: 0,
    cache_hit: 0,
    cache_miss: 0,
    rate_limit: 0
  });

  useEffect(() => {
    // Subscribe to metrics updates
    const unsubscribe = metricsTracker.subscribe((newMetrics) => {
      setMetrics(newMetrics);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="flex items-center space-x-4 text-sm text-gray-600">
      <div className="flex items-center space-x-2">
        <span className="font-medium">API Calls:</span>
        <span>GSC: {metrics.gsc}</span>
        <span>OpenAI: {metrics.openai}</span>
        <span>Gemini: {metrics.gemini}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="font-medium">Cache:</span>
        <span>Hits: {metrics.cache_hit}</span>
        <span>Misses: {metrics.cache_miss}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="font-medium">Rate Limits:</span>
        <span>{metrics.rate_limit}</span>
      </div>
    </div>
  );
}