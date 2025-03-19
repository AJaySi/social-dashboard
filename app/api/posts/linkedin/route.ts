import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.accessToken || session.provider !== 'linkedin') {
      return NextResponse.json(
        { error: 'Unauthorized. Please connect to LinkedIn first.' },
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

    if (!session.user?.id) {
      return NextResponse.json(
        { error: 'User ID not found. Please try reconnecting to LinkedIn.' },
        { status: 400 }
      );
    }

    // LinkedIn API endpoint for creating posts
    const linkedinApiUrl = 'https://api.linkedin.com/v2/ugcPosts';

    const postData = {
      author: `urn:li:person:${session.user.id}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await fetch(linkedinApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('LinkedIn API error:', error);
      return NextResponse.json(
        { error: 'Failed to post to LinkedIn. Please try again.' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json({
      success: true,
      postId: result.id,
      message: 'Successfully posted to LinkedIn'
    });

  } catch (error) {
    console.error('Error posting to LinkedIn:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}