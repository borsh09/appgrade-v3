import { TradeInPage } from '@/components/commerce/trade-in-page';

export default async function Page({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  return <TradeInPage returnToCart={from === 'cart'} />;
}
