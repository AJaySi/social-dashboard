import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY environment variable is not configured. Some features may not work properly.');
}

if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  console.warn('Warning: NEXT_PUBLIC_GEMINI_API_KEY environment variable is not configured. Some features may not work properly.');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const gemini = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// Queue for managing content generation requests
const requestQueue: Array<() => Promise<unknown>> = [];
let isProcessing = false;

// Process queue with rate limiting
async function processQueue() {
  if (isProcessing || requestQueue.length === 0) return;
  
  isProcessing = true;
  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    if (request) {
      try {
        await request();
        // Add delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error processing request:', error);
      }
    }
  }
  isProcessing = false;
}

// Exponential backoff retry logic
async function retryWithExponentialBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 2000
): Promise<T> {
  let retries = 0;
  
  while (true) {
    try {
      return await operation();
    } catch (error) {
      const rateLimitError = error as { code?: string };
      if (rateLimitError?.code === 'rate_limit_exceeded' && retries < maxRetries) {
        const delay = initialDelay * Math.pow(2, retries);
        console.log(`Rate limit reached. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
      } else {
        throw error;
      }
    }
  }
}

export interface ContentPersonalizationPreferences {
  contentTone?: string;
  writingStyle?: string;
  targetAudience?: string;
  industryTerminology?: string;
  contentComplexity?: number;
  keyTerms?: string[];
  contentLength?: 'concise' | 'balanced' | 'comprehensive';
}

export async function generateSectionContent(
  title: string,
  keywords: string[] = [],
  type: string,
  context?: string,
  personalizationPreferences?: ContentPersonalizationPreferences,
  provider: 'openai' | 'gemini' = 'openai'
) {
  const generateContent = async () => {
    // Build personalization instructions if preferences are provided
    let personalizationInstructions = '';
    if (personalizationPreferences) {
      personalizationInstructions = `
    Content Personalization:
    - Tone: ${personalizationPreferences.contentTone || 'professional'}
    - Writing Style: ${personalizationPreferences.writingStyle || 'informative'}
    - Target Audience: ${personalizationPreferences.targetAudience || 'general'}
    - Industry Terminology: ${personalizationPreferences.industryTerminology || 'general'}
    - Content Complexity: ${personalizationPreferences.contentComplexity ? (personalizationPreferences.contentComplexity > 70 ? 'Complex' : personalizationPreferences.contentComplexity > 30 ? 'Balanced' : 'Simple') : 'Balanced'}
    - Content Length: ${personalizationPreferences.contentLength || 'balanced'}
    - Key Terms to Include: ${personalizationPreferences.keyTerms?.join(', ') || ''}`;
    }

    const prompt = `Generate engaging, informative content for a blog section with the following details:
    Title: ${title}
    Keywords: ${Array.isArray(keywords) ? keywords.join(', ') : ''}
    Type: ${type}
    ${context ? `Context: ${context}` : ''}
    ${personalizationInstructions}
    
    Generate the content now:`;

    try {
      if (provider === 'openai') {
        try {
          const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              { role: 'system', content: 'You are a professional content writer skilled in creating engaging, SEO-optimized content.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000
          });

          return completion.choices[0]?.message?.content || '';
        } catch (openaiError: any) {
          console.warn('OpenAI generation failed, falling back to Gemini:', openaiError.message);
          provider = 'gemini';
        }
      }
      
      // Fallback to Gemini or direct Gemini usage
      const model = gemini.getGenerativeModel({
        model: 'gemini-pro',
        systemInstruction: 'You are a professional content writer skilled in creating engaging, SEO-optimized content.'
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('Content generation failed:', error);
      throw new Error(`Content generation failed: ${error.message}`);
    }
  };

  return new Promise((resolve, reject) => {
    const request = async () => {
      try {
        const content = await retryWithExponentialBackoff(generateContent);
        resolve(content);
      } catch (error) {
        console.error('Error generating section content:', error);
        reject(new Error('Failed to generate section content'));
      }
    };

    requestQueue.push(request);
    processQueue();
  });
}