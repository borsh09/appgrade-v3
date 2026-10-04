import { pageMetadata, homeDescription } from '@/lib/seo';
export const metadata = pageMetadata('Смартфоны, компьютеры и другая техника', homeDescription, '/');
import { HomePage } from '@/components/home/home-page';
export default function Home() { return <HomePage />; }
