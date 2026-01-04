// src/context/UserContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from "@/src/context/AuthContext";

type UserRole = 'user' | 'shop_owner';

interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  fullName?: string;
  phone?: string;
  profileImage?: string;
  shopId?: string; // For shop owners
  bio?: string;
  location?: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshProfile: () => Promise<void>;
  switchToShopOwner: () => void;
  switchToUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { setAuthenticated } = useAuth();

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
      profileImage: email.includes('shop')
        ? 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400'
        : 'https://images.unsplash.com/photo-1494790108755-2616b786d4d9?w=400',
      shopId: email.includes('shop') ? 'shop_123' : undefined,
      bio: 'Fashion enthusiast • Virtual try-on expert',
      location: 'New York, USA',
    };

    setUser(mockUser);
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      console.log('logout from context');
      const { authService } = await import('@/src/api');
      await authService.logout();
      setAuthenticated(false);
    } catch (error) {
      console.error('Error during context logout:', error);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  const refreshProfile = async () => {
    try {
      // In a real implementation, this would call api.get('/auth/me')
      // For now, we'll try to use the authService if available
      const { authService } = await import('@/src/api');
      try {
        const userData = await authService.getProfile();
        // Check if userData is nested under 'user' key or is the user object directly
        const freshUser = userData.user || userData;

        setUser(prev => {
          // If we have fresh data, use it to populate user state
          return {
            ...(prev || {}),
            ...freshUser,
            // Ensure ID is consistent if backend returns _id
            id: freshUser.id || freshUser._id || (prev ? prev.id : '')
          };
        });
        console.log("Profile refreshed successfully");
      } catch (err) {
        console.error("Failed to fetch fresh profile from API:", err);
      }
    } catch (e) {
      console.log("Auth service not available yet or error importing");
    }
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
      refreshProfile,
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