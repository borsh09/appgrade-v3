type Specification = { source: string; specs: [string, string][] };
// Exact model names only: never inherit a specification from another generation.
export const verifiedModelSpecifications: Record<string, Specification> = {};
const add = (model: string, source: string, specs: [string, string][]) => {
  verifiedModelSpecifications[model] = { source, specs };
};
add('Dyson TP11', 'https://www.dyson.com.sg/purifier-cool-pc1-black-nickel', [
  ['Фильтрация', 'Герметичная HEPA H13 и активированный уголь'], ['Воздушный поток', 'Более 290 л/с на максимальной скорости'],
  ['Поворот', 'До 350°'], ['Скорости потока', '10 уровней'], ['Управление', 'Пульт и приложение MyDyson'],
  ['Высота', '1055 мм'], ['Ширина', '220 мм'], ['Вес', '4,72 кг'], ['Длина кабеля', '1,8 м'],
]);
add('Dyson TP12', 'https://www.dyson.com.mx/purificador-cool-pc2-de-nox-nickel-gold', [
  ['Фильтрация', 'Трёхступенчатая герметичная HEPA H13 и K-Carbon'], ['Очистка воздуха', 'Улавливание частиц и газов, разрушение формальдегида'],
  ['Поворот', 'До 350°'], ['Управление', 'Пульт и приложение MyDyson'], ['Максимальный шум', '61,5 дБ'],
  ['Высота', '1050 мм'], ['Диаметр основания', '220 мм'], ['Вес', '4,9 кг'], ['Длина кабеля', '1,8 м'],
]);
add('Dyson PH05', 'https://www.dyson.co.uk/air-treatment/purifier-humidifiers/purifier-humidify-cool-ph2/de-nox-white-gold', [
  ['Функции', 'Очистка, увлажнение и обдув'], ['Фильтрация', 'Трёхступенчатая герметичная HEPA H13 и K-Carbon'],
  ['Обработка воды', 'Ultraviolet Cleanse, ультрафиолет'], ['Управление', 'Приложение MyDyson'], ['Поворот', '90°'],
  ['Шум', 'До 62,4 дБА; 46 дБА в тихом режиме'], ['Высота', '923 мм'], ['Вес', '8,12 кг'], ['Длина кабеля', '1,8 м'],
]);
add('Dyson HD19', 'https://www.dyson.de/haarpflege/haartrockner/supersonic-travel/ceramic-pink', [
  ['Тип', 'Компактный дорожный фен Supersonic Travel'], ['Режимы', '3 температуры и 2 скорости'], ['Воздушный поток', '11,6 л/с'],
  ['Напряжение', '100–240 В, автоматическая адаптация'], ['Мощность', '1000–1220 Вт'], ['Вес', '331 г'],
  ['Размеры', '222 × 71 × 68 мм'], ['Длина кабеля', '2 м'], ['Контроль нагрева', 'Интеллектуальное регулирование температуры'],
]);
// Device parameters from the manufacturer's store FAQ; bundle contents stay SKU-specific.
const game = (model: string, slug: string, genre: string, developer: string, mode: string) => add(model, `https://www.playstation.com/en-us/games/${slug}/`, [
  ['Платформа этой версии', 'PlayStation 5'], ['Жанр', genre], ['Разработчик', developer], ['Режим игры', mode],
]);
game('PS5 Astro Bot', 'astro-bot', 'Трёхмерный приключенческий платформер', 'Team ASOBI', 'Один игрок');
game('PS5 Minecraft', 'minecraft', 'Песочница, строительство и выживание', 'Mojang', 'Одиночная игра, локальная игра до 4 игроков и сетевые режимы');
game('PS5 Gran Turismo 7', 'gran-turismo-7', 'Гоночный симулятор', 'Polyphony Digital', 'Одиночная игра и многопользовательские гонки');
game('PS5 Cyberpunk 2077', 'cyberpunk-2077', 'Ролевая игра в открытом мире от первого лица', 'CD PROJEKT RED', 'Один игрок');
game('PS5 Mortal Kombat 1', 'mortal-kombat-1', 'Файтинг', 'NetherRealm Studios', '1–2 игрока локально; сетевые режимы требуют PS Plus');
game('PS5 Split Fiction', 'split-fiction', 'Кооперативное приключение', 'Hazelight Studios', 'Только для двух игроков: локально или по сети; поддержка cross-play и Friend’s Pass');
add('PS5 NBA 2K27', 'https://newsroom.2k.com/news/nbar-2k27-gameplay-unleashes-complete-on-court-control-in-a-balanced-two-way-era', [
  ['Платформа этой версии', 'PlayStation 5'], ['Жанр', 'Баскетбольный симулятор'], ['Разработчик', 'Visual Concepts'], ['Издатель', '2K'], ['Особенности', 'ProPLAY, режимы MyCAREER, MyNBA, MyTEAM и The City'],
]);
add('PS5 NHL 26', 'https://www.ea.com/games/nhl/nhl-26', [
  ['Платформа этой версии', 'PlayStation 5'], ['Жанр', 'Хоккейный спортивный симулятор'], ['Издатель', 'Electronic Arts / EA SPORTS'],
]);
game('PS5 The Last of Us Part I', 'the-last-of-us-part-i', 'Сюжетный приключенческий экшен', 'Naughty Dog', 'Один игрок');
game('PS5 The Last of Us Part II', 'the-last-of-us-part-ii-remastered', 'Сюжетный приключенческий экшен', 'Naughty Dog', 'Один игрок');
game('PS5 Marvel: Wolverine', 'marvels-wolverine', 'Сюжетный приключенческий экшен', 'Insomniac Games', 'Один игрок');
game('PS5 Ghost Of Yotei', 'ghost-of-yotei', 'Приключенческий экшен', 'Sucker Punch Productions', 'Одиночная сюжетная игра; отдельный сетевой режим Legends');
game('PS5 Spider Man 2', 'marvels-spider-man-2', 'Приключенческий экшен', 'Insomniac Games', 'Один игрок');
game('PS5 Sackboy: A Big Adventure', 'sackboy-a-big-adventure', 'Трёхмерный платформер', 'Sumo Digital', '1–4 игрока; сетевой кооператив требует PS Plus');
game('PS5 007 First Light', '007-first-light', 'Приключенческий экшен от третьего лица со скрытным прохождением', 'IO Interactive', 'Один игрок');
add('PS5 Slim', 'https://www.playstation.com/content/dam/global_pdc/en-gb/corporate/support/manuals/ps5-docs/2100ab/CFI-21XX_PS5_Instruction_Manual_Web%24en-gb.pdf', [
  ['Процессор', 'AMD Ryzen Zen 2, 8 ядер / 16 потоков'], ['Графика', 'AMD Radeon на архитектуре RDNA'], ['Оперативная память', '16 ГБ GDDR6'],
  ['Порты', '2 × USB-A 10 Гбит/с, USB-C Hi-Speed, USB-C 10 Гбит/с, HDMI, Ethernet'], ['Расширение памяти', 'Слот M.2 SSD Key M'], ['Wi-Fi', 'Wi-Fi 6'], ['Bluetooth', '5.1'],
]);
add('Sony Pulse Elite', 'https://www.playstation.com/en-gb/accessories/pulse-elite-wireless-headset/', [
  ['Излучатели', 'Планарные магнитные'], ['Беспроводной звук', 'PlayStation Link с передачей без потерь'], ['Микрофон', 'Выдвижной, с AI-подавлением шума'],
  ['Время работы', 'До 30 часов по данным производителя'], ['Быстрая зарядка', '10 минут дают до 2 часов работы по данным производителя'], ['Совместимость', 'PS5, PS Portal, PC, Mac, мобильные устройства'],
]);
add('Sony Pulse 3D', 'https://www.playstation.com/en-us/accessories/pulse-3d-wireless-headset/', [
  ['Микрофоны', 'Два встроенных с шумоподавлением'], ['Зарядка', 'USB-C'], ['Подключение', 'Беспроводной USB-адаптер или кабель 3,5 мм'],
  ['Время работы', 'До 12 часов по данным производителя'], ['Совместимость', 'PS5, PS4, совместимые PC и Mac через USB-адаптер'], ['Звук', 'Настройка для Tempest 3D Audio в поддерживаемых играх PS5'],
]);
add('Sony DualSense Edge', 'https://www.playstation.com/en-gb/accessories/dualsense-edge-wireless-controller/', [
  ['Подключение', 'USB или Bluetooth'], ['Управление', 'Переназначение кнопок, регулировка чувствительности стиков и зон курков'], ['Профили', 'Сохранение и быстрое переключение'],
  ['Обратная связь', 'Тактильная отдача и адаптивные курки в поддерживаемых играх'], ['Микрофон', 'Встроенный'], ['Движение', 'Управление наклоном контроллера'],
]);
for (const model of ['Sony DualSense Genshin Impact Limited Edition', 'Sony DualSense 007 First Light Limited Edition']) add(model, 'https://www.playstation.com/en-us/accessories/dualsense-wireless-controller/', [
  ['Тип', 'Беспроводной игровой контроллер DualSense для PS5'], ['Тактильная отдача', 'Поддерживается в совместимых играх'], ['Курки', 'Адаптивные, с изменяемым сопротивлением в поддерживаемых играх'],
  ['Управление', 'Два аналоговых стика и сенсорная панель'],
]);
add('PS Portal', 'https://www.playstation.com/en-gb/accessories/playstation-portal-remote-player/', [
  ['Назначение', 'Удалённая игра с PS5 по Wi-Fi'], ['Экран', 'LCD 8″, Full HD 1080p'], ['Частота', 'До 60 кадр/с'], ['Управление', 'Тактильная отдача и адаптивные курки в поддерживаемых играх'],
  ['Аудио', 'Проводные наушники или совместимые устройства PlayStation Link'], ['Условия Remote Play', 'Нужны PS5, совместимая установленная игра и стабильная сеть'],
]);
add('PS VR2 with game', 'https://www.playstation.com/en-us/ps-vr2/ps-vr2-tech-specs/', [
  ['Дисплеи', 'OLED, 2000 × 2040 на каждый глаз'], ['Частота обновления', '90 или 120 Гц'], ['Угол обзора', 'Около 110°'], ['Подключение к PS5', 'USB-C'],
  ['Отслеживание', '4 встроенные камеры и ИК-отслеживание глаз'], ['Обратная связь', 'Вибрация шлема, тактильная отдача и эффект курков контроллеров Sense'], ['Микрофон', 'Встроенный'],
]);
add('PS5 Pro', 'https://www.playstation.com/en-us/ps5/ps5-pro/', [
  ['Накопитель', 'SSD 2 ТБ'], ['Масштабирование изображения', 'PlayStation Spectral Super Resolution (PSSR)'], ['Графика', 'Улучшенная трассировка лучей в совместимых играх'],
  ['Вывод изображения', 'До 4K 120 кадр/с в поддерживаемых играх с совместимым дисплеем'], ['Wi-Fi', 'Wi-Fi 7'], ['Дисковый привод', 'Подключаемый, приобретается отдельно'],
]);
add('PS5 Disc Drive', 'https://direct.playstation.com/en-us/buy-accessories/disc-drive-for-ps5-digital-edition-consoles', [
  ['Тип', 'Подключаемый дисковый привод'], ['Совместимость', 'PS5 Digital Edition модельной группы slim и PS5 Pro; требуется совместимость конкретной консоли'],
  ['Игровые диски', 'PS5 и поддерживаемые PS4 Blu-ray'], ['Видеодиски', '4K Ultra HD Blu-ray, Blu-ray, DVD'],
]);
add('Sony DualSense ChargingStation', 'https://direct.playstation.com/en-us/buy-accessories/dualsense-charging-station', [
  ['Назначение', 'Зарядная станция для контроллеров'], ['Совместимость', 'DualSense и DualSense Edge'], ['Количество', 'До двух контроллеров одновременно'],
  ['Крепление', 'Контактная зарядка с фиксацией click-in'], ['Питание', 'Через сетевой адаптер, без подключения контроллеров к USB консоли'],
]);
for (const watts of [25, 45]) add(`Samsung Power Adapter ${watts}W`, watts === 45 ? 'https://www.samsung.com/es/mobile-accessories/45w-power-adapter-black-ep-t4510xbegeu/' : 'https://www.samsung.com/mk/mobile-accessories/wall-charger-for-super-fast-charging-25w-black-ep-ta800xbegww/', [
  ['Тип', 'Сетевой зарядный адаптер'], ['Максимальная мощность', `${watts} Вт с совместимым устройством и кабелем`], ['Выходной разъём', 'USB-C'],
  ['Быстрая зарядка', watts === 45 ? 'Super Fast Charging 2.0, USB PD 3.0 PDO/PPS' : 'Super Fast Charging, USB PD 3.0 PPS'], ['Входное напряжение', '100–240 В'],
]);
add('EarPods USB-C', 'https://www.apple.com/shop/product/myqy3am/a/earpods-usb-c', [
  ['Тип', 'Проводные наушники-вкладыши'], ['Подключение', 'USB-C'], ['Управление', 'Пульт на кабеле: громкость, воспроизведение и звонки'],
  ['Совместимость', 'Mac с USB-C и macOS 12.6+, iPad с USB-C и iPadOS 16.4+, iPhone с USB-C и iOS 17+'],
]);
add('MacBook Pro 14 (2021)', 'https://support.apple.com/en-us/111902', [
  ['Экран', 'Liquid Retina XDR 14,2″, 3024 × 1964'], ['Частота обновления', 'Адаптивная ProMotion до 120 Гц'], ['Яркость', 'SDR до 500 нит; HDR до 1000 нит на весь экран и до 1600 нит в пике'],
  ['Порты', '3 × Thunderbolt 4 / USB-C, HDMI, SDXC, MagSafe 3, 3,5 мм'], ['Аккумулятор', '70 Вт·ч'], ['Быстрая зарядка', 'Поддерживается с адаптером 96 Вт'],
]);
add('Apple Magic Keyboard iPad Pro 11 M2', 'https://support.apple.com/en-ie/111910', [
  ['Тип', 'Клавиатура-чехол с трекпадом'], ['Совместимость', 'iPad Pro 11″ 1–4 поколений, включая M2; iPad Air 4–5 поколений'],
  ['Клавиши', 'Подсветка, ножничный механизм, ход 1 мм'], ['Трекпад', 'Multi-Touch'], ['Порт', 'USB-C для сквозной зарядки iPad'], ['Конструкция', 'Магнитное крепление с плавной регулировкой угла'],
]);
add('Samsung Galaxy Watch 9', 'https://www.samsung.com/in/watches/galaxy-watch/galaxy-watch9-44mm-silver-bluetooth-sm-l350nzsains/', [
  ['Система', 'Wear OS Powered by Samsung'], ['Процессор', '5 ядер, до 2,1 ГГц'], ['Оперативная память', '2 ГБ'], ['Встроенная память', '32 ГБ'],
  ['Bluetooth', '6.0'], ['Wi-Fi', '2,4 и 5 ГГц'], ['NFC', 'Поддерживается'], ['Навигация', 'GPS, GLONASS, BeiDou, Galileo, QZSS'],
]);
// Supplier calls the 2025 Galaxy Watch Ultra “Watch 8 Ultra”; verified against its SM-L705 family.
add('Samsung Galaxy Watch 8 Ultra', 'https://www.samsung.com/lv/watches/galaxy-watch/galaxy-watch-ultra-2025-47mm-titanium-blue-lte-sm-l705fzb2eue/', [
  ['Модель производителя', 'Galaxy Watch Ultra (2025), семейство SM-L705'], ['Процессор', '5 ядер, 3 нм'], ['Оперативная память', '2 ГБ'], ['Встроенная память', '64 ГБ'],
  ['GPS', 'Двухчастотный L1 + L5'], ['Аккумулятор', '590 мА·ч'], ['Защита', '10 ATM, IP68'], ['Материал корпуса', 'Титан Grade 4'],
]);
add('Samsung Galaxy Fit3', 'https://www.samsung.com/es/watches/galaxy-fit/galaxy-fit3-pink-gold-bluetooth-sm-r390nidaeub/', [
  ['Экран', 'AMOLED 1,6″, 256 × 402'], ['Bluetooth', '5.3'], ['Система', 'FreeRTOS'], ['Аккумулятор', '208 мА·ч, типичная ёмкость'],
  ['Вес корпуса', '18,5 г'], ['Защита', '5 ATM, IP68'], ['Датчики', 'Акселерометр, барометр, гироскоп, оптический пульсометр, освещённость'], ['GPS', 'Используется GPS подключённого смартфона'],
]);
add('Samsung Galaxy A07', 'https://www.samsung.com/latin/smartphones/galaxy-a/galaxy-a07-green-128gb-sm-a075mzgggto/', [
  ['Процессор', 'MediaTek Helio G99, 6 нм'], ['Экран', 'PLS LCD 6,7″, 1600 × 720, до 90 Гц'], ['Основные камеры', '50 Мп + 2 Мп'], ['Фронтальная камера', '8 Мп'],
  ['Защита', 'IP54'], ['Карты памяти', 'microSD до 2 ТБ'], ['Bluetooth', '5.3'], ['Аудиоразъём', '3,5 мм'],
]);
add('Samsung Galaxy A07s', 'https://www.samsung.com/levant/smartphones/galaxy-a/galaxy-a07s-green-64gb-sm-a077fzgdmea/', [
  ['Процессор', '8 ядер, до 2,2 ГГц'], ['Экран', 'PLS LCD 6,7″, 1600 × 720'], ['Основные камеры', '50 Мп + 2 Мп'], ['Фронтальная камера', '8 Мп'],
  ['Видео', 'Full HD до 30 кадр/с'], ['Карты памяти', 'microSD до 2 ТБ'],
]);
add('Samsung Galaxy A16', 'https://www.samsung.com/br/smartphones/galaxy-a/galaxy-a16-light-green-128gb-sm-a165mlgdzto/', [
  ['Процессор', '8 ядер, до 2,2 ГГц'], ['Экран', 'Super AMOLED 6,7″, 2340 × 1080'], ['Основные камеры', '50 Мп + 5 Мп + 2 Мп'], ['Фронтальная камера', '13 Мп'],
  ['Видео', 'Full HD до 30 кадр/с'], ['Карты памяти', 'microSD до 1,5 ТБ'],
]);
add('Samsung Galaxy Watch 7', 'https://www.samsung.com/at/watches/galaxy-watch/galaxy-watch7-44mm-green-lte-sm-l315fzgaeue/', [
  ['Система', 'Wear OS Powered by Samsung'], ['Процессор', '5 ядер, до 1,6 ГГц'], ['Оперативная память', '2 ГБ'], ['Встроенная память', '32 ГБ'], ['Bluetooth', '5.3'],
  ['Wi-Fi', '2,4 и 5 ГГц'], ['NFC', 'Поддерживается'], ['Датчики', 'Пульс, электрический сердечный датчик, биоимпеданс, температура, барометр, акселерометр, гироскоп, компас, освещённость'],
]);
add('Samsung Galaxy Watch Ultra 2', 'https://www.samsung.com/de/business/watches/galaxy-watch/galaxy-watch-ultra2-titanium-silver-lte-sm-l715fzsaeub/', [
  ['Система', 'Wear OS Powered by Samsung'], ['Процессор', '5 ядер, до 2,1 ГГц'], ['Оперативная память', '2 ГБ'], ['Встроенная память', '64 ГБ'], ['Bluetooth', '6.0'],
  ['Экран', 'Super AMOLED 1,5″, 498 × 498'], ['Аккумулятор', '800 мА·ч, типичная ёмкость'], ['Защита', '10 ATM, IP69K'], ['Wi-Fi', '2,4 и 5 ГГц'],
]);
add('Realme GT 7T', 'https://www.realme.com/tw/realme-gt-7t-5g/specs', [
  ['Процессор', 'MediaTek Dimensity 8400-Max, 4 нм'], ['Экран', '6,8″, 2800 × 1280, до 120 Гц'], ['Аккумулятор', '7000 мА·ч, типичная ёмкость'], ['Зарядка', '120 Вт SUPERVOOC'],
  ['Основные камеры', '50 Мп Sony IMX896, f/1,8; сверхширокоугольная 8 Мп'], ['Фронтальная камера', '32 Мп Sony IMX615'], ['Видео', '4K до 60 кадр/с'], ['Wi-Fi', 'Wi-Fi 6'], ['Bluetooth', '6.0'],
]);
add('Samsung Galaxy Tab A11', 'https://www.samsung.com/es/tablets/galaxy-tab-a/galaxy-tab-a11-gray-64gb-sm-x130nzaaeub/', [
  ['Процессор', '8 ядер, до 2,2 ГГц'], ['Экран', 'TFT 8,7″, 1340 × 800'], ['Основная камера', '8 Мп с автофокусом'], ['Фронтальная камера', '5 Мп'],
  ['Карты памяти', 'microSD до 2 ТБ'], ['Bluetooth', '5.3'], ['Аккумулятор', '5100 мА·ч, типичная ёмкость'], ['Аудиоразъём', '3,5 мм'],
]);
add('Samsung Galaxy Tab S10 Lite', 'https://www.samsung.com/es/tablets/galaxy-tab-s/galaxy-tab-s10-lite-silver-256gb-sm-x406bzspeub/', [
  ['Процессор', '8 ядер, до 2,4 ГГц'], ['Экран', 'TFT 10,9″, 2112 × 1320'], ['Основная камера', '8 Мп с автофокусом'], ['Фронтальная камера', '5 Мп'],
  ['Стилус', 'Поддержка S Pen'], ['Карты памяти', 'microSD до 2 ТБ'], ['Bluetooth', '5.3'], ['Аккумулятор', '8000 мА·ч, типичная ёмкость'], ['Wi-Fi', 'Wi-Fi 6'],
]);
add('Vivo X300', 'https://www.vivo.com.cn/vivo/param/x300', [
  ['Процессор', 'MediaTek Dimensity 9500'], ['Экран', 'AMOLED, 2640 × 1216, 1–120 Гц'], ['Камеры', '200 Мп основная ZEISS, 50 Мп телеобъектив ZEISS APO, 50 Мп сверхширокоугольная'],
  ['Стабилизация', 'OIS основной камеры и телеобъектива'], ['Оптическое приближение', '3×'], ['Фронтальная камера', '50 Мп, f/2,0'], ['Bluetooth', '5.4'], ['Wi-Fi', 'Wi-Fi 7'],
]);
for (const model of ['Vivo X300 Pro', 'Vivo X300 Pro Satellite']) add(model, 'https://www.vivo.com.cn/vivo/param/x300pro', [
  ['Процессор', 'MediaTek Dimensity 9500'], ['Экран', 'AMOLED, 2800 × 1260, 1–120 Гц'], ['Камеры', '50 Мп основная ZEISS, 200 Мп телеобъектив ZEISS APO, 50 Мп сверхширокоугольная'],
  ['Стабилизация', 'OIS основной камеры и телеобъектива'], ['Оптическое приближение', '3,5×'], ['Фронтальная камера', '50 Мп, f/2,0'], ['Bluetooth', '5.4'], ['Wi-Fi', 'Wi-Fi 7'],
]);
add('Vivo X300 Ultra', 'https://www.vivo.com.cn/vivo/param/x300ultra', [
  ['Процессор', 'Qualcomm Snapdragon 8 Elite Gen 5'], ['Экран', 'AMOLED, 3168 × 1440, до 144 Гц'], ['Камеры', '200 Мп 35 мм ZEISS, 200 Мп 85 мм ZEISS, 50 Мп 14 мм ZEISS'],
  ['Стабилизация', 'OIS всех задних камер'], ['Оптическое приближение', '3,7×'], ['Фронтальная камера', '50 Мп, f/2,45'], ['Bluetooth', '5.4'], ['Wi-Fi', 'Wi-Fi 7'],
]);
add('Realme 16', 'https://www.realme.com/tw/realme-16-5g/specs', [
  ['Процессор', 'MediaTek Dimensity 6400 Turbo'], ['Экран', 'Гибкий AMOLED 6,57″, 2372 × 1080, до 120 Гц'], ['Аккумулятор', '7000 мА·ч, типичная ёмкость'],
  ['Зарядка', 'До 60 Вт'], ['Основные камеры', '50 Мп + 2 Мп'], ['Фронтальная камера', '50 Мп'], ['Накопитель', 'UFS 2.2'], ['Оперативная память', 'LPDDR4X'],
]);
add('Plaud Note', 'https://global.plaud.ai/products/plaud-note-ai-voice-recorder', [
  ['Назначение', 'Диктофон для встреч и телефонных разговоров'], ['Режимы записи', 'Окружающий звук и телефонный разговор через датчик вибрации'],
  ['Время записи', 'До 30 часов непрерывной записи по данным производителя'], ['Толщина', '2,99 мм'], ['Вес', '30 г'],
  ['Обработка записей', 'Транскрипция и резюме в приложении Plaud после записи; доступность и лимиты зависят от тарифа'],
]);
add('Plaud Note Pro', 'https://global.plaud.ai/products/plaud-note-pro', [
  ['Микрофоны', '4 MEMS-микрофона с AI beamforming'], ['Дальность записи', 'До 5 м по данным производителя'], ['Режимы записи', 'Автоматическое переключение встречи / телефонного разговора'],
  ['Отметки', 'Выделение важного момента коротким нажатием'], ['Индикация', 'Экран InstantView'],
  ['Обработка записей', 'Транскрипция и резюме в приложении Plaud после записи; доступность и лимиты зависят от тарифа'],
]);
add('CMF Buds 2a', 'https://us.nothing.tech/products/cmf-buds-2a', [
  ['Излучатель', '12,4 мм с биоволоконной диафрагмой'], ['Шумоподавление', 'Активное, до 42 дБ по данным производителя'], ['Время прослушивания', 'До 8 часов по данным производителя; зависит от режима и громкости'],
]);
add('CMF Buds Pro 2', 'https://in.nothing.tech/products/cmf-buds-pro-2', [
  ['Излучатели', 'Два: 11 мм и 6 мм'], ['Шумоподавление', 'Гибридное активное, до 50 дБ по данным производителя'], ['Микрофоны', '6 HD-микрофонов'],
]);
for (const model of ['DJI Osmo Mobile 8P Device Only', 'DJI Osmo Mobile 8P Creator Combo', 'DJI Osmo Mobile 8P Advanced Tracking Combo']) add(model, 'https://store.dji.com/uk/product/osmo-mobile-8p', [
  ['Стабилизация', 'Трёхосевая, восьмое поколение'], ['Крепление телефона', 'Магнитное'], ['Поворот по горизонтали', '360°, без ограничения оборотов'],
  ['Отслеживание в приложении', 'ActiveTrack 8.0'], ['Питание смартфона', 'Поддерживается через USB-C'], ['Сопряжение', 'Bluetooth с NFC для быстрого подключения совместимого телефона'],
]);
add('Nothing Phone 3', 'https://us.nothing.tech/products/phone-3', [
  ['Процессор', 'Qualcomm Snapdragon 8s Gen 4'], ['Экран', 'Гибкий AMOLED 6,67″, 120 Гц'], ['Камеры', 'Основная 50 Мп с OIS, перископ 50 Мп с OIS, сверхширокоугольная 50 Мп'],
  ['Фронтальная камера', '50 Мп'], ['Защита', 'IP68'], ['Аккумулятор', '5150 мА·ч; индийская версия — 5500 мА·ч'],
]);
add('Nothing Phone 3a Lite', 'https://intl.nothing.tech/products/phone-3a-lite', [
  ['Процессор', 'MediaTek Dimensity 7300 Pro 5G'], ['Экран', 'AMOLED 6,77″, адаптивная частота до 120 Гц'], ['Аккумулятор', '5000 мА·ч'],
  ['Bluetooth', '5.4'], ['Частота ШИМ экрана', '2160 Гц'], ['Основная камера', '50 Мп'],
]);
add('Nothing Phone 4a Pro', 'https://us.nothing.tech/products/phone-4a-pro', [
  ['Процессор', 'Qualcomm Snapdragon 7 Gen 4'], ['Экран', 'Гибкий AMOLED 6,83″, до 144 Гц'], ['Защита', 'IP65'],
  ['Аккумулятор', '5080 мА·ч; индийская версия — 5400 мА·ч'], ['Частота ШИМ экрана', '2160 Гц'],
]);
add('Nothing Phone 4b', 'https://intl.nothing.tech/products/phone-4b', [
  ['Процессор', 'Qualcomm Snapdragon 6 Gen 4'], ['Экран', 'Super AMOLED 6,77″, адаптивная частота до 120 Гц'], ['Защита', 'IP64'],
  ['Аккумулятор', '5200 мА·ч; индийская версия — 6000 мА·ч'], ['Основная камера', '50 Мп'], ['Видео', 'Поддержка 4K'],
]);
for (const model of ['DJI Osmo Pocket 4 Standard Combo', 'DJI Osmo Pocket 4 Creator Combo', 'DJI Osmo Pocket 4 Essential Combo']) add(model, 'https://www.dji.com/no/osmo-pocket-4', [
  ['Сенсор', 'CMOS 1″'], ['Видео', '4K до 60 кадр/с; замедленная съёмка 4K до 240 кадр/с'], ['Объектив', '20 мм в эквиваленте, f/2,0'],
  ['Стабилизация', 'Механическая трёхосевая'], ['Динамический диапазон', '14 ступеней'], ['Цветовой профиль', '10-битный D-Log'],
  ['Экран', 'Поворотный сенсорный OLED 2″'], ['Встроенное хранилище', '107 ГБ'], ['Отслеживание', 'ActiveTrack 7.0'],
]);
for (const model of ['DJI Osmo Mobile 7', 'DJI Osmo Mobile 7P']) add(model, 'https://www.dji.com/osmo-mobile-7-series/faq', [
  ['Стабилизация', 'Трёхосевая'], ['Крепление смартфона', 'Магнитное'], ['Совместимые смартфоны', 'Вес 170–300 г, ширина 67–84 мм, толщина 6,9–10 мм'],
  ['Штатив', 'Встроенный, для ровной поверхности без ветра'], ['Время работы', 'До 10 часов: сбалансированное неподвижное устройство без дополнительных аксессуаров'],
  ['Резьба крепления', '1/4″-20 UNC'], ['Приложение', 'DJI Mimo'],
]);
add('DJI Osmo Mobile 8 Device Only', 'https://www.dji.com/osmo-mobile-8/specs', [
  ['Совместимые смартфоны', 'Вес 170–300 г, ширина 67–84 мм, толщина 6,9–10 мм'], ['Поворот по горизонтали', '360°, без ограничения оборотов'],
  ['Удлинитель', 'Встроенный, до 215 мм'], ['Аккумулятор', '3350 мА·ч'], ['Зарядка', 'USB-C, около 2,5 часа с адаптером 10 Вт'], ['Bluetooth', '5.3'], ['Приложение', 'DJI Mimo'],
]);
add('DJI Osmo Action 4 Adventure Combo', 'https://www.dji.com/osmo-action-4/specs', [
  ['Сенсор', 'CMOS 1/1,3″'], ['Видео', '4K до 120 кадр/с'], ['Объектив', 'Угол 155°, f/2,8'], ['Вес камеры', '145 г'],
  ['Карты памяти', 'microSD до 512 ГБ'], ['Аккумулятор камеры', '1770 мА·ч'], ['Стабилизация', 'RockSteady 3.0/3.0+, HorizonBalancing, HorizonSteady'],
  ['Водонепроницаемость', 'До 18 м без бокса при закрытых крышках и установленной защите объектива; для длительной подводной съёмки нужен бокс'],
]);
for (const model of ['DJI Osmo Action 5 Pro Standard Combo', 'DJI Osmo Action 5 Pro Adventure Combo']) add(model, 'https://www.dji.com/osmo-action-5-pro/specs', [
  ['Сенсор', 'CMOS 1/1,3″'], ['Видео', '4K до 120 кадр/с'], ['Фото', 'До 40 Мп'], ['Объектив', 'Угол 155°, f/2,8'], ['Вес камеры', '146 г'],
  ['Хранение', '64 ГБ встроенной памяти, доступно 47 ГБ; microSD до 1 ТБ'], ['Аккумулятор камеры', '1950 мА·ч'], ['Wi-Fi', 'Wi-Fi 6'], ['Bluetooth', 'BLE 5.1'],
]);
for (const model of ['DJI Osmo Action 6 Standard Combo', 'DJI Osmo Action 6 Adventure Combo']) add(model, 'https://www.dji.com/osmo-action-6/specs', [
  ['Сенсор', 'CMOS 1/1,1″'], ['Видео', '8K до 30 кадр/с; 4K до 120 кадр/с'], ['Фото', 'До 38 Мп'], ['Объектив', 'Угол 155°, переменная диафрагма f/2,0–f/4,0'],
  ['Вес камеры', '149 г'], ['Хранение', '64 ГБ встроенной памяти, доступно 50 ГБ; microSD до 1 ТБ'], ['Аккумулятор камеры', '1950 мА·ч'], ['Wi-Fi', 'Wi-Fi 6'], ['Bluetooth', 'BLE 5.1'],
]);
for (const size of ['M', 'L']) add(`XREAL One Pro (${size})`, 'https://us.shop.xreal.com/products/xreal-one-pro', [
  ['Дисплеи', 'Sony Micro-OLED 0,55″'], ['Частота обновления', 'До 120 Гц'], ['Угол обзора', '57°'], ['Процессор', 'XREAL X1'],
  ['Отслеживание', 'Встроенное 3DoF; 6DoF с дополнительным XREAL Eye'], ['Задержка изображения', '3 мс motion-to-photon по данным производителя'],
  ['Межзрачковое расстояние', size === 'M' ? '57–66 мм' : '66–75 мм'], ['Подключение', 'USB-C с поддержкой вывода видео DisplayPort у устройства-источника'],
]);
add('XREAL 1S Glasses', 'https://us.shop.xreal.com/products/xreal-1s/', [
  ['Процессор', 'XREAL X1'], ['Частота обновления', 'До 120 Гц в 3DoF'], ['Отслеживание', 'Встроенное 3DoF; 6DoF с дополнительным XREAL Eye'],
  ['Подключение', 'USB-C с выводом DisplayPort'], ['Режимы изображения', '0DoF, 3DoF, Ultrawide, REAL 3D, Side-View'], ['Звук', 'Открытая аудиосистема, разработанная совместно с Bose'],
]);
add('XREAL Beam Pro 256GB', 'https://jp.shop.xreal.com/en/products/xreal-beam-pro', [
  ['Назначение', 'Устройство для пространственных приложений и совместимых AR-очков XREAL'], ['Частота экрана устройства', '60 Гц'],
  ['Камеры', 'Две камеры 50 Мп для пространственных фото и видео'], ['Приложения', 'Поддержка Google Play'], ['Wi-Fi', 'Wi-Fi 6'],
]);
add('Dyson V12S SV46 Detect Slim Submarine', 'https://www.dyson.hk/en-HK/dyson-v12s-detect-slim-submarine-yellow-nickel', [
  ['Тип уборки', 'Сухая и влажная'], ['Мощность всасывания', '165 аВт'], ['Контейнер', '0,35 л'], ['Циклоны', '11'],
  ['Время работы', 'До 60 минут в Eco на твёрдом полу'], ['Фильтрация', 'Герметичная HEPA'], ['Регулировка мощности', 'Автоматическая по количеству пыли в режиме Auto'],
]);
add('Dyson V10 SV12 Cyclone', 'https://www.dyson.co.uk/vacuum-cleaners/cordless/v10/detail-cleaning-kit', [
  ['Двигатель', 'Dyson V10, до 125 000 об/мин'], ['Время работы', 'До 60 минут; зависит от режима и насадки'], ['Циклоны', '14'],
  ['Контейнер', '0,77 л'], ['Зарядка', '3,5 часа'], ['Фильтрация', 'Герметичная, 99,99% частиц от 0,3 мкм по тестам производителя'],
]);
add('Dyson V11 SV15 Fluffy', 'https://www.dyson.com.sg/products/vacuum-cleaners/dyson-v11/owners', [
  ['Конструкция', 'Вертикальный пылесос с преобразованием в ручной'], ['Индикация', 'LCD с остатком времени работы и состоянием устройства'],
  ['Режимы', 'Eco, Auto/Medium, Boost'], ['Аккумулятор', 'Съёмный, с фиксацией click-in'], ['Фильтр', 'Моющийся'],
]);
for (const model of ['Dyson HS05 Origin', 'Dyson HS05 Long']) add(model, 'https://www.dyson.co.uk/hair-care/hair-stylers/airwrap/complete-long-nickel-copper', [
  ['Технология укладки', 'Воздушный поток Coanda'], ['Двигатель', 'Dyson V9, до 110 000 об/мин'], ['Режимы', '3 температуры, 3 скорости и холодный обдув'],
  ['Воздушный поток', '13,5 л/с'], ['Контроль нагрева', 'Более 40 измерений в секунду, температура ниже 150 °C'], ['Ионизация', 'Отрицательные ионы для снижения статического электричества'],
]);
add('Dyson V10 SV18 Digital Slim Fluffy', 'https://www.dyson.com.sg/products/vacuum-cleaners/dyson-digital-slim/overview', [
  ['Мощность всасывания', '100 аВт'], ['Двигатель', 'Dyson Hyperdymium, до 120 000 об/мин'], ['Циклоны', '11'],
  ['Время работы', 'До 40 минут в режиме Eco на твёрдом полу'], ['Фильтрация', 'Герметичная пятиступенчатая'], ['Конструкция', 'Вертикальная с преобразованием в ручной пылесос'],
]);
for (const model of ['Dyson V16 SV53A Piston Animal', 'Dyson V16 SV53A Piston Animal Submarine']) add(model, `https://www.dyson.co.uk/vacuum-cleaners/cordless/v16-piston-animal/${model.endsWith('Submarine') ? 'submarine-black-copper' : 'black-copper'}`, [
  ['Мощность всасывания', '315 аВт'], ['Время работы', 'До 70 минут; зависит от режима, покрытия и насадки'], ['Объём контейнера', '1,3 л'],
  ['Фильтрация', '99,9% частиц размером от 0,1 мкм по тестам производителя'], ['Зарядка', '4,5 часа'], ['Контейнер', 'Сжатие пыли поршнем и гигиеничная очистка'],
  ['Тип уборки', model.endsWith('Submarine') ? 'Сухая и влажная' : 'Сухая'],
]);
add('Dyson PencilVac Fluffycones', 'https://www.dyson.com.tr/pencilvac-fluffycones-kablosuz-supurge', [
  ['Назначение', 'Сухая уборка твёрдых напольных покрытий'], ['Мощность всасывания', '55 аВт'], ['Объём контейнера', '0,08 л'],
  ['Время работы', 'До 30 минут в Eco; зависит от режима и покрытия'], ['Зарядка', '3,5 часа'], ['Вес', '1,8 кг'], ['Насадка', 'Fluffycones с четырьмя коническими валиками'],
]);
const insta = (models: string[], slug: string, specs: [string, string][]) => {
  for (const model of models) add(model, `https://store.insta360.com/product/${slug}`, specs);
};
add('OnePlus Nord Buds 4 Pro', 'https://www.oneplus.com/eg/oneplus-nord-buds-4-pro/specs', [
  ['Излучатель', 'Динамический, 12 мм'], ['Частотный диапазон', '20 Гц — 40 кГц'], ['Импеданс', '28 Ом'],
  ['Микрофоны', '6, по 3 в каждом наушнике'], ['Bluetooth', '6.0'], ['Аудиокодеки', 'LHDC 5.0, AAC, SBC'],
  ['Зарядка', 'USB-C'], ['Вес одного наушника', '4,4 ± 0,2 г'],
  ['Время прослушивания', 'До 13 часов; до 56 часов с кейсом. AAC, ANC выключено, громкость 50%, по тестам производителя'],
]);
for (const model of ['DJI Osmo 360 II Adventure Combo', 'DJI Osmo 360 II Standard Combo']) add(model, 'https://store.dji.com/sg/product/osmo-360-2', [
  ['Сенсор', '1″ для панорамной съёмки'], ['Панорамное видео', '8K, до 60 кадр/с с HDR'], ['Динамический диапазон', '14,5 ступени'],
  ['Ночная съёмка', 'AI SuperNight 2.0'], ['Объективы', 'Сменные, устойчивые к царапинам'], ['Хранение записи', '105 ГБ встроенного хранилища'],
]);
for (const model of ['DJI Osmo Pocket 4P Standard Combo', 'DJI Osmo Pocket 4P Vlog Combo']) add(model, 'https://store.dji.com/es/product/osmo-pocket-4p', [
  ['Камеры', 'Две камеры'], ['Основной сенсор', 'CMOS 1″'], ['Динамический диапазон', '17 ступеней'],
  ['Замедленная съёмка', '4K, до 240 кадр/с в поддерживаемом режиме'], ['Цветовой профиль', 'D-Log 2'],
  ['Стабилизация', 'Трёхосевая'], ['Отслеживание', 'ActiveTrack'], ['Фотографии Live Photo', 'Поддерживаются'],
]);
for (const model of ['DJI Mic Mini (1TX + 1RX)', 'DJI Mic Mini (2TX + 1 Mobile RX)', 'DJI Mic Mini (2TX + 1RX + Charging Case)', 'DJI Mic Mini Transmitter']) add(model, 'https://store.dji.com/es/product/dji-mic-mini', [
  ['Тип устройства', 'Беспроводной петличный микрофон'], ['Подключение к совместимым камерам', 'Прямое подключение DJI OsmoAudio'],
  ['Шумоподавление', 'Два уровня'], ['Защита от перегрузки звука', 'Автоматический ограничитель'],
]);
add('DJI Mic 3 (2TX + 1RX + Charging Case)', 'https://store.dji.com/es/product/dji-mic-3', [
  ['Внутренняя запись', '32-битный float, два файла'], ['Настройка усиления', 'Адаптивная'], ['Профили голоса', 'Три предустановки'],
  ['Шумоподавление', 'Два уровня'], ['Синхронизация записи', 'Встроенный таймкод'], ['Радиосвязь', 'Два диапазона'],
]);
add('DJI Mic Mini 2 (1TX + 1RX)', 'https://store.dji.com/es/product/dji-mic-mini-2-tx-rx', [
  ['Тип устройства', 'Беспроводной петличный микрофон'], ['Профили голоса', 'Три предустановки'], ['Шумоподавление', 'Два уровня'],
  ['Защита от перегрузки звука', 'Автоматический ограничитель'], ['Прямое подключение', 'DJI OsmoAudio'],
]);
add('DJI Power 1000 V2', 'https://store.dji.com/es/product/dji-power-1000-v2', [
  ['Ёмкость аккумулятора', '1024 Вт·ч'], ['Выходная мощность', '2600 Вт'], ['Порты USB-C', 'Два порта до 140 Вт'],
  ['Зарядка', 'От электросети; солнечные панели и автомобильное питание с совместимыми аксессуарами'],
  ['Расширение ёмкости', 'До 11 264 Вт·ч с дополнительными батареями'],
]);
add('Bowers & Wilkins Pi8', 'https://www.bowerswilkins.com/en-us/product/in-ear-headphones/pi8/', [
  ['Динамики', '12 мм Carbon Cone'], ['Bluetooth', '5.4'], ['Аудиокодеки', 'aptX Lossless, aptX Adaptive, aptX Classic, AAC, SBC'],
  ['Шумоподавление', 'Активное'], ['Защита наушников', 'IP54'], ['Микрофоны', 'По 3 в каждом наушнике'],
  ['Время работы', 'До 6,5 часов с ANC; ещё до 13,5 часов от кейса, по тестам производителя'], ['Зарядка', 'USB-C и беспроводная'],
]);
add('Bowers & Wilkins Px7 S3', 'https://www.bowerswilkins.com/en-us/product/over-ear-headphones/px7-s3/301020-84-00-308.html', [
  ['Динамики', 'Два динамических биоцеллюлозных излучателя 40 мм'], ['Bluetooth', '5.3'],
  ['Аудиокодеки', 'aptX Lossless, aptX Adaptive, aptX HD, aptX Classic, AAC, SBC'], ['Микрофоны', '8'],
  ['Время работы', 'До 30 часов по данным производителя'], ['USB-C', 'Зарядка и передача аудио'], ['Вес', '300 г без футляра'],
]);
add('MacBook Pro 14 M5 Max', 'https://support.apple.com/en-us/126318', [
  ['Процессор', 'Apple M5 Max'], ['Экран', '14,2″ Liquid Retina XDR'], ['Разрешение экрана', '3024 × 1964'],
  ['Частота обновления', 'ProMotion, до 120 Гц'], ['Разъёмы', 'Три Thunderbolt 5 (USB-C), HDMI, SDXC, MagSafe 3, аудио 3,5 мм'],
  ['Wi-Fi', 'Wi-Fi 7'], ['Bluetooth', '6'], ['Камера', '12 Мп Center Stage'], ['Аккумулятор', '72,4 Вт·ч'],
]);
add('MacBook Pro 16 M5 Pro', 'https://support.apple.com/en-us/126319', [
  ['Процессор', 'Apple M5 Pro'], ['Экран', '16,2″ Liquid Retina XDR'], ['Разрешение экрана', '3456 × 2234'],
  ['Частота обновления', 'ProMotion, до 120 Гц'], ['Разъёмы', 'Три Thunderbolt 5 (USB-C), HDMI, SDXC, MagSafe 3, аудио 3,5 мм'],
  ['Wi-Fi', 'Wi-Fi 7'], ['Bluetooth', '6'], ['Камера', '12 Мп Center Stage'],
]);
for (const size of ['11', '13']) add(`iPad Pro ${size} M5`, `https://support.apple.com/en-us/${size === '11' ? '125406' : '125407'}`, [
  ['Процессор', 'Apple M5'], ['Экран', `${size}″ Ultra Retina XDR, Tandem OLED`],
  ['Разрешение экрана', size === '11' ? '2420 × 1668' : '2752 × 2064'], ['Частота обновления', 'ProMotion, 10–120 Гц'],
  ['Яркость HDR', 'До 1600 нит в пике'], ['Разъём', 'Thunderbolt / USB 4'], ['Звук', 'Четыре динамика'],
  ['Совместимые стилусы', 'Apple Pencil Pro, Apple Pencil USB-C'],
]);
add('iPad Mini 7', 'https://support.apple.com/en-us/121456', [
  ['Процессор', 'Apple A17 Pro'], ['Экран', '8,3″ Liquid Retina IPS'], ['Разрешение экрана', '2266 × 1488'],
  ['Яркость экрана', '500 нит'], ['Основная камера', '12 Мп'], ['Фронтальная камера', '12 Мп, сверхширокоугольная'],
  ['Авторизация', 'Touch ID в верхней кнопке'], ['Разъём', 'USB-C'], ['Совместимые стилусы', 'Apple Pencil Pro, Apple Pencil USB-C'],
]);
add('AirPods 4 ANC', 'https://support.apple.com/en-us/121204', [
  ['Процессор', 'Apple H2'], ['Bluetooth', '5.3'], ['Шумоподавление', 'Активное; адаптивное аудио и режим прозрачности'],
  ['Защита', 'IP54'], ['Вес одного наушника', '4,3 г'], ['Зарядка кейса', 'USB-C, Qi или зарядное устройство Apple Watch'],
  ['Время прослушивания', 'До 4 часов с ANC; до 20 часов с кейсом и ANC, по тестам Apple'],
]);
for (const size of ['11', '13']) add(`iPad Air ${size} M2`, `https://support.apple.com/en-us/${size === '11' ? '119894' : '119893'}`, [
  ['Процессор', 'Apple M2, 8 ядер CPU и 9 ядер GPU'], ['Экран', `${size}″ Liquid Retina IPS`],
  ['Разрешение экрана', size === '11' ? '2360 × 1640' : '2732 × 2048'], ['Яркость экрана', size === '11' ? '500 нит' : '600 нит'],
  ['Основная камера', '12 Мп'], ['Фронтальная камера', '12 Мп, сверхширокоугольная, на длинной стороне корпуса'],
  ['Авторизация', 'Touch ID'], ['Разъём', 'USB-C'], ['Совместимые стилусы', 'Apple Pencil Pro, Apple Pencil USB-C'],
]);
add('Apple 60W USB-C Charge Cable (1m)', 'https://www.apple.com/shop/product/MW493AM/A/60w-usb-c-charge-cable-1-m', [
  ['Разъёмы', 'USB-C с обеих сторон'], ['Длина', '1 м'], ['Мощность зарядки', 'До 60 Вт'], ['Передача данных', 'USB 2'], ['Оплётка', 'Тканевая'],
]);
for (const size of ['11', '13']) add(`Apple Magic Keyboard iPad Air ${size} M3`, `https://support.apple.com/en-us/${size === '11' ? '122272' : '122273'}`, [
  ['Тип аксессуара', 'Клавиатура-чехол с трекпадом'], ['Совместимость', `iPad Air ${size}″ с M2, M3 и M4`],
  ['Подключение', 'Smart Connector'], ['Клавиши', 'Ножничный механизм, ход 1 мм'], ['Функциональный ряд', '14 клавиш'],
  ['Зарядка планшета', 'Сквозная через USB-C'], ['Конструкция', 'Магнитное крепление, регулировка угла наклона'],
]);
for (const size of ['11', '13']) add(`Apple Magic Keyboard iPad Pro ${size} M4`, `https://support.apple.com/en-us/${size === '11' ? '120125' : '120136'}`, [
  ['Тип аксессуара', 'Клавиатура-чехол с трекпадом'], ['Совместимость', `iPad Pro ${size}″ с M4 и M5`], ['Подключение', 'Smart Connector'],
  ['Клавиши', 'Подсветка, ножничный механизм, ход 1 мм'], ['Функциональный ряд', '14 клавиш'],
  ['Трекпад', 'Стеклянный, с тактильным откликом'], ['Зарядка планшета', 'Сквозная через USB-C'],
]);
for (const length of ['1', '2']) add(`Apple MagSafe Charger (${length}m)`, 'https://support.apple.com/en-us/105047', [
  ['Способ зарядки', 'Беспроводная, с магнитным выравниванием на совместимых iPhone'], ['Разъём питания', 'USB-C'],
  ['Длина кабеля', `${length} м`], ['Совместимость', 'MagSafe; устройства с поддержкой Qi'],
]);
add('Apple USB-C to Lightning Cable (1m)', 'https://www.apple.com/shop/product/muq93am/a/usb-c-to-lightning-cable-1-m', [
  ['Разъёмы', 'USB-C и Lightning'], ['Длина', '1 м'], ['Назначение', 'Зарядка и синхронизация устройств с Lightning'],
  ['Быстрая зарядка', 'На совместимых iPhone и iPad с подходящим USB-C адаптером'],
]);
add('Apple Power Adapter 20W USB-C', 'https://www.apple.com/shop/product/mwvv3am/a/20w-usb-c-power-adapter', [
  ['Тип устройства', 'Сетевой адаптер питания'], ['Выходная мощность', 'До 20 Вт'], ['Разъём', 'USB-C'],
  ['Назначение', 'Зарядка совместимых устройств USB-C'],
]);
for (const model of ['AirTag 1 Pack (2021)', 'AirTag 1 Pack (2026)', 'AirTag 4 Pack (2026)']) {
  const newer = model.includes('2026');
  add(model, `https://support.apple.com/en-us/${newer ? '126203' : '111847'}`, [
    ['Связь', 'Bluetooth, Ultra Wideband, NFC'], ['Чип точного поиска', newer ? 'Apple Ultra Wideband второго поколения' : 'Apple U1'],
    ['Батарея', 'Сменная CR2032'], ['Защита', 'IP67'], ['Размер одной метки', 'Диаметр 31,9 мм, толщина 8 мм'],
    ['Вес одной метки', newer ? '11,8 г' : '11 г'], ['Датчик', 'Акселерометр'], ['Звуковой поиск', 'Встроенный динамик'],
  ]);
}
add('JBL Xtreme 4', 'https://www.jbl.com/XTREME-4.html', [
  ['Мощность от сети', '2 × 30 Вт НЧ + 2 × 20 Вт ВЧ, RMS'], ['Мощность от аккумулятора', '2 × 20 Вт НЧ + 2 × 15 Вт ВЧ, RMS'],
  ['Частотный диапазон', '44 Гц — 20 кГц'], ['Bluetooth', '5.3'], ['Защита', 'IP67'], ['Вес', '2,1 кг'],
  ['Время работы', 'До 24 часов; до 30 часов с Playtime Boost, по тестам производителя'], ['Объединение колонок', 'Auracast'],
]);
add('JBL Xtreme 5', 'https://www.jbl.com/XTREME-5.html', [
  ['Мощность от сети', '90 Вт НЧ + 2 × 20 Вт ВЧ, RMS'], ['Мощность от аккумулятора', '60 Вт НЧ + 2 × 15 Вт ВЧ, RMS'],
  ['Частотный диапазон', '40 Гц — 20 кГц'], ['Защита', 'IP68'], ['Объединение колонок', 'Auracast'],
  ['Время работы', 'До 24 часов; до 28 часов с Playtime Boost, по тестам производителя'], ['Проводное аудио', 'USB-C, поддержка lossless'],
]);
add('JBL Boombox 4', 'https://www.jbl.com/BOOMBOX-4.html', [
  ['Bluetooth', '5.4'], ['Частотный диапазон', '37 Гц — 20 кГц'], ['Защита', 'IP68'], ['Аккумулятор', '99,02 Вт·ч'],
  ['Время работы', 'До 28 часов; до 34 часов с Playtime Boost, по тестам производителя'], ['Объединение колонок', 'Auracast'],
  ['Вес', '5,89 кг'], ['Габариты', '510 × 260 × 210 мм'], ['Проводное аудио', 'USB-C, поддержка lossless'],
]);
add('JBL Flip 7', 'https://www.jbl.com/FLIP-7.html', [
  ['Мощность', '25 Вт НЧ + 10 Вт ВЧ, RMS'], ['Bluetooth', '5.4'], ['Частотный диапазон', '60 Гц — 20 кГц'], ['Защита', 'IP68'],
  ['Аккумулятор', '17,28 Вт·ч'], ['Время работы', 'До 14 часов; до 16 часов с Playtime Boost, по тестам производителя'],
  ['Вес', '826 г'], ['Габариты', '183 × 70 × 72 мм'], ['Объединение колонок', 'Auracast'], ['Проводное аудио', 'USB-C, поддержка lossless'],
]);
for (const max of [false, true]) add(`Xiaomi 17 Pro${max ? ' Max' : ''}`, `https://www.mi.com/prod/xiaomi-17-pro${max ? '-max' : ''}`, [
  ['Процессор', 'Snapdragon 8 Elite Gen 5, 3 нм'], ['Диагональ основного экрана', max ? '6,9″' : '6,3″'],
  ['Обновление экрана', 'LTPO, адаптивное, до 120 Гц'], ['Ёмкость аккумулятора', max ? '7500 мА·ч' : '6300 мА·ч'],
  ['Проводная зарядка', 'До 100 Вт'], ['Беспроводная зарядка', 'До 50 Вт'], ['Оптика', 'Leica Summilux'],
]);
add('JBL Partybox On-The-Go 2', 'https://global.jbl.com/JBLPARTYBOXOTG2BAM.html', [
  ['Bluetooth', '5.4'], ['Частотный диапазон', '40 Гц — 20 кГц'], ['Динамики', 'НЧ 135 мм и два ВЧ 20 мм'],
  ['Аккумулятор', '34 Вт·ч'], ['Время работы', 'До 15 часов, зависит от громкости и аудиозаписи'],
  ['Габариты', '501 × 258 × 221 мм'], ['Вес', '6,36 кг'],
]);
add('JBL Partybox 720', 'https://www.jbl.com/bluetooth-speakers/PARTYBOX-720.html', [
  ['Мощность', '800 Вт RMS'], ['Bluetooth', '5.4'], ['Частотный диапазон', '32 Гц — 20 кГц'],
  ['Динамики', 'Два НЧ 243 мм и два ВЧ 30 мм'], ['Габариты', '416 × 942 × 406 мм'], ['Объединение колонок', 'Auracast'],
]);
add('Marshall Motif 2', 'https://www.marshall.com/in/en/product/motif-ii-anc', [
  ['Динамики', 'Динамические, 6 мм'], ['Импеданс', '16 Ом'], ['Частотный диапазон', '20 Гц — 20 кГц'], ['Bluetooth', '5.3 LE'],
  ['Шумоподавление', 'Активное, режим прозрачности'], ['Защита', 'Наушники IPX5; кейс IPX4'], ['Вес одного наушника', '4,31 г'],
  ['Время работы', 'До 6 часов с ANC; до 30 часов с кейсом и ANC, по данным производителя'],
]);
add('Marshall Acton 3', 'https://www.marshall.com/gt/en/product/acton-iii?pid=1006008', [
  ['Частотный диапазон', '45 Гц — 20 кГц'], ['Усилители', '30 Вт НЧ и два по 15 Вт ВЧ, класс D'], ['Bluetooth', '5.2'],
  ['Проводной вход', '3,5 мм'], ['Вес', '2,85 кг'], ['Питание', 'Электросеть 100–240 В, 50–60 Гц'], ['Настройка звука', 'Низкие и высокие частоты; приложение Marshall Bluetooth'],
]);
for (const model of ['Dyson HD07', 'Dyson HD08', 'Dyson HD15']) add(model, 'https://www.dyson.com.sg/dyson-supersonic-hair-dryer-prussian-blue-rich-copper-hd08', [
  ['Тип устройства', 'Фен Supersonic'], ['Воздушный поток', 'До 13,3 л/с'], ['Скорости потока', 'Три режима'],
  ['Контроль температуры', 'Интеллектуальный'], ['Ионизация', 'Отрицательные ионы для уменьшения статического электричества'],
]);
for (const model of ['Dyson HD17', 'Dyson HD18']) add(model, model === 'Dyson HD18' ? 'https://www.dyson.co.uk/content/dam/dyson/maintenance/user-guides/pl_pl/personalcare/dysonsupersonichairdryer/hd18/hd18_dyson_supersonic_r_professional_specyfikacja_techniczna_en.pdf' : 'https://www.dyson.com.sg/supersonic-r-plum-copper', [
  ['Тип устройства', 'Фен Supersonic r'], ['Воздушный поток', 'До 12,5 л/с'], ['Температурные режимы', 'Четыре, включая холодный обдув'],
  ['Скорости потока', 'Три режима'], ['Настройки насадок', 'RFID, распознавание и сохранение настроек'], ['Ионизация', 'Отрицательные ионы'],
]);
add('Dyson V8 SV25 Advanced', 'https://www.dyson.co.uk/vacuum-cleaners/cordless/v8/advanced', [
  ['Мощность всасывания', 'До 130 AW'], ['Время работы', 'До 40 минут; зависит от насадки, режима и поверхности'],
  ['Зарядка', 'Около 5 часов'], ['Объём контейнера', '0,54 л'], ['Режимы мощности', 'Два'], ['Циклоны', '15, Root Cyclone'],
]);
add('Dyson V8 SV10K Slim Fluffy', 'https://www.dyson.com.sg/dyson-v8-slim-fluffy-red', [
  ['Мощность всасывания', 'До 115 AW'], ['Время работы', 'До 40 минут; зависит от режима и поверхности'],
  ['Зарядка', 'Около 5 часов'], ['Объём контейнера', '0,54 л'], ['Двигатель', 'Dyson V8'], ['Фильтрация', 'Полная фильтрация устройства'],
]);
add('Dyson WR04 Pencil Wash', 'https://www.dyson.co.uk/floor-cleaners/wet/pencilwash/copper', [
  ['Тип уборки', 'Влажная, твёрдые полы'], ['Бак чистой воды', '0,3 л'], ['Бак грязной воды', '0,34 л'],
  ['Время работы', 'До 30 минут по данным производителя'], ['Режимы', 'Стандартный и MAX'], ['Экран', 'LED, заряд и уведомления об обслуживании'],
]);
add('Dyson HJ10', 'https://www.dyson.co.uk/air-treatment/purifiers/hushjet/white-silver', [
  ['Тип устройства', 'Очиститель воздуха HushJet'], ['Фильтры', 'Электростатический и активированный уголь'],
  ['Уровень шума в тихом режиме', '24 дБА'], ['Управление', 'Приложение MyDyson и голосовое управление'], ['Высота', '470 мм'],
]);
add('Dyson V8 Total Clean', 'https://www.dyson.co.uk/vacuum-cleaners/cordless/v8/total-clean-black', [
  ['Время работы', 'До 40 минут; зависит от режима и поверхности'], ['Зарядка', 'Около 5 часов'], ['Объём контейнера', '0,54 л'],
  ['Двигатель', 'Dyson V8, до 110 000 об/мин'], ['Фильтрация', 'Герметичная фильтрация устройства'],
]);
add('Dyson V8 SV25 Absolute', 'https://www.dyson.ae/en-AE/dyson-v8-absolute-silver-yellow', [
  ['Мощность всасывания', 'До 115 AW'], ['Время работы', 'До 40 минут с немоторизованной насадкой в обычном режиме'],
  ['Зарядка', 'Около 5 часов'], ['Объём контейнера', '0,54 л'], ['Циклонная система', '2 Tier Radial'],
]);
add('Dyson V15S SV47 Detect Absolute Submarine', 'https://www.dyson.co.nz/dyson-v15-submarine-absolute-448802-01-yellow-nickel', [
  ['Тип уборки', 'Сухая и влажная с насадкой Submarine'], ['Мощность всасывания', 'До 240 AW'], ['Время работы', 'До 60 минут в Eco на твёрдом полу'],
  ['Зарядка', 'Около 4,5 часа'], ['Объём контейнера', '0,77 л'], ['Циклоны', '14'], ['Двигатель', 'Hyperdymium'],
]);
add('Dyson TP10', 'https://www.dyson.com.sg/dyson-purifier-cool-gen1-white-white', [
  ['Тип устройства', 'Очиститель воздуха с вентилятором Purifier Cool Gen1'], ['Высота', '1050 мм'],
  ['Воздушный поток', 'До 290 л/с'], ['Основание', 'Диаметр 248 мм'],
]);
add('Marshall Stanmore 3', 'https://www.marshall.com/gb/en/product/stanmore-iii', [
  ['Частотный диапазон', '45 — 20 000 Гц'], ['Усилители', '50 Вт для НЧ-динамика и два по 15 Вт для ВЧ-динамиков, класс D'],
  ['Bluetooth', '5.2'], ['Проводные входы', '3,5 мм и RCA'], ['Акустическое оформление', 'Фазоинвертор'],
  ['Габариты', '350 × 203 × 188 мм'], ['Вес', '4,25 кг'], ['Регулировка звука', 'Низкие и высокие частоты на колонке и в приложении'],
]);
insta(['Insta360 X3'], 'x3', [
  ['Сенсор', '1/2″, 48 Мп'], ['Панорамные фотографии', '72 Мп'], ['Панорамное видео', '5,7K с Active HDR'],
  ['Видео с одним объективом', '4K, 30 кадр/с'], ['Экран', 'Сенсорный, 2,29″'], ['Аккумулятор', '1800 мА·ч'],
]);
insta(['Insta360 X4'], 'x4', [
  ['Панорамное видео', '8K (7680 × 3840), до 30 кадр/с'], ['Видео с одним объективом', '4K, до 60 кадр/с'],
  ['Замедленное панорамное видео', '4K, до 100 кадр/с'], ['Водозащита', 'Погружение до 10 м'],
  ['Время работы', 'До 135 минут по данным производителя; зависит от режима съёмки'], ['Защита объективов', 'Съёмные защитные элементы'],
]);
insta(['Insta360 X5', 'Insta360 X5 Essentials Bundle'], 'x5', [
  ['Сенсоры', 'Два сенсора 1/1,28″'], ['Обработка изображения', 'Три чипа с ИИ'], ['Ночная съёмка', 'PureVideo'],
  ['Режим InstaFrame', 'Одновременное сохранение плоского и панорамного видео'], ['Крепление', 'Резьба 1/4″'],
  ['Питание', 'Рекомендуется адаптер USB PD 9 В / 3 А; поддерживается 5 В / 3 А'],
]);
insta(['Insta360 X6', 'Insta360 X6 Essential Bundle'], 'x6', [
  ['Сенсоры', 'Два квадратных сенсора Sony 1/1,1″'], ['Обработка изображения', 'Три чипа с ИИ'],
  ['Крепление', 'Резьба 1/4″ и магнитное быстросъёмное соединение'], ['Хранение записи', 'Встроенное хранилище 47 ГБ и карты microSD'],
  ['Питание', 'Рекомендуется адаптер USB PD 9 В / 3 А; поддерживается 5 В / 3 А'],
]);
insta(['Insta360 Ace Pro 2 Dual Battery', 'Insta360 Ace Pro 2 Xplorer Bundle'], 'ace-pro-2', [
  ['Сенсор', '1/1,3″'], ['Объектив', 'Leica SUMMARIT'], ['Видео', '8K, до 30 кадр/с'],
  ['Видео с Active HDR', '4K, до 60 кадр/с'], ['Фотографии', '50 Мп'], ['Экран', 'Откидной сенсорный, 2,5″'],
  ['Обработка изображения', 'Два чипа: Pro Imaging и ИИ-чип 5 нм'], ['Цветовой профиль', 'I-Log'],
]);
insta(['Insta360 Go Ultra Creator Bundle', 'Insta360 Go Ultra Standard Bundle'], 'go-ultra', [
  ['Сенсор', '1/1,28″'], ['Видео', '4K, до 60 кадр/с'], ['Ночная съёмка', 'PureVideo'], ['HDR', 'Active HDR 4K'],
  ['Время работы камеры', 'До 70 минут по данным производителя'], ['Время работы с Action Pod', 'До 200 минут по данным производителя'],
  ['Хранение записи', 'Сменные карты microSD'], ['Минимальная дистанция съёмки', '30 см'],
]);
insta(['Insta360 Go 3S Standard Edition'], 'go-3s', [
  ['Видео', 'До 4K'], ['Замедленная съёмка', 'До 200 кадр/с в поддерживаемых режимах'], ['Битрейт', 'До 120 Мбит/с'],
  ['Объектив', 'Широкоугольный, режим MegaView'], ['Поиск устройства', 'Apple Find My'], ['Интервальная съёмка', 'Поддерживается'],
]);
for (const [model, gimbal] of [['Insta360 Link 2 Standard Bundle', true], ['Insta360 Link 2C Standard Bundle', false]] as const) insta([model], 'link-2', [
  ['Видео', 'До 4K'], ['Стабилизатор', gimbal ? 'Двухосевой подвес с отслеживанием пользователя' : 'Без подвеса; автоматическое кадрирование'],
  ['Звук', 'Шумоподавление с ИИ'], ['Совместимость', 'Windows и macOS'], ['Режим доски', 'Обычный и интеллектуальный'],
  ['Управление', 'Программа Link Controller; дистанционное управление со смартфона в той же сети Wi-Fi'],
]);
add('iPhone 15 Plus', 'https://support.apple.com/en-us/111830', [
  ['Тип экрана', 'Super Retina XDR OLED'], ['Диагональ экрана', '6,7″'], ['Разрешение экрана', '2796 × 1290'],
  ['Процессор', 'Apple A16 Bionic'], ['Основные камеры', '48 Мп + 12 Мп'], ['Фронтальная камера', '12 Мп TrueDepth'],
  ['Разъём', 'USB-C'], ['Защита', 'IP68'], ['Bluetooth', '5.3'], ['Wi-Fi', 'Wi-Fi 6'],
]);
add('iPhone 15 Pro', 'https://support.apple.com/en-us/111829', [
  ['Тип экрана', 'Super Retina XDR OLED'], ['Диагональ экрана', '6,1″'], ['Разрешение экрана', '2556 × 1179'],
  ['Частота обновления', 'Адаптивная, до 120 Гц'], ['Процессор', 'Apple A17 Pro'],
  ['Основные камеры', '48 Мп + 12 Мп + 12 Мп'], ['Оптический зум', 'Телеобъектив 3×'], ['Защита', 'IP68'], ['Разъём', 'USB-C'],
]);
add('iPhone 15 Pro Max', 'https://support.apple.com/en-us/111828', [
  ['Тип экрана', 'Super Retina XDR OLED'], ['Диагональ экрана', '6,7″'], ['Разрешение экрана', '2796 × 1290'],
  ['Частота обновления', 'Адаптивная, до 120 Гц'], ['Процессор', 'Apple A17 Pro'],
  ['Основные камеры', '48 Мп + 12 Мп + 12 Мп'], ['Оптический зум', 'Телеобъектив 5×'], ['Защита', 'IP68'], ['Разъём', 'USB-C'],
]);
add('iPhone 14 Plus', 'https://support.apple.com/en-us/111854', [
  ['Тип экрана', 'Super Retina XDR OLED'], ['Диагональ экрана', '6,7″'], ['Разрешение экрана', '2778 × 1284'],
  ['Процессор', 'Apple A15 Bionic'], ['Основные камеры', '12 Мп + 12 Мп'], ['Фронтальная камера', '12 Мп TrueDepth'],
  ['Защита', 'IP68'], ['Разъём', 'Lightning'],
]);
add('MacBook Neo 13', 'https://www.apple.com/macbook-neo/specs/', [
  ['Процессор', 'Apple A18 Pro, 6 ядер CPU, 5 ядер GPU'], ['Экран', '13″ Liquid Retina IPS'],
  ['Разрешение экрана', '2408 × 1506'], ['Яркость экрана', '500 нит'],
  ['Разъёмы', 'USB-C с USB 3, USB-C с USB 2, аудио 3,5 мм'], ['Аккумулятор', '36,5 Вт·ч'],
]);
for (const size of ['11', '13']) add(`iPad Air ${size} M4`, 'https://www.apple.com/ipad-air/specs/', [
  ['Процессор', 'Apple M4, 8 ядер CPU, 9 ядер GPU'], ['Экран', `${size}″ Liquid Retina IPS`],
  ['Разрешение экрана', size === '11' ? '2360 × 1640' : '2732 × 2048'], ['Яркость экрана', size === '11' ? '500 нит' : '600 нит'],
  ['Основная камера', '12 Мп'], ['Стилусы', 'Apple Pencil Pro, Apple Pencil USB-C'],
]);
add('Apple Watch SE3', 'https://www.apple.com/apple-watch-se-3/specs/', [
  ['Процессор', 'Apple S10, 64-битный двухъядерный'], ['Дисплей', 'Always-On Retina OLED LTPO'],
  ['Яркость дисплея', 'До 1000 нит'], ['Встроенная память', '64 ГБ'],
  ['Датчики', 'Оптический датчик пульса, температуры, компас, высотомер, акселерометр, гироскоп'],
]);
add('Apple Watch Series 10', 'https://support.apple.com/en-us/121202', [
  ['Процессор', 'Apple S10, 64-битный двухъядерный'], ['Дисплей', 'Always-On Retina OLED LTPO3'],
  ['Яркость дисплея', 'До 2000 нит'], ['Встроенная память', '64 ГБ'],
  ['Управление', 'Digital Crown, боковая кнопка, жест двойного касания'],
]);
for (const model of ['Apple Watch SE2 2023', 'Apple Watch SE2 2024']) add(model, 'https://support.apple.com/en-us/111853', [
  ['Процессор', 'Apple S8, 64-битный двухъядерный'], ['Дисплей', 'Retina OLED LTPO'],
  ['Яркость дисплея', 'До 1000 нит'], ['Встроенная память', '32 ГБ'], ['Операционная система', 'watchOS'],
]);
add('AirPods Max 2', 'https://www.apple.com/airpods-max/specs/', [
  ['Процессор', 'Apple H2 в каждой чашке'], ['Шумоподавление', 'Активное, режим прозрачности и адаптивное аудио'],
  ['Bluetooth', '5.3'], ['Микрофоны', '9'], ['Зарядка', 'USB-C'], ['Вес', '386,2 г с амбушюрами'],
  ['Время прослушивания', 'До 20 часов с активным шумоподавлением, по тестам производителя'],
]);
add('Sony WH-1000XM5', 'https://www.sony.co.uk/electronics/support/wireless-headphones-bluetooth-headphones/wh-1000xm5/specifications', [
  ['Конструкция', 'Закрытые полноразмерные'], ['Вес', 'Около 250 г'], ['Bluetooth', '5.2'],
  ['Кодеки', 'SBC, AAC, LDAC'], ['Время прослушивания', 'До 30 часов с шумоподавлением, до 40 часов без него'],
  ['Зарядка', 'USB, около 3,5 часа'],
]);
add('XREAL XBX A01+', 'https://www.xreal.com/xbxa01', [
  ['Тип устройства', 'Очки с виртуальным экраном'], ['Вес', '62 г'],
  ['Пиковая яркость', '1600 нит'], ['HDR', 'HDR10'], ['Угол обзора', '50°'],
  ['Виртуальный экран', 'Эквивалент 147″ на расстоянии 4 м'], ['Конструкция', 'Съёмная передняя рамка'],
]);
add('Infinix Note 60', 'https://ru.infinixmobility.com/note-60?ysclid=mo742lhokl456204355', [
  ['Процессор', 'MediaTek Dimensity 7400 Ultimate 5G'], ['Экран', '1,5K, до 144 Гц'],
  ['Основная камера', '50 Мп'], ['Аккумулятор', '6500 мА·ч'], ['Проводная зарядка', 'До 45 Вт'],
  ['Звук', 'Стереодинамики'], ['Операционная система', 'XOS 16'],
]);
add('Xiaomi Car Charger 100W', 'https://www.mi.com/shop/buy/detail?product_id=1222700019', [
  ['Тип устройства', 'Автомобильный зарядный адаптер'], ['Максимальная мощность', '100 Вт с совместимым устройством и кабелем'],
  ['Разъёмы', '1 USB-A + 1 USB-C (1A1C)'],
]);
add('Redmi A3 Pro', 'https://www.mi.com/africa-fr/product/redmi-a3-pro/specs/', [
  ['Процессор', 'MediaTek Helio G81-Ultra, до 2 ГГц'], ['Экран', '6,88″, 1640 × 720, до 90 Гц'],
  ['Основная камера', '50 Мп, f/1,8'], ['Фронтальная камера', '5 Мп, f/2,2'],
  ['Аккумулятор', '5160 мА·ч, типичная ёмкость'], ['Зарядка', 'До 18 Вт, USB-C'], ['Bluetooth', '5.4'], ['Wi-Fi', '2,4 и 5 ГГц'],
]);
add('Amazon Kindle 12 Starfish', 'https://www.aboutamazon.com/news/devices/which-kindle-to-buy', [
  ['Модель производителя', 'Kindle Paperwhite Kids, поколение 2024'], ['Экран', '7″, монохромный, без бликов'],
  ['Встроенная память', '16 ГБ'], ['Управление для родителей', 'Amazon Parent Dashboard'],
  ['Обложка', 'Дизайн Starfish'],
]);
add('Sony WH-1000XM5SA', 'https://www.sony.co.uk/store/product/wh1000xm5sab.ce7/WH-1000XM5SA-Soft-Case-Wireless-Noise-Cancelling-Headphones', [
  ['Тип наушников', 'Беспроводные полноразмерные'], ['Шумоподавление', 'Активное, с несколькими микрофонами'],
  ['Подключение', 'Bluetooth Multipoint'], ['Кодек', 'LDAC для совместимых устройств'],
  ['Время работы', 'До 30 часов по тестам Sony'], ['Комплектация версии SA', 'Мягкий чехол'],
]);
add('Google Fitbit Air Stephen Curry', 'https://store.google.com/product/google_fitbit_air_specs?hl=en-US', [
  ['Тип устройства', 'Фитнес-трекер'], ['Bluetooth', '5.0'],
  ['Датчики', 'Оптические датчики SpO₂, датчик температуры устройства'],
  ['Время работы', 'До 7 дней по тестам производителя; зависит от использования'],
  ['Хранение данных', '7 дней подробных данных движения, 30 дней ежедневных итогов'],
]);
add('Amazon Kindle 12 Colorsoft Signature Edition', 'https://www.aboutamazon.com/news/devices/kindle-color-specs-price-announce', [
  ['Экран', '7″ Colorsoft, цветной, без бликов'], ['Подсветка', 'Автоматическая регулировка яркости'],
  ['Зарядка', 'USB-C или беспроводная с совместимой станцией'],
  ['Время работы', 'До 8 недель по условиям тестирования Amazon'], ['Встроенная память', '32 ГБ'],
]);
for (const model of ['Ray-Ban Очки с камерой WAYFARER RW4012', 'Ray-Ban Wayfarer RW4012 Shiny Transparent', 'Ray-Ban Skyler RW4014 Shiny Peach/Brown Transitions (52)', 'Ray-Ban Skyler RW4014', 'Ray-Ban Headliner RW4013', 'Ray-Ban Headliner RW4013F']) add(model, 'https://www.ray-ban.com/usa/c/frequently-asked-questions-ray-ban-meta-smart-glasses', [
  ['Поколение', 'Ray-Ban Meta Gen 2'], ['Видео', 'До 3K Ultra HD'],
  ['Время работы', 'До 8 часов по тестам производителя; зависит от использования'],
  ['Зарядка', 'Через зарядный футляр'],
]);
add('Ray-Ban Skyler RW4010', 'https://www.ray-ban.com/usa/c/frequently-asked-questions-ray-ban-meta-smart-glasses', [
  ['Поколение', 'Ray-Ban Meta Gen 1'], ['Конструкция', 'Умные очки с камерой'],
  ['Время работы', 'До 4 часов по тестам производителя; зависит от использования'], ['Зарядка', 'Через зарядный футляр'],
]);
for (const model of ['Insta360 Flow 2 AI Tracket Bundle', 'Insta360 Flow 2 Standard Bundle']) add(model, 'https://onlinemanual.insta360.com/flow2/en-us/specs/hardware', [
  ['Тип устройства', 'Складной стабилизатор для смартфона'], ['Вес стабилизатора', 'Около 348 г без зажима'],
  ['Вес магнитного зажима', 'Около 25 г'], ['Размеры в сложенном виде', '178,4 × 97,9 × 36,7 мм без зажима'],
  ['Размеры смартфона', 'Толщина 6,9–10 мм, ширина 64–84 мм, вес 130–300 г'], ['Влагозащита', 'Отсутствует'],
]);
for (const model of ['Insta360 Luna Ultra Fill Light Bundle', 'Insta360 Luna Ultra Standard Bundle', 'Insta360 Luna Ultra Creator Combo', 'Insta360 Luna Pro Fill Light Bundle']) {
  const ultra = model.includes('Ultra');
  add(model, 'https://onlinemanual.insta360.com/lunaultra/en-us/specs/specs', [
    ['Тип камеры', 'Компактная камера с моторизованным стабилизатором'],
    ['Матрицы', ultra ? 'Основная 1″, телефото 1/1,3″' : 'Основная 1″'],
    ['Светосила', ultra ? 'Основной объектив f/1,8, телефото f/2,0' : 'f/1,8'],
    ['Аккумуляторы', 'Камера 1550 мА·ч, съёмный пульт с экраном 210 мА·ч'],
    ['Разъём', 'USB-C, USB 3.0'], ['Wi-Fi', '6 в камере, 4 в пульте'],
    ['Размеры', ultra ? '52,4 × 169,9 × 38,5 мм' : '52,78 × 155,7 × 38,47 мм'],
    ['Влагозащита', 'Водозащита и защита от брызг отсутствуют'],
  ]);
}
for (const model of ['Garmin CIRQA Smart Band', 'Garmin CIRQA Smart Band Captain']) add(model, 'https://www8.garmin.com/manuals/webhelp/GUID-D3BE589F-1A6C-4B6F-9ABC-07DB9AA6C739/EN-US/GUID-288B36E2-F702-441F-856C-4B1795689C95.html', [
  ['Аккумулятор', 'Встроенный литий-ионный, перезаряжаемый'], ['Время работы', 'До 10 дней по данным производителя'],
  ['Водостойкость', '5 ATM по условиям испытаний Garmin'], ['Температура зарядки', 'От 0 до 45 °C'],
]);
add('Oura Ring 5', 'https://ouraring.com/store/rings/oura-ring-5/black', [
  ['Материал', 'Титановая наружная и внутренняя поверхности'], ['Ширина', '6,09 мм'], ['Толщина', '2,28 мм'],
  ['Вес', 'От 2 г, зависит от размера'], ['Время работы', '6–9 дней; зависит от размера, настроек и использования'],
  ['Зарядка', 'Около 80 минут, зависит от уровня заряда; зарядное устройство соответствует размеру кольца'],
  ['Подключение', 'Bluetooth Low Energy'], ['Защита', 'IP68, водостойкость до 100 м по условиям производителя'],
]);
add('Canon PowerShot G7 X Mark III 30th Anniversary', 'https://www.usa.canon.com/shop/p/powershot-g7-x-mark-iii-graphite-kit-powershot-30th-anniversary-limited-edition', [
  ['Матрица', '1″ stacked CMOS, 20,1 Мп'], ['Процессор изображения', 'DIGIC 8'],
  ['Объектив', '24–100 мм в эквиваленте 35 мм, f/1,8–2,8'], ['Оптический зум', '4,2×'],
  ['Стабилизация', 'Оптическая'], ['Видео', '4K 30 кадров/с, Full HD 120 кадров/с'],
  ['Экран', '3″ сенсорный, наклон до 180° для селфи'],
]);
add('GoPro Hero 11 Mini', 'https://gopro.com/en/us/shop/cameras/hero11-black-mini/CHDHF-111-master.html', [
  ['Видео', '5,3K 60 кадров/с, 2,7K 240 кадров/с'], ['Стабилизация', 'HyperSmooth 5.0 с Horizon Lock'],
  ['Фото из видео', 'Кадры до 24,7 Мп'], ['Вес', '133 г'], ['Водозащита', 'До 10 м по условиям производителя'],
  ['Крепление', 'Два набора складных крепёжных ушек'],
]);
add('GoPro HERO 13', 'https://gopro.com/en/us/shop/cameras/learn/hero13black/CHDHX-131-master.html', [
  ['Видео', '5,3K 60 кадров/с, 4K 120 кадров/с, 2,7K 240 кадров/с'], ['Стабилизация', 'HyperSmooth 6.0'],
  ['Аккумулятор', 'Сменный Enduro 1900 мА·ч, совместим с HERO13 Black'], ['Wi-Fi', '6'],
  ['Навигация', 'GPS, наложение данных на видео'], ['HDR-видео', '10-битное HLG'],
]);
for (const model of ['GoPro Max 2', 'GoPro Max 2 Accessory Bundle']) add(model, 'https://gopro.com/en/us/shop/cameras/buy/max2/CHDHZ-311-master.html', [
  ['Тип камеры', 'Панорамная 360°'], ['Видео', 'До 8K в 360°; до 4K с одним объективом'],
  ['Панорамные фото', '29 Мп'], ['Объективы', 'Заменяемые пользователем защитные стеклянные линзы'],
  ['Микрофоны', '6, поддержка пространственного звука'], ['Редактирование', 'Рекадрирование 360° в GoPro Quik'],
]);
add('Steam Controller', 'https://store.steampowered.com/hardware/steamcontroller', [
  ['Стики', '2 магнитных TMR с ёмкостным определением касания'], ['Управление движением', '6-осевой IMU'],
  ['Подключение', 'Bluetooth, USB-C или беспроводной передатчик Steam Controller Puck'],
  ['Зарядка', 'USB-C или магнитная станция Puck'], ['Время работы', 'Более 35 часов по тестам производителя; зависит от использования'],
]);
add('Huawei FreeClip 2S', 'https://consumer.huawei.com/ro/headphones/freeclip2/buy/', [
  ['Конструкция', 'Открытые беспроводные наушники'], ['Время работы', 'До 9 часов, до 38 часов с кейсом по данным производителя'],
  ['Зарядка', 'USB-C или беспроводная'], ['Быстрая зарядка', '10 минут для прослушивания до 3 часов'],
]);
add('Honor 500 Pro', 'https://www.honor.com/cn/phones/honor-500-pro/', [
  ['Процессор', 'Qualcomm Snapdragon 8 Elite'], ['Экран', '6,55″, до 120 Гц'],
  ['Аккумулятор', '8000 мА·ч, типичная ёмкость; 7800 мА·ч, номинальная'],
  ['Проводная зарядка', 'До 80 Вт с совместимым зарядным устройством и кабелем'],
  ['Беспроводная зарядка', 'До 50 Вт с совместимым зарядным устройством'],
  ['Основная камера', '200 Мп; полное разрешение доступно в соответствующих режимах'], ['ШИМ экрана', '3840 Гц'],
]);
add('Honor 400 Smart', 'https://www.honor.com/it/phones/honor-400-smart/spec/', [
  ['Процессор', 'Qualcomm Snapdragon 685'], ['Диагональ экрана', '6,77″'],
  ['Основные камеры', '108 Мп + 2 Мп датчик глубины'], ['Фронтальная камера', '8 Мп'], ['Видео', 'До Full HD 1080p'],
]);
add('Fujifilm Instax Mini SE', 'https://www.instaxus.com/cameras/instax-mini-se/', [
  ['Плёнка', 'FUJIFILM instax mini, продаётся отдельно'], ['Размер снимка', '62 × 46 мм, карточка 86 × 54 мм'],
  ['Объектив', '60 мм'], ['Дистанция съёмки', 'От 0,6 м'], ['Выдержка', '1/60 с'],
  ['Экспозиция', 'Ручное переключение яркости'], ['Питание', '4 щелочные батарейки AA, 1,5 В'],
]);
add('Fujifilm Instax Mini Evo', 'https://www.fujifilm.com/us/en/consumer/instax/cameras/minievo/specifications', [
  ['Тип камеры', 'Гибридная цифровая камера с моментальной печатью'], ['Матрица', '1/5″ CMOS'],
  ['Разрешение снимков', '2560 × 1920'], ['Объектив', '28 мм в эквиваленте 35 мм'],
  ['Выдержка', '1/4–1/8000 с, автоматически'], ['Чувствительность', 'ISO 100–1600, автоматически'],
  ['Bluetooth', '4.2 BLE'], ['Эффекты', '10 эффектов объектива × 10 эффектов плёнки'],
]);
add('Fujifilm Instax Mini Evo Cinema', 'https://www.instax.com/mini_evo_cinema/fr/spec/', [
  ['Тип камеры', 'Гибридная камера с видео и моментальной печатью'], ['Матрица', '1/5″ CMOS'],
  ['Разрешение фото', '1920 × 2560'], ['Разрешение видео', '600 × 800; 1080 × 1440 в режиме качества 2020'],
  ['Объектив', '28 мм в эквиваленте 35 мм'], ['Выдержка', '1/4–1/8000 с'],
  ['Чувствительность', 'ISO 100–1600'], ['Плёнка', 'FUJIFILM instax mini, продаётся отдельно'],
]);
add('Huawei FreeClip 2', 'https://consumer.huawei.com/en/headphones/freeclip2/specs/', [
  ['Конструкция', 'Открытые наушники с креплением-клипсой'], ['Динамики', '10,8 мм, двойная диафрагма'],
  ['Частотный диапазон', '20 Гц – 20 кГц'], ['Bluetooth', '6.0, подключение к двум устройствам'],
  ['Время работы', 'До 9 часов, до 38 часов с кейсом; по тестам Huawei при громкости 50%'],
  ['Зарядка', 'USB-C или беспроводная, до 3 Вт'], ['Защита', 'Наушники IP57, кейс IP54'], ['Вес наушника', 'Около 5,1 г'],
]);
add('Fujifilm Instax Mini 13', 'https://instax.co.uk/cameras/mini-13/', [
  ['Плёнка', 'FUJIFILM instax mini, продаётся отдельно'], ['Размер снимка', '62 × 46 мм, карточка 86 × 54 мм'],
  ['Объектив', '60 мм, f/12,7'], ['Экспозиция', 'Автоматическая'], ['Выдержка', '1/2–1/250 с'],
  ['Дистанция съёмки', 'От 0,3 м; режим крупного плана для 0,3–0,5 м'], ['Питание', '2 щелочные батарейки AA (LR6)'],
  ['Размеры', '105,5 × 124,7 × 67,6 мм'],
]);
add('Google Pixel 7', 'https://support.google.com/pixelphone/answer/7158570?hl=en-gb', [
  ['Процессор', 'Google Tensor G2, сопроцессор безопасности Titan M2'], ['Экран', '6,3″ OLED, 2400 × 1080, до 90 Гц'],
  ['Основные камеры', '50 Мп широкоугольная + 12 Мп ультраширокая'], ['Фронтальная камера', '10,8 Мп'],
  ['Видео', '4K до 60 кадров/с'], ['Аккумулятор', '4355 мА·ч, типичная ёмкость'],
  ['Разъём', 'USB-C 3.2 Gen 2'], ['Bluetooth', '5.2'], ['Защита', 'IP68 по условиям испытаний производителя'],
]);
add('Redmi Note 14 5G', 'https://www.mi.com/lk/product/redmi-note-14-5g/specs/', [
  ['Процессор', 'MediaTek Dimensity 7025-Ultra, 6 нм'], ['Экран', '6,67″ AMOLED, 2400 × 1080, до 120 Гц'],
  ['Основные камеры', '108 Мп с OIS + 8 Мп ультраширокая + 2 Мп макро'], ['Аккумулятор', '5110 мА·ч, типичная ёмкость'],
  ['Зарядка', 'До 45 Вт'], ['Bluetooth', '5.3'], ['Wi-Fi', '802.11 a/b/g/n/ac, 2,4 и 5 ГГц'],
]);
add('Sony Xperia 1 VII', 'https://www.sony.jp/xperia/products/xperia1m7/spec.html', [
  ['Процессор', 'Qualcomm Snapdragon 8 Elite'], ['Диагональ экрана', '6,5″'], ['Аккумулятор', '5000 мА·ч'],
  ['Защита', 'Пылезащита IP6X, водозащита IPX5 / IPX8 по условиям испытаний производителя'],
]);
add('Redmi Note 14S', 'https://www.mi.com/co/product/redmi-note-14s/specs/', [
  ['Процессор', 'MediaTek Helio G99-Ultra, 6 нм'], ['Экран', '6,67″ AMOLED, 2400 × 1080, до 120 Гц'],
  ['Основные камеры', '200 Мп с OIS + 8 Мп ультраширокая + 2 Мп макро'], ['Фронтальная камера', '16 Мп'],
  ['Аккумулятор', '5000 мА·ч, типичная ёмкость'], ['Зарядка', 'До 67 Вт, USB-C'], ['Bluetooth', '5.3'], ['Wi-Fi', '802.11 a/b/g/n/ac'],
]);
add('Realme 15', 'https://www.realme.com/bd/realme-15-5g/specs', [
  ['Процессор', 'MediaTek Dimensity 7300+ 5G'], ['Экран', '6,77″ AMOLED, 2392 × 1080, до 144 Гц'],
  ['Основные камеры', '50 Мп Sony IMX882 с OIS + 8 Мп ультраширокая'], ['Фронтальная камера', '50 Мп'],
  ['Аккумулятор', '7000 мА·ч, типичная ёмкость'], ['Зарядка', 'До 80 Вт, USB-C'], ['Bluetooth', '5.4'], ['Wi-Fi', '5 / 6, 2,4 и 5 ГГц'],
]);
for (const model of ['Xbox Controller', 'Xbox Controller Deep', 'Xbox Controller Pulse']) add(model, 'https://www.xbox.com/en-US/accessories/controllers/xbox-wireless-controller', [
  ['Совместимость', 'Xbox Series X|S, Xbox One, Windows и совместимые мобильные устройства'],
  ['Питание', 'Батарейки AA; до 40 часов по тестам Microsoft, зависит от использования'],
  ['Настройка кнопок', 'Переназначение в приложении Xbox Accessories'],
]);
for (const [model, code, megapixels] of [
  ['Sony A7 IV Body', 'ilce-7m4', '33'], ['Sony A7 III Body', 'ilce-7m3', '24,2'], ['Sony A7C Body', 'ilce-7c', '24,2'],
]) add(model, `https://www.sony.com/electronics/support/e-mount-body-ilce-7-series/${code}/specifications`, [
  ['Тип камеры', 'Беззеркальная со сменными объективами'], ['Матрица', `Полнокадровая Exmor R CMOS, ${megapixels} Мп`],
  ['Байонет', 'Sony E'], ['Видео', code === 'ilce-7m4' ? '4K до 60 кадров/с; при 50/60 кадрах/с используется область APS-C / Super 35' : '4K до 30 кадров/с'],
  ['Комплектация объектива', 'Body — без объектива'],
]);
add('Bang & Olufsen BeoPlay H95', 'https://bangolufsenrmaskillgohel.blob.core.windows.net/zendesk-guide/User%20Guide%20Files/Headphones/Beoplay%20H95/Product-sheet_H95_EN.pdf', [
  ['Динамики', 'Титановые, 40 мм'], ['Частотный диапазон', '20 Гц – 22 кГц'], ['Bluetooth', '5.1'],
  ['Кодеки', 'SBC, AAC, aptX Adaptive'], ['Шумоподавление', 'Адаптивное ANC и режим прозрачности'],
  ['Время работы', 'До 38 часов с ANC, до 50 часов без ANC по тестам производителя'],
  ['Аккумулятор', '1200 мА·ч, типичная ёмкость'], ['Зарядка', 'USB-C'],
]);
add('Bang & Olufsen Beoplay EX Oxygen', 'https://www.bang-olufsen.com/en/us/comparison/products?p1=beoplay-ex&p2=beoplay-eleven&p3=beoplay-h100&slug=headphones', [
  ['Конструкция', 'Беспроводные внутриканальные'], ['Динамики', 'Неодимовые, 9,2 мм'],
  ['Шумоподавление', 'Адаптивное активное ANC'], ['Защита наушников', 'IP57'],
]);
add('Marshall Woburn 2', 'https://www.marshall.com/in/en/support/speakers/support-for-woburn-ii-bluetooth', [
  ['Усилители', '2 × 50 Вт класса D для НЧ, 2 × 15 Вт класса D для ВЧ'],
  ['Динамики', '2 сабвуфера 5,25″, 2 ВЧ по 1″'], ['Bluetooth', '5.0, aptX'],
  ['Подключения', 'Bluetooth, AUX и RCA'], ['Управление', 'Регуляторы громкости, низких и высоких частот'],
]);
add('JBL Flip 6', 'https://support.jbl.com/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw08391c21/pdfs/JBL_Flip_6_SpecSheet_English.pdf', [
  ['Мощность', '20 Вт RMS НЧ + 10 Вт RMS ВЧ'], ['Динамики', 'НЧ 45 × 80 мм, ВЧ 16 мм'],
  ['Частотный диапазон', '63 Гц – 20 кГц'], ['Bluetooth', '5.1'],
  ['Время работы', 'До 12 часов; зависит от громкости и аудиоматериала'], ['Зарядка', 'Около 2,5 часа при 5 В / 3 А'], ['Вес', '550 г'],
]);
add('JBL Partybox 320', 'https://www.jbl.com/on/demandware.static/-/Sites-masterCatalog_Harman/default/dwc1d3e48b/pdfs/JBL_PARTYBOX_STAGE_320_OM_Global_EN_V4.pdf', [
  ['Мощность', '240 Вт RMS'], ['Динамики', '2 НЧ по 165 мм, 2 ВЧ по 25 мм'], ['Частотный диапазон', '40 Гц – 20 кГц (−6 дБ)'],
  ['Bluetooth', '5.4'], ['Защита', 'IPX4'], ['Время работы', 'До 18 часов; зависит от громкости и аудиоматериала'],
  ['Зарядка', 'Около 3 часов при выключенной колонке'], ['Вес', '16,5 кг'],
]);
add('Harman/Kardon Aura Studio 4', 'https://www.harmankardon.com/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw0987a691/pdfs/HK_Aura_Studio_4_Spec_Sheet_EN.pdf', [
  ['Мощность', '2 × 15 Вт + 100 Вт RMS'], ['Динамики', '6 × 40 мм, сабвуфер 130 мм'],
  ['Частотный диапазон', '45 Гц – 20 кГц (−6 дБ)'], ['Bluetooth', '4.2'], ['Питание', '100–240 В, 50/60 Гц'], ['Вес', '3,6 кг'],
]);
add('JBL Partybox 330', 'https://www.jbl.com/PARTYBOX-330.html', [
  ['Динамики', '2 НЧ по 165 мм, 2 ВЧ по 25 мм'], ['Частотный диапазон', '40 Гц – 20 кГц (−6 дБ)'],
  ['Bluetooth', '6.0'], ['Защита', 'IPX4'], ['Аккумулятор', 'Сменный JBL Battery 400, 68 Вт·ч'],
  ['Время работы', 'До 18 часов; зависит от громкости и аудиоматериала'], ['Зарядка', 'Около 3 часов'],
  ['Вес', '17,1 кг'], ['Подключения', 'AUX 3,5 мм, входы микрофонов и гитары, Auracast'],
]);
add('Harman/Kardon Onyx Studio 9', 'https://www.harmankardon.com/on/demandware.static/-/Sites-masterCatalog_Harman/default/dwe835c0f1/pdfs/Harman_Kardon_Onyx_Studio_9_Spec_Sheet_EN.pdf', [
  ['Мощность', '50 Вт RMS'], ['Динамики', 'НЧ 120 мм, 3 ВЧ по 20 мм'], ['Частотный диапазон', '50 Гц – 20 кГц (−6 дБ)'],
  ['Bluetooth', '5.3'], ['Питание', '100–240 В, 50/60 Гц'], ['Настройка', 'Эквалайзер в Harman Kardon One'],
  ['Стереопара', 'Беспроводное объединение двух Onyx Studio 9'],
]);
add('Harman/Kardon Aura Studio 5', 'https://support.harmankardon.com/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw01666d53/pdfs/HK_Aura_Studio_5_Spec_Sheet_EN.pdf', [
  ['Мощность', '2 × 20 Вт + 20 Вт + 100 Вт RMS'], ['Динамики', '6 × 40 мм, ВЧ 25 мм, сабвуфер 143 мм'],
  ['Частотный диапазон', '45 Гц – 20 кГц (−6 дБ)'], ['Bluetooth', '5.4'], ['Питание', '100–240 В, 50/60 Гц'],
  ['Размеры', '306,4 × 234 × 234 мм'], ['Настройка', 'Звук и подсветка через Harman Kardon One'],
]);
add('Beats Solo 4', 'https://www.beatsbydre.com/headphones/solo4-wireless', [
  ['Конструкция', 'Накладные, складные'], ['Динамики', '40 мм'], ['Bluetooth', '5.3, Class 1'],
  ['Проводное подключение', 'USB-C с lossless-аудио или аналоговый вход 3,5 мм'],
  ['Зарядка', 'USB-C'], ['Время работы', 'До 50 часов по тестам производителя'],
  ['Быстрая зарядка', '10 минут для прослушивания до 5 часов'], ['Вес', '217 г'],
]);
add('Beats Powerbeats Pro 2', 'https://www.beatsbydre.com/earbuds/powerbeats-pro-2', [
  ['Конструкция', 'Внутриканальные, с заушными креплениями'], ['Процессор', 'Apple H2'],
  ['Шумоподавление', 'Активное ANC, режим прозрачности'], ['Защита наушников', 'IPX4'],
  ['Датчики', 'Мониторинг пульса во время тренировок с совместимыми приложениями'],
  ['Время работы', 'До 10 часов, до 45 часов с кейсом по тестам производителя'],
  ['Зарядка кейса', 'USB-C или беспроводная Qi'], ['Быстрая зарядка', '5 минут для прослушивания до 1,5 часа'],
]);
add('Oura Ring 4', 'https://ouraring.com/product/rings', [
  ['Материал', 'Титан, внутренняя и внешняя поверхности'], ['Формат', 'Умное кольцо'],
  ['Время работы', '5–8 дней по тестам производителя; зависит от размера и использования'],
  ['Зарядка', 'Через зарядную станцию для соответствующего размера кольца'],
]);
