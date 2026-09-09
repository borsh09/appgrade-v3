import { NextResponse } from 'next/server';
import { ordersAvailable } from '@/lib/server/readiness';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const ready = await ordersAvailable();
  return NextResponse.json({ status: ready ? 'ready' : 'unavailable', ordersAvailable: ready }, {
    status: ready ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}
