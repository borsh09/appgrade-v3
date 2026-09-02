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
