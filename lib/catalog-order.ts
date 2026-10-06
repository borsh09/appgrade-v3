import type { CatalogItem } from './catalog-registry';

export const preorderModels = new Set([
  'Apple Watch Series 12',
  'Apple Watch Ultra 4', 'AirPods 5 with Wireless Charging Case',
]);
export const promotedModels = new Set(['iPhone 18 Pro Max', 'iPhone 18 Pro']);

// Editorial launch priorities; these are not a claim about measured sales.
const modelPriorities: Record<string, readonly RegExp[]> = {
  iphones: [/^iPhone 18 Pro Max$/, /^iPhone 18 Pro$/, /^iPhone 17$/, /^iPhone 17 Pro$/, /^iPhone 17 Pro Max$/, /^iPhone 16$/, /^iPhone 16 Pro/, /^iPhone Air$/, /^iPhone 15$/, /^iPhone 16e$/],
  samsung: [/Galaxy S26/, /Galaxy S25/, /Galaxy A57/, /Galaxy A37/, /Galaxy A17/, /Galaxy Z Flip/, /Galaxy Z Fold/, /Galaxy Tab/],
  xiaomi: [/^Xiaomi 17$/, /^Xiaomi 17 Pro/, /^Xiaomi 15/, /^Redmi Note/, /^Poco/, /^Xiaomi Pad/, /^Redmi Pad/],
  google: [/Pixel 10 Pro/, /Pixel 10$/, /Pixel 9a/, /Pixel 9/],
  macbooks: [/^MacBook Air 13 M5/, /^MacBook Air 15 M5/, /^MacBook Air 13 M4/, /^MacBook Air 15 M4/, /^MacBook Pro 14 M5/, /^MacBook Pro 16 M5/, /^MacBook Neo/, /^Mac Mini/, /^iMac/],
  ipads: [/^iPad 11 A16/, /^iPad Air 11 M4/, /^iPad Air 13 M4/, /^iPad mini/, /^iPad Pro 11 M5/, /^iPad Pro 13 M5/],
  audio: [/^AirPods Pro 3/, /^AirPods Pro 2/, /^AirPods 4 ANC/, /^AirPods 4$/, /^AirPods Max/, /^Marshall Major/, /^JBL Charge/, /^Яндекс Станция Мини/, /^Sony WH/],
  watches: [/^Apple Watch Series 11/, /^Apple Watch SE3/, /^Apple Watch Ultra 3/, /^Apple Watch Series 10/, /Galaxy Watch/],
  dyson: [/^Dyson HS09/, /^Dyson HS08/, /^Dyson HS05/, /^Dyson HD16/, /^Dyson HT01/, /^Dyson V15/, /^Dyson V12/, /^Dyson V8/],
  playstation: [/^PlayStation 5 Slim/, /^PlayStation 5 Pro/, /^PlayStation 5/, /^Sony DualSense/, /^Nintendo/, /^Xbox/, /^Steam Deck/],
};

function modelPriority(item: CatalogItem) {
  const patterns = modelPriorities[item.category ?? ''] ?? [];
  const index = patterns.findIndex(pattern => pattern.test(item.model));
  return index < 0 ? patterns.length : index;
}
function promotedColorPriority(item: CatalogItem) {
  if (!promotedModels.has(item.model)) return 0;
  if (/burgundy|red|бордо|красн/i.test(item.color)) return 0;
  if (/black|ч[её]рн/i.test(item.color)) return 1;
  return 2;
}
function orderVariants<T extends CatalogItem>(items: T[]): T[] {
  const sorted = items.slice().sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  if (!promotedModels.has(sorted[0].model)) return sorted;
  const colors = new Map<string, T[]>();
  for (const item of sorted) {
    const queue = colors.get(item.color) ?? [];
    queue.push(item);
    colors.set(item.color, queue);
  }
  const queues = [...colors.values()].sort((a, b) => promotedColorPriority(a[0]) - promotedColorPriority(b[0]));
  const result: T[] = [];
  for (let index = 0; result.length < sorted.length; index++) {
    for (const queue of queues) if (queue[index]) result.push(queue[index]);
  }
  return result;
}

/** Show different model families first, with affordable configurations leading each family.
 * Keep unpriced products, preorders and missing photographs behind the launch selection. */
export function merchandiseCatalog<T extends CatalogItem>(items: readonly T[]): T[] {
  const tier = (item: T) => !item.photoMissing && item.price !== null && item.price > 0 && promotedModels.has(item.model) ? -1 : Number(Boolean(item.photoMissing)) * 4
    + Number(item.price === null || item.price <= 0) * 2
    + Number(preorderModels.has(item.model));
  const buckets = new Map<number, T[]>();
  for (const item of items) {
    const key = tier(item);
    const bucket = buckets.get(key) ?? [];
    bucket.push(item);
    buckets.set(key, bucket);
  }
  return [...buckets].sort(([a], [b]) => a - b).flatMap(([, bucket]) => {
    const groups = new Map<string, T[]>();
    for (const item of bucket) {
      const queue = groups.get(item.modelSlug) ?? [];
      queue.push(item);
      groups.set(item.modelSlug, queue);
    }
    const queues = [...groups.values()]
      .map(orderVariants)
      .sort((a, b) => modelPriority(a[0]) - modelPriority(b[0]));
    const result: T[] = [];
    for (let index = 0; result.length < bucket.length; index++) {
      for (const queue of queues) if (queue[index]) result.push(queue[index]);
    }
    return result;
  });
}

/** Preserve the current order within each group and place missing photos last. */
export function missingPhotosLast<T extends { photoMissing?: boolean }>(items: readonly T[]): T[] {
  const withPhotos: T[] = [];
  const withoutPhotos: T[] = [];
  for (const item of items) {
    (item.photoMissing ? withoutPhotos : withPhotos).push(item);
  }
  return [...withPhotos, ...withoutPhotos];
}
