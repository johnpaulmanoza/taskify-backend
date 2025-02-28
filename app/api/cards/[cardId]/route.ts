import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/cards/[cardId] - Get a specific card
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

    // Get card details and verify ownership
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

    const card = cards[0];

    // Get labels for this card
    const labels = await query(`
      SELECT l.* FROM labels l
      JOIN card_labels cl ON l.id = cl.label_id
      WHERE cl.card_id = ?
    `, [cardId]) as any[];

    return NextResponse.json({
      ...card,
      labels,
    });
  } catch (error) {
    console.error('Error fetching card:', error);
    return NextResponse.json(
      { error: 'Failed to fetch card' },
      { status: 500 }
    );
  }
}

// PUT /api/cards/[cardId] - Update a card
export async function PUT(
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
    const { title, description, list_id, position } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Verify card ownership
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

    let updateQuery = 'UPDATE cards SET title = ?, description = ?';
    const queryParams: any[] = [title, description || ''];

    // If list_id is provided, update it as well (move card to another list)
    if (list_id !== undefined) {
      // Check if the target list exists and belongs to the user
      const lists = await query(`
        SELECT l.* FROM lists l
        JOIN boards b ON l.board_id = b.id
        WHERE l.id = ? AND b.user_id = ?
      `, [list_id, user.id]) as any[];
      
      if (!lists || lists.length === 0) {
        return NextResponse.json(
          { error: 'Target list not found or access denied' },
          { status: 404 }
        );
      }

      updateQuery += ', list_id = ?';
      queryParams.push(list_id);
    }

    // If position is provided, update it as well
    if (position !== undefined) {
      updateQuery += ', position = ?';
      queryParams.push(position);
    }

    updateQuery += ' WHERE id = ?';
    queryParams.push(cardId);

    const result = await query(updateQuery, queryParams) as any;

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Card not found or not updated' },
        { status: 404 }
      );
    }

    const updatedCard = await query('SELECT * FROM cards WHERE id = ?', [cardId]) as any[];
    return NextResponse.json(updatedCard[0]);
  } catch (error) {
    console.error('Error updating card:', error);
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 }
    );
  }
}

// DELETE /api/cards/[cardId] - Delete a card
export async function DELETE(
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

    // Verify card ownership
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

    const result = await query('DELETE FROM cards WHERE id = ?', [cardId]) as any;

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Card not found or not deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Card deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting card:', error);
    return NextResponse.json(
      { error: 'Failed to delete card' },
      { status: 500 }
    );
  }
}