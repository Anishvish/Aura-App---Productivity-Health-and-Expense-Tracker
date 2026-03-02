import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { PaperProvider, Text } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme, darkTheme, lightTheme, Colors } from './theme/theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import AppNavigator from './navigation/AppNavigator';
import { initDatabase } from './database/Database';

const ThemeWrapper = ({ children }) => {
    const { user } = useAuth();
    const activeTheme = user?.theme === 'light' ? lightTheme : darkTheme;

    return (
        <PaperProvider theme={activeTheme}>
            {children}
        </PaperProvider>
    );
};

const App = () => {
    const [dbReady, setDbReady] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const init = async () => {
            try {
                const success = await initDatabase();
                if (success) {
                    setDbReady(true);
                } else {
                    setError('Failed to initialize database');
                }
            } catch (err) {
                setError(err.message);
            }
        };
        init();
    }, []);

    if (error) {
        return (
            <SafeAreaProvider>
                <PaperProvider theme={theme}>
                    <View style={styles.loadingContainer}>
                        <Text style={styles.errorText}>⚠️ {error}</Text>
                    </View>
                </PaperProvider>
            </SafeAreaProvider>
        );
    }

    if (!dbReady) {
        return (
            <SafeAreaProvider>
                <PaperProvider theme={theme}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.healthPrimary} />
                        <Text style={styles.loadingText}>Initializing Aura...</Text>
                    </View>
                </PaperProvider>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <AuthProvider>
                <ThemeWrapper>
                    <AppProvider>
                        <AppNavigator />
                    </AppProvider>
                </ThemeWrapper>
            </AuthProvider>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: Colors.textSecondary,
    },
    errorText: {
        fontSize: 16,
        color: Colors.danger,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
});

export default App;
