export interface CatalogCategory {
  id: string;
  title: string;
  image: string;
  description: string;
}

export const catalogCategories: CatalogCategory[] = [
  {
    id: 'iphone',
    title: 'iPhone',
    image: '/images/king-category-iphone.webp',
    description: 'Все модели iPhone',
  },
  {
    id: 'samsung',
    title: 'Samsung',
    image: '/images/king-category-smartphones.webp',
    description: 'Смартфоны и планшеты',
  },
  {
    id: 'xiaomi',
    title: 'Xiaomi',
    image: '/images/products/xiaomi/15-ultra-main.png',
    description: 'Xiaomi, Redmi и Poco',
  },
  {
    id: 'macbook',
    title: 'MacBook и iMac',
    image: '/images/category-laptops.webp',
    description: 'Компьютеры Apple',
  },
  {
    id: 'ipad',
    title: 'iPad',
    image: '/images/king-category-tablets.webp',
    description: 'Планшеты и аксессуары',
  },
  {
    id: 'audio',
    title: 'Наушники и аудио',
    image: '/images/king-category-headphones.webp',
    description: 'AirPods, Sony, JBL',
  },
  {
    id: 'watches',
    title: 'Смарт-часы',
    image: '/images/king-category-watches.webp',
    description: 'Apple Watch и другие',
  },
  {
    id: 'gaming',
    title: 'Игровые приставки',
    image: '/images/king-category-gaming.webp',
    description: 'PlayStation и игры',
  },
  {
    id: 'google',
    title: 'Google Pixel',
    image: '/images/products/gallery/pixel10proxl-moonstone/view-1.jpg',
    description: 'Смартфоны Google',
  },
  {
    id: 'dyson',
    title: 'Dyson',
    image: '/images/king-category-dyson.webp',
    description: 'Красота и здоровье',
  },
  {
    id: 'cameras',
    title: 'Фотоаппараты',
    image: '/images/products/cameras/mini13-blue.jpg',
    description: 'Instax и моментальная печать',
  },
  {
    id: 'accessories',
    title: 'Аксессуары',
    image: '/images/king-category-accessories.webp',
    description: 'Для ваших устройств',
  },
  {
    id: 'gadgets',
    title: 'Гаджеты',
    image: '/images/king-category-gadgets.webp',
    description: 'Полезные устройства',
  },
];
