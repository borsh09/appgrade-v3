import type { CatalogItem } from '@/lib/catalog-registry';

const aliases: Array<[RegExp, string]> = [
  [/айф[оа]?н/g, 'iphone'],
  [/макбук/g, 'macbook'],
  [/айпад/g, 'ipad'],
  [/аирподс|эйрподс/g, 'airpods'],
  [/самсунг/g, 'samsung'],
  [/галакси/g, 'galaxy'],
  [/пиксель/g, 'pixel'],
  [/плейстейшн|плейстейшен/g, 'playstation'],
  [/про\s*макс/g, 'pro max'],
  [/про/g, 'pro'],
  [/макс/g, 'max'],
  [/плюс/g, 'plus'],
];

const keyboardRu = 'йцукенгшщзхъфывапролджэячсмитьбю';
const keyboardEn = 'qwertyuiop[]asdfghjkl;\'zxcvbnm,.';

function switchKeyboardLayout(value: string) {
  return value.split('').map(character => {
    const ruIndex = keyboardRu.indexOf(character);
    if (ruIndex >= 0) return keyboardEn[ruIndex];
    const enIndex = keyboardEn.indexOf(character);
    return enIndex >= 0 ? keyboardRu[enIndex] : character;
  }).join('');
}

export function normalizeSearchText(value: string) {
  let normalized = value.normalize('NFKC').toLocaleLowerCase('ru').replace(/ё/g, 'е');
  for (const [pattern, replacement] of aliases) normalized = normalized.replace(pattern, replacement);
  return normalized
    .replace(/\+/g, ' plus ')
    .replace(/([0-9])\s*(гб|gb)\b/g, '$1gb')
    .replace(/([0-9])\s*(тб|tb)\b/g, '$1tb')
    .replace(/([a-zа-я])([0-9])/g, '$1 $2')
    .replace(/([0-9])([a-zа-я])/g, '$1 $2')
    .replace(/[^a-zа-я0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function editDistance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0]; row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const saved = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = saved;
    }
  }
  return row[b.length];
}

function tokenMatches(token: string, words: string[]) {
  if (words.some(word => word.includes(token) || (word.length >= 3 && token.includes(word)))) return true;
  const tolerance = token.length >= 7 ? 2 : token.length >= 4 ? 1 : 0;
  return tolerance > 0 && words.some(word => Math.abs(word.length - token.length) <= tolerance && editDistance(token, word) <= tolerance);
}

export function catalogItemSearchText(item: CatalogItem) {
  return normalizeSearchText([
    item.brand,
    item.model,
    item.modelSlug,
    item.category,
    item.kind,
    item.chip,
    item.ram,
    item.storage,
    item.size,
    item.color,
    item.sim,
    item.connectivity,
    item.configuration,
  ].filter(Boolean).join(' '));
}

export function matchesCatalogSearch(item: CatalogItem, query: string) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;
  const haystack = catalogItemSearchText(item);
  const words = haystack.split(' ');
  const queries = [normalizedQuery, normalizeSearchText(switchKeyboardLayout(query))];
  return queries.some(candidate => candidate.split(' ').every(token => tokenMatches(token, words)));
}

export type CatalogSearchResult<T extends CatalogItem> = T & { searchCount: number; searchMinPrice: number | null };

export function getGroupedCatalogSearchResults<T extends CatalogItem>(items: T[], query: string, limit = 6): CatalogSearchResult<T>[] {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < 2) return [];
  const found = items.filter(item => matchesCatalogSearch(item, normalizedQuery));
  const groups = new Map<string, T[]>();
  found.forEach(item => {
    const key = `${item.category}:${item.modelSlug}`;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  });
  return [...groups.values()].map(variants => ({
    ...variants[0],
    searchCount: variants.length,
    searchMinPrice: variants.reduce<number | null>((minimum, variant) => variant.price !== null && (minimum === null || variant.price < minimum) ? variant.price : minimum, null),
  })).sort((a, b) => {
    const aModel = normalizeSearchText(a.model);
    const bModel = normalizeSearchText(b.model);
    return Number(bModel === normalizedQuery) - Number(aModel === normalizedQuery)
      || Number(bModel.startsWith(normalizedQuery)) - Number(aModel.startsWith(normalizedQuery))
      || b.searchCount - a.searchCount;
  }).slice(0, limit);
}
