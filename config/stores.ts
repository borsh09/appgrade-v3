export type StoreId =
  | 'magnitogorsk'
  | 'beloretsk'
  | 'troitsk';

export type Store = {
  id: StoreId;

  city: string;
  address: string;

  phone: string;
  schedule: string;

  latitude?: number;
  longitude?: number;

  routeUrl: string;
  twoGisUrl?: string;

  telegram?: string;
  vk?: string;
  instagram?: string;
};

export const STORES: Record<StoreId, Store> = {
  magnitogorsk: {
    id: 'magnitogorsk',

    city: 'Магнитогорск',

    address: 'пр-т Ленина, 69',

    phone: '+7 912 083-44-48',

    schedule: 'Ежедневно, 10:00–21:00',

    latitude: 53.413055,
    longitude: 58.98484,

    routeUrl:
      'https://yandex.ru/maps/?rtext=~53.413055,58.98484&rtt=auto',

    twoGisUrl:
      'https://2gis.ru/magnitogorsk/firm/70000001081044586/58.98484%2C53.413055',

    telegram:
      'https://t.me/APPGRADEmgn',

    vk:
      'https://vk.ru/appgrade_mgn',

    instagram:
      'https://www.instagram.com/appgrade.ru?igsi=MTVuMXlkNWRsazdtZg==',
  },

  beloretsk: {
    id: 'beloretsk',

    city: 'Белорецк',

    address: 'ул. П. Точисского, 21',

    phone: '+7 996 691-35-12',

    schedule: 'Ежедневно, 10:00–20:00',

    latitude: 53.966766,
    longitude: 58.411049,

    routeUrl:
      'https://yandex.ru/maps/?rtext=~53.966766,58.411049&rtt=auto',

    twoGisUrl:
      'https://2gis.ru/beloreck/firm/70000001091783582/58.411049%2C53.966766',

    telegram:
      'https://t.me/APPGRADEmgn',

    vk:
      'https://vk.ru/appgrade_mgn',

    instagram:
      'https://www.instagram.com/appgrade.ru?igsi=MTVuMXlkNWRsazdtZg==',
  },

  troitsk: {
    id: 'troitsk',

    city: 'Троицк',

    address: 'ул. имени А. М. Климова, 36 · 2 этаж',

    phone: '+7 909 099-05-37',

    schedule: 'Ежедневно, 10:00–20:00',

    latitude: 54.086095,
    longitude: 61.557759,

    routeUrl:
      'https://yandex.ru/maps/?rtext=~54.086095,61.557759&rtt=auto',

    twoGisUrl:
      'https://2gis.ru/troick/geo/70030076626877296/61.557759%2C54.086095',

    telegram:
      'https://t.me/APPGRADEmgn',

    vk:
      'https://vk.ru/appgrade_mgn',

    instagram:
      'https://www.instagram.com/appgrade.ru?igsi=MTVuMXlkNWRsazdtZg==',
  },
};

export const STORE_LIST = Object.values(STORES);