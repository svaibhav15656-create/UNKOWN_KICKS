// Central place to map a product name to a display image.
// Update this once your product catalog is finalized — see note in chat
// about the "MAnforce condoms" / "condoms" entries, which look like leftover
// seed data and should be removed from the backend product table.
export const PRODUCT_IMAGES = {
  'Running Shoes': '/images/sneaker_core_black.png',
  'Cotton T-Shirt': '/images/apparel_hoodie.png',
  'Denim Jeans': '/images/apparel_hoodie.png',
  'Backpack': '/images/sneaker_sand_beige.png',
};

export const DEFAULT_IMAGE = '/images/sneaker_sand_beige.png';

export function getProductImage(product) {
  if (!product) return DEFAULT_IMAGE;
  return PRODUCT_IMAGES[product.name] || DEFAULT_IMAGE;
}