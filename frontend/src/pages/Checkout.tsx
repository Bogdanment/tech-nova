import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { clearCart, getCart, getCartTotals } from '../lib/cart';
import { formatCurrency } from '../lib/format';
import type { CartItem } from '../lib/cart';

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: '',
  });

  useEffect(() => {
    const savedCart = getCart();

    if (savedCart.length === 0) {
      navigate('/cart');
      return;
    }

    setCart(savedCart);
  }, [navigate]);

  const totals = getCartTotals(cart);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/orders', {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        deliveryAddress: formData.deliveryAddress,
        orderItems: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      clearCart();
      navigate('/');
    } catch (submitError) {
      setError('Unable to place the order. Please verify the cart and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6 lg:space-y-8">
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Checkout</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950 lg:text-4xl">Complete your purchase</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} className="surface space-y-5 rounded-[32px] p-6 lg:p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700">Full name</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(event) => setFormData({ ...formData, customerName: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Phone</label>
              <input
                type="tel"
                required
                value={formData.customerPhone}
                onChange={(event) => setFormData({ ...formData, customerPhone: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="+7 900 000-00-00"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <input
              type="email"
              required
              value={formData.customerEmail}
              onChange={(event) => setFormData({ ...formData, customerEmail: event.target.value })}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Delivery address</label>
            <textarea
              required
              rows={4}
              value={formData.deliveryAddress}
              onChange={(event) => setFormData({ ...formData, deliveryAddress: event.target.value })}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              placeholder="Street, building, apartment, city"
            />
          </div>

          {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-slate-950 px-6 py-4 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Submitting order...' : 'Place order'}
          </button>
        </form>

        <aside className="surface h-fit rounded-[32px] p-6 lg:p-8">
          <div className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Summary</div>
          <div className="mt-5 space-y-4 max-h-[360px] overflow-auto pr-1">
            {cart.map((item) => (
              <div key={item.productId} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-950">{item.name}</div>
                  <div className="text-xs text-slate-500">Qty {item.quantity}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-950">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-sm text-slate-600">
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
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-lg font-semibold text-slate-950">
              <span>Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>

          <Link to="/cart" className="mt-4 block text-center text-sm font-semibold text-cyan-700 hover:text-cyan-600">
            Return to cart
          </Link>
        </aside>
      </div>
    </section>
  );
};

export default Checkout;
