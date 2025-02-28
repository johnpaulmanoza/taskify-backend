import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

// This tells Next.js that this route should be dynamically rendered
export const dynamic = 'force-dynamic';

// POST /api/auth/register - Register a new user
export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Add more validation
    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Check if username or email already exists
    const existingUsers = await query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    ) as any[];

    if (existingUsers && existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 400 }
        );
      }
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const result = await query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    ) as any;

    if (!result || !result.insertId) {
      console.error('Failed to insert user, no insertId returned');
      return NextResponse.json(
        { error: 'Failed to register user' },
        { status: 500 }
      );
    }

    const userId = result.insertId;
    
    // Get the created user (excluding password)
    const newUsers = await query(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [userId]
    ) as any[];

    if (!newUsers || newUsers.length === 0) {
      console.error('User was created but could not be retrieved');
      return NextResponse.json(
        { error: 'User created but could not be retrieved' },
        { status: 500 }
      );
    }

    return NextResponse.json(newUsers[0], { status: 201 });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Failed to register user', details: (error as Error).message },
      { status: 500 }
    );
  }
}