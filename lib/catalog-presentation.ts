import type { CatalogItem } from './catalog-registry';

// Exact manufacturer part numbers from Apple's model-identification guides.
// https://support.apple.com/en-us/102869
// https://support.apple.com/en-us/108052
// https://salesdownload.apple.com/public/sites/asw/common/compliance/index.htm
const macModels: Record<string, string> = {};
function macParts(parts: string, model: string) {
  for (const part of parts.split(' ')) macModels[part] = model;
}
macParts('MDV94 MDVA4 MDVC4 MDVD4 MDVE4 MDVF4 MDVH4 MDVK4 MDVN4 MDVQ4 MDVT4 MDVU4', 'MacBook Air 15 M5');
macParts('MDH74 MDH84 MDH94 MDHA4 MDHC4 MDHD4 MDHE4 MDHF4 MDHG4 MDHH4 MDHJ4 MDHK4', 'MacBook Air 13 M5');
macParts('MDE04 MDE14 MDE34 MDE44 MDE54 MDE64 MJ3D4 MJ3E4', 'MacBook Pro 14 M5');
macParts('MGDN4 MGDP4 MGDQ4 MGDR4 MGDT4 MGDU4', 'MacBook Pro 14 (2026)');
macParts('MGE44 MGE64 MGE74 MGE94 MGEA4 MGEC4 MGED4 MGEE4', 'MacBook Pro 16 (2026)');
macParts('MKGP3 MKGQ3 MKGR3 MKGT3', 'MacBook Pro 14 (2021)');
macParts('MX2T3 MX2U3 MX2V3 MX2W3 MX2X3 MX2Y3 MX303 MX313', 'MacBook Pro 16 (2024)');
// Apple's shop resolves these exact part numbers to the named models.
// https://www.apple.com/shop/product/MJLV4LL/A
// https://www.apple.com/shop/product/MHFD4LL/A (and the other Neo parts below)
macParts('MJLV4 MJLW4', 'MacBook Pro 14 M5 Pro');
macParts('MHFD4 MHFF4 MHFH4 MHFE4 MHFC4 MHFG4', 'MacBook Neo 13');
// Individual shop pages also identify the chip, rather than only the generation.
// https://www.apple.com/shop/product/MGE94LL/A
// https://www.apple.com/shop/product/MGDQ4LL/A
macParts('MGDR4', 'MacBook Pro 14 M5 Pro');
macParts('MGDQ4 MGDU4', 'MacBook Pro 14 M5 Max');
macParts('MGE44', 'MacBook Pro 16 M5 Pro');
macParts('MGE74 MGE94 MGED4', 'MacBook Pro 16 M5 Max');

const colors = [
  'Dune Glow', 'Sage Mist', 'Marble Mist',
  'Malachite Green', 'Fir Green',
  'Techno Red', 'Rhythm Blue', 'Chroma Teal', 'Chroma Pearl', 'Chroma Indigo',
  'Sterling Silver', 'Galactic Purple', 'Starlight Blue', 'Cosmic Red', 'Midnight Black', 'Gray Camouflage', 'Nova Pink',
  'Indigo Blue', 'Dark Gray', 'Dark Grey', 'Light Gray', 'Light Grey', 'Carbon Black', 'Shock Blue', 'Matte Black',
  'Blue/Copper', 'Blue Copper', 'Jasper Plum', 'Ceramic Pink', 'Vinca Blue',
  'Anthracite Tan', 'Gentle Rose', 'Sand', 'Squad', 'Fog', 'Berry', 'Mauve',
  'Brushed Silver', 'Stealth', 'Shiny Black', 'Shiny Cosmic Blue', 'Cobalt Blue',
  'Storm Gray', 'Cloud Gray', 'Royal Burgundy', 'Tan', 'Teal', 'Lilac', 'Olive',
  'Charcoal', 'Jetblack', 'Blueblack', 'Blueberry', 'Pistachio', 'Fog',
  'Ultramarine', 'Amber Silk', 'Ceramic Apricot', 'Ceramic Patina', 'Ceramic Pop', 'Red Velvet',
  'Strawberry Bronze', 'Kanzan Pink', 'Nickel/Copper', 'Nickel/Purple',
  'Blue/Black', 'White/Gold', 'White/White', 'Black/Nickel', 'Nickel/Gold',
  'Red/Iron', 'Nickel/Nickel', 'Nickel/Red', 'Yellow/Nickel', 'Copper/Black',
  'Silver/Yellow', 'Silver/Nickel',
  'Space Black', 'Space Gray', 'Sky Blue', 'Cosmic Orange', 'Deep Blue', 'Natural Titanium',
  'White Titanium', 'Black Titanium', 'Desert Titanium', 'Blue Titanium', 'Deep Purple', 'Light Gold', 'Rose Gold', 'Pink Gold',
  'Cloud White', 'French Gray', 'Graphite', 'Starlight', 'Midnight', 'Silver', 'Black',
  'White', 'Blue', 'Green', 'Pink', 'Purple', 'Red', 'Yellow', 'Orange', 'Gold', 'Gray', 'Cyan', 'Brown',
  'Grey', 'Cream', 'Violet', 'Lavender', 'Indigo', 'Citrus', 'Blush', 'Obsidian', 'Porcelain', 'Natural', 'Desert', 'Dark Cherry', 'Cherry',
  'Hazel', 'Mint', 'Navy', 'Icyblue', 'Pinkgold', 'бежевый', 'чёрный', 'черный', 'белый',
  'зелёный', 'зеленый', 'серый', 'фиолетовый', 'розовый', 'синий', 'красный',
];
const colorPattern = colors.slice().sort((a, b) => b.length - a.length).join('|');
const colorBeforeDetail = new RegExp(`\\s+(${colorPattern})(?=\\s*(?:\\(|USB-C\\b|Lightning\\b|Sport\\b|Ocean\\b|Trail\\b|Alpine\\b|ANC\\b|RU\\b|CN\\b|EU\\b|US\\b|JP\\b|KR\\b|/|\\||$))`, 'i');
const memoryCategories = new Set(['iphones', 'smartphones', 'samsung', 'google', 'xiaomi', 'ipads', 'macbooks', 'playstation']);
const memory = (value: string) => /tb|тб/i.test(value) ? `${parseInt(value, 10)} ТБ` : `${parseInt(value, 10)} ГБ`;

/** Supplier labels remain in priceAlias/sourceTitle; only buyer-facing fields change. */
export function presentCatalogItem(item: CatalogItem): CatalogItem {
  const result = { ...item };
  if (/^(?:Beats|Bose|B&W|Sony) Headphones$/.test(item.sourceCategory ?? '')) result.category = 'audio';
  let name = item.model.trim().replace(/\s+/g, ' ');
  if (item.sourceCategory === 'PlayStation') {
    name = name.replace(/^PS5 DualSense\b/, 'Sony DualSense');
    if (name === 'Sony DualSense Camouflage') name = 'Sony DualSense Gray Camouflage';
  }
  const configuration: string[] = item.configuration ? item.configuration.split(' · ') : [];
  const colorPart = result.color.match(/,\s*([A-Z0-9]{5})$/)?.[1];
  if (colorPart) {
    result.color = result.color.replace(/,\s*[A-Z0-9]{5}$/, '').trim();
    configuration.push(colorPart);
  }
  const verboseMac = name.match(/^Ноутбук\s+Apple\s+(MacBook\s+(?:Air|Pro)\s+\d+)"?\s*\((M\d(?:\s+(?:Pro|Max))?)/i);
  if (verboseMac) {
    name = `${verboseMac[1]} ${verboseMac[2]}`;
    result.chip ||= verboseMac[2];
  }
  // Older parser matches sometimes embedded the entire specification in model.
  // Use only explicit facts already present in that record.
  const imac = name.match(/iMac\s+(\d+)"\s*\((M\d(?:\s+(?:Pro|Max))?),\s*(\d{4})\)/i);
  if (imac && item.sourceCategory === 'iMac') {
    const ports = name.match(/\d+\s+порта?/i)?.[0];
    const cores = name.match(/\d+C CPU\/\d+C GPU/i)?.[0];
    const part = item.sourceTitle?.match(/^([A-Z0-9]{5})\s*-/)?.[1];
    const sourceColor = item.sourceTitle?.match(new RegExp(`\\s+(${colorPattern})$`, 'i'))?.[1];
    name = `iMac ${imac[1]} ${imac[2]} (${imac[3]})`;
    result.chip ||= imac[2];
    if (sourceColor) result.color = sourceColor;
    configuration.push(...[ports, cores, part].filter((value): value is string => Boolean(value)));
  }
  if (item.sourceCategory === 'Цифровые камеры Canon') {
    name = name.replace(/^Компактный Фотоаппарат\s+/i, '').replace(/\s*\((Black|Silver)\/[^)]+\)$/, (_, color: string) => {
      result.color ||= color;
      return '';
    });
  }
  if (name.startsWith('Геймпад Sony DualSense')) {
    name = name.replace(/^Геймпад /, '').replace(/\s+для PS5\s*\(([^)]+)\)$/, (_, color: string) => {
      result.color ||= color;
      configuration.push('PS5');
      return '';
    });
  }
  name = name.replace(/^Яндекс станция(?=\s|$)/i, 'Яндекс Станция');
  if (item.sourceCategory === 'Яндекс Станция') {
    name = name.replace(/\s+(Лиловый|Изумрудный|Малиновый|Оранжевый)$/i, (_, color: string) => {
      result.color ||= color;
      return '';
    });
  }
  if (item.sourceCategory === 'Ray-Ban') name = name.replace(/^Очки Meta WAYFARER Ray-Ban/i, 'Ray-Ban Wayfarer');
  if (item.sourceCategory === 'Macbook') {
    const part = name.match(/^([A-Z0-9]{5})\s*-\s*/)?.[1];
    if (part) {
      name = name.replace(/^[A-Z0-9]{5}\s*-\s*/, `${macModels[part] ?? `Apple MacBook (${part})`} `);
      if (macModels[part]) configuration.push(part);
    }
  }
  if (/^Galaxy\b/.test(name)) name = `Samsung ${name}`;
  if (item.sourceCategory === 'Sony Phone' && /^Xperia\b/.test(name)) name = `Sony ${name}`;
  if (item.sourceCategory === 'Fujifilm Instax' && /^Instax\b/.test(name)) name = `Fujifilm ${name}`;
  if (/^(?:Magic Mouse|Magic Keyboard|Magic Trackpad|Pencil)\b/.test(name)) name = `Apple ${name}`;
  const miniPart = name.match(/^Mac mini ([A-Z0-9]{5})\s*-\s*/)?.[1];
  if (miniPart) {
    // https://support.apple.com/en-us/102852
    name = name.replace(/^Mac mini [A-Z0-9]{5}\s*-\s*/, `${['MCX44', 'MU9E3'].includes(miniPart) ? 'Mac mini (2024)' : 'Mac mini'} `);
    configuration.push(miniPart);
  }

  // Ring sizes are not watch case diameters. Keep their label explicit.
  if (/\bRing\b/i.test(name)) {
    name = name.replace(/\s*\(Size\s*(\d+)\)\s*$/i, (_, size: string) => {
      configuration.push(`Размер ${size}`);
      return '';
    });
  }
  // Supplier regions belong to the variant, including when placed after its colour.
  name = name.replace(/\s*\((RU|CN|EU|US|JP|KR)\)\s*$/i, (_, region: string) => {
    configuration.push(region.toUpperCase());
    return '';
  });
  if (/^(RU|CN|EU|US|JP|KR)$/i.test(result.sim ?? '')) {
    configuration.push(result.sim!.toUpperCase());
    delete result.sim;
  }
  name = name.replace(/\s*\((\d+\s*(?:GB|TB))\)\s*$/i, (_, capacity: string) => {
    result.storage ||= memory(capacity);
    return '';
  });

  let suffix = '';
  if (memoryCategories.has(item.category ?? '')) {
    const pair = name.match(/\s+(\d{1,3})\s*\/\s*(\d{1,4}(?:\s*(?:TB|ТБ|GB|ГБ))?)(?=\s|$)/i);
    const capacity = pair ? undefined : name.match(/\s+(\d{1,4}\s*(?:TB|ТБ|GB|ГБ))(?=\s|$)/i)
      ?? (['iphones', 'google'].includes(item.category ?? '') ? name.match(/\s+(32|64|128|256|512|1024|2048)(?=\s|$)/) : undefined);
    if (pair) {
      result.ram ||= memory(pair[1]);
      result.storage ||= memory(pair[2]);
      suffix = name.slice(pair.index! + pair[0].length).trim();
      name = name.slice(0, pair.index).trim();
    } else if (capacity) {
      result.storage ||= memory(capacity[1]);
      suffix = name.slice(capacity.index! + capacity[0].length).trim();
      name = name.slice(0, capacity.index).trim();
    }
  }
  if (item.category === 'watches') {
    const size = name.match(/\s+(\d{2})\s*mm\b/i);
    if (size) {
      result.size ||= `${size[1]} мм`;
      suffix = name.slice(size.index! + size[0].length).trim();
      name = name.slice(0, size.index).trim();
    }
  }
  if (suffix) {
    const connectivity = suffix.match(/\b(?:Wi-Fi(?:\s*\+\s*Cellular)?|LTE|Cellular)\b/i);
    if (connectivity) {
      result.connectivity ||= connectivity[0];
      suffix = suffix.replace(connectivity[0], '').trim();
    }
    const sim = suffix.match(/\b(?:Sim\s*\/\s*eSim|eSIM|Dual SIM)\b/i);
    if (sim) {
      result.sim ||= sim[0];
      suffix = suffix.replace(sim[0], '').replace(/\(\s*\)/g, '').trim();
    }
    const color = (` ${suffix}`).match(colorBeforeDetail);
    if (color) {
      result.color ||= color[1];
      suffix = (` ${suffix}`).replace(color[0], '').trim();
    }
    if (suffix) configuration.push(suffix);
  } else {
    const color = name.match(colorBeforeDetail);
    if (color && (!item.color || item.color.toLowerCase() === color[1].toLowerCase())) {
      result.color ||= color[1];
      const tail = name.slice(color.index! + color[0].length).trim();
      if (tail) configuration.push(tail.replace(/^[/|]\s*/, ''));
      name = name.slice(0, color.index).trim();
    }
  }
  // Parser's iPad 11 product pages explicitly identify the 2025 A16 model.
  if (item.sourceCategory === 'iPad' && name === 'iPad 11') name = 'iPad 11 A16';
  result.model = name.replace(/\s*-\s*$/, '').trim();
  result.configuration = [...new Set(configuration)].join(' · ') || undefined;
  return result;
}
