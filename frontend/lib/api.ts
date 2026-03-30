const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Generic fetch wrapper — uses British spelling 'authorisation' to match backend
async function request<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { authorisation: `Bearer ${token}` }),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  success: boolean;
  data: {
    user: { id: string; name: string; email: string; role: string };
    tokens: { accessToken: string; refreshToken: string };
  };
}

export interface ProfileResponse {
  success: boolean;
  data: { user: { id: string; name: string; email: string; role: string; isVerified: boolean } };
}

export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: (refreshToken: string) =>
    request("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  getProfile: () => request<ProfileResponse>("/api/auth/profile"),
};

// ─── Products ─────────────────────────────────────────────────────────────────

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  flavour?: string;
  weight?: string;
  servings?: number;
  images: string[];
  stock: number;
  SKU: string;
  isFeatured: boolean;
  isActive: boolean;
  rating: number;
  numReviews: number;
  tags: string[];
  reviews: Review[];
  createdAt: string;
}

export interface Review {
  _id: string;
  userId: string;
  username: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      current: number;
      total: number;
      results: number;
      totalProducts: number;
    };
  };
}

export const productsAPI = {
  getAll: (params?: Record<string, string>) => {
    const query = params
      ? "?" + new URLSearchParams(params).toString()
      : "";
    return request<ProductsResponse>(`/api/products${query}`);
  },

  getById: (id: string) =>
    request<{ success: boolean; data: Product }>(`/api/products/${id}`),

  getFeatured: () =>
    request<{ success: boolean; data: Product[] }>("/api/products/featured"),

  addReview: (id: string, data: { rating: number; comment: string }) =>
    request(`/api/products/${id}/reviews`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Cart ────────────────────────────────────────────────────────────────────

export const cartAPI = {
  get: () => request("/api/cart"),

  addItem: (productId: string, quantity: number) =>
    request("/api/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    }),

  updateItem: (productId: string, quantity: number) =>
    request(`/api/cart/items/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),

  removeItem: (productId: string) =>
    request(`/api/cart/items/${productId}`, { method: "DELETE" }),

  clear: () => request("/api/cart", { method: "DELETE" }),
};

// ─── Orders ──────────────────────────────────────────────────────────────────

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: {
    productId: string;
    name: string;
    brand: string;
    image?: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  trackingNumber?: string;
  createdAt: string;
}

export const ordersAPI = {
  create: (data: {
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    notes?: string;
  }) =>
    request<{ success: boolean; data: Order }>("/api/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMyOrders: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{
      success: boolean;
      data: { orders: Order[]; pagination: object };
    }>(`/api/orders/my-orders${query}`);
  },

  getById: (id: string) =>
    request<{ success: boolean; data: Order }>(`/api/orders/${id}`),

  cancel: (id: string, reason?: string) =>
    request(`/api/orders/${id}/cancel`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    }),
};
