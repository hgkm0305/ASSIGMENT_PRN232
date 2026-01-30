import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';

// Initialize database endpoint (call this once after deployment)
export async function GET() {
  try {
    await initDatabase();
    return NextResponse.json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
}
