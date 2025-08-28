import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { path, token } = await request.json();
    
    // Verify the token (you can set this in your environment variables)
    const expectedToken = process.env.REVALIDATE_TOKEN;
    if (expectedToken && token !== expectedToken) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    if (path) {
      // Revalidate specific path
      revalidatePath(path);
      console.log(`Revalidated path: ${path}`);
    } else {
      // Revalidate all blog posts
      revalidatePath('/blog');
      revalidatePath('/blog/[slug]');
      console.log('Revalidated all blog paths');
    }

    return NextResponse.json({ 
      message: 'Revalidation successful',
      revalidated: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: 'Revalidation failed', error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Revalidation endpoint is working',
    usage: 'POST with { path: "/blog/[slug]", token: "your-token" }'
  });
}
