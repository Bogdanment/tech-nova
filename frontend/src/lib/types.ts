export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  stockQuantity: number;
  sku: string;
  brand: string;
  categoryId?: string;
  category: Category;
  specifications: Record<string, unknown> | null;
  images: string[];
  isFeatured: boolean;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  orderItems: Array<{
    id: string;
    quantity: number;
    price: number;
    product: Product;
  }>;
};

export type User = {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
};
