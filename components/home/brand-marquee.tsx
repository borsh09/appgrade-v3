import Link from '@/components/shared/safe-link';

const brands = [
  {
    name: 'APPLE',
    href: '/catalog/iphones',
  },
  {
    name: 'SAMSUNG',
    href: '/catalog/samsung',
  },
  {
    name: 'XIAOMI',
    href: '/catalog/xiaomi',
  },
  {
    name: 'GOOGLE',
    href: '/catalog/google',
  },
  {
    name: 'DYSON',
    href: '/catalog/dyson',
  },
  {
    name: 'SONY',
    href: '/catalog',
  },
  {
    name: 'JBL',
    href: '/catalog/audio',
  },
  {
    name: 'PLAYSTATION',
    href: '/catalog/playstation',
  },
  {
    name: 'APPLE WATCH',
    href: '/catalog/watches',
  },
  {
    name: 'AIRPODS',
    href: '/catalog/audio',
  },
  {
    name: 'MACBOOK',
    href: '/catalog/macbooks',
  },
];

export function BrandMarquee() {
  return (
    <section className="appgrade-brand-marquee">
      <div className="appgrade-brand-marquee-track">
        <div className="appgrade-brand-marquee-group">
          {brands.map((brand) => (
            <Link
              href={brand.href}
              key={`first-${brand.name}`}
              className="appgrade-brand-marquee-item"
            >
              {brand.name}
            </Link>
          ))}
        </div>

        <div
          className="appgrade-brand-marquee-group"
          aria-hidden="true"
        >
          {brands.map((brand) => (
            <Link
              href={brand.href}
              key={`second-${brand.name}`}
              className="appgrade-brand-marquee-item"
              tabIndex={-1}
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}