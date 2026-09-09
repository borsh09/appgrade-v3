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
    title: 'Игровые приставки',
    image: '/images/king-category-gaming.webp',
    description: 'Консоли PlayStation',
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
    image: '/images/products/cameras/mini13-blue.jpg',
    description: 'Instax и моментальная печать',
  },
  {
    id: 'accessories',
    href: '/#контакты',
    title: 'Аксессуары',
    image: '/images/king-category-accessories.webp',
    description: 'Для ваших устройств',
  },
  {
    id: 'gadgets',
    href: '/#контакты',
    title: 'Гаджеты',
    image: '/images/king-category-gadgets.webp',
    description: 'Полезные устройства',
  },
];
