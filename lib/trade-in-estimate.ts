export const TRADE_IN_STORAGE_KEY = 'appgrade-trade-in-v1';

export type TradeInDeviceType = 'Смартфон' | 'Планшет' | 'Ноутбук' | 'Смарт-часы';
export type TradeInSelection = {
  deviceType: TradeInDeviceType;
  model: string;
  functionState: 'perfect' | 'issues' | 'broken';
  bodyState: 'clean' | 'worn' | 'damaged';
  batteryState: 'good' | 'service';
  kitState: 'full' | 'device';
};
export type TradeInQuote = TradeInSelection & { estimate: number };

const basePrices: Record<TradeInDeviceType, number> = {
  'Смартфон': 68000,
  'Планшет': 52000,
  'Ноутбук': 95000,
  'Смарт-часы': 32000,
};
const functionFactors = { perfect: 1, issues: .65, broken: .32 };
const bodyFactors = { clean: 1, worn: .82, damaged: .56 };
const batteryFactors = { good: 1, service: .88 };
const kitFactors = { full: 1, device: .94 };

function getModelFactor(deviceType: TradeInDeviceType, model: string) {
  const value = model.toLowerCase();
  const generations: Record<TradeInDeviceType, [RegExp, number][]> = {
    'Смартфон': [[/\b(18|s26|pixel 11)\b/, 1], [/\b(17|s25|pixel 10)\b/, .92], [/\b(16|s24|pixel 9)\b/, .82], [/\b(15|s23|pixel 8)\b/, .7], [/\b(14|s22|pixel 7)\b/, .58], [/\b(13|s21|pixel 6)\b/, .48], [/\b(12|s20|pixel 5)\b/, .38], [/\b(11|xs|max|xr)\b/, .28], [/\b(x|se|8|7|6)\b/, .18]],
    'Планшет': [[/\b(m5|2026|2027)\b/, 1], [/\b(m4|2024|2025)\b/, .88], [/\b(m2|2022|2023)\b/, .7], [/\b(2020|2021)\b/, .52], [/\b(2018|2019)\b/, .34]],
    'Ноутбук': [[/\b(m5|2026|2027)\b/, 1], [/\b(m4|2024|2025)\b/, .9], [/\b(m3|2023)\b/, .8], [/\b(m2|2022)\b/, .69], [/\b(m1|2020|2021)\b/, .54], [/\b(2018|2019)\b/, .3]],
    'Смарт-часы': [[/\b(12|ultra 3|2026|2027)\b/, 1], [/\b(11|ultra 2|2025)\b/, .88], [/\b(10|ultra|2024)\b/, .76], [/\b(9|8|2022|2023)\b/, .58], [/\b(7|6|2020|2021)\b/, .4], [/\b(5|4|3)\b/, .25]],
  };
  const match = generations[deviceType].find(([pattern]) => pattern.test(value));
  const premium = /\b(pro max|ultra)\b/.test(value) ? 1.12 : /\bpro\b/.test(value) ? 1.06 : 1;
  return Math.min(1, (match?.[1] ?? .62) * premium);
}

export function calculateTradeInEstimate(selection: TradeInSelection) {
  const { deviceType, model, functionState, bodyState, batteryState, kitState } = selection;
  return Math.max(1500, Math.round((basePrices[deviceType] * getModelFactor(deviceType, model) * functionFactors[functionState] * bodyFactors[bodyState] * batteryFactors[batteryState] * kitFactors[kitState]) / 500) * 500);
}

export function parseTradeInQuote(value: unknown): TradeInQuote | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const quote = value as Record<string, unknown>;
  if (!Object.hasOwn(basePrices, String(quote.deviceType)) || typeof quote.model !== 'string' || !quote.model.trim() || quote.model.length > 150) return null;
  if (!Object.hasOwn(functionFactors, String(quote.functionState)) || !Object.hasOwn(bodyFactors, String(quote.bodyState)) || !Object.hasOwn(batteryFactors, String(quote.batteryState)) || !Object.hasOwn(kitFactors, String(quote.kitState))) return null;
  const selection = {
    deviceType: quote.deviceType as TradeInDeviceType,
    model: quote.model.trim(),
    functionState: quote.functionState as TradeInSelection['functionState'],
    bodyState: quote.bodyState as TradeInSelection['bodyState'],
    batteryState: quote.batteryState as TradeInSelection['batteryState'],
    kitState: quote.kitState as TradeInSelection['kitState'],
  };
  const estimate = calculateTradeInEstimate(selection);
  return quote.estimate === estimate ? { ...selection, estimate } : null;
}

export function tradeInDiscount(estimate: number, productsTotal: number) {
  return Math.min(estimate, Math.max(0, productsTotal));
}
