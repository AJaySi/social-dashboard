import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.accessToken || session.provider !== 'facebook') {
      return NextResponse.json(
        { error: 'Unauthorized. Please connect to Facebook first.' },
        { status: 401 }
      );
    }

    const { content } = await req.json();

    if (!content || typeof content !== 'string' || content.length === 0) {
      return NextResponse.json(
        { error: 'Content is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    // Facebook Graph API endpoint for creating posts
    const facebookApiUrl = `https://graph.facebook.com/v18.0/me/feed`;

    const response = await fetch(facebookApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: content
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Facebook API error:', error);
      return NextResponse.json(
        { error: 'Failed to post to Facebook. Please try again.' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json({
      success: true,
      postId: result.id,
      message: 'Successfully posted to Facebook'
    });

  } catch (error) {
    console.error('Error posting to Facebook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}