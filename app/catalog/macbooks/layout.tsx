import { categoryMetadata, categoryBreadcrumb } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';

export const metadata = categoryMetadata('macbooks');
export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return <><JsonLd data={categoryBreadcrumb('macbooks')} />{children}</>;
}
