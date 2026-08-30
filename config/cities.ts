export const CITIES = {
  magnitogorsk: { id: 'magnitogorsk', name: 'Магнитогорск', shortName: 'Магнитогорск' },
  beloretsk: { id: 'beloretsk', name: 'Белорецк', shortName: 'Белорецк' },
  troitsk: { id: 'troitsk', name: 'Троицк', shortName: 'Троицк' },
} as const;

export type CityId = keyof typeof CITIES;
export type City = (typeof CITIES)[CityId];
export const DEFAULT_CITY_ID: CityId = 'magnitogorsk';
export const CITY_LIST = Object.values(CITIES);
