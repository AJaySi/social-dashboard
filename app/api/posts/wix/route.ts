import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in first.' },
        { status: 401 }
      );
    }

    // Check if Wix is configured
    if (!process.env.WIX_API_KEY || !process.env.WIX_ACCOUNT_ID) {
      return NextResponse.json(
        { error: 'Wix is not configured. Please configure your Wix API credentials first.', needsConfig: true },
        { status: 400 }
      );
    }

    const { content, title } = await req.json();

    if (!content || typeof content !== 'string' || content.length === 0) {
      return NextResponse.json(
        { error: 'Content is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    if (!title || typeof title !== 'string' || title.length === 0) {
      return NextResponse.json(
        { error: 'Title is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    // Wix API endpoint for creating draft posts
    const wixApiUrl = 'https://www.wixapis.com/blog/v3/draft-posts';

    const postData = {
      draftPost: {
        title,
        memberId: process.env.WIX_ACCOUNT_ID || '',
        richContent: {
          nodes: [
            {
              type: 'PARAGRAPH',
              id: 'pvirv1',
              nodes: [
                {
                  type: 'TEXT',
                  id: '',
                  nodes: [],
                  textData: {
                    text: content,
                    decorations: []
                  }
                }
              ],
              paragraphData: {}
            }
          ]
        },
        featured: false,
        commentingEnabled: true,
        language: 'en'
      },
      fieldsets: ["URL", "RICH_CONTENT"]
    };

    const response = await fetch(wixApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': process.env.WIX_API_KEY,
        'Content-Type': 'application/json',
        'wix-account-id': process.env.WIX_ACCOUNT_ID
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Wix API error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to post to Wix blog',
          details: error.message || 'Unknown error occurred',
          code: error.code || response.status
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json({
      success: true,
      postId: result.post.id,
      message: 'Successfully posted to Wix blog'
    });

  } catch (error) {
    console.error('Error posting to Wix blog:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}