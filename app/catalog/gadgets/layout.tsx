import { categoryMetadata, categoryBreadcrumb } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';

export const metadata = categoryMetadata('gadgets');
export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return <><JsonLd data={categoryBreadcrumb('gadgets')} />{children}</>;
}
