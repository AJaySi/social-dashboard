import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

interface ScheduledPost {
  id: string;
  userId: string;
  content: string;
  platform: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'published' | 'failed';
  createdAt: string;
}

// In-memory storage for scheduled posts (in a production app, this would be a database)
const scheduledPosts: ScheduledPost[] = [];

// GET endpoint to retrieve scheduled posts for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in first.' },
        { status: 401 }
      );
    }

    // Filter posts for the current user
    const userPosts = scheduledPosts.filter(post => post.userId === session.user?.id);
    
    return NextResponse.json({
      success: true,
      posts: userPosts
    });
  } catch (error) {
    console.error('Error retrieving scheduled posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new scheduled post
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in first.' },
        { status: 401 }
      );
    }

    const { content, platform, scheduledDate, scheduledTime } = await req.json();

    // Validate required fields
    if (!content || !platform || !scheduledDate || !scheduledTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a new scheduled post
    const newPost: ScheduledPost = {
      id: Date.now().toString(),
      userId: session.user.id,
      content,
      platform,
      scheduledDate,
      scheduledTime,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Add to the scheduled posts array
    scheduledPosts.push(newPost);

    return NextResponse.json({
      success: true,
      post: newPost
    });
  } catch (error) {
    console.error('Error scheduling post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove a scheduled post
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in first.' },
        { status: 401 }
      );
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Find the post and ensure it belongs to the current user
    const postIndex = scheduledPosts.findIndex(
      post => post.id === id && post.userId === session.user?.id
    );

    if (postIndex === -1) {
      return NextResponse.json(
        { error: 'Post not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    // Remove the post
    scheduledPosts.splice(postIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting scheduled post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}