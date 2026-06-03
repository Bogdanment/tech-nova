import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCart } from '../lib/cart';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const syncCart = () => {
      const cartItems = getCart();
      setCartCount(cartItems.reduce((sum, item) => sum + item.quantity, 0));
    };

    syncCart();
    window.addEventListener('storage', syncCart);
    window.addEventListener('cartchange', syncCart);

    return () => {
      window.removeEventListener('storage', syncCart);
      window.removeEventListener('cartchange', syncCart);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-slate-950/85 text-white backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-300/20">
            TN
          </span>
          <div>
            <div className="font-heading text-lg leading-none">TechNova</div>
            <div className="text-xs text-slate-400">Computers, peripherals, mobile devices</div>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-2 text-sm font-medium text-slate-200">
          <Link to="/catalog" className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white">
            Catalog
          </Link>
          <Link to="/cart" className="relative rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white">
            Cart
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-cyan-400 px-1 text-[11px] font-bold text-slate-950">
                {cartCount}
              </span>
            )}
          </Link>
          {user && (
            <Link to="/profile" className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white">
              Profile
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white">
              Admin
            </Link>
          )}
          {user ? (
            <button
              onClick={logout}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-white transition hover:bg-white/10"
            >
              Logout
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="rounded-full border border-white/15 px-4 py-2 transition hover:bg-white/10">
                Login
              </Link>
              <Link to="/register" className="rounded-full bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
