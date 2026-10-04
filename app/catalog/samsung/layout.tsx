import { categoryMetadata, categoryBreadcrumb } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';

export const metadata = categoryMetadata('samsung');
export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return <><JsonLd data={categoryBreadcrumb('samsung')} />{children}</>;
}
