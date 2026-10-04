import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { catalogItems } from '../lib/catalog-registry';

type Entry = { name?: string; content?: string; propertycode?: string; propertyvalue?: string };
type Component = { attr?: { spuData?: { parameterData?: { GroupName: string; nameDetailList?: Entry[] }[] }; parameterCn?: { parameterList?: { list?: Entry[] }[] } } };
const sources: [string, string, string][] = [
  ['phone13sspecs', 'OnePlus 13S', 'https://www.oneplus.in/13s/specs'],
  ['phone15tspecs', 'OnePlus 15T', 'https://www.oneplus.com/cn/15t/specs'],
  ['pad4specs', 'OnePlus Pad 4', 'https://www.oneplus.com/sg/pad-4/specs'],
  ['ce5', 'OnePlus Nord CE5', 'https://www.oneplus.com/il/nord-ce5/specs'],
  ['ce6', 'OnePlus Nord CE6', 'https://www.oneplus.com/ru/nord-ce6/specs'],
  ['nord5', 'OnePlus Nord 5', 'https://www.oneplus.com/be_nl/nord-5/specs'],
  ['nord6specs', 'OnePlus Nord 6', 'https://www.oneplus.com/no/nord-6/specs'],
  ['buds4', 'OnePlus Buds 4', 'https://www.oneplus.com/us/oneplus-buds-4/specs'],
  ['nordbuds4pro', 'OnePlus Nord Buds 4 Pro', 'https://www.oneplus.com/eg/oneplus-nord-buds-4-pro/specs'],
];
const labels: Record<string, string> = {
  height: 'Высота', width: 'Ширина', length: 'Длина', thickness: 'Толщина', weight: 'Вес', size: 'Диагональ экрана', 'screen size': 'Диагональ экрана',
  resolution: 'Разрешение экрана', 'refresh rate': 'Частота обновления экрана', type: 'Тип экрана', 'panel type': 'Тип экрана',
  'operating system': 'Операционная система', platform: 'Процессор', chipset: 'Процессор', 'processing platform': 'Процессор', cpu: 'CPU', gpu: 'GPU',
  battery: 'Аккумулятор', 'battery capacity': 'Ёмкость аккумулятора', charge: 'Зарядка', charging: 'Зарядка',
  drivers: 'Динамики', 'frequency response': 'Частотный диапазон', microphones: 'Микрофоны', impedance: 'Импеданс',
  'bluetooth® version': 'Bluetooth', 'bluetooth® codec': 'Аудиокодеки Bluetooth', 'noise cancellation type': 'Шумоподавление',
  'charging interface': 'Разъём зарядки', 'charging time': 'Время зарядки', speakers: 'Динамики', brightness: 'Яркость экрана',
  'ram type': 'Тип оперативной памяти', 'rom specifications': 'Тип накопителя', 'noise control modes': 'Режимы шумоподавления',
  hoogtе: 'Высота', hoogte: 'Высота', breedte: 'Ширина', dikte: 'Толщина', gewicht: 'Вес', maten: 'Диагональ экрана', resolutie: 'Разрешение экрана',
  vernieuwingsfrequentie: 'Частота обновления экрана', paneeltype: 'Тип экрана', besturingssysteem: 'Операционная система', batterij: 'Аккумулятор',
  høyde: 'Высота', bredde: 'Ширина', tykkelse: 'Толщина', vekt: 'Вес', størrelse: 'Диагональ экрана', oppløsning: 'Разрешение экрана',
  'الميكروفونات': 'Микрофоны', 'المقاومة': 'Импеданс', 'برامج التشغيل': 'Динамики', 'الاستجابة الترددية': 'Частотный диапазон',
  'إصدَار bluetooth®': 'Bluetooth', 'برنامج ترميز bluetooth®‎': 'Аудиокодеки Bluetooth', 'واجهة الشحن': 'Разъём зарядки',
  FUSELAGE_LENGTH: 'Высота', BODY_WIDTH: 'Ширина', BODY_THICKNESS: 'Толщина', BODY_WEIGHT: 'Вес', PROCESSING_PLATFORM: 'Процессор',
  CPU_MANUFACTURING_PROCESS: 'Техпроцесс', GPU_MODEL: 'GPU', RAM_SPECIFICATIONS: 'Тип оперативной памяти', ROM_SPECIFICATIONS: 'Тип накопителя',
  SCREEN_SIZE: 'Диагональ экрана', SCREEN_TYPE: 'Тип экрана', SCREEN_RESOLUTION: 'Разрешение экрана', SCREEN_REFRESH_RATE: 'Частота обновления экрана',
};
const key = (value: string) => value.normalize('NFKC').toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
const translate = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/™|®/g, '').replace(/measured diagonally from corner to corner|diagonaal gemeten van hoek tot hoek/g, 'по диагонали')
  .replace(/inches|inch|英寸/g, 'дюйма').replace(/毫米|\bmm\b/g, 'мм').replace(/纳米/g, 'нм').replace(/约/g, 'около ').replace(/克|\bg\b/g, 'г')
  .replace(/mAh/g, ' мА·ч').replace(/\bHz\b/g, 'Гц').replace(/hours/g, 'ч').replace(/\bW\b/g, 'Вт').replace(/Up to|up to|Tot /g, 'До ')
  .replace(/Fifth-generation Snapdragon|第五代骁龙8至尊版移动平台/g, 'Snapdragon 8 Elite Gen 5').replace(/Mobile Platform/g, '').replace(/based on/g, 'на базе')
  .replace(/Earbuds:/g, 'Наушники:').replace(/Charging [Cc]ase:/g, 'Кейс:').replace(/Total:/g, 'Всего:').replace(/Real-Time Adaptive Active Noise Cancellation/g, 'Адаптивное активное шумоподавление')
  .replace(/woofer/g, 'НЧ-динамик').replace(/tweeter/g, 'ВЧ-динамик').replace(/mics per side/g, 'микрофона с каждой стороны').replace(/\s+/g, ' ').trim();
const file = 'data/official-model-specifications.json', saved = JSON.parse(readFileSync(file, 'utf8'));
for (const [cache, model, source] of sources) {
  const path = `.tmp-qa/oneplus/${cache}-pageDsl.json`;
  if (!existsSync(path)) continue;
  const data = JSON.parse(readFileSync(path, 'utf8')) as { byId: Record<string, Component> };
  const groups = Object.values(data.byId).flatMap(component => [
    ...(component.attr?.spuData?.parameterData ?? []).map(group => ({ title: group.GroupName, rows: group.nameDetailList ?? [] })),
    ...(component.attr?.parameterCn?.parameterList ?? []).map(group => ({ title: '', rows: group.list ?? [] })),
  ]);
  const declared = groups.flatMap(group => group.rows).find(row => row.name === 'SPU_NAME' || row.propertycode === 'SPU_NAME_CN');
  if (declared && key((declared.content ?? declared.propertyvalue ?? '').replace(/一加/g, 'OnePlus')) !== key(model)) throw Error(`OnePlus model mismatch: ${model}`);
  const specs: [string, string][] = [];
  const add = (label: string, value: string) => { if (label && value && value.length < 400 && !/[\u3400-\u9fff\u0600-\u06ff]/.test(value) && !specs.some(([name]) => name === label)) specs.push([label, value]); };
  for (const group of groups) for (const row of group.rows) {
    if (group.title === 'General') continue;
    const name = row.propertycode ?? row.name ?? '', content = row.propertyvalue ?? row.content ?? '';
    const label = labels[name] ?? labels[key(name).replace(/:$/, '')] ?? (/^[А-Яа-яЁё]/.test(name) && !/памят|ram|конфигурац|функции|озу|поддерж|доступ/i.test(name) ? name : '');
    if (label && !/parameters|features/i.test(name) && !/size/i.test(name) || row.propertycode === 'SCREEN_SIZE') add(label, translate(content));
    if (label && /size/i.test(name) && /Display/.test(group.title)) add(label, translate(content));
    if (!name || /parameters|параметры/i.test(name)) for (const line of content.split(/[\r\n]+/)) {
      const pair = line.match(/^([^:]{2,55}):\s*(.+)$/);
      if (!pair) continue;
      const label = labels[key(pair[1])] ?? (/^[А-Яа-яЁё]/.test(pair[1]) && !/памят|ram|конфигурац|расширен|цвет|тепло|сенсорный|рейтинг/i.test(pair[1]) ? pair[1] : '');
      add(label, translate(pair[2]));
    }
    if (!name && /^(?:Charge|Зарядка)$/.test(group.title)) add('Зарядка', translate(content));
  }
  if (specs.length >= 3) saved[key(model)] = { source, name: model, specs, scope: 'model' };
  console.log(model, specs.length, catalogItems.filter(item => key(item.model) === key(model)).length);
}
writeFileSync(file, JSON.stringify(saved, null, 2) + '\n');
