import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
    isAuthenticated: boolean;
    userType: "user" | "shop" | "admin" | null;
    isLoading: boolean;
    checkAuth: () => Promise<void>;
    setAuthenticated: (authenticated: boolean, type?: "user" | "shop" | "admin" | null) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userType, setUserType] = useState<"user" | "shop" | "admin" | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        console.log('🔍 AuthContext: Checking authentication...');
        try {
            const token = await AsyncStorage.getItem('authToken');
            const type = await AsyncStorage.getItem('userType') as "user" | "shop" | "admin" | null;
            const sessionTimestamp = await AsyncStorage.getItem('sessionTimestamp');

            const hasToken = !!token;
            console.log('🔍 AuthContext: checkAuth result:', { hasToken, type, token: token ? 'EXISTS' : 'MISSING', sessionTimestamp });

            // Check if session is valid (not expired)
            let isSessionValid = false;
            if (hasToken && sessionTimestamp) {
                const lastLoginTime = parseInt(sessionTimestamp, 10);
                const currentTime = Date.now();
                const sessionDuration = 0; // No auto-login - require fresh login every time
                
                isSessionValid = (currentTime - lastLoginTime) < sessionDuration;
                console.log('🔍 Session check:', { 
                    lastLoginTime: new Date(lastLoginTime).toISOString(), 
                    currentTime: new Date(currentTime).toISOString(),
                    isValid: isSessionValid 
                });
            }

            // Only authenticate if token exists AND session is valid
            if (hasToken && isSessionValid) {
                setIsAuthenticated(true);
                setUserType(type);
            } else {
                // Session expired or no session - clear everything
                if (hasToken && !isSessionValid) {
                    console.log('⏰ Session expired - clearing auth data');
                    await AsyncStorage.removeItem('authToken');
                    await AsyncStorage.removeItem('user');
                    await AsyncStorage.removeItem('userType');
                    await AsyncStorage.removeItem('shop');
                    await AsyncStorage.removeItem('sessionTimestamp');
                }
                setIsAuthenticated(false);
                setUserType(null);
            }
        } catch (error) {
            console.error('AuthContext: Error checking auth:', error);
            setIsAuthenticated(false);
            setUserType(null);
        } finally {
            setIsLoading(false);
        }
    };

    const setAuthenticated = async (authenticated: boolean, type: "user" | "shop" | "admin" | null = null) => {
        console.log('🔄 AuthContext: Setting auth:', authenticated, 'Type:', type);
        setIsAuthenticated(authenticated);
        setUserType(type);
        try {
            if (authenticated && type) {
                await AsyncStorage.setItem('userType', type);
                // Store session timestamp when user logs in
                await AsyncStorage.setItem('sessionTimestamp', Date.now().toString());
                console.log('✅ Session timestamp saved:', new Date().toISOString());
            } else {
                await AsyncStorage.removeItem('userType');
                await AsyncStorage.removeItem('sessionTimestamp');
            }
        } catch (error) {
            console.error('AuthContext: Error saving userType:', error);
        }
    };

    const logout = async () => {
        try {
            console.log('🚪 AuthContext: Logging out...');
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('userType');
            await AsyncStorage.removeItem('shop'); // Also clear shop data for seller logout
            await AsyncStorage.removeItem('sessionTimestamp'); // Clear session timestamp
            setAuthenticated(false, null);
        } catch (error) {
            console.error('AuthContext: Logout error:', error);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, userType, isLoading, checkAuth, setAuthenticated, logout }}>
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
