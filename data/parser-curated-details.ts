type Curated = { source: string; specs: [string, string][] };
const entries: Record<string, Curated> = {};
const add = (ids: string[], source: string, specs: [string, string][]) => {
  for (const id of ids) entries[id] = { source, specs: specs.map(([label, value]) => [label, value]) };
};

add(['parser-sheet1-424', 'parser-sheet1-425'],
  'https://direct.playstation.com/en-us/buy-accessories/dualsense-wireless-controller', [
    ['Совместимость', 'PlayStation 5'],
    ['Тактильная отдача', 'Есть, в поддерживаемых играх'],
    ['Адаптивные триггеры', 'Есть, в поддерживаемых играх'],
    ['Микрофон', 'Встроенный'],
  ]);
add(['parser-sheet1-995'],
  'https://www.apple.com/shop/product/MUWA3AM/A/apple-pencil-usb-c', [
    ['Подключение и зарядка', 'Кабель USB‑C'],
    ['Чувствительность к наклону', 'Есть'],
    ['Магнитное крепление к iPad', 'Есть, для хранения'],
    ['Вес', '20,5 г'],
  ]);
add(['parser-sheet1-996'],
  'https://www.apple.com/shop/product/mx2d3am/a/apple-pencil-pro', [
    ['Управление сжатием', 'Есть'],
    ['Поворот корпуса', 'Поддерживается в совместимых приложениях'],
    ['Тактильная отдача', 'Есть'],
    ['Поиск через «Локатор»', 'Есть'],
  ]);
add(['parser-sheet1-1370', 'parser-sheet1-1372', 'parser-sheet1-1373', 'parser-sheet1-1374'],
  'https://alice.yandex.ru/support/ru/station/meet/characteristics-mini2', [
    ['Мощность динамика', '10 Вт'],
    ['Микрофоны', '4'],
    ['Беспроводная связь', 'Wi‑Fi 2,4/5 ГГц, Bluetooth 5.0'],
    ['Аудиовыход', 'AUX OUT'],
  ]);
add(['parser-sheet1-1420'],
  'https://support.apple.com/en-gb/126620', [
    ['Чип', 'Apple H2 в каждом наушнике'],
    ['Активное шумоподавление', 'Есть'],
    ['Пространственное аудио', 'С отслеживанием движений головы'],
    ['Проводное подключение', 'USB‑C'],
  ]);
add(['parser-sheet1-1447'],
  'https://www.dji.com/mic-2/specs', [
    ['Комплект', '2 передатчика, 1 приёмник, зарядный кейс'],
    ['Диаграмма направленности', 'Всенаправленная'],
    ['Внутренняя запись', '32‑битный формат с плавающей точкой'],
    ['Ёмкость кейса', '3250 мА·ч'],
  ]);
add(['parser-sheet1-1365'],
  'https://www.apple.com/uk/shop/product/myqy3zm/a/earpods-usb-c', [
    ['Тип подключения', 'Проводное, USB‑C'],
    ['Пульт управления', 'Регулировка громкости и воспроизведения'],
    ['Звонки', 'Управление вызовами с пульта'],
  ]);
add(['parser-sheet1-1436'],
  'https://support.apple.com/en-gb/111839', [
    ['Чип', 'A15 Bionic'],
    ['Встроенная память', '128 ГБ'],
    ['Подключение', 'Wi‑Fi 6, Gigabit Ethernet, Bluetooth 5.0'],
    ['Разъём', 'HDMI 2.1'],
  ]);
add(['parser-sheet1-1284', 'parser-sheet1-1285'],
  'Парсер.xlsx!Лист1', [
    ['Тип', 'Чехол-конверт для ноутбука'],
    ['Материал', 'Фетр (Felt)'],
  ]);
entries['parser-sheet1-1284'].specs.push(['Совместимость по названию', 'MacBook Air 13 / MacBook Neo']);
entries['parser-sheet1-1285'].specs.push(['Совместимость по названию', 'MacBook Air 15']);
add(['parser-sheet1-1288', 'parser-sheet1-1289'],
  'https://cdsassets.apple.com/live/6GJYWVAV/user/ma1981_magic-trackpad-2-ug.pdf', [
    ['Подключение', 'Беспроводное'],
    ['Жесты', 'Multi‑Touch'],
    ['Технология нажатия', 'Force Touch'],
  ]);
add(['parser-sheet1-1290', 'parser-sheet1-1291', 'parser-sheet1-1292', 'parser-sheet1-1293'],
  'https://cdsassets.apple.com/live/6GJYWVAV/user/ma1983_magic-keyboard-ug.pdf', [
    ['Подключение', 'Bluetooth'],
    ['Питание', 'Встроенный аккумулятор'],
  ]);
entries['parser-sheet1-1290'].specs.push(['Touch ID', 'Есть, согласно названию модели']);
entries['parser-sheet1-1291'].specs.push(['Цифровой блок', 'Есть, согласно названию модели']);
entries['parser-sheet1-1292'].specs.push(['Touch ID и цифровой блок', 'Есть, согласно названию модели']);
entries['parser-sheet1-1293'].source = 'https://support.apple.com/en-gb/112443';
entries['parser-sheet1-1293'].specs.push(['Клавиши', 'Мультимедийные']);
add(['parser-sheet1-1295'], 'Парсер.xlsx!Лист1', [
  ['Тип', 'Чехол'],
  ['Совместимость по названию', 'iPhone 17 Air'],
  ['Исполнение', 'Прозрачное, магнитное'],
]);
add(['parser-sheet1-998'], 'https://support.apple.com/ru-ru/111937', [
  ['Трекпад', 'Встроенный, поддерживает жесты Multi‑Touch'],
  ['Зарядка iPad', 'Через порт USB‑C на клавиатуре'],
  ['Защита', 'Закрывает переднюю и заднюю стороны iPad'],
]);

export const parserCuratedDetails = entries;
