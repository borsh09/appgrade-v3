export const PRICE_UPDATE_KEY = 'appgrade-price-update';
export const PRICE_UPDATE_CHANNEL = 'appgrade-prices';

export function notifyPriceUpdate() {
  window.dispatchEvent(new Event('appgrade-prices-refresh'));
  try { window.localStorage.setItem(PRICE_UPDATE_KEY, `${Date.now()}:${Math.random()}`); } catch { /* Storage may be disabled. */ }
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(PRICE_UPDATE_CHANNEL);
    channel.postMessage('refresh');
    channel.close();
  }
}
