export interface CatalogCategory {
  id: string;
  title: string;
  href: string;
  image: string;
  description: string;
}

export const catalogCategories: CatalogCategory[] = [
  {
    id: 'iphone',
    href: '/catalog/iphones',
    title: 'iPhone',
    image: '/images/king-category-iphone.webp',
    description: 'Все модели iPhone',
  },
  {
    id: 'samsung',
    href: '/catalog/samsung',
    title: 'Samsung',
    image: '/images/king-category-smartphones.webp',
    description: 'Смартфоны и планшеты',
  },
  {
    id: 'smartphones',
    href: '/catalog/smartphones',
    title: 'Другие смартфоны',
    image: '/images/king-category-smartphones.webp',
    description: 'Nothing, OnePlus, Honor и другие',
  },
  {
    id: 'xiaomi',
    href: '/catalog/xiaomi',
    title: 'Xiaomi',
    image: '/images/products/xiaomi/15-ultra-main.png',
    description: 'Xiaomi, Redmi и Poco',
  },
  {
    id: 'macbook',
    href: '/catalog/macbooks',
    title: 'MacBook',
    image: '/images/category-laptops.webp',
    description: 'Компьютеры Apple',
  },
  {
    id: 'ipad',
    href: '/catalog/ipads',
    title: 'iPad',
    image: '/images/king-category-tablets.webp',
    description: 'Планшеты и аксессуары',
  },
  {
    id: 'audio',
    href: '/catalog/audio',
    title: 'Наушники и аудио',
    image: '/images/king-category-headphones.webp',
    description: 'AirPods, Marshall, JBL',
  },
  {
    id: 'watches',
    href: '/catalog/watches',
    title: 'Смарт-часы',
    image: '/images/king-category-watches.webp',
    description: 'Apple Watch и другие',
  },
  {
    id: 'gaming',
    href: '/catalog/playstation',
    title: 'Игровые устройства',
    image: '/images/king-category-gaming.webp',
    description: 'PlayStation, Nintendo и другое',
  },
  {
    id: 'google',
    href: '/catalog/google',
    title: 'Google Pixel',
    image: '/images/products/gallery/pixel10proxl-moonstone/view-1.jpg',
    description: 'Смартфоны Google',
  },
  {
    id: 'dyson',
    href: '/catalog/dyson',
    title: 'Dyson',
    image: '/images/king-category-dyson.webp',
    description: 'Красота и здоровье',
  },
  {
    id: 'cameras',
    href: '/catalog/cameras',
    title: 'Фотоаппараты',
    image: '/images/products/cameras/evo-black.png',
    description: 'Instax и моментальная печать',
  },
  {
    id: 'accessories',
    href: '/catalog/gadgets',
    title: 'Гаджеты и аксессуары',
    image: '/images/king-category-accessories.webp',
    description: 'Аксессуары и другая техника',
  },
];

const categoryGroups = [
  { title: 'Смартфоны', ids: ['iphone', 'samsung', 'xiaomi', 'google', 'smartphones'] },
  { title: 'Компьютеры и планшеты', ids: ['macbook', 'ipad'] },
  { title: 'Аудио и часы', ids: ['audio', 'watches'] },
  { title: 'Игры, фото и аксессуары', ids: ['gaming', 'cameras', 'dyson', 'accessories'] },
] as const;

export const catalogCategoryGroups = categoryGroups.map(group => ({
  title: group.title,
  categories: catalogCategories.filter(category => (group.ids as readonly string[]).includes(category.id)),
}));
