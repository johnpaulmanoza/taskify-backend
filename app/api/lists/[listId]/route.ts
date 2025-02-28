import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/lists/[listId] - Get a specific list with its cards
export async function GET(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const listId = params.listId;

    // Get list details and verify ownership
    const lists = await query(`
      SELECT l.* FROM lists l
      JOIN boards b ON l.board_id = b.id
      WHERE l.id = ? AND b.user_id = ?
    `, [listId, user.id]) as any[];
    
    if (!lists || lists.length === 0) {
      return NextResponse.json(
        { error: 'List not found or access denied' },
        { status: 404 }
      );
    }

    const list = lists[0];

    // Get cards for this list
    const cards = await query(
      'SELECT * FROM cards WHERE list_id = ? ORDER BY position ASC',
      [listId]
    ) as any[];

    return NextResponse.json({
      ...list,
      cards,
    });
  } catch (error) {
    console.error('Error fetching list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch list' },
      { status: 500 }
    );
  }
}

// PUT /api/lists/[listId] - Update a list
export async function PUT(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const listId = params.listId;
    const { title, position } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Verify list ownership
    const lists = await query(`
      SELECT l.* FROM lists l
      JOIN boards b ON l.board_id = b.id
      WHERE l.id = ? AND b.user_id = ?
    `, [listId, user.id]) as any[];
    
    if (!lists || lists.length === 0) {
      return NextResponse.json(
        { error: 'List not found or access denied' },
        { status: 404 }
      );
    }

    let updateQuery = 'UPDATE lists SET title = ?';
    const queryParams: any[] = [title];

    // If position is provided, update it as well
    if (position !== undefined) {
      updateQuery += ', position = ?';
      queryParams.push(position);
    }

    updateQuery += ' WHERE id = ?';
    queryParams.push(listId);

    const result = await query(updateQuery, queryParams) as any;

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'List not found or not updated' },
        { status: 404 }
      );
    }

    const updatedList = await query('SELECT * FROM lists WHERE id = ?', [listId]) as any[];
    return NextResponse.json(updatedList[0]);
  } catch (error) {
    console.error('Error updating list:', error);
    return NextResponse.json(
      { error: 'Failed to update list' },
      { status: 500 }
    );
  }
}

// DELETE /api/lists/[listId] - Delete a list
export async function DELETE(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const listId = params.listId;

    // Verify list ownership
    const lists = await query(`
      SELECT l.* FROM lists l
      JOIN boards b ON l.board_id = b.id
      WHERE l.id = ? AND b.user_id = ?
    `, [listId, user.id]) as any[];
    
    if (!lists || lists.length === 0) {
      return NextResponse.json(
        { error: 'List not found or access denied' },
        { status: 404 }
      );
    }

    const result = await query('DELETE FROM lists WHERE id = ?', [listId]) as any;

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'List not found or not deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'List deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting list:', error);
    return NextResponse.json(
      { error: 'Failed to delete list' },
      { status: 500 }
    );
  }
}