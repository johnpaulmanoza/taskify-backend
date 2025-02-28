import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserById } from '@/lib/db';

// This tells Next.js that this route should be dynamically rendered
export const dynamic = 'force-dynamic';

// GET /api/auth/me - Get the current authenticated user
export async function GET(request: NextRequest) {
  try {
    const payload = await getCurrentUser(request);
    
    if (!payload || !payload.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const user = await getUserById(payload.id as number) as any;
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json(
      { error: 'Failed to get current user' },
      { status: 500 }
    );
  }
}