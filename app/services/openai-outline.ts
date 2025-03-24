import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is missing.');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface SearchMetrics {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface ContentGap {
  keyword: string;
  metrics?: SearchMetrics;
  type: 'content_gap' | 'optimization_opportunity';
  title: string;
}

interface SerpData {
  related_questions?: { question: string }[];
  related_searches?: { query: string }[];
  organic_results?: {
    title: string;
    snippet: string;
    position: number;
  }[];
}

interface GenerateOutlineParams {
  title: string;
  query?: string;
  blogTitle?: string;
  gscInsights: ContentGap[];
  serpData?: SerpData;
}

interface OutlineSection {
  id: string;
  title: string;
  keywords: string[];
  estimatedWordCount: number;
  keyPoints: string[];
  sectionType: 'introduction' | 'body' | 'conclusion' | 'faq' | 'case_study';
  optimizationScore: number;
  type?: 'introduction' | 'body' | 'conclusion' | 'faq' | 'case_study' | 'content';
  content?: string;
}

// Define the Zod schema for blog outline sections - simplified for better compatibility
const OutlineSectionSchema = z.object({
  title: z.string(),
  keywords: z.array(z.string()),
  wordCount: z.number().optional(),
  word_count: z.number().optional(),
  keyPoints: z.array(z.string()).optional(),
  key_points: z.array(z.string()).optional(),
  sectionType: z.enum(['introduction', 'body', 'conclusion', 'faq', 'case_study']).optional(),
  section_type: z.enum(['introduction', 'body', 'conclusion', 'faq', 'case_study']).optional(),
  optimizationScore: z.number().optional(),
  optimization_score: z.number().optional()
});

// Define the complete blog outline schema
const BlogOutlineSchema = z.object({
  outline: z.array(OutlineSectionSchema)
});

// Cache storage for outlines with 15-minute expiration
const outlineCache = new Map<string, { data: OutlineSection[]; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export async function generateOutlinePrompt({
  title,
  query,
  blogTitle,
  gscInsights,
  serpData
}: GenerateOutlineParams): Promise<string> {
  const searchTerm = query || title || blogTitle;
  let prompt = `Create a comprehensive blog outline for: "${searchTerm}"

Consider the following data-driven insights to structure the content:`;

  // Add GSC insights for content gaps and optimization opportunities
  if (gscInsights.length > 0) {
    prompt += '\n\nContent Opportunities and Gaps:';
    gscInsights.forEach(insight => {
      prompt += `\n- ${insight.title} for keyword "${insight.keyword}"`;
      if (insight.metrics) {
        prompt += ` (${insight.metrics.impressions} impressions, position ${insight.metrics.position})`;
      }
    });
  }

  // Add SERP data insights
  if (serpData) {
    if (serpData.related_questions?.length) {
      prompt += '\n\nCommon User Questions to Address:';
      serpData.related_questions.slice(0, 5).forEach(q => {
        prompt += `\n- ${q.question}`;
      });
    }

    if (serpData.related_searches?.length) {
      prompt += '\n\nRelated Topics to Consider:';
      serpData.related_searches.slice(0, 5).forEach(rs => {
        prompt += `\n- ${rs.query}`;
      });
    }

    if (serpData.organic_results?.length) {
      prompt += '\n\nCompetitor Content Patterns:';
      serpData.organic_results.slice(0, 3).forEach(result => {
        prompt += `\n- ${result.title} (Position ${result.position})`;
      });
    }
  }

  prompt += `\n\nProvide a structured blog outline with sections:
- Title: Clear and engaging section heading
- Keywords: List of target keywords to include
- Word Count: Estimated length based on topic depth
- Key Points: Main points to cover in bullet form
- Section Type: One of [introduction, body, conclusion, faq, case_study]
- Optimization Score: 0-100 based on search intent match

Ensure the outline:
1. Addresses identified content gaps
2. Incorporates high-performing keywords
3. Answers common user questions
4. Follows a logical content hierarchy
5. Maintains proper keyword distribution
6. Includes data-backed recommendations for section depth`;

  return prompt;
}

export async function generateBlogOutline(params: GenerateOutlineParams): Promise<OutlineSection[]> {
  try {
    const cacheKey = `${params.title}_${params.query || ''}_${JSON.stringify(params.gscInsights)}`;
    const cachedData = outlineCache.get(cacheKey);

    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data;
    }

    const prompt = await generateOutlinePrompt(params);

    const completion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-mini-2024-07-18',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert content strategist and SEO specialist. Create detailed blog outlines that are data-driven, comprehensive, and optimized for both search engines and user intent.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: zodResponseFormat(BlogOutlineSchema, 'outline')
    });

    if (!completion.choices[0]?.message?.parsed?.outline) {
      throw new Error('Invalid response format from OpenAI API');
    }

    const sections = completion.choices[0].message.parsed.outline;
    
    const formattedSections = sections.map((section: z.infer<typeof OutlineSectionSchema>, index: number) => ({
      id: `section-${index + 1}`,
      title: section.title || 'Untitled Section',
      keywords: section.keywords || [],
      estimatedWordCount: section.wordCount || section.word_count || 300,
      keyPoints: section.keyPoints || section.key_points || [],
      sectionType: section.sectionType || section.section_type || 'body',
      optimizationScore: section.optimizationScore || section.optimization_score || 70
    }));

    outlineCache.set(cacheKey, {
      data: formattedSections,
      timestamp: Date.now()
    });

    return formattedSections;
  } catch (error) {
    console.error('Error generating blog outline:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate blog outline: ${error.message}`);
    }
    throw new Error(`Failed to generate blog outline: ${String(error)}`);
  }
}