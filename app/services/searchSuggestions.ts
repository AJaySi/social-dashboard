import OpenAI from 'openai';
import { cache } from 'react';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Check for required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is missing');
}

if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  console.error('Error: NEXT_PUBLIC_GEMINI_API_KEY environment variable is missing');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const gemini = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// Custom error classes for better error handling
class APIAuthenticationError extends Error {
  constructor(provider: string, message: string) {
    super(`${provider} Authentication Error: ${message}`);
    this.name = 'APIAuthenticationError';
  }
}

class APIRequestError extends Error {
  constructor(provider: string, message: string) {
    super(`${provider} Request Error: ${message}`);
    this.name = 'APIRequestError';
  }
}


interface GSCInsight {
  type: string;
  title: string;
  description: string;
  data: unknown[];
}

interface GenerateSearchQueriesParams {
  content: string;
  gscInsights: GSCInsight[];
}

interface SearchQuerySuggestion {
  query: string;
  keywords: string[];
  insights: string[];
}

// Define simplified Zod schema for search query suggestions
const SearchQuerySuggestionSchema = z.object({
  instruction: z.array(z.object({
    query: z.string(),
    keywords: z.array(z.string()),
    insights: z.array(z.string())
  }))
});

// Cache storage for suggestions with 5-minute expiration
const suggestionCache = new Map<string, { data: SearchQuerySuggestion[]; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

// Cache the generated suggestions
export const generateSearchQueries = cache(async ({ content, gscInsights }: GenerateSearchQueriesParams): Promise<SearchQuerySuggestion[]> => {
  if (!content) {
    throw new Error('Content is required for generating search queries');
  }

  // Generate cache key based on content and insights
  const cacheKey = `${content}_${JSON.stringify(gscInsights)}`;
  const cachedData = suggestionCache.get(cacheKey);

  // Return cached data if valid
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data;
  }

  try {
    const systemPrompt = `You are an expert SEO strategist. Generate search query suggestions that are relevant and actionable.`;

    let userPrompt = `Generate 5 SEO-optimized search query suggestions for the following content:\n\n"${content.slice(0, 1000)}"\n\n`;

    const provider = (process.env.DEFAULT_AI_PROVIDER || 'gemini') as 'openai' | 'gemini';

    if (gscInsights?.length) {
      userPrompt += 'Consider these insights when generating suggestions:\n';
      gscInsights.forEach(insight => {
        userPrompt += `- ${insight.title}: ${insight.description}\n`;
      });
    }

    let suggestions;

    if (provider === 'openai') {
      const completion = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-mini-2024-07-18',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: zodResponseFormat(SearchQuerySuggestionSchema, 'instruction')
      });

      if (!completion.choices[0]?.message?.parsed?.instruction) {
        throw new Error('Invalid response format from OpenAI API');
      }

      suggestions = completion.choices[0].message.parsed.instruction;
    } else {
      const schema = {
        type: SchemaType.OBJECT,
        properties: {
          instruction: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                query: { 
                  type: SchemaType.STRING,
                  description: "Search query suggestion"
                },
                keywords: { 
                  type: SchemaType.ARRAY, 
                  items: { 
                    type: SchemaType.STRING
                  }
                },
                insights: { 
                  type: SchemaType.ARRAY, 
                  items: { 
                    type: SchemaType.STRING
                  }
                }
              },
              required: ["query", "keywords", "insights"]
            }
          }
        },
        required: ["instruction"]
      };

      const model = gemini.getGenerativeModel({
        model: 'gemini-1.5-pro',
        systemInstruction: systemPrompt,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema
        }
      });

      const result = await model.generateContent(userPrompt);
      const response = await result.response;
      const content = JSON.parse(response.text());
      suggestions = content.instruction;
    }

    // Cache valid suggestions
    suggestionCache.set(cacheKey, {
      data: suggestions,
      timestamp: Date.now()
    });

    return suggestions;
  } catch (error) {
    console.error('Error generating search queries:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate search query suggestions: ${error.message}`);
    }
    throw new Error('Failed to generate search query suggestions');
  }
});

// Cache storage for refined queries
const refinedQueryCache = new Map<string, { data: SearchQuerySuggestion; timestamp: number }>();

// Cache refined queries
export const refineSearchQuery = cache(async (query: string, content: string): Promise<SearchQuerySuggestion> => {
  if (!query || !content) {
    throw new Error('Both query and content are required for refinement');
  }

  // Generate cache key for refined query
  const cacheKey = `${query}_${content}`;
  const cachedData = refinedQueryCache.get(cacheKey);

  // Return cached refinement if valid
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data;
  }

  try {
    const systemPrompt = `You are an expert SEO strategist. Refine and optimize the search query.`;

    const userPrompt = `Refine this search query for better SEO performance:\n\nQuery: "${query}"\n\nContent context: "${content.slice(0, 500)}"`;

    const provider = (process.env.DEFAULT_AI_PROVIDER || 'gemini') as 'openai' | 'gemini';
    let suggestion;

    if (provider === 'openai') {
      const completion = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-mini-2024-07-18',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: zodResponseFormat(SearchQuerySuggestionSchema, 'instruction')
      });

      if (!completion.choices[0]?.message?.parsed?.instruction?.[0]) {
        throw new Error('Invalid response format from OpenAI API');
      }

      suggestion = completion.choices[0].message.parsed.instruction[0];
    } else {
      const schema = {
        type: SchemaType.OBJECT,
        properties: {
          instruction: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                query: { 
                  type: SchemaType.STRING,
                  description: "Search query suggestion"
                },
                keywords: { 
                  type: SchemaType.ARRAY, 
                  items: { 
                    type: SchemaType.STRING
                  }
                },
                insights: { 
                  type: SchemaType.ARRAY, 
                  items: { 
                    type: SchemaType.STRING
                  }
                }
              },
              required: ["query", "keywords", "insights"]
            }
          }
        },
        required: ["instruction"]
      };

      const model = gemini.getGenerativeModel({
        model: 'gemini-1.5-pro',
        systemInstruction: systemPrompt,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema
        }
      });

      const result = await model.generateContent(userPrompt);
      const response = await result.response;
      const content = JSON.parse(response.text());
      suggestion = content.instruction[0];
    }

    // Cache valid suggestion
    refinedQueryCache.set(cacheKey, {
      data: suggestion,
      timestamp: Date.now()
    });

    return suggestion;
  } catch (error) {
    console.error('Error refining search query:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to refine search query: ${error.message}`);
    }
    throw new Error('Failed to refine search query');
  }
});