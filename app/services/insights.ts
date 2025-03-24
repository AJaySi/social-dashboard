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

interface TopPerformerData {
  keyword: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  recommendations?: string[];
}

export async function generateActionableInsights(topPerformers: TopPerformerData[], provider: 'openai' | 'gemini' = 'openai') {
  try {
    let prompt = `Analyze these top performing search queries and provide actionable insights:\n\n`;

    // Add each top performer's data to the prompt
    topPerformers.forEach(performer => {
      const ctr = performer.ctr || 0;
      const position = performer.position || 0;
      
      prompt += `Keyword: ${performer.keyword || 'Unknown'}
`;
      prompt += `Performance Metrics:
`;
      prompt += `- Clicks: ${performer.clicks || 0}
`;
      prompt += `- Impressions: ${performer.impressions || 0}
`;
      prompt += `- CTR: ${(ctr * 100).toFixed(2)}%
`;
      prompt += `- Position: ${position.toFixed(1)}
`;
      if (performer.recommendations?.length) {
        prompt += `Current Recommendation: ${performer.recommendations[0]}
`;
      }
      prompt += '\n';
    });

    prompt += `\nProvide detailed actionable insights in a highly structured markdown format:\n`;
    prompt += `# Search Intent Analysis\n- What are users really looking for with these queries?\n- What is the primary intent behind each search term?\n- How can we better match user expectations?\n\n`;
    prompt += `# Content Gap Opportunities\n- What topics or angles are we missing?\n- What related subjects should we cover?\n- What questions are users asking that we haven't addressed?\n\n`;
    prompt += `# Optimization Strategies\n- How can we improve our content for these queries?\n- What specific changes would boost our rankings?\n- What content structure would work best?\n\n`;
    prompt += `\nEnsure to use proper markdown formatting:\n- Use ## for subsections\n- Use bullet points for lists\n- Use **bold** for emphasis\n- Use > for important quotes or takeaways\n- Include actionable recommendations in each section`;

    if (provider === 'openai') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert SEO analyst and content strategist. Provide actionable insights that help improve search performance and content strategy.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        presence_penalty: 0.3,
        frequency_penalty: 0.3
      });

      return completion.choices[0].message.content || '';
    } else {
      const model = gemini.getGenerativeModel({
        model: 'gemini-pro',
        systemInstruction: 'You are an expert SEO analyst and content strategist. Provide actionable insights that help improve search performance and content strategy.'
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    }
  } catch (error) {
    console.error('Error generating actionable insights:', error);
    throw error;
  }
}