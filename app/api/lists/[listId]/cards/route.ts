import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/lists/[listId]/cards - Get all cards for a list
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

    // Check if list exists and belongs to the user's board
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

    // Get cards for this list
    const cards = await query(
      'SELECT * FROM cards WHERE list_id = ? ORDER BY position ASC',
      [listId]
    ) as any[];

    return NextResponse.json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    );
  }
}

// POST /api/lists/[listId]/cards - Create a new card
export async function POST(
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
    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Check if list exists and belongs to the user's board
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

    // Get the highest position value to place the new card at the end
    const positionResult = await query(
      'SELECT COALESCE(MAX(position), 0) as maxPosition FROM cards WHERE list_id = ?',
      [listId]
    ) as any[];
    
    const position = positionResult[0].maxPosition + 1;

    // Create the new card
    const result = await query(
      'INSERT INTO cards (list_id, title, description, position) VALUES (?, ?, ?, ?)',
      [listId, title, description || '', position]
    ) as any;

    const cardId = result.lastInsertRowid;
    const newCard = await query('SELECT * FROM cards WHERE id = ?', [cardId]) as any[];

    return NextResponse.json(newCard[0], { status: 201 });
  } catch (error) {
    console.error('Error creating card:', error);
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    );
  }
}