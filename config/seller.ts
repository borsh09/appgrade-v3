export const seller={
  name:process.env.SELLER_NAME?.trim()||'',
  inn:process.env.SELLER_INN?.trim()||'',
  address:process.env.SELLER_ADDRESS?.trim()||'',
  privacyEmail:process.env.SELLER_PRIVACY_EMAIL?.trim()||'',
};
export const sellerConfigured=Object.values(seller).every(Boolean);
