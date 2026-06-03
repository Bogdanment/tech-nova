import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../lib/api';
import { addToCart } from '../lib/cart';
import { formatCurrency } from '../lib/format';
import type { Product } from '../lib/types';
import ProductImage from '../components/ProductImage';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/products/slug/${slug}`);
        setProduct(response.data as Product);
        setSelectedImage(0);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  const images = product?.images?.length ? product.images : [`https://picsum.photos/seed/${encodeURIComponent(product?.slug || 'tech-product')}/1200/900`];
  const displayPrice = product?.discountPrice ?? product?.price ?? 0;

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    addToCart(product, quantity, images[selectedImage]);
    setStatusMessage('Product added to cart.');
  };

  if (loading) {
    return <div className="surface rounded-[28px] px-6 py-10 text-sm text-slate-500">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="surface rounded-[28px] px-6 py-10 text-sm text-slate-500">
        Product not found. Return to the <Link to="/catalog" className="font-semibold text-cyan-600">catalog</Link>.
      </div>
    );
  }

  const specificationEntries = product.specifications ? Object.entries(product.specifications) : [];

  return (
    <section className="space-y-6 lg:space-y-8">
      <Link to="/catalog" className="text-sm font-semibold text-slate-500 transition hover:text-slate-950">
        Back to catalog
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface self-start rounded-[32px] p-4 lg:p-5">
          <ProductImage src={images[selectedImage]} alt={product.name} className="aspect-[4/3] w-full rounded-[24px]" loading="eager" />

          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {images.map((image, index) => (
                <button
                  key={image + index}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`overflow-hidden rounded-2xl border-2 transition ${
                    selectedImage === index ? 'border-cyan-400' : 'border-transparent'
                  }`}
                >
                  <ProductImage src={image} alt={`${product.name} ${index + 1}`} className="h-24 w-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="surface rounded-[32px] p-6 lg:p-8">
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            <span>{product.brand}</span>
            <span>/</span>
            <span>{product.category?.name}</span>
            <span>/</span>
            <span>{product.sku}</span>
          </div>

          <h1 className="mt-3 text-3xl font-semibold text-slate-950 lg:text-4xl">{product.name}</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600 lg:text-base">{product.description}</p>

          <div className="mt-6 flex items-end gap-3">
            <div className="text-4xl font-semibold text-slate-950">{formatCurrency(displayPrice)}</div>
            {product.discountPrice && (
              <div className="pb-1 text-lg text-slate-400 line-through">{formatCurrency(product.price)}</div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                product.isAvailable && product.stockQuantity > 0
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {product.isAvailable && product.stockQuantity > 0 ? 'In stock' : 'Out of stock'}
            </span>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              {product.stockQuantity} units remaining
            </span>
          </div>

          <div className="mt-8">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Quantity</div>
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 text-lg transition hover:border-slate-950"
              >
                -
              </button>
              <div className="min-w-16 rounded-full border border-slate-200 px-5 py-3 text-center font-semibold">{quantity}</div>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(product.stockQuantity, value + 1))}
                disabled={!product.isAvailable || product.stockQuantity === 0}
                className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 text-lg transition hover:border-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.isAvailable || product.stockQuantity === 0}
            className="mt-8 w-full rounded-full bg-slate-950 px-6 py-4 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add to cart
          </button>
          {statusMessage && <p className="mt-3 text-sm text-emerald-600">{statusMessage}</p>}

          <div className="mt-8 grid gap-3 rounded-[24px] bg-slate-50 p-5 text-sm text-slate-600">
            <div className="flex items-center justify-between gap-3">
              <span>Category</span>
              <span className="font-semibold text-slate-950">{product.category?.name}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>SKU</span>
              <span className="font-semibold text-slate-950">{product.sku}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Availability</span>
              <span className="font-semibold text-slate-950">
                {product.isAvailable && product.stockQuantity > 0 ? 'Ready to ship' : 'Unavailable'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="surface rounded-[32px] p-6 lg:p-8">
          <h2 className="text-2xl font-semibold text-slate-950">Description</h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600 lg:text-base">{product.description}</p>
        </section>

        <section className="surface rounded-[32px] p-6 lg:p-8">
          <h2 className="text-2xl font-semibold text-slate-950">Specifications</h2>
          {specificationEntries.length > 0 ? (
            <div className="mt-4 space-y-3">
              {specificationEntries.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                  <span className="font-semibold text-slate-700">{label}</span>
                  <span className="text-right text-slate-600">{String(value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No specifications have been added yet.</p>
          )}
        </section>
      </div>
    </section>
  );
};

export default ProductDetail;
