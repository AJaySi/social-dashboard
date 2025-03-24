import { OpenAI } from 'openai';

const openai = new OpenAI();

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
  personalizationPreferences?: ContentPersonalizationPreferences
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