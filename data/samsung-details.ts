export interface SamsungDetailContent {
  eyebrow: string;
  lead: string;
  highlights: Array<{ value: string; label: string }>;
  groups: Array<{ title: string; rows: Array<[string, string]> }>;
}

type Profile = {
  display: string;
  panel?: string;
  chip: string;
  camera: string;
  battery: string;
  protection?: string;
  form?: string;
  eyebrow: string;
  lead: string;
};

const profiles: Record<string, Profile> = {
  'Samsung Galaxy S24 Ultra': { display: '6,8″ · 120 Гц', chip: 'Snapdragon 8 Gen 3 for Galaxy', camera: '200 Мп · четыре камеры', battery: '5000 мА·ч', protection: 'IP68 · титановая рамка', eyebrow: 'Флагман с камерой Ultra и встроенным S Pen', lead: 'Большой антибликовый экран, камера 200 Мп и встроенный S Pen превращают Galaxy S24 Ultra в универсальный инструмент для съёмки, заметок и работы.' },
  'Samsung Galaxy S25': { display: '6,2″ · 120 Гц', chip: 'Snapdragon 8 Elite for Galaxy', camera: '50 Мп · три камеры', battery: '4000 мА·ч', eyebrow: 'Компактный флагман с возможностями Galaxy AI', lead: 'Galaxy S25 сочетает компактный корпус, яркий адаптивный экран и флагманскую производительность. Удобный формат для ежедневной съёмки, общения и работы.' },
  'Samsung Galaxy S25 FE': { display: '6,7″ · 120 Гц', chip: 'Exynos 2400', camera: '50 Мп · три камеры', battery: '4900 мА·ч', eyebrow: 'Флагманские возможности в доступной серии FE', lead: 'Большой AMOLED-дисплей, оптическая стабилизация камеры и инструменты Galaxy AI делают S25 FE практичным смартфоном для контента и повседневных задач.' },
  'Samsung Galaxy S25 Plus': { display: '6,7″ · 120 Гц', chip: 'Snapdragon 8 Elite for Galaxy', camera: '50 Мп · три камеры', battery: '4900 мА·ч', eyebrow: 'Больше экран и больше времени без подзарядки', lead: 'Galaxy S25+ предлагает просторный дисплей высокого разрешения, флагманскую скорость и увеличенный аккумулятор в тонком сбалансированном корпусе.' },
  'Samsung Galaxy S25 Ultra': { display: '6,9″ · 120 Гц', chip: 'Snapdragon 8 Elite for Galaxy', camera: '200 Мп · четыре камеры', battery: '5000 мА·ч', protection: 'IP68 · титановая рамка', eyebrow: 'Максимальная камера Galaxy и точность S Pen', lead: 'Galaxy S25 Ultra создан для тех, кому нужны профессиональная камера, большой экран, высокая производительность и точное управление встроенным пером S Pen.' },
  'Samsung Galaxy S25 Edge': { display: '6,7″ · 120 Гц', chip: 'Snapdragon 8 Elite for Galaxy', camera: '200 Мп · две камеры', battery: '3900 мА·ч', protection: 'IP68 · титановая рамка', eyebrow: 'Тонкий флагман без компромисса в качестве', lead: 'Особенно тонкий корпус, основная камера 200 Мп и флагманский процессор делают Galaxy S25 Edge лёгким и выразительным смартфоном.' },
  'Samsung Galaxy S26': { display: '6,3″ · 120 Гц', chip: 'Флагманский процессор Galaxy', camera: '50 Мп · три камеры', battery: 'на весь день', eyebrow: 'Умный компактный Galaxy нового поколения', lead: 'Компактный Galaxy S26 быстро справляется с ежедневными задачами, помогает обрабатывать фотографии и предлагает плавный экран с адаптивной частотой обновления.' },
  'Samsung Galaxy S26 Plus': { display: '6,7″ · 120 Гц', chip: 'Флагманский процессор Galaxy', camera: '50 Мп · три камеры', battery: 'на весь день', eyebrow: 'Просторный экран и интеллектуальные функции Galaxy', lead: 'Galaxy S26+ сочетает большой яркий экран, высокую производительность и удобные функции Galaxy AI для общения, работы и творчества.' },
  'Samsung Galaxy S26 Ultra': { display: '6,9″ · 120 Гц', chip: 'Флагманский процессор Galaxy', camera: '200 Мп · система Ultra', battery: 'на весь день', protection: 'IP68 · премиальный корпус', eyebrow: 'Самый технологичный Galaxy для работы и съёмки', lead: 'Galaxy S26 Ultra объединяет большой антибликовый дисплей, камеру высокого разрешения, продвинутый зум и максимальную производительность серии.' },
  'Samsung Galaxy A57': { display: '6,7″ · 120 Гц', chip: 'Восьмиядерный процессор', camera: '50 Мп · OIS', battery: '5000 мА·ч', protection: 'IP67', eyebrow: 'Сбалансированный Galaxy для каждого дня', lead: 'Galaxy A57 предлагает плавный Super AMOLED-дисплей, стабилизированную камеру и ёмкий аккумулятор в аккуратном современном корпусе.' },
  'Samsung Galaxy A37': { display: '6,7″ · 120 Гц', chip: 'Exynos 1480', camera: '50 Мп · OIS', battery: '5000 мА·ч', protection: 'IP68', eyebrow: 'Яркий экран, надёжная камера и длительная поддержка', lead: 'Galaxy A37 получил плавный Super AMOLED-дисплей, камеру с оптической стабилизацией и защищённый корпус для уверенного ежедневного использования.' },
  'Samsung Galaxy A17': { display: '6,7″ · 90 Гц', chip: 'Восьмиядерный процессор', camera: '50 Мп · OIS', battery: '5000 мА·ч', protection: 'IP54', eyebrow: 'Всё необходимое на большом экране', lead: 'Galaxy A17 — практичный смартфон с большим Super AMOLED-дисплеем, основной камерой с оптической стабилизацией и аккумулятором на весь день.' },
  'Samsung Galaxy Z Fold 8': { display: '7,6″ внутри · 120 Гц', chip: 'Snapdragon for Galaxy', camera: '50 Мп · система камер', battery: '4800 мА·ч', protection: 'IP48', form: 'Складной · два дисплея', eyebrow: 'Большой экран, который помещается в кармане', lead: 'Galaxy Z Fold8 раскрывается в просторный рабочий экран для нескольких приложений, чтения и видео, сохраняя удобный внешний дисплей для быстрых задач.' },
  'Samsung Galaxy Z Flip 8': { display: '6,9″ внутри · 120 Гц', chip: 'Exynos 2600 for Galaxy', camera: '50 Мп · FlexCam', battery: '4300 мА·ч', protection: 'IP48', form: 'Раскладной · FlexWindow', eyebrow: 'Компактный снаружи, полноценный внутри', lead: 'Galaxy Z Flip8 складывается до карманного формата, позволяет пользоваться приложениями на внешнем экране и снимать без штатива в режиме FlexCam.' },
  'Samsung Galaxy Z Fold 8 Ultra': { display: '8,0″ внутри · 120 Гц', chip: 'Snapdragon 8 Elite Gen 5 for Galaxy', camera: '200 Мп · Ultra', battery: '5000 мА·ч', protection: 'IP48', form: 'Складной Ultra · два дисплея', eyebrow: 'Мобильное рабочее пространство уровня Ultra', lead: 'Galaxy Z Fold8 Ultra раскрывается в большой 8-дюймовый экран, поддерживает удобную многозадачность и дополняет её камерой 200 Мп и флагманской производительностью.' },
};

export function getSamsungDetails(model: string): SamsungDetailContent {
  const profile = profiles[model] ?? profiles['Samsung Galaxy S26'];
  return {
    eyebrow: profile.eyebrow,
    lead: profile.lead,
    highlights: [
      { value: profile.display, label: 'дисплей' },
      { value: profile.chip, label: 'производительность' },
      { value: profile.camera, label: 'система камер' },
      { value: profile.battery, label: 'аккумулятор' },
    ],
    groups: [
      { title: 'Экран', rows: [['Тип', profile.panel ?? 'Dynamic AMOLED 2X'], ['Диагональ и частота', profile.display], ['Особенности', 'Адаптивная яркость, Always On Display']] },
      { title: 'Производительность', rows: [['Процессор', profile.chip], ['Операционная система', 'Android · One UI'], ['Интеллектуальные функции', 'Galaxy AI']] },
      { title: 'Камеры', rows: [['Основная система', profile.camera], ['Видео', 'Стабилизация, HDR, ночной режим'], ['Фронтальная камера', 'Автофокус и портретный режим']] },
      { title: 'Корпус и связь', rows: [['Форм-фактор', profile.form ?? 'Сенсорный моноблок'], ['Защита', profile.protection ?? 'Защита от воды и пыли'], ['Связь', '5G, Wi‑Fi, Bluetooth, NFC'], ['Зарядка', 'USB‑C · быстрая и беспроводная']] },
    ],
  };
}
