// src/context/UserContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from "@/src/context/AuthContext";

type UserRole = 'user' | 'shop_owner';

export interface User {
  id: string;
  _id?: string; // Mongoose ID
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

  // Load user from storage on mount
  React.useEffect(() => {
    const initUser = async () => {
      try {
        const { authService } = await import('@/src/api');
        const storedUser = await authService.getStoredUser();
        if (storedUser) {
          // Normalize ID
          const normalizedUser = {
            ...storedUser,
            id: storedUser.id || storedUser._id
          };
          setUser(normalizedUser);
          setAuthenticated(true);
        } else {
          // Try to fetch profile if token exists
          const isAuth = await authService.isAuthenticated();
          if (isAuth) {
            setAuthenticated(true);
            await refreshProfile();
          }
        }
      } catch (e) {
        console.log('User init error', e);
      }
    };
    initUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { authService } = await import('@/src/api');
      const response = await authService.login(email, password);

      const loggedInUser = response.user;
      // Normalize ID
      const userWithId = {
        ...loggedInUser,
        id: loggedInUser.id || loggedInUser._id
      };

      setUser(userWithId);
      setAuthenticated(true);

      return response;
    } catch (error) {
      console.log('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
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