import type { ProductDetailContent } from '@/lib/product-details';

export function ProductSpecifications({ details }: { details: ProductDetailContent }) {
  return <section className="product-specifications" id="specs">
    <div className="product-section-kicker">Характеристики</div>
    <div>
      <div className="product-spec-groups">
        {details.groups.map(group => <div className="product-spec-group" key={group.title}>
          <h3>{group.title}</h3>
          <dl>{group.rows.map(([label, value], index) => <div key={`${label}-${index}`}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        </div>)}
      </div>
      {details.limitedSpecs && <p className="product-spec-note">Дополнительные технические характеристики уточняются.</p>}
    </div>
  </section>;
}
