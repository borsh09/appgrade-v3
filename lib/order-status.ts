export const orderStatuses: Record<string, string> = {
  new: 'Новый', confirmed: 'Подтверждён', assembled: 'Собран',
  ready_for_pickup: 'Готов к выдаче', out_for_delivery: 'Передан в доставку',
  issued: 'Выдан', delivered: 'Доставлен', cancelled: 'Отменён',
  contacted: 'Связались', awaiting_payment: 'Ожидает оплаты', completed: 'Завершён',
};

export const tradeInStatuses: Record<string, string> = {
  new: 'Новый', confirmed: 'Подтверждён', contacted: 'Связались',
  awaiting_payment: 'Ожидает оплаты', completed: 'Завершён', issued: 'Выдан', cancelled: 'Отменён',
};

export const closedOrderStatuses = ['issued', 'delivered', 'completed', 'cancelled'];
export const completedOrderStatuses = ['issued', 'delivered', 'completed'];

export function nextEntryStatuses(type: 'order' | 'trade-in', status: string, fulfillment?: string): string[] {
  if (type === 'trade-in') {
    return ({ new: ['confirmed', 'cancelled'], confirmed: ['contacted', 'completed', 'cancelled'],
      contacted: ['awaiting_payment', 'completed', 'cancelled'], awaiting_payment: ['issued', 'completed', 'cancelled'] } as Record<string, string[]>)[status] ?? [];
  }
  const delivery = fulfillment === 'delivery';
  return ({ new: ['confirmed', 'cancelled'], confirmed: ['assembled', 'cancelled'],
    assembled: [delivery ? 'out_for_delivery' : 'ready_for_pickup', 'cancelled'],
    ready_for_pickup: delivery ? [] : ['issued', 'cancelled'],
    out_for_delivery: delivery ? ['delivered', 'cancelled'] : [],
    contacted: ['assembled', 'cancelled'], awaiting_payment: ['assembled', 'cancelled'],
  } as Record<string, string[]>)[status] ?? [];
}

export const statusActionLabels: Record<string, string> = {
  confirmed: 'Подтвердить', assembled: 'Заказ собран', ready_for_pickup: 'Готов к выдаче',
  out_for_delivery: 'Передать в доставку', issued: 'Выдать заказ', delivered: 'Заказ доставлен',
  cancelled: 'Отменить', contacted: 'Связались', awaiting_payment: 'Ожидает оплаты', completed: 'Завершить',
};
