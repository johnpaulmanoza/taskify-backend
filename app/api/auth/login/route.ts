import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsernameOrEmail } from '@/lib/db';
import { signToken, setAuthCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// This tells Next.js that this route should be dynamically rendered
export const dynamic = 'force-dynamic';

// POST /api/auth/login - Login a user
export async function POST(request: NextRequest) {
  try {
    const { usernameOrEmail, password } = await request.json();

    // Validate input
    if (!usernameOrEmail || !password) {
      return NextResponse.json(
        { error: 'Username/email and password are required' },
        { status: 400 }
      );
    }

    // Find the user
    const user = await getUserByUsernameOrEmail(usernameOrEmail) as any;

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create a token
    const token = await signToken({
      id: user.id,
      username: user.username,
      email: user.email
    });

    // Create response
    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      message: 'Login successful'
    });

    // Set the token in cookies
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}