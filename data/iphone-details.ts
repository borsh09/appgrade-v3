export interface IphoneDetailContent {
  eyebrow: string;
  lead: string;
  highlights: Array<{ value: string; label: string }>;
  groups: Array<{ title: string; rows: Array<[string, string]> }>;
}

const base = (chip: string, display: string, camera: string, battery: string): IphoneDetailContent => ({
  eyebrow: 'Создан, чтобы каждый день ощущался быстрее',
  lead: `Яркий дисплей ${display}, производительный чип ${chip} и продвинутая система камер. iPhone удобно работает в экосистеме Apple, поддерживает быструю зарядку и защищён от воды и пыли.`,
  highlights: [{ value: display, label: 'дисплей Super Retina XDR' }, { value: chip, label: 'чип Apple' }, { value: camera, label: 'основная камера' }, { value: battery, label: 'воспроизведение видео' }],
  groups: [
    { title: 'Экран', rows: [['Тип', 'Super Retina XDR OLED'], ['Диагональ', display], ['Технологии', 'HDR, True Tone, широкий цветовой охват P3']] },
    { title: 'Производительность', rows: [['Процессор', chip], ['Операционная система', 'iOS'], ['Аутентификация', 'Face ID']] },
    { title: 'Камеры', rows: [['Основная камера', camera], ['Фронтальная камера', 'TrueDepth'], ['Видео', '4K, HDR Dolby Vision']] },
    { title: 'Корпус и связь', rows: [['Защита', 'IP68'], ['Связь', '5G, Wi‑Fi, Bluetooth, NFC'], ['Разъём', chip === 'A15 Bionic' ? 'Lightning' : 'USB‑C'], ['Беспроводная зарядка', 'MagSafe и Qi']] },
  ],
});

export function getIphoneDetails(model: string): IphoneDetailContent {
  if (model.includes('18 Pro Max')) return base('A20 Pro', '6,9″ · 120 Гц', '48 Мп · переменная диафрагма', 'до 45 часов');
  if (model.includes('18 Pro')) return base('A20 Pro', '6,3″ · 120 Гц', '48 Мп · переменная диафрагма', 'до 36 часов');
  if (model.includes('Duo')) {
    const details = base('A20 Pro', '7,6″ + 5,4″ · 120 Гц', '48 Мп · две камеры', 'до 44 часов видео');
    details.eyebrow = 'Первый складной iPhone с двумя дисплеями';
    details.lead = 'iPhone Duo раскрывается в большой 7,6-дюймовый OLED-дисплей и поддерживает Split View в iOS 27. Титановая рамка, чип A20 Pro, Touch ID в боковой кнопке и две камеры по 48 Мп.';
    details.groups[1].rows[2] = ['Аутентификация', 'Touch ID в боковой кнопке'];
    details.groups[2].rows[1] = ['Фронтальные камеры', '12 Мп Center Stage и камера FaceTime под дисплеем'];
    return details;
  }
  if (model.includes('17 Pro Max')) return base('A19 Pro', '6,9″ · 120 Гц', '48 Мп · три камеры', 'до 39 часов');
  if (model.includes('17 Pro')) return base('A19 Pro', '6,3″ · 120 Гц', '48 Мп · три камеры', 'до 33 часов');
  if (model.includes('17e')) return base('A19', '6,1″', '48 Мп Fusion', 'на весь день');
  if (model.includes('17')) return base('A19', '6,3″ · 120 Гц', '48 Мп Dual Fusion', 'до 30 часов');
  if (model.includes('Air')) return base('A19 Pro', '6,5″ · 120 Гц', '48 Мп Fusion', 'на весь день');
  if (model.includes('16 Pro Max')) return base('A18 Pro', '6,9″ · 120 Гц', '48 Мп · три камеры', 'до 33 часов');
  if (model.includes('16 Pro')) return base('A18 Pro', '6,3″ · 120 Гц', '48 Мп · три камеры', 'до 27 часов');
  if (model.includes('16 Plus')) return base('A18', '6,7″', '48 Мп Fusion', 'до 27 часов');
  if (model.includes('16e')) return base('A18', '6,1″', '48 Мп Fusion', 'до 26 часов');
  if (model.includes('16')) return base('A18', '6,1″', '48 Мп Fusion', 'до 22 часов');
  if (model.includes('15 Plus')) return base('A16 Bionic', '6,7″', '48 Мп', 'до 26 часов');
  if (model.includes('15')) return base('A16 Bionic', '6,1″', '48 Мп', 'до 20 часов');
  if (model.includes('14')) return base('A15 Bionic', '6,1″', '12 Мп · две камеры', 'до 20 часов');
  return base('A15 Bionic', '6,1″', '12 Мп · две камеры', 'до 19 часов');
}
