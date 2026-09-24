import sourceRows from '@/data/trade-in-prices.json';

export const TRADE_IN_STORAGE_KEY = 'appgrade-trade-in-v2';

export type TradeInPriceRow = {
  id: number;
  model: string;
  storage: string;
  sim: string | null;
  minBattery: number | null;
  maxBattery: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  batteryLabel: string;
  priceLabel: string;
};

export const tradeInPrices: TradeInPriceRow[] = sourceRows;
export const tradeInModels = [...new Set(tradeInPrices.map(row => row.model))];

export type TradeInSelection = {
  rowId: number;
  batteryPercent: number;
  functionState: 'working' | 'issues' | 'broken';
  bodyState: 'clean' | 'worn' | 'damaged';
};

export type TradeInAssessment = {
  row: TradeInPriceRow;
  estimate: number | null;
  reason: 'priced' | 'request' | 'battery' | 'condition';
};

export type TradeInQuote = TradeInSelection & {
  estimate: number;
  model: string;
  storage: string;
  sim: string | null;
};

export function getTradeInRow(rowId: number) {
  return tradeInPrices.find(row => row.id === rowId);
}

export function getTradeInAssessment(selection: TradeInSelection): TradeInAssessment | null {
  const row = getTradeInRow(selection.rowId);
  if (!row || !Number.isInteger(selection.batteryPercent) || selection.batteryPercent < 0 || selection.batteryPercent > 100
    || !['working', 'issues', 'broken'].includes(selection.functionState)
    || !['clean', 'worn', 'damaged'].includes(selection.bodyState)) return null;
  if (selection.functionState !== 'working' || selection.bodyState === 'damaged') {
    return { row, estimate: null, reason: 'condition' };
  }
  if (row.minBattery === null || row.maxBattery === null) {
    return { row, estimate: null, reason: 'request' };
  }
  if (selection.batteryPercent < row.minBattery || selection.batteryPercent > row.maxBattery) {
    return { row, estimate: null, reason: 'battery' };
  }
  if (row.maxPrice === null) return { row, estimate: null, reason: 'request' };
  return { row, estimate: row.maxPrice, reason: 'priced' };
}

export function calculateTradeInEstimate(selection: TradeInSelection) {
  return getTradeInAssessment(selection)?.estimate ?? null;
}

export function parseTradeInSelection(value: unknown): TradeInSelection | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  const selection: TradeInSelection = {
    rowId: data.rowId as number,
    batteryPercent: data.batteryPercent as number,
    functionState: data.functionState as TradeInSelection['functionState'],
    bodyState: data.bodyState as TradeInSelection['bodyState'],
  };
  return getTradeInAssessment(selection) ? selection : null;
}

export function parseTradeInQuote(value: unknown): TradeInQuote | null {
  const selection = parseTradeInSelection(value);
  if (!selection) return null;
  const assessment = getTradeInAssessment(selection)!;
  if (!assessment.estimate || (value as Record<string, unknown>).estimate !== assessment.estimate) return null;
  return {
    ...selection,
    estimate: assessment.estimate,
    model: assessment.row.model,
    storage: assessment.row.storage,
    sim: assessment.row.sim,
  };
}

export function tradeInDiscount(estimate: number, productsTotal: number) {
  return Math.min(estimate, Math.max(0, productsTotal));
}
