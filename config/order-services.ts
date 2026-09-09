export const ORDER_SERVICES = {
  transfer: {
    title: 'Перенос данных',
    price: 2990,
    appliesTo: ['iphone', 'ipad'],
  },
  screen: { title: 'Защита экрана', price: 990, appliesTo: ['iphone', 'ipad'] },
  android: {
    title: 'Перенос с Android на iOS',
    price: 2990,
    appliesTo: ['iphone'],
  },
  setup: {
    title: 'Настройка iPhone и iPad',
    price: 2990,
    appliesTo: ['iphone', 'ipad'],
  },
  banks: {
    title: 'Установка банковских приложений',
    price: 490,
    appliesTo: ['iphone', 'ipad'],
  },
  'apple-id': {
    title: 'Создание Apple ID',
    price: 990,
    appliesTo: ['iphone', 'ipad'],
  },
} as const;
