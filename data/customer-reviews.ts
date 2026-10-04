export const reviewSources = {
  yandex: { name: 'Яндекс Карты', href: 'https://yandex.com/maps/org/apgreyd/89372369544/reviews/', mark: 'Я' },
  twoGis: { name: '2ГИС', href: 'https://2gis.ru/magnitogorsk/firm/70000001081044586/tab/reviews', mark: '2ГИС' },
} as const;

export const customerReviews = [
  { author: 'Лена Ш.', initials: 'ЛШ', source: 'yandex', date: '14 апреля 2025', text: 'Телефон пришел за 4 дня.' },
  { author: 'Настя Левина', initials: 'НЛ', source: 'twoGis', text: 'Консультанты грамотные, не навязывают лишнего.' },
  { author: 'Elena V', initials: 'EV', source: 'yandex', date: '19 сентября 2025', text: 'Цены выгодные. Техника оригинальная.' },
  { author: 'Светлана Боярская', initials: 'СБ', source: 'twoGis', text: 'Потрясающий магазин,очень низкие цены,хорошее обслуживание' },
  { author: 'Ксения С.', initials: 'КС', source: 'yandex', date: '18 февраля 2025', text: 'Вежливый персонал, спасибо большое за сервис!' },
  { author: 'Алексей Корниенко', initials: 'АК', source: 'twoGis', text: 'Внимательные и доброжелательные ребята.' },
] as const;
