import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-950">TechNova</h3>
            <p className="text-sm text-slate-600">
              Quality electronics for your home and office. Trusted brands, fast shipping, reliable support.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-950">Shop</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/catalog" className="hover:text-slate-950">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=laptops" className="hover:text-slate-950">
                  Laptops
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=components" className="hover:text-slate-950">
                  Components
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=accessories" className="hover:text-slate-950">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-950">Support</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/profile" className="hover:text-slate-950">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-slate-950">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <a href="mailto:support@technova.com" className="hover:text-slate-950">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="tel:+1234567890" className="hover:text-slate-950">
                  +373 077777777
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-950">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a href="#" className="hover:text-slate-950">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-950">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-950">
                  Shipping Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-950">
                  Returns & Refunds
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-8 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} TechNova. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
