import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY environment variable is not configured. Some features may not work properly.');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ContentSection = {
  id: string;
  title: string;
  content: string;
  metrics?: {
    uniquenessScore?: number;
    contextualScore?: number;
    coherenceScore?: number;
    thematicScore?: number;
    narrativeFlowScore?: number;
  };
};

type QualityMetric = {
  name: string;
  score: number;
  description: string;
  status: 'success' | 'warning' | 'error' | 'normal';
  suggestions?: string[];
};

type AnalysisResponse = {
  overallScore: number;
  qualityMetrics: QualityMetric[];
  seoMetrics: QualityMetric[];
  readabilityMetrics: QualityMetric[];
  engagementMetrics: QualityMetric[];
  improvementSuggestions: string[];
};

export async function POST(request: NextRequest) {
  try {
    const { content, keyword } = await request.json();
    
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Analyze content using OpenAI
    const analysisResult = await analyzeContentWithAI(content, keyword);
    
    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('Error analyzing content:', error);
    return NextResponse.json({ error: 'Failed to analyze content' }, { status: 500 });
  }
}

async function analyzeContentWithAI(content: string, keyword?: string): Promise<AnalysisResponse> {
  // Analyze SEO metrics
  const seoAnalysis = await analyzeSEO(content, keyword);
  
  // Analyze readability
  const readabilityAnalysis = await analyzeReadability(content);
  
  // Analyze engagement potential
  const engagementAnalysis = await analyzeEngagement(content);
  
  // Analyze content quality
  const qualityAnalysis = await analyzeQuality(content, sections);
  
  // Analyze sections and update their metrics
  const analyzedSections = await analyzeSections(sections);
  
  // Generate improvement suggestions
  const allSuggestions = [
    ...seoAnalysis.flatMap(m => m.suggestions || []),
    ...readabilityAnalysis.flatMap(m => m.suggestions || []),
    ...engagementAnalysis.flatMap(m => m.suggestions || []),
    ...qualityAnalysis.flatMap(m => m.suggestions || [])
  ];
  
  // Calculate overall score
  const allMetrics = [
    ...seoAnalysis,
    ...readabilityAnalysis,
    ...engagementAnalysis,
    ...qualityAnalysis
  ];
  
  const overallScore = Math.round(
    allMetrics.reduce((sum, metric) => sum + metric.score, 0) / allMetrics.length
  );
  
  // Prioritize suggestions based on metric scores
  const prioritizedSuggestions = await prioritizeSuggestions(allSuggestions, allMetrics);
  
  return {
    overallScore,
    qualityMetrics: qualityAnalysis,
    seoMetrics: seoAnalysis,
    readabilityMetrics: readabilityAnalysis,
    engagementMetrics: engagementAnalysis,
    improvementSuggestions: prioritizedSuggestions,
    sections: analyzedSections
  };
}

async function analyzeSEO(content: string, keyword?: string): Promise<QualityMetric[]> {
  const prompt = `Analyze the following content for SEO optimization. Focus on keyword density, meta elements, heading structure, and internal linking. If a target keyword is provided, analyze its usage.

Content: ${content.substring(0, 4000)}${content.length > 4000 ? '...(content truncated)' : ''}

Target keyword: ${keyword || 'Not specified'}

Provide a detailed analysis with scores (0-100) for the following metrics:
1. Keyword Optimization - How effectively are target keywords used?
2. Meta Information - How well are title, description, and heading structure optimized?
3. Internal Linking - How effectively are internal links used?
4. Content Length - Is the content length appropriate for the topic?

For each metric, provide specific improvement suggestions.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are an SEO expert analyzing content quality. Provide objective analysis with specific, actionable suggestions.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 1000
  });

  const response = completion.choices[0]?.message?.content || '';
  
  // Parse the response to extract metrics
  // This is a simplified implementation - in production, you'd want more robust parsing
  const seoMetrics: QualityMetric[] = [
    extractMetric(response, 'Keyword Optimization', 'Measures effective use of target keywords'),
    extractMetric(response, 'Meta Information', 'Evaluates title, description, and heading structure'),
    extractMetric(response, 'Internal Linking', 'Measures effective use of internal links'),
    extractMetric(response, 'Content Length', 'Evaluates if content length is appropriate for the topic')
  ];

  return seoMetrics;
}

async function analyzeReadability(content: string): Promise<QualityMetric[]> {
  const prompt = `Analyze the following content for readability. Focus on reading ease, sentence structure, vocabulary level, and content structure.

Content: ${content.substring(0, 4000)}${content.length > 4000 ? '...(content truncated)' : ''}

Provide a detailed analysis with scores (0-100) for the following metrics:
1. Reading Ease - How easy is the content to read?
2. Sentence Structure - How well-structured are the sentences?
3. Vocabulary Level - Is the vocabulary appropriate for the target audience?
4. Content Structure - How well-organized is the content?

For each metric, provide specific improvement suggestions.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a readability expert analyzing content quality. Provide objective analysis with specific, actionable suggestions.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 1000
  });

  const response = completion.choices[0]?.message?.content || '';
  
  // Parse the response to extract metrics
  const readabilityMetrics: QualityMetric[] = [
    extractMetric(response, 'Reading Ease', 'Measures how easy the content is to read'),
    extractMetric(response, 'Sentence Structure', 'Evaluates sentence length and variety'),
    extractMetric(response, 'Vocabulary Level', 'Measures appropriateness of vocabulary for target audience'),
    extractMetric(response, 'Content Structure', 'Evaluates logical organization and formatting')
  ];

  return readabilityMetrics;
}

async function analyzeEngagement(content: string): Promise<QualityMetric[]> {
  const prompt = `Analyze the following content for engagement potential. Focus on hook strength, call-to-action effectiveness, emotional appeal, and use of visual elements.

Content: ${content.substring(0, 4000)}${content.length > 4000 ? '...(content truncated)' : ''}

Provide a detailed analysis with scores (0-100) for the following metrics:
1. Hook Strength - How effectively does the content grab attention?
2. Call to Action - How effective are the calls to action?
3. Emotional Appeal - How well does the content connect emotionally with readers?
4. Visual Elements - How well are visual elements used to enhance engagement?

For each metric, provide specific improvement suggestions.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are an engagement expert analyzing content quality. Provide objective analysis with specific, actionable suggestions.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 1000
  });

  const response = completion.choices[0]?.message?.content || '';
  
  // Parse the response to extract metrics
  const engagementMetrics: QualityMetric[] = [
    extractMetric(response, 'Hook Strength', 'Measures how effectively the content grabs attention'),
    extractMetric(response, 'Call to Action', 'Evaluates effectiveness of calls to action'),
    extractMetric(response, 'Emotional Appeal', 'Measures emotional connection with readers'),
    extractMetric(response, 'Visual Elements', 'Evaluates use of visual elements to enhance engagement')
  ];

  return engagementMetrics;
}

async function analyzeQuality(content: string, sections: ContentSection[]): Promise<QualityMetric[]> {
  const prompt = `Analyze the following content for overall quality. Focus on content coherence, thematic consistency, content uniqueness, and narrative flow.

Content: ${content.substring(0, 4000)}${content.length > 4000 ? '...(content truncated)' : ''}

Provide a detailed analysis with scores (0-100) for the following metrics:
1. Content Coherence - How well do ideas flow and connect throughout the content?
2. Thematic Consistency - How well does the content maintain key themes throughout?
3. Content Uniqueness - How original is the content compared to similar content?
4. Narrative Flow - How good is the storytelling quality and progression?

For each metric, provide specific improvement suggestions.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a content quality expert. Provide objective analysis with specific, actionable suggestions.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 1000
  });

  const response = completion.choices[0]?.message?.content || '';
  
  // Parse the response to extract metrics
  const qualityMetrics: QualityMetric[] = [
    extractMetric(response, 'Content Coherence', 'Measures how well ideas flow and connect throughout the content'),
    extractMetric(response, 'Thematic Consistency', 'Evaluates how well the content maintains key themes throughout'),
    extractMetric(response, 'Content Uniqueness', 'Measures originality compared to similar content'),
    extractMetric(response, 'Narrative Flow', 'Evaluates the storytelling quality and progression')
  ];

  return qualityMetrics;
}

async function analyzeSections(sections: ContentSection[]): Promise<ContentSection[]> {
  const analyzedSections = [...sections];
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (!section.content) continue;
    
    const previousContent = i > 0 ? sections[i-1].content : undefined;
    const nextContent = i < sections.length - 1 ? sections[i+1].content : undefined;
    
    const prompt = `Analyze the following content section for quality metrics:

Section Title: ${section.title}
Section Content: ${section.content}

${previousContent ? `Previous Section Content: ${previousContent.substring(0, 500)}...` : ''}
${nextContent ? `Next Section Content: ${nextContent.substring(0, 500)}...` : ''}

Provide scores (0-100) for the following metrics:
1. Uniqueness Score - How original is this section?
2. Contextual Score - How well does this section flow with surrounding content?
3. Coherence Score - How well-structured and logical is this section?
4. Thematic Score - How well does this section maintain the overall theme?
5. Narrative Flow Score - How well does this section contribute to the overall narrative?

Format your response as JSON with only the scores, like this:
{
  "uniquenessScore": 85,
  "contextualScore": 78,
  "coherenceScore": 92,
  "thematicScore": 88,
  "narrativeFlowScore": 82
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a content quality expert. Analyze the section and provide only the requested JSON output with scores.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      });

      const response = completion.choices[0]?.message?.content || '{}';
      try {
        const metrics = JSON.parse(response);
        analyzedSections[i] = {
          ...section,
          metrics: {
            uniquenessScore: metrics.uniquenessScore,
            contextualScore: metrics.contextualScore,
            coherenceScore: metrics.coherenceScore,
            thematicScore: metrics.thematicScore,
            narrativeFlowScore: metrics.narrativeFlowScore
          }
        };
      } catch (e) {
        console.error('Error parsing section metrics:', e);
      }
    } catch (e) {
      console.error('Error analyzing section:', e);
    }
  }
  
  return analyzedSections;
}

// Function removed to fix ESLint error

async function prioritizeSuggestions(suggestions: string[], metrics: QualityMetric[]): Promise<string[]> {
  // Sort metrics by score (lowest first)
  const sortedMetrics = [...metrics].sort((a, b) => a.score - b.score);
  
  // Get suggestions from lowest scoring metrics first
  const prioritizedSuggestions: string[] = [];
  const addedSuggestions = new Set<string>();
  
  // First add suggestions from metrics with scores below 70
  for (const metric of sortedMetrics) {
    if (metric.score < 70 && metric.suggestions) {
      for (const suggestion of metric.suggestions) {
        if (!addedSuggestions.has(suggestion)) {
          prioritizedSuggestions.push(suggestion);
          addedSuggestions.add(suggestion);
        }
      }
    }
  }
  
  // Then add remaining suggestions
  for (const metric of sortedMetrics) {
    if (metric.score >= 70 && metric.suggestions) {
      for (const suggestion of metric.suggestions) {
        if (!addedSuggestions.has(suggestion)) {
          prioritizedSuggestions.push(suggestion);
          addedSuggestions.add(suggestion);
        }
      }
    }
  }
  
  // Add any remaining suggestions not tied to metrics
  for (const suggestion of suggestions) {
    if (!addedSuggestions.has(suggestion)) {
      prioritizedSuggestions.push(suggestion);
      addedSuggestions.add(suggestion);
    }
  }
  
  return prioritizedSuggestions;
}

function extractMetric(response: string, metricName: string, description: string): QualityMetric {
  // Simple regex to extract score and suggestions for a metric
  const scoreRegex = new RegExp(`${metricName}[^0-9]*([0-9]+)`, 'i');
  const scoreMatch = response.match(scoreRegex);
  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 70; // Default to 70 if not found
  
  // Extract suggestions
  const suggestions: string[] = [];
  const lines = response.split('\n');
  let capturingSuggestions = false;
  
  for (const line of lines) {
    if (line.toLowerCase().includes(metricName.toLowerCase()) && line.includes(':')) {
      capturingSuggestions = true;
      continue;
    }
    
    if (capturingSuggestions) {
      if (line.trim() === '' || (line.includes(':') && !line.includes('-'))) {
        capturingSuggestions = false;
        continue;
      }
      
      const suggestion = line.trim().replace(/^[\-\*]\s*/, '');
      if (suggestion && !suggestion.includes(':') && suggestion.length > 10) {
        suggestions.push(suggestion);
      }
    }
  }
  
  return {
    name: metricName,
    score,
    description,
    status: getScoreStatus(score),
    suggestions
  };
}

function getScoreStatus(score: number): 'success' | 'normal' | 'warning' | 'error' {
  if (score >= 80) return 'success';
  if (score >= 70) return 'normal';
  if (score >= 60) return 'warning';
  return 'error';
}