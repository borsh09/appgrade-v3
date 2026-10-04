import { isPublicSite, serializeJsonLd } from '@/lib/seo';

export function JsonLd({ data }: { data: unknown }) {
  if (!isPublicSite || !data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
