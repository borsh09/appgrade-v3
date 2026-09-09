import { NextResponse } from 'next/server';
import { getPrices } from '@/lib/server/prices';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    return NextResponse.json(await getPrices(), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json(
      { error: 'Prices temporarily unavailable' },
      { status: 503 },
    );
  }
}
