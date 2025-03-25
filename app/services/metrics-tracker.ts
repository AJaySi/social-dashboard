'use client';

type MetricType = 'gsc' | 'openai' | 'gemini' | 'cache_hit' | 'cache_miss' | 'rate_limit';

interface Metrics {
  gsc: number;
  openai: number;
  gemini: number;
  cache_hit: number;
  cache_miss: number;
  rate_limit: number;
}

class MetricsTracker {
  private static instance: MetricsTracker;
  private metrics: Metrics = {
    gsc: 0,
    openai: 0,
    gemini: 0,
    cache_hit: 0,
    cache_miss: 0,
    rate_limit: 0
  };

  private constructor() {}

  public static getInstance(): MetricsTracker {
    if (!MetricsTracker.instance) {
      MetricsTracker.instance = new MetricsTracker();
    }
    return MetricsTracker.instance;
  }

  public incrementMetric(type: MetricType): void {
    this.metrics[type]++;
    this.notifySubscribers();
  }

  public getMetrics(): Metrics {
    return { ...this.metrics };
  }

  private subscribers: ((metrics: Metrics) => void)[] = [];

  public subscribe(callback: (metrics: Metrics) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(): void {
    const metrics = this.getMetrics();
    this.subscribers.forEach(callback => callback(metrics));
  }

  public resetMetrics(): void {
    this.metrics = {
      gsc: 0,
      openai: 0,
      gemini: 0,
      cache_hit: 0,
      cache_miss: 0,
      rate_limit: 0
    };
    this.notifySubscribers();
  }
}

export const metricsTracker = MetricsTracker.getInstance();