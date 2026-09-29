import rows from './client-search-index.json';
import type { CatalogItem } from '@/lib/catalog-registry';

export const searchIndex = rows as (CatalogItem & { name: string; href: string; detail: string })[];
