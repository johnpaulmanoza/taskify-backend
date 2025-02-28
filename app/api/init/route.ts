import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

// This tells Next.js that this route should be dynamically rendered
export const dynamic = 'force-dynamic';

// GET /api/init - Initialize the database
export async function GET() {
  try {
    const result = await initDb();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', details: (error as Error).message },
      { status: 500 }
    );
  }
}