const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const siteUrl = new URL(configuredUrl).origin;
export const isPublicSite = new URL(siteUrl).protocol === 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(new URL(siteUrl).hostname);
