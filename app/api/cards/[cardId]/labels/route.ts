import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/cards/[cardId]/labels - Get all labels for a card
export async function GET(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const cardId = params.cardId;

    // Check if card exists and belongs to the user
    const cards = await query(`
      SELECT c.* FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      WHERE c.id = ? AND b.user_id = ?
    `, [cardId, user.id]) as any[];
    
    if (!cards || cards.length === 0) {
      return NextResponse.json(
        { error: 'Card not found or access denied' },
        { status: 404 }
      );
    }

    // Get labels for this card
    const labels = await query(`
      SELECT l.* FROM labels l
      JOIN card_labels cl ON l.id = cl.label_id
      WHERE cl.card_id = ?
    `, [cardId]) as any[];

    return NextResponse.json(labels);
  } catch (error) {
    console.error('Error fetching labels for card:', error);
    return NextResponse.json(
      { error: 'Failed to fetch labels for card' },
      { status: 500 }
    );
  }
}

// POST /api/cards/[cardId]/labels - Add a label to a card
export async function POST(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const cardId = params.cardId;
    const { label_id } = await request.json();

    if (!label_id) {
      return NextResponse.json(
        { error: 'Label ID is required' },
        { status: 400 }
      );
    }

    // Check if card exists and belongs to the user
    const cards = await query(`
      SELECT c.* FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      WHERE c.id = ? AND b.user_id = ?
    `, [cardId, user.id]) as any[];
    
    if (!cards || cards.length === 0) {
      return NextResponse.json(
        { error: 'Card not found or access denied' },
        { status: 404 }
      );
    }

    // Check if label exists
    const labels = await query('SELECT * FROM labels WHERE id = ?', [label_id]) as any[];
    
    if (!labels || labels.length === 0) {
      return NextResponse.json(
        { error: 'Label not found' },
        { status: 404 }
      );
    }

    // Check if the association already exists
    const existingAssoc = await query(
      'SELECT * FROM card_labels WHERE card_id = ? AND label_id = ?',
      [cardId, label_id]
    ) as any[];

    if (existingAssoc.length > 0) {
      return NextResponse.json(
        { error: 'Label is already assigned to this card' },
        { status: 400 }
      );
    }

    // Create the association
    await query(
      'INSERT INTO card_labels (card_id, label_id) VALUES (?, ?)',
      [cardId, label_id]
    );

    return NextResponse.json(
      { message: 'Label added to card successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding label to card:', error);
    return NextResponse.json(
      { error: 'Failed to add label to card' },
      { status: 500 }
    );
  }
}

// DELETE /api/cards/[cardId]/labels/[labelId] - Remove a label from a card
export async function DELETE(
  request: NextRequest,
  { params }: { params: { cardId: string, labelId: string } }
) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const url = new URL(request.url);
    const labelId = url.searchParams.get('labelId');
    const cardId = params.cardId;

    if (!labelId) {
      return NextResponse.json(
        { error: 'Label ID is required' },
        { status: 400 }
      );
    }

    // Check if card exists and belongs to the user
    const cards = await query(`
      SELECT c.* FROM cards c
      JOIN lists l ON c.list_id = l.id
      JOIN boards b ON l.board_id = b.id
      WHERE c.id = ? AND b.user_id = ?
    `, [cardId, user.id]) as any[];
    
    if (!cards || cards.length === 0) {
      return NextResponse.json(
        { error: 'Card not found or access denied' },
        { status: 404 }
      );
    }

    const result = await query(
      'DELETE FROM card_labels WHERE card_id = ? AND label_id = ?',
      [cardId, labelId]
    ) as any;

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Label is not assigned to this card or does not exist' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Label removed from card successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing label from card:', error);
    return NextResponse.json(
      { error: 'Failed to remove label from card' },
      { status: 500 }
    );
  }
}