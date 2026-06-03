import type { Product } from './types';

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  brand: string;
  stockQuantity: number;
  slug: string;
};

const CART_KEY = 'techstore_cart';
const SHIPPING_PRICE = 10;

const notifyCartChange = () => {
  window.dispatchEvent(new Event('cartchange'));
};

export const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]') as CartItem[];
  } catch {
    return [];
  }
};

export const saveCart = (cart: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  notifyCartChange();
};

export const clearCart = () => {
  localStorage.removeItem(CART_KEY);
  notifyCartChange();
};

export const getCartTotals = (cart: CartItem[]) => {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? SHIPPING_PRICE : 0;

  return {
    subtotal,
    shipping,
    total: subtotal + shipping,
  };
};

export const addToCart = (product: Product, quantity: number, image?: string) => {
  const cart = getCart();
  const itemImage = image || product.images[0] || '';
  const price = product.discountPrice ?? product.price;
  const existingItem = cart.find((item) => item.productId === product.id);

  if (existingItem) {
    existingItem.quantity = Math.min(existingItem.quantity + quantity, product.stockQuantity);
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price,
      quantity: Math.min(quantity, product.stockQuantity),
      image: itemImage,
      brand: product.brand,
      stockQuantity: product.stockQuantity,
      slug: product.slug,
    });
  }

  saveCart(cart);
};

export const updateCartItemQuantity = (productId: string, quantity: number) => {
  const cart = getCart()
    .map((item) => (item.productId === productId ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);
  saveCart(cart);
};

export const removeCartItem = (productId: string) => {
  const cart = getCart().filter((item) => item.productId !== productId);
  saveCart(cart);
};
