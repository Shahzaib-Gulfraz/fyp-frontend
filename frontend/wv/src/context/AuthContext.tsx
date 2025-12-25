import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
    isAuthenticated: boolean;
    userType: "user" | "shop" | null;
    isLoading: boolean;
    checkAuth: () => Promise<void>;
    setAuthenticated: (authenticated: boolean, type?: "user" | "shop" | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userType, setUserType] = useState<"user" | "shop" | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        console.log('🔍 AuthContext: Checking authentication...');
        try {
            const token = await AsyncStorage.getItem('authToken');
            const type = await AsyncStorage.getItem('userType') as "user" | "shop" | null;

            const hasToken = !!token;
            console.log('🔍 AuthContext: Token exists:', hasToken, 'Type:', type);

            setIsAuthenticated(hasToken);
            setUserType(type);
        } catch (error) {
            console.error('AuthContext: Error checking auth:', error);
            setIsAuthenticated(false);
            setUserType(null);
        } finally {
            setIsLoading(false);
        }
    };

    const setAuthenticated = (authenticated: boolean, type: "user" | "shop" | null = null) => {
        console.log('🔄 AuthContext: Setting auth:', authenticated, 'Type:', type);
        setIsAuthenticated(authenticated);
        setUserType(type);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, userType, isLoading, checkAuth, setAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
