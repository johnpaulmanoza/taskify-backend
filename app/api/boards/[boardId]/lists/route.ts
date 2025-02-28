import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/boards/[boardId]/lists - Get all lists for a board
export async function GET(
  request: NextRequest,
  { params }: { params: { boardId: string } }
) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const boardId = params.boardId;

    // Check if board exists and belongs to the user
    const boards = await query(
      'SELECT * FROM boards WHERE id = ? AND user_id = ?',
      [boardId, user.id]
    ) as any[];
    
    if (!boards || boards.length === 0) {
      return NextResponse.json(
        { error: 'Board not found or access denied' },
        { status: 404 }
      );
    }

    // Get lists for this board
    const lists = await query(
      'SELECT * FROM lists WHERE board_id = ? ORDER BY position ASC',
      [boardId]
    ) as any[];

    return NextResponse.json(lists);
  } catch (error) {
    console.error('Error fetching lists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lists' },
      { status: 500 }
    );
  }
}

// POST /api/boards/[boardId]/lists - Create a new list
export async function POST(
  request: NextRequest,
  { params }: { params: { boardId: string } }
) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const boardId = params.boardId;
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Check if board exists and belongs to the user
    const boards = await query(
      'SELECT * FROM boards WHERE id = ? AND user_id = ?',
      [boardId, user.id]
    ) as any[];
    
    if (!boards || boards.length === 0) {
      return NextResponse.json(
        { error: 'Board not found or access denied' },
        { status: 404 }
      );
    }

    // Get the highest position value to place the new list at the end
    const positionResult = await query(
      'SELECT COALESCE(MAX(position), 0) as maxPosition FROM lists WHERE board_id = ?',
      [boardId]
    ) as any[];
    
    const position = positionResult[0].maxPosition + 1;

    // Create the new list
    const result = await query(
      'INSERT INTO lists (board_id, title, position) VALUES (?, ?, ?)',
      [boardId, title, position]
    ) as any;

    const listId = result.lastInsertRowid;
    const newList = await query('SELECT * FROM lists WHERE id = ?', [listId]) as any[];

    return NextResponse.json(newList[0], { status: 201 });
  } catch (error) {
    console.error('Error creating list:', error);
    return NextResponse.json(
      { error: 'Failed to create list' },
      { status: 500 }
    );
  }
}