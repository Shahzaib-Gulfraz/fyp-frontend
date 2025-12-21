// src/context/UserContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

type UserRole = 'user' | 'shop_owner';

interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  fullName?: string;
  phone?: string;
  avatar?: string;
  shopId?: string; // For shop owners
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  switchToShopOwner: () => void;
  switchToUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock login function - replace with actual API call
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data - in real app, this would come from your API
    const mockUser: User = {
      id: '1',
      username: email.includes('shop') ? 'fashionhub' : 'john_doe',
      email,
      role: email.includes('shop') ? 'shop_owner' : 'user',
      fullName: email.includes('shop') ? 'Fashion Hub Boutique' : 'John Doe',
      phone: '+1 (555) 123-4567',
      avatar: email.includes('shop') 
        ? 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400'
        : 'https://images.unsplash.com/photo-1494790108755-2616b786d4d9?w=400',
      shopId: email.includes('shop') ? 'shop_123' : undefined,
    };
    
    setUser(mockUser);
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  const switchToShopOwner = () => {
    if (user) {
      setUser({
        ...user,
        role: 'shop_owner',
        shopId: user.shopId || 'shop_' + Date.now(),
      });
    }
  };

  const switchToUser = () => {
    if (user) {
      setUser({
        ...user,
        role: 'user',
        shopId: undefined,
      });
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      updateUser,
      switchToShopOwner,
      switchToUser,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}