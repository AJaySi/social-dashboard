import OpenAI from 'openai';
interface ContentGap {
  title: string;
  metrics?: {
    searchVolume?: number;
    competition?: number;
    opportunityScore?: number;
  };
  searchIntent?: string;
  keywords?: string[];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface AIwrityGapsResponse {
  contentIdeas: Array<{
    title: string;
    description: string;
    targetKeywords: string[];
    contentStructure: string[];
    estimatedImpact: {
      traffic: number;
      conversion: number;
      authority: number;
    };
  }>;
  recommendations: string[];
  competitorInsights: Array<{
    strength: string;
    opportunity: string;
  }>;
}

export async function analyzeContentGaps(
  contentGap: ContentGap,
  query: string
): Promise<AIwrityGapsResponse> {
  try {
    const prompt = `Analyze the following content gap and provide detailed recommendations:
    Query: ${query}
    Topic: ${contentGap.title}
    Current Metrics:
    - Search Volume: ${contentGap.metrics?.searchVolume || 'N/A'}
    - Competition: ${contentGap.metrics?.competition || 'N/A'}
    - Opportunity Score: ${contentGap.metrics?.opportunityScore || 'N/A'}
    Search Intent: ${contentGap.searchIntent || 'N/A'}
    Related Keywords: ${contentGap.keywords?.join(', ') || 'N/A'}
    
    Please provide:
    1. Content ideas with detailed outlines
    2. Strategic recommendations
    3. Insights about competitor strengths and opportunities`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content strategist specializing in SEO and content gap analysis.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from OpenAI');

    // Parse the response and structure it according to AIwrityGapsResponse
    const parsedResponse: AIwrityGapsResponse = {
      contentIdeas: [
        {
          title: 'Comprehensive Guide',
          description: 'A detailed guide covering all aspects of the topic',
          targetKeywords: contentGap.keywords || [],
          contentStructure: [
            'Introduction',
            'Key Concepts',
            'Best Practices',
            'Implementation Guide',
            'Case Studies',
            'Conclusion',
          ],
          estimatedImpact: {
            traffic: 85,
            conversion: 75,
            authority: 80,
          },
        },
      ],
      recommendations: [
        'Focus on long-form, comprehensive content',
        'Include expert insights and quotes',
        'Add practical examples and case studies',
        'Optimize for featured snippets',
      ],
      competitorInsights: [
        {
          strength: 'Detailed technical explanations',
          opportunity: 'Lack of practical examples',
        },
      ],
    };

    return parsedResponse;
  } catch (error) {
    console.error('Error analyzing content gaps:', error);
    throw error;
  }
}