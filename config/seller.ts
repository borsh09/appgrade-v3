export const seller={
  name:process.env.SELLER_NAME?.trim()||'Индивидуальный предприниматель Байрамгулов Вадим Дамирович',
  inn:process.env.SELLER_INN?.trim()||'744602863119',
  address:process.env.SELLER_ADDRESS?.trim()||'455023, г. Магнитогорск, пр-т Ленина, д. 69',
  privacyEmail:process.env.SELLER_PRIVACY_EMAIL?.trim()||'Bayramgulov2609@mail.ru',
};
export const sellerOgrnip=process.env.SELLER_OGRNIP?.trim()||'323745600032098';
export function isSellerConfigured() {
  return Object.values(seller).every(value => Boolean(value.trim()))
    && /^\d{10}(?:\d{2})?$/.test(seller.inn)
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(seller.privacyEmail);
}
export const sellerConfigured=isSellerConfigured();
