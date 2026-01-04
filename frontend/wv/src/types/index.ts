export type ViewMode = '3d' | 'ar';

export interface ClothingItem {
    id: string;
    name: string;
    brand: string;
    price: string;
    originalPrice?: string;
    discount?: string;
    rating: number;
    reviews: number;
    image: string;
    category: string;
    sizes: string[];
    colors: string[];
    isLiked: boolean;
    description?: string;
    materials?: string;
    care?: string;
    shipping?: string;
}

export interface FilterItem {
    id: string;
    name: string;
    icon: string;
}

export interface TryOnHistoryItem {
    id: string;
    name: string;
    brand: string;
    price: string;
    image: string;
    date: string;
    liked: boolean;
}

// Order Types
export interface OrderItem {
    id: string;
    clothingItem: ClothingItem;
    size: string;
    color: string;
    quantity: number;
    price: string;
}

export interface OrderSummary {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
}

export interface Order {
    id: string;
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: PaymentMethod;
    orderSummary: OrderSummary;
    orderDate: string;
    estimatedDelivery: string;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
    trackingNumber?: string;
    total?: number; // legacy/optional compatibility
}

export interface ShippingAddress {
    id?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    fullName?: string;
    phone?: string;
    email?: string;
    isDefault?: boolean;
}

export interface PaymentMethod {
    id: string;
    type: string;
    lastFour?: string;
    brand?: string;
    cardHolder?: string;
    expiryDate?: string;
    isDefault?: boolean;
}
