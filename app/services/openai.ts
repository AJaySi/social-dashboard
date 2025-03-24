import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY environment variable is not configured. Some features may not work properly.');
}

const openai = new OpenAI(
  {
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  }
);

interface GSCMetrics {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface GenerateBlogTitlesParams {
  content: string;
  gscMetrics?: GSCMetrics;
  recommendations?: string[];
  category?: 'quick_wins' | 'trending' | 'optimized';
}

export async function generateBlogTitles({ content, gscMetrics, recommendations, category }: GenerateBlogTitlesParams) {
  try {
    let prompt = `Generate 5 engaging, SEO-optimized blog titles for the following content: "${content}"`;

    if (category === 'quick_wins') {
      prompt += '\n\nFocus on creating titles that can achieve quick traffic gains by:';
      prompt += '\n- Targeting low-competition, high-opportunity keywords';
      prompt += '\n- Addressing immediate user intent and search demand';
      prompt += '\n- Incorporating proven CTR-boosting patterns';
    }

    if (gscMetrics) {
      prompt += `\n\nConsider these search performance metrics:\n- Clicks: ${gscMetrics.clicks}\n- Impressions: ${gscMetrics.impressions}\n- CTR: ${gscMetrics.ctr}\n- Position: ${gscMetrics.position}`;
    }

    if (recommendations?.length) {
      prompt += '\n\nOptimize titles based on these quick wins opportunities:\n' + recommendations.map(rec => `- ${rec}`).join('\n');
      prompt += '\n\nEnsure the titles specifically target these opportunities while maintaining high CTR potential.';
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional content strategist and SEO expert. Generate engaging blog titles that are both compelling to readers and optimized for search engines. Consider search intent, keyword relevance, and CTR optimization patterns.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 300,
      presence_penalty: 0.6,
      frequency_penalty: 0.4
    });

    const titles = completion.choices[0].message.content
      ?.split('\n')
      .filter(title => title.trim())
      .slice(0, 5) || [];

    return titles;
  } catch (error) {
    console.error('Error generating blog titles:', error);
    throw error;
  }
}