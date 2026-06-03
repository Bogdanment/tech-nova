import { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { formatCurrency } from '../lib/format';
import type { Category, Order, OrderStatus, Product } from '../lib/types';

type CategoryRecord = Category & { products?: Product[] };

type ProductFormState = {
  id: string | null;
  name: string;
  slug: string;
  description: string;
  price: string;
  discountPrice: string;
  stockQuantity: string;
  sku: string;
  brand: string;
  categoryId: string;
  specificationsJson: string;
  images: string[];
  isFeatured: boolean;
  isAvailable: boolean;
};

type CategoryFormState = {
  id: string | null;
  name: string;
  slug: string;
  description: string;
};

const emptyProductForm = (): ProductFormState => ({
  id: null,
  name: '',
  slug: '',
  description: '',
  price: '',
  discountPrice: '',
  stockQuantity: '',
  sku: '',
  brand: '',
  categoryId: '',
  specificationsJson: '{}',
  images: [],
  isFeatured: false,
  isAvailable: true,
});

const emptyCategoryForm = (): CategoryFormState => ({
  id: null,
  name: '',
  slug: '',
  description: '',
});

const statusOptions: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm());
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [message, setMessage] = useState('');

  const loadData = async () => {
    const [productsResponse, categoriesResponse, ordersResponse] = await Promise.all([
      api.get('/products'),
      api.get('/categories'),
      api.get('/orders'),
    ]);

    setProducts(Array.isArray(productsResponse.data) ? productsResponse.data : []);
    setCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []);
    setOrders(Array.isArray(ordersResponse.data) ? ordersResponse.data : []);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await loadData();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const resetProductForm = () => setProductForm(emptyProductForm());
  const resetCategoryForm = () => setCategoryForm(emptyCategoryForm());

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/products/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.url as string;
  };

  const beginEditProduct = (product: Product) => {
    setActiveTab('products');
    setProductForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: String(product.price),
      discountPrice: product.discountPrice ? String(product.discountPrice) : '',
      stockQuantity: String(product.stockQuantity),
      sku: product.sku,
      brand: product.brand,
      categoryId: product.categoryId || product.category?.id || '',
      specificationsJson: JSON.stringify(product.specifications || {}, null, 2),
      images: product.images || [],
      isFeatured: product.isFeatured,
      isAvailable: product.isAvailable,
    });
  };

  const beginEditCategory = (category: CategoryRecord) => {
    setActiveTab('categories');
    setCategoryForm({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    });
  };

  const handleSubmitProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    try {
      const parsedSpecifications = productForm.specificationsJson.trim()
        ? JSON.parse(productForm.specificationsJson)
        : {};

      const payload = {
        name: productForm.name.trim(),
        slug: productForm.slug.trim(),
        description: productForm.description.trim(),
        price: Number(productForm.price),
        discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : null,
        stockQuantity: Number(productForm.stockQuantity),
        sku: productForm.sku.trim(),
        brand: productForm.brand.trim(),
        categoryId: productForm.categoryId,
        specifications: parsedSpecifications,
        images: productForm.images,
        isFeatured: productForm.isFeatured,
        isAvailable: productForm.isAvailable,
      };

      if (productForm.id) {
        await api.patch(`/products/${productForm.id}`, payload);
        setMessage('Product updated successfully.');
      } else {
        await api.post('/products', payload);
        setMessage('Product created successfully.');
      }

      resetProductForm();
      await loadData();
    } catch (error) {
      setMessage('Unable to save product. Check the form values and try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    try {
      const payload = {
        name: categoryForm.name.trim(),
        slug: categoryForm.slug.trim(),
        description: categoryForm.description.trim() || null,
      };

      if (categoryForm.id) {
        await api.patch(`/categories/${categoryForm.id}`, payload);
        setMessage('Category updated successfully.');
      } else {
        await api.post('/categories', payload);
        setMessage('Category created successfully.');
      }

      resetCategoryForm();
      await loadData();
    } catch {
      setMessage('Unable to save category.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Delete this product?')) {
      return;
    }

    setBusy(true);
    try {
      await api.delete(`/products/${productId}`);
      await loadData();
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Delete this category? Products in it must be reassigned first.')) {
      return;
    }

    setBusy(true);
    try {
      await api.delete(`/categories/${categoryId}`);
      await loadData();
    } finally {
      setBusy(false);
    }
  };

  const handleOrderStatus = async (orderId: string, status: OrderStatus) => {
    await api.patch(`/orders/${orderId}/status`, { status });
    await loadData();
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const searchTarget = [
        order.customerName,
        order.customerEmail,
        order.customerPhone,
        order.deliveryAddress,
        order.id,
        ...order.orderItems.map((item) => item.product.name),
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = !query || searchTarget.includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  const statCards = [
    { label: 'Products', value: products.length },
    { label: 'Categories', value: categories.length },
    { label: 'Orders', value: orders.length },
    { label: 'Open', value: orders.filter((order) => order.status === 'PENDING' || order.status === 'PROCESSING').length },
  ];

  if (loading) {
    return <div className="surface rounded-[30px] p-6">Loading admin dashboard...</div>;
  }

  return (
    <section className="space-y-6 lg:space-y-8">
      <div className="surface rounded-[32px] p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">Admin dashboard</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950 lg:text-4xl">Inventory and order management</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              Create products and categories, update stock, manage order statuses, and upload product images.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[32rem]">
            {statCards.map((card) => (
              <div key={card.label} className="rounded-2xl bg-slate-50 p-4 text-center">
                <div className="text-2xl font-bold text-slate-950">{card.value}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{card.label}</div>
              </div>
            ))}
          </div>
        </div>

        {message && <p className="mt-5 rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800">{message}</p>}
      </div>

      <div className="flex flex-wrap gap-3">
        {(['products', 'categories', 'orders'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              activeTab === tab ? 'bg-slate-950 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-slate-400'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'products' && (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <form onSubmit={handleSubmitProduct} className="surface rounded-[30px] p-6 lg:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-2xl text-slate-950">
                  {productForm.id ? 'Edit product' : 'Create product'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">Manage title, pricing, images, and stock from one form.</p>
              </div>
              {productForm.id && (
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
                >
                  Cancel edit
                </button>
              )}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input
                value={productForm.name}
                onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
                placeholder="Product name"
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 md:col-span-2"
                required
              />
              <input
                value={productForm.slug}
                onChange={(event) => setProductForm({ ...productForm, slug: event.target.value })}
                placeholder="slug-for-url"
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
              <input
                value={productForm.sku}
                onChange={(event) => setProductForm({ ...productForm, sku: event.target.value })}
                placeholder="SKU"
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
              <input
                value={productForm.brand}
                onChange={(event) => setProductForm({ ...productForm, brand: event.target.value })}
                placeholder="Brand"
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
              <input
                type="number"
                min="0"
                value={productForm.price}
                onChange={(event) => setProductForm({ ...productForm, price: event.target.value })}
                placeholder="Price"
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
              <input
                type="number"
                min="0"
                value={productForm.discountPrice}
                onChange={(event) => setProductForm({ ...productForm, discountPrice: event.target.value })}
                placeholder="Discount price"
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              />
              <input
                type="number"
                min="0"
                value={productForm.stockQuantity}
                onChange={(event) => setProductForm({ ...productForm, stockQuantity: event.target.value })}
                placeholder="Stock quantity"
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
              <select
                value={productForm.categoryId}
                onChange={(event) => setProductForm({ ...productForm, categoryId: event.target.value })}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={productForm.isFeatured}
                  onChange={(event) => setProductForm({ ...productForm, isFeatured: event.target.checked })}
                />
                Featured product
              </label>
              <label className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={productForm.isAvailable}
                  onChange={(event) => setProductForm({ ...productForm, isAvailable: event.target.checked })}
                />
                Available for sale
              </label>
              <textarea
                value={productForm.description}
                onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
                placeholder="Product description"
                rows={4}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 md:col-span-2"
                required
              />
              <textarea
                value={productForm.specificationsJson}
                onChange={(event) => setProductForm({ ...productForm, specificationsJson: event.target.value })}
                placeholder="Specifications JSON"
                rows={6}
                className="rounded-2xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none transition focus:border-cyan-400 md:col-span-2"
              />

              <div className="md:col-span-2">
                <div className="flex items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;

                        setImageUploading(true);
                        try {
                          const url = await uploadImage(file);
                          setProductForm({ ...productForm, images: [...productForm.images, url] });
                        } finally {
                          setImageUploading(false);
                          event.target.value = '';
                        }
                      }}
                    />
                    Upload image
                  </label>
                  {imageUploading && <span className="text-sm text-slate-500">Uploading...</span>}
                </div>

                {productForm.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {productForm.images.map((image) => (
                      <div key={image} className="relative overflow-hidden rounded-2xl bg-slate-100">
                        <img src={image} alt="Product" className="h-24 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setProductForm({ ...productForm, images: productForm.images.filter((entry) => entry !== image) })}
                          className="absolute right-2 top-2 rounded-full bg-slate-950/80 px-2 py-1 text-[11px] font-semibold text-white"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-6 w-full rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? 'Saving...' : productForm.id ? 'Update product' : 'Create product'}
            </button>
          </form>

          <div className="surface rounded-[30px] p-6 lg:p-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-2xl text-slate-950">Products</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{products.length} items</span>
            </div>
            <div className="mt-5 space-y-4">
              {products.map((product) => (
                <article key={product.id} className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{product.brand}</div>
                      <h3 className="mt-1 text-lg font-semibold text-slate-950">{product.name}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-500">{product.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-slate-100 px-3 py-1">{product.category?.name}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">Stock {product.stockQuantity}</span>
                        <span className={`rounded-full px-3 py-1 ${product.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {product.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <div className="mt-3 text-sm font-semibold text-slate-950">
                        {formatCurrency(product.discountPrice ?? product.price)}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => beginEditProduct(product)}
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={busy}
                        className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {products.length === 0 && <div className="rounded-[24px] bg-slate-50 p-6 text-sm text-slate-500">No products yet.</div>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <form onSubmit={handleSubmitCategory} className="surface rounded-[30px] p-6 lg:p-8">
            <h2 className="font-heading text-2xl text-slate-950">
              {categoryForm.id ? 'Edit category' : 'Create category'}
            </h2>
            <p className="mt-2 text-sm text-slate-500">Categories organize the catalog and power front-end filtering.</p>

            <div className="mt-6 space-y-4">
              <input
                value={categoryForm.name}
                onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })}
                placeholder="Category name"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
              <input
                value={categoryForm.slug}
                onChange={(event) => setCategoryForm({ ...categoryForm, slug: event.target.value })}
                placeholder="category-slug"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
              <textarea
                value={categoryForm.description}
                onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })}
                placeholder="Optional description"
                rows={4}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              />

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? 'Saving...' : categoryForm.id ? 'Update category' : 'Create category'}
                </button>
                {categoryForm.id && (
                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:border-slate-400"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>

          <div className="surface rounded-[30px] p-6 lg:p-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-2xl text-slate-950">Categories</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{categories.length} items</span>
            </div>

            <div className="mt-5 space-y-4">
              {categories.map((category) => (
                <article key={category.id} className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">{category.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{category.slug}</p>
                      {category.description && <p className="mt-2 text-sm text-slate-500">{category.description}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => beginEditCategory(category)}
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={busy}
                        className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {categories.length === 0 && <div className="rounded-[24px] bg-slate-50 p-6 text-sm text-slate-500">No categories yet.</div>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="surface rounded-[30px] p-6 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-heading text-2xl text-slate-950">Orders</h2>
              <p className="mt-1 text-sm text-slate-500">Search and filter order history by client data or status.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search orders"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as OrderStatus | 'all')}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
              >
                <option value="all">All statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {filteredOrders.map((order) => (
              <article key={order.id} className="rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{order.status}</div>
                    <h3 className="text-lg font-semibold text-slate-950">{order.customerName}</h3>
                    <div className="text-sm text-slate-500">{order.customerEmail}</div>
                    <div className="text-sm text-slate-500">{order.customerPhone}</div>
                    <div className="text-sm text-slate-500">{order.deliveryAddress}</div>
                    <div className="text-xs text-slate-400">Created {new Date(order.createdAt).toLocaleString()}</div>
                  </div>

                  <div className="w-full max-w-xs space-y-3 lg:text-right">
                    <div className="text-2xl font-bold text-slate-950">{formatCurrency(order.totalAmount)}</div>
                    <select
                      value={order.status}
                      onChange={(event) => handleOrderStatus(order.id, event.target.value as OrderStatus)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-400 lg:text-right"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-200 pt-4">
                  <div className="grid gap-3">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                        <div>
                          <div className="font-semibold text-slate-950">{item.product.name}</div>
                          <div className="text-xs text-slate-500">Qty {item.quantity}</div>
                        </div>
                        <div className="font-semibold text-slate-950">{formatCurrency(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}

            {filteredOrders.length === 0 && <div className="rounded-[24px] bg-slate-50 p-6 text-sm text-slate-500">No orders found.</div>}
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminDashboard;
