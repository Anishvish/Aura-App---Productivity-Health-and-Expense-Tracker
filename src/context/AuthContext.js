import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserById, updateUserTheme } from '../database/Database';

const AuthContext = createContext();

const AUTH_STORAGE_KEY = '@aura_auth_user_id';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on app launch
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
                if (storedUserId) {
                    const userData = await getUserById(parseInt(storedUserId, 10));
                    if (userData) {
                        setUser(userData);
                    } else {
                        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
                    }
                }
            } catch (error) {
                console.error('Error checking auth:', error);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (userData) => {
        try {
            setUser(userData);
            await AsyncStorage.setItem(AUTH_STORAGE_KEY, String(userData.id));
        } catch (error) {
            console.error('Error saving auth state:', error);
        }
    };

    const signup = async (userData) => {
        try {
            setUser(userData);
            await AsyncStorage.setItem(AUTH_STORAGE_KEY, String(userData.id));
        } catch (error) {
            console.error('Error saving auth state:', error);
        }
    };

    const logout = async () => {
        try {
            setUser(null);
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing auth state:', error);
        }
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    // Instant theme switching - updates state immediately + persists to DB
    const setTheme = async (themeName) => {
        if (user) {
            setUser(prev => ({ ...prev, theme: themeName }));
            try {
                await updateUserTheme(user.id, themeName);
            } catch (e) {
                console.error('Error persisting theme:', e);
            }
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, isLoggedIn: !!user, login, signup, logout, updateUser, setTheme }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
