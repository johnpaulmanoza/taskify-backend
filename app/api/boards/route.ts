import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/boards - Get all boards for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const boards = await query(
      'SELECT * FROM boards WHERE user_id = ? ORDER BY created_at DESC',
      [user.id]
    ) as any[];
    
    return NextResponse.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boards' },
      { status: 500 }
    );
  }
}

// POST /api/boards - Create a new board
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO boards (user_id, title, description) VALUES (?, ?, ?)',
      [user.id, title, description || '']
    ) as any;

    const boardId = result.insertId;
    const newBoard = await query('SELECT * FROM boards WHERE id = ?', [boardId]) as any[];

    return NextResponse.json(newBoard[0], { status: 201 });
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json(
      { error: 'Failed to create board' },
      { status: 500 }
    );
  }
}