import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/boards/[boardId] - Get a specific board with its lists and cards
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

    // Get board details and verify ownership
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

    const board = boards[0];

    // Get lists for this board
    const lists = await query(
      'SELECT * FROM lists WHERE board_id = ? ORDER BY position ASC',
      [boardId]
    ) as any[];

    // Get cards for each list
    const listsWithCards = await Promise.all(
      lists.map(async (list) => {
        const cards = await query(
          'SELECT * FROM cards WHERE list_id = ? ORDER BY position ASC',
          [list.id]
        ) as any[];
        
        return {
          ...list,
          cards,
        };
      })
    );

    return NextResponse.json({
      ...board,
      lists: listsWithCards,
    });
  } catch (error) {
    console.error('Error fetching board:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board' },
      { status: 500 }
    );
  }
}

// PUT /api/boards/[boardId] - Update a board
export async function PUT(
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
    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Verify board ownership
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

    const result = await query(
      'UPDATE boards SET title = ?, description = ? WHERE id = ? AND user_id = ?',
      [title, description || '', boardId, user.id]
    ) as any;

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Board not found or not updated' },
        { status: 404 }
      );
    }

    const updatedBoard = await query('SELECT * FROM boards WHERE id = ?', [boardId]) as any[];
    return NextResponse.json(updatedBoard[0]);
  } catch (error) {
    console.error('Error updating board:', error);
    return NextResponse.json(
      { error: 'Failed to update board' },
      { status: 500 }
    );
  }
}

// DELETE /api/boards/[boardId] - Delete a board
export async function DELETE(
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

    // Verify board ownership
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

    const result = await query(
      'DELETE FROM boards WHERE id = ? AND user_id = ?',
      [boardId, user.id]
    ) as any;

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Board not found or not deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Board deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting board:', error);
    return NextResponse.json(
      { error: 'Failed to delete board' },
      { status: 500 }
    );
  }
}