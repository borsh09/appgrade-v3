import type { MetadataRoute } from 'next';
import { isPublicSite, siteUrl } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return isPublicSite
    ? { rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/cart', '/favorites'] }, sitemap: `${siteUrl}/sitemap.xml` }
    : { rules: { userAgent: '*', disallow: '/' } };
}
