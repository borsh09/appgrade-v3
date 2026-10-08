'use client';
import Link from '@/components/shared/safe-link';
import { catalogItems, normalizeProductName } from '@/lib/catalog-registry';
import { optionHref, variantFields } from '@/lib/product-selection';

const colorFinishes: [RegExp, string][] = [
  [/cosmic orange/i, '#d87942'],
  [/desert|пустын/i, '#cbb79e'],
  [/natural|натураль/i, '#aaa69d'],
  [/deep blue/i, '#35445e'],
  [/mist blue|sky blue|небесн/i, '#b5c8db'],
  [/space gr[ae]y|space black|космическ/i, '#53545a'],
  [/rose gold|розовое золото/i, '#d8b3a5'],
  [/starlight|сияющ|звездн|звёздн/i, '#e8e1d2'],
  [/midnight|полноч|т[её]мн.*ноч/i, '#282e38'],
  [/ultramarine/i, '#6675cb'],
  [/teal|бирюз/i, '#749b99'],
  [/sage|шалфей/i, '#a7b59d'],
  [/lavender|сирен|лаванд/i, '#bcb2d0'],
  [/burgundy|бордов/i, '#703b49'],
  [/graphite|графит/i, '#57595b'],
  [/silver|серебр/i, '#d7d9db'],
  [/white|бел|ivory|cream|крем/i, '#f2f0e9'],
  [/black|ч[её]рн/i, '#27282b'],
  [/pink|розов/i, '#e7b5c5'],
  [/purple|violet|фиолет/i, '#a291be'],
  [/blue|син|голуб/i, '#7e9ab8'],
  [/green|зел[её]н|mint|мятн|olive/i, '#91ab8f'],
  [/yellow|ж[её]лт/i, '#edda85'],
  [/orange|оранж/i, '#df9454'],
  [/red|красн/i, '#c34848'],
  [/gold|золот/i, '#d3bd8d'],
  [/gr[ae]y|серый|серая/i, '#a4a5a8'],
  [/beige|беж|sand|песоч/i, '#cfc1ab'],
  [/brown|коричн|chocolate/i, '#8a6955'],
];

function colorSwatch(value: string) {
  const colors = value
    .split(/\s*[/+]\s*/)
    .map(
      (part) =>
        colorFinishes.find(([pattern]) => pattern.test(part))?.[1] ?? '#c5c5c0',
    );
  return colors.length > 1
    ? `conic-gradient(${colors.map((color, index) => `${color} ${(index / colors.length) * 100}% ${((index + 1) / colors.length) * 100}%`).join(', ')})`
    : colors[0];
}
const labels = {
  chip: 'Процессор',
  storage: 'Память',
  ram: 'Оперативная память',
  color: 'Цвет',
  sim: 'SIM',
  size: 'Размер',
  connectivity: 'Связь',
  configuration: 'Версия',
};
export function ProductVariants({ selectedId }: { selectedId: string }) {
  const selected = catalogItems.find((item) => item.id === selectedId);
  if (!selected) return null;
  const variants = catalogItems.filter(
    (item) => item.modelSlug === selected.modelSlug,
  );
  return (
    <div className="product-options">
      {variantFields.map((key) => {
        const values = [
          ...new Map(
            variants
              .filter((item) => item[key] && item[key] !== '—')
              .map((item) => [normalizeProductName(item[key]!), item[key]!]),
          ).values(),
        ];
        if (key === 'storage' || key === 'ram' || key === 'size') {
          const capacity = (value: string) =>
            parseFloat(value) * (/tb|тб/i.test(value) ? 1024 : 1);
          values.sort((a, b) => capacity(a) - capacity(b));
        }
        if (!values.length) return null;
        const isColor = key === 'color';
        return (
          <section
            className="product-option"
            key={key}
            aria-label={labels[key]}
          >
            <div className="product-option-head">
              <span>{labels[key]}</span>
            </div>
            <div
              className={`product-option-values${isColor ? ' product-color-swatches' : ''}`}
            >
              {values.map((value) => {
                const active =
                  normalizeProductName(value) ===
                  normalizeProductName(selected[key] ?? '');
                return (
                  <Link
                    key={value}
                    href={optionHref(variants, selected, key, value)!}
                    className={active ? 'selected' : ''}
                    aria-label={`${labels[key]}: ${value}`}
                    aria-current={active ? 'true' : undefined}
                    title={isColor ? value : undefined}
                  >
                    {isColor ? (
                      <span
                        className="product-color-swatch"
                        style={{ background: colorSwatch(value) }}
                        aria-hidden="true"
                      />
                    ) : (
                      value
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
