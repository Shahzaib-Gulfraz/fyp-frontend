import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    checkAuth: () => Promise<void>;
    setAuthenticated: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        console.log('🔍 AuthContext: Checking authentication...');
        try {
            const token = await AsyncStorage.getItem('authToken');
            const hasToken = !!token;
            console.log('🔍 AuthContext: Token exists:', hasToken);
            setIsAuthenticated(hasToken);
        } catch (error) {
            console.error('AuthContext: Error checking auth:', error);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const setAuthenticated = (value: boolean) => {
        console.log('🔄 AuthContext: Setting authenticated to:', value);
        setIsAuthenticated(value);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, checkAuth, setAuthenticated }}>
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
