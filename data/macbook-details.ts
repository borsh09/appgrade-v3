export interface MacbookDetailContent {
  eyebrow: string;
  lead: string;
  highlights: Array<{ value: string; label: string }>;
  groups: Array<{ title: string; rows: Array<[string, string]> }>;
}

export function getMacbookDetails(model: string): MacbookDetailContent {
  const neo = model === 'MacBook Neo';
  const m1 = model.includes('M1');
  const is15 = model.includes('15');
  const chip = neo ? 'Apple A18 Pro' : m1 ? 'Apple M1' : 'Apple M5';
  const display = neo ? '13,0″ · 2408×1506' : is15 ? '15,3″ · 2880×1864' : m1 ? '13,3″ · 2560×1600' : '13,6″ · 2560×1664';
  const battery = neo ? 'до 16 часов' : 'до 18 часов';
  const camera = neo || m1 ? 'FaceTime HD' : '12 Мп Center Stage';
  return {
    eyebrow: neo ? 'Новый Mac для ярких идей и ежедневных задач' : m1 ? 'Тихий, лёгкий и по-прежнему быстрый' : `Сила M5 в невероятно тонком корпусе ${is15 ? 'с большим экраном' : ''}`,
    lead: neo ? 'MacBook Neo сочетает прочный алюминиевый корпус, яркий 13-дюймовый экран и энергоэффективный чип A18 Pro. Он легко справляется с учёбой, документами, общением и повседневным творчеством.' : m1 ? 'MacBook Air с M1 работает бесшумно без вентилятора, быстро запускает приложения и долго держит заряд. Компактный корпус удобно брать с собой каждый день.' : `MacBook Air с M5 получил производительный чип Apple, яркий Liquid Retina дисплей и до 18 часов автономной работы. ${is15 ? 'Большая диагональ даёт больше пространства для проектов и нескольких окон.' : 'Компактная версия особенно удобна в дороге.'}`,
    highlights: [{ value: display, label: 'дисплей Liquid Retina' }, { value: chip, label: 'чип Apple' }, { value: battery, label: 'автономная работа' }, { value: camera, label: 'камера' }],
    groups: [
      { title: 'Дисплей', rows: [['Тип', 'Liquid Retina · IPS'], ['Диагональ и разрешение', display], ['Яркость', '500 нит'], ['Цвет', 'True Tone · широкий цветовой охват']] },
      { title: 'Производительность', rows: [['Процессор', chip], ['Графика', 'Встроенный GPU Apple'], ['Операционная система', 'macOS'], ['Охлаждение', 'Бесшумная конструкция без вентилятора']] },
      { title: 'Камера и звук', rows: [['Камера', camera], ['Микрофоны', 'Система направленных микрофонов'], ['Аудио', 'Стереодинамики · Spatial Audio']] },
      { title: 'Подключения', rows: [['Беспроводная связь', 'Wi‑Fi · Bluetooth'], ['Разъёмы', neo ? 'USB‑C · аудио 3,5 мм' : m1 ? '2× Thunderbolt / USB 4 · аудио 3,5 мм' : 'MagSafe 3 · 2× Thunderbolt 4 · аудио 3,5 мм'], ['Безопасность', 'Touch ID']] },
    ],
  };
}
