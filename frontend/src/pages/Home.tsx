import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductImage from '../components/ProductImage';
import api from '../lib/api';
import { formatCurrency } from '../lib/format';
import type { Category, Product } from '../lib/types';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
        ]);

        const products = Array.isArray(productsResponse.data) ? (productsResponse.data as Product[]) : [];
        setFeaturedProducts(products.filter((product) => product.isFeatured && product.isAvailable).slice(0, 4));
        setNewProducts(
          [...products]
            .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
            .slice(0, 4),
        );
        setCategories(Array.isArray(categoriesResponse.data) ? (categoriesResponse.data as Category[]) : []);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const heroHighlights = [
    { label: 'Fast delivery', value: '1-3 days' },
    { label: 'Wide selection', value: '1000+ items' },
    { label: 'Secure payment', value: 'Protected' },
  ];

  if (loading) {
    return <div className="surface rounded-[28px] px-6 py-10 text-sm text-slate-500">Loading storefront...</div>;
  }

  return (
    <section className="space-y-8 lg:space-y-10">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel overflow-hidden rounded-[32px] p-8 lg:p-10">
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-950 lg:text-6xl">
            Quality electronics for your home and office
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 lg:text-lg">
            Discover laptops, components, monitors, keyboards, smartphones, and accessories from trusted brands.
            Fast shipping and reliable support.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/catalog" className="rounded-full bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800">
              Shop now
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {heroHighlights.map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/75 p-4 ring-1 ring-slate-200/70">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</div>
                <div className="mt-2 text-lg font-semibold text-slate-950">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="surface rounded-[28px] p-6">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Trending categories</div>
            <div className="mt-4 grid gap-3">
              {categories.slice(0, 4).map((category, index) => (
                <Link
                  key={category.id}
                  to={`/catalog?category=${category.slug}`}
                  className="group flex items-center justify-between rounded-2xl border border-slate-200/80 px-4 py-4 transition hover:border-cyan-300 hover:bg-cyan-50/80"
                >
                  <div>
                    <div className="font-semibold text-slate-950">{category.name}</div>
                    <div className="text-sm text-slate-500">{category.description || 'Fresh picks for your setup'}</div>
                  </div>
                  <div className="text-lg text-slate-300 transition group-hover:text-cyan-500">0{index + 1}</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="surface rounded-[28px] p-6">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Why choose us</div>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                Real-time stock updates and accurate availability information.
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                High-quality product images and detailed specifications.
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                Order tracking and instant notifications for your purchases.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface rounded-[28px] p-6 lg:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Popular products</div>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Featured hardware</h2>
            </div>
            <Link to="/catalog" className="text-sm font-semibold text-cyan-600 hover:text-cyan-500">
              View all
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className="group rounded-[24px] border border-slate-200/80 bg-white p-4 transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg"
                >
                  <ProductImage
                    src={product.images[0] || `https://picsum.photos/seed/${encodeURIComponent(product.slug)}/900/700`}
                    alt={product.name}
                    className="h-48 w-full rounded-[20px]"
                    imageClassName="transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-950">{product.name}</h3>
                      <p className="text-sm text-slate-500">{product.brand}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-semibold text-slate-950">
                        {formatCurrency(product.discountPrice ?? product.price)}
                      </div>
                      {product.discountPrice && (
                        <div className="text-xs text-slate-400 line-through">{formatCurrency(product.price)}</div>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 p-8 text-sm text-slate-500">
                Add featured products from the admin panel to populate this block.
              </div>
            )}
          </div>
        </section>

        <section className="surface rounded-[28px] p-6 lg:p-8">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">New arrivals</div>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Recently added inventory</h2>

          <div className="mt-6 space-y-4">
            {newProducts.length > 0 ? (
              newProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className="flex items-center gap-4 rounded-[22px] border border-slate-200/80 bg-white p-4 transition hover:border-cyan-300 hover:shadow-md"
                >
                  <ProductImage
                    src={product.images[0] || `https://picsum.photos/seed/${encodeURIComponent(product.slug)}-thumb/240/240`}
                    alt={product.name}
                    className="h-20 w-20 shrink-0 rounded-[18px]"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold text-slate-950">{product.name}</h3>
                    <p className="text-sm text-slate-500">{product.category?.name}</p>
                    <div className="mt-1 text-sm font-semibold text-slate-950">
                      {formatCurrency(product.discountPrice ?? product.price)}
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                    {product.stockQuantity} in stock
                  </span>
                </Link>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 p-8 text-sm text-slate-500">
                No products yet. Create items in the admin panel after deployment.
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Warranty', 'Official warranty on all products with easy returns.'],
          ['Fast delivery', 'Quick shipping to your door with tracking.'],
          ['Customer support', 'Help when you need it via phone and email.'],
        ].map(([title, description]) => (
          <div key={title} className="surface rounded-[28px] p-6">
            <div className="text-lg font-semibold text-slate-950">{title}</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </div>
        ))}
      </section>
    </section>
  );
};

export default Home;
