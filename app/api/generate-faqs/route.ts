import { NextResponse } from 'next/server';
import { limiter } from '@/app/utils/rate-limit';

export async function POST(request: Request) {
  try {
    await limiter.check(5, 'GENERATE_FAQS_TOKEN');
    
    const body = await request.json();
    const { relatedQuestions, relatedSearches, query, generateFromSearches } = body;
    
    // Generate FAQs based on related questions or searches
    let faqs = [];
    
    if (generateFromSearches && relatedSearches && relatedSearches.length > 0) {
      // Generate FAQs from related searches
      faqs = relatedSearches.slice(0, 5).map((searchQuery: string) => ({
        question: `${searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1)}?`,
        answer: `This is a comprehensive answer about ${searchQuery} related to ${query}.`
      }));
    } else if (relatedQuestions && relatedQuestions.length > 0) {
      // Generate FAQs from related questions
      faqs = relatedQuestions.slice(0, 5).map((item: { question: string; snippet: string }) => ({
        question: item.question,
        answer: item.snippet || `This is a detailed answer about ${item.question.toLowerCase()}.`
      }));
    }
    
    return NextResponse.json(faqs);
  } catch (error) {
    console.error('Error generating FAQs:', error);
    return NextResponse.json(
      { error: 'Failed to generate FAQs' },
      { status: 500 }
    );
  }
}