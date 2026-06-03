import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductImage from '../components/ProductImage';
import { clearCart, getCart, getCartTotals, removeCartItem, updateCartItemQuantity } from '../lib/cart';
import { formatCurrency } from '../lib/format';
import type { CartItem } from '../lib/cart';

const Cart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const syncCart = () => setCart(getCart());

    syncCart();
    window.addEventListener('storage', syncCart);
    window.addEventListener('cartchange', syncCart);

    return () => {
      window.removeEventListener('storage', syncCart);
      window.removeEventListener('cartchange', syncCart);
    };
  }, []);

  const totals = getCartTotals(cart);

  if (cart.length === 0) {
    return (
      <section className="surface mx-auto max-w-2xl rounded-[32px] p-10 text-center lg:p-14">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-cyan-50 text-3xl text-cyan-600">Cart</div>
        <h2 className="mt-6 text-3xl font-semibold text-slate-950">Your cart is empty</h2>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          Browse the catalog and add laptops, accessories, phones, and peripherals before checking out.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/catalog" className="rounded-full bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800">
            Continue shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 lg:space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Cart</div>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950 lg:text-4xl">Review your order</h1>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-950 hover:text-slate-950"
        >
          Clear cart
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {cart.map((item) => (
            <article key={item.productId} className="surface flex gap-4 rounded-[28px] p-4 lg:p-5">
              <Link to={`/product/${item.slug}`} className="shrink-0">
                <ProductImage src={item.image} alt={item.name} className="h-28 w-28 rounded-[22px]" />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{item.brand}</div>
                  <Link to={`/product/${item.slug}`} className="mt-1 block text-lg font-semibold text-slate-950 hover:text-cyan-700">
                    {item.name}
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                    {formatCurrency(item.price)} each
                  </div>
                  <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                    Stock {item.stockQuantity}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center rounded-full border border-slate-200">
                    <button
                      type="button"
                      onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
                      className="px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
                    >
                      -
                    </button>
                    <span className="min-w-12 px-4 py-2 text-center text-sm font-semibold text-slate-950">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateCartItemQuantity(item.productId, Math.min(item.stockQuantity, item.quantity + 1))}
                      className="px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeCartItem(item.productId)}
                    className="text-sm font-semibold text-rose-600 transition hover:text-rose-500"
                  >
                    Remove
                  </button>

                  <div className="ml-auto text-lg font-semibold text-slate-950">{formatCurrency(item.price * item.quantity)}</div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="surface h-fit rounded-[28px] p-6 lg:p-7">
          <div className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Summary</div>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Order total</h2>

          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-950">{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-slate-950">
                {totals.shipping > 0 ? formatCurrency(totals.shipping) : 'Free'}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between text-lg font-semibold text-slate-950">
                <span>Total</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </div>

          <Link
            to="/checkout"
            className="mt-8 block rounded-full bg-slate-950 px-6 py-4 text-center font-semibold text-white transition hover:bg-slate-800"
          >
            Proceed to checkout
          </Link>
          <Link
            to="/catalog"
            className="mt-3 block rounded-full border border-slate-200 px-6 py-4 text-center font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </section>
  );
};

export default Cart;
