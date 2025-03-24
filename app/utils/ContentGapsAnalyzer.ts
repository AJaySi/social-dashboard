interface KeywordData {
  query: string;
  impressions: number;
  position: number;
}

type ContentGapScore = {
  topic: string;
  score: number;
  searchVolume: number;
  competition: number;
  currentRanking: number;
  searchIntent: string;
  relatedKeywords: string[];
  competitorContent: {
    url: string;
    title: string;
    contentStructure: string[];
  }[];
};

type KeywordCluster = {
  mainKeyword: string;
  relatedKeywords: string[];
  avgSearchVolume: number;
  avgPosition: number;
  searchIntent: string;
};

export class ContentGapsAnalyzer {
  private keywordData: KeywordData[];
  private readonly MIN_SEARCH_VOLUME = 100;
  private readonly MAX_COMPETITION_SCORE = 0.8;

  constructor(keywordData: KeywordData[]) {
    this.keywordData = keywordData;
  }

  public analyzeContentGaps(): ContentGapScore[] {
    const keywordClusters = this.createKeywordClusters();
    const contentGaps = this.identifyContentGaps(keywordClusters);
    return this.scoreContentGaps(contentGaps);
  }

  private createKeywordClusters(): KeywordCluster[] {
    const clusters: KeywordCluster[] = [];
    const processedKeywords = new Set<string>();

    for (const keyword of this.keywordData) {
      if (processedKeywords.has(keyword.query)) continue;

      const relatedKeywords = this.findRelatedKeywords(keyword.query);
      const cluster: KeywordCluster = {
        mainKeyword: keyword.query,
        relatedKeywords: relatedKeywords.map(k => k.query),
        avgSearchVolume: this.calculateAvgSearchVolume([keyword, ...relatedKeywords]),
        avgPosition: this.calculateAvgPosition([keyword, ...relatedKeywords]),
        searchIntent: this.determineSearchIntent(keyword.query)
      };

      clusters.push(cluster);
      processedKeywords.add(keyword.query);
      relatedKeywords.forEach(k => processedKeywords.add(k.query));
    }

    return clusters;
  }

  private findRelatedKeywords(query: string): KeywordData[] {
    return this.keywordData.filter(k => 
      k.query !== query && 
      (k.query.includes(query) || query.includes(k.query))
    );
  }

  private calculateAvgSearchVolume(keywords: KeywordData[]): number {
    return keywords.reduce((sum, k) => sum + k.impressions, 0) / keywords.length;
  }

  private calculateAvgPosition(keywords: KeywordData[]): number {
    return keywords.reduce((sum, k) => sum + k.position, 0) / keywords.length;
  }

  private determineSearchIntent(query: string): string {
    const informationalKeywords = ['how', 'what', 'why', 'guide', 'tutorial'];
    const commercialKeywords = ['buy', 'price', 'review', 'best', 'vs'];
    const transactionalKeywords = ['purchase', 'order', 'deal', 'discount'];

    const lowerQuery = query.toLowerCase();

    if (informationalKeywords.some(k => lowerQuery.includes(k))) return 'informational';
    if (commercialKeywords.some(k => lowerQuery.includes(k))) return 'commercial';
    if (transactionalKeywords.some(k => lowerQuery.includes(k))) return 'transactional';
    return 'navigational';
  }

  private identifyContentGaps(clusters: KeywordCluster[]): ContentGapScore[] {
    return clusters
      .filter(cluster => 
        cluster.avgSearchVolume >= this.MIN_SEARCH_VOLUME &&
        cluster.avgPosition > 10 // Not ranking in top 10
      )
      .map(cluster => ({
        topic: cluster.mainKeyword,
        score: 0, // Will be calculated in scoreContentGaps
        searchVolume: cluster.avgSearchVolume,
        competition: this.calculateCompetitionScore(cluster),
        currentRanking: cluster.avgPosition,
        searchIntent: cluster.searchIntent,
        relatedKeywords: cluster.relatedKeywords,
        competitorContent: this.analyzeCompetitorContent(cluster.mainKeyword)
      }));
  }

  private calculateCompetitionScore(cluster: KeywordCluster): number {
    // Simplified competition score based on average position
    return Math.min(cluster.avgPosition / 100, this.MAX_COMPETITION_SCORE);
  }

  private analyzeCompetitorContent(keyword: string): { url: string; title: string; contentStructure: string[]; }[] {
    // In a real implementation, this would analyze actual SERP data
    // For now, return mock data
    return [
      {
        url: `https://example.com/${keyword.replace(/\s+/g, '-')}`,
        title: `Complete Guide to ${keyword}`,
        contentStructure: [
          'Introduction',
          'What is ' + keyword,
          'Benefits and Features',
          'How to Get Started',
          'Best Practices',
          'Common Challenges',
          'Conclusion'
        ]
      }
    ];
  }

  private scoreContentGaps(gaps: ContentGapScore[]): ContentGapScore[] {
    return gaps.map(gap => {
      const searchVolumeScore = Math.min(gap.searchVolume / 1000, 1) * 40;
      const competitionScore = (1 - gap.competition) * 30;
      const rankingScore = (100 - Math.min(gap.currentRanking, 100)) / 100 * 30;

      gap.score = searchVolumeScore + competitionScore + rankingScore;
      return gap;
    }).sort((a, b) => b.score - a.score);
  }
}