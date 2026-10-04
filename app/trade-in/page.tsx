import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata('Trade-In — обмен смартфона с доплатой', 'Оцените смартфон по модели, памяти и состоянию в APPGRADE. Предварительный расчёт Trade-In и заявка на обмен. Итоговая оценка после проверки устройства.', '/trade-in');
import { TradeInPage } from '@/components/commerce/trade-in-page';

export default async function Page({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  return <TradeInPage returnToCart={from === 'cart'} />;
}
