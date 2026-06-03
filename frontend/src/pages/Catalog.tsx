import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { formatCurrency } from '../lib/format';
import type { Category, Product } from '../lib/types';

const PRODUCTS_PER_PAGE = 9;

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [availability, setAvailability] = useState(searchParams.get('availability') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 4000000 });
  const [maxPrice, setMaxPrice] = useState(4000000);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
        ]);

        const productsData = Array.isArray(productsResponse.data) ? (productsResponse.data as Product[]) : [];
        setProducts(productsData);
        setCategories(Array.isArray(categoriesResponse.data) ? (categoriesResponse.data as Category[]) : []);

        // Calculate max price from products
        if (productsData.length > 0) {
          const highestPrice = Math.max(
            ...productsData.map((p) => p.discountPrice ?? p.price)
          );
          setMaxPrice(highestPrice);
          setPriceRange((prev) => ({ ...prev, max: highestPrice }));
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, availability, sortBy, priceRange.min, priceRange.max]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (availability !== 'all') params.set('availability', availability);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    setSearchParams(params);
  }, [availability, searchQuery, selectedCategory, setSearchParams, sortBy]);

  const filteredProducts = [...products]
    .filter((product) => {
      const query = searchQuery.trim().toLowerCase();
      const categoryMatch = selectedCategory === 'all' || product.category?.slug === selectedCategory;
      const availabilityMatch =
        availability === 'all' ||
        (availability === 'in-stock' && product.isAvailable && product.stockQuantity > 0) ||
        (availability === 'out-of-stock' && (!product.isAvailable || product.stockQuantity <= 0));
      const price = product.discountPrice ?? product.price;
      const priceMatch = price >= priceRange.min && price <= priceRange.max;

      if (!query) {
        return categoryMatch && availabilityMatch && priceMatch;
      }

      const searchable = [product.name, product.brand, product.description, product.sku, product.category?.name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(query) && categoryMatch && availabilityMatch && priceMatch;
    })
    .sort((left, right) => {
      if (sortBy === 'price-asc') {
        return (left.discountPrice ?? left.price) - (right.discountPrice ?? right.price);
      }

      if (sortBy === 'price-desc') {
        return (right.discountPrice ?? right.price) - (left.discountPrice ?? left.price);
      }

      if (sortBy === 'stock-desc') {
        return right.stockQuantity - left.stockQuantity;
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setCurrentPage(1);
  };

  if (loading) {
    return <div className="surface rounded-[28px] px-6 py-10 text-sm text-slate-500">Loading catalog...</div>;
  }

  return (
    <section className="space-y-6 lg:space-y-8">
      <div className="glass-panel rounded-[32px] p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Catalog</div>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 lg:text-4xl">Browse the full electronics lineup</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 lg:text-base">
              Search across gadgets, components, and accessories with category filtering, stock visibility, price sorting,
              and paginated browsing.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Results</div>
            <div className="mt-1 text-2xl font-semibold">{filteredProducts.length}</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="surface grid gap-4 rounded-[28px] p-5 lg:grid-cols-2 xl:grid-cols-4">
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by product, brand, or SKU"
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
        />
        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={availability}
          onChange={(event) => setAvailability(event.target.value)}
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
        >
          <option value="all">All inventory</option>
          <option value="in-stock">In stock</option>
          <option value="out-of-stock">Out of stock</option>
        </select>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
        >
          <option value="newest">Newest first</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="stock-desc">Stock: high to low</option>
        </select>

        <div className="xl:col-span-2">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
            <span>Min price</span>
            <span>{formatCurrency(priceRange.min)}</span>
          </div>
          <input
            type="range"
            min="0"
            max={maxPrice}
            step="1000"
            value={priceRange.min}
            onChange={(event) => setPriceRange({ ...priceRange, min: Number(event.target.value) })}
            className="w-full"
          />
        </div>

        <div className="xl:col-span-2">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
            <span>Max price</span>
            <span>{formatCurrency(priceRange.max)}</span>
          </div>
          <input
            type="range"
            min="0"
            max={maxPrice}
            step="1000"
            value={priceRange.max}
            onChange={(event) => setPriceRange({ ...priceRange, max: Number(event.target.value) })}
            className="w-full"
          />
        </div>
      </form>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <div className="surface rounded-[28px] p-5">
            <h2 className="text-lg font-semibold text-slate-950">Catalog filters</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Refine the catalog by stock, category, and pricing to keep browsing fast and relevant.
            </p>
          </div>

          <div className="surface rounded-[28px] p-5">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Categories</div>
            <div className="mt-4 space-y-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                    selectedCategory === category.slug
                      ? 'border-cyan-300 bg-cyan-50 text-slate-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-slate-400">{category.slug}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              Showing {paginatedProducts.length} of {filteredProducts.length} products
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setAvailability('all');
                setSortBy('newest');
                setPriceRange({ min: 0, max: maxPrice });
              }}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
            >
              Reset filters
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {paginatedProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.slug}`}
                className="group surface overflow-hidden rounded-[28px] transition hover:-translate-y-1"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.images[0] || `https://picsum.photos/seed/${encodeURIComponent(product.slug)}/900/700`}
                    alt={product.name}
                    className="h-56 w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute left-4 top-4 flex gap-2">
                    {product.isFeatured && (
                      <span className="rounded-full bg-cyan-400 px-3 py-1 text-xs font-semibold text-slate-950">
                        Featured
                      </span>
                    )}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        product.isAvailable && product.stockQuantity > 0
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {product.isAvailable && product.stockQuantity > 0 ? 'In stock' : 'Out of stock'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{product.brand}</div>
                    <h3 className="mt-2 text-lg font-semibold text-slate-950">{product.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{product.description}</p>
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div className="text-xl font-semibold text-slate-950">
                        {formatCurrency(product.discountPrice ?? product.price)}
                      </div>
                      {product.discountPrice && (
                        <div className="text-xs text-slate-400 line-through">{formatCurrency(product.price)}</div>
                      )}
                    </div>
                    <div className="text-right text-sm text-slate-500">Stock: {product.stockQuantity}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {paginatedProducts.length === 0 && (
            <div className="surface rounded-[28px] p-12 text-center text-sm text-slate-500">
              No products match the current filters.
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 7).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`h-10 min-w-10 rounded-full px-4 text-sm font-semibold transition ${
                    currentPage === pageNumber ? 'bg-slate-950 text-white' : 'border border-slate-200 text-slate-700'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Catalog;
