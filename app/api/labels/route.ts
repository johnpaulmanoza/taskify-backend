import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/labels - Get all labels
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const labels = await query('SELECT * FROM labels ORDER BY name ASC') as any[];
    return NextResponse.json(labels);
  } catch (error) {
    console.error('Error fetching labels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch labels' },
      { status: 500 }
    );
  }
}

// POST /api/labels - Create a new label
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { name, color } = await request.json();

    if (!name || !color) {
      return NextResponse.json(
        { error: 'Name and color are required' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO labels (name, color) VALUES (?, ?)',
      [name, color]
    ) as any;

    const labelId = result.lastInsertRowid;
    const newLabel = await query('SELECT * FROM labels WHERE id = ?', [labelId]) as any[];

    return NextResponse.json(newLabel[0], { status: 201 });
  } catch (error) {
    console.error('Error creating label:', error);
    return NextResponse.json(
      { error: 'Failed to create label' },
      { status: 500 }
    );
  }
}