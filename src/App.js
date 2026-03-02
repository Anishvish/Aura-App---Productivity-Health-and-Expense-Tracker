import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { PaperProvider, Text } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme, Colors } from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import AppNavigator from './navigation/AppNavigator';
import { initDatabase } from './database/Database';

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
            <PaperProvider theme={theme}>
                <AuthProvider>
                    <AppProvider>
                        <AppNavigator />
                    </AppProvider>
                </AuthProvider>
            </PaperProvider>
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
