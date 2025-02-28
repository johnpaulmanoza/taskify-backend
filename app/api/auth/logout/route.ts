import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

// This tells Next.js that this route should be dynamically rendered
export const dynamic = 'force-dynamic';

// POST /api/auth/logout - Logout a user
export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      message: 'Logout successful'
    });

    // Clear the auth cookie
    clearAuthCookie(response);

    return response;
  } catch (error) {
    console.error('Error logging out:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}