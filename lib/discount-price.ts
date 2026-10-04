export function discountPrice(base: number | null | undefined, sale: number | undefined) {
  return typeof base === 'number' && typeof sale === 'number' && sale > 0 && sale < base
    ? { price: sale, oldPrice: base } : { price: base, oldPrice: undefined };
}
