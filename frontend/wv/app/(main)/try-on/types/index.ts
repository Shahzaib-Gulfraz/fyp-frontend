export type ViewMode = '3d' | 'ar' | 'generated';

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