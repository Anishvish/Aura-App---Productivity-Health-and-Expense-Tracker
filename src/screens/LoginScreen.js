import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Animated, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Spacing, BorderRadius } from '../theme/theme';
import { useTheme } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { validateUser } from '../database/Database';

const LoginScreen = ({ navigation }) => {
    const { colors: Colors, dark: isDarkTheme } = useTheme();
    const styles = getStyles ? getStyles(Colors) : {};
    const { login } = useAuth();
    const [contact, setContact] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
            Animated.spring(logoScale, { toValue: 1, friction: 4, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleLogin = async () => {
        setError('');
        const trimmedContact = contact.trim();
        if (!trimmedContact) { setError('Please enter your email or phone number'); return; }

        // Basic validation: must be a valid email OR at least a 10-digit number
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedContact);
        const isPhone = /^\+?[\d\s-]{10,}$/.test(trimmedContact);

        if (!isEmail && !isPhone) {
            setError('Please enter a valid email address or phone number');
            return;
        }

        if (!password) { setError('Please enter your password'); return; }

        setLoading(true);
        try {
            const result = await validateUser(trimmedContact, password);
            if (result.success) {
                await login(result.user);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={isDarkTheme ? "light-content" : "dark-content"} backgroundColor={Colors.background} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled">

                    {/* Logo & Branding */}
                    <Animated.View style={[styles.logoSection, { opacity: fadeAnim, transform: [{ scale: logoScale }] }]}>
                        <View style={styles.logoCircle}>
                            <Image source={require('../../assets/icon.png')} style={{ width: 60, height: 60, borderRadius: 30 }} />
                        </View>
                        <Text style={styles.appTitle}>Aura</Text>
                        <Text style={styles.appSubtitle}>Health & Productivity Hub</Text>
                    </Animated.View>

                    {/* Login Form */}
                    <Animated.View style={[styles.formSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <Text style={styles.formTitle}>Welcome Back</Text>
                        <Text style={styles.formSubtitle}>Sign in to continue your journey</Text>

                        {error ? (
                            <View style={styles.errorBanner}>
                                <MaterialCommunityIcons name="alert-circle-outline" size={18} color={Colors.danger} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <TextInput
                            mode="outlined"
                            label="Email or Phone Number"
                            value={contact}
                            onChangeText={(t) => { setContact(t); setError(''); }}
                            style={styles.input}
                            outlineColor={Colors.border}
                            activeOutlineColor={Colors.healthPrimary}
                            textColor={Colors.textPrimary}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            left={<TextInput.Icon icon="account-outline" color={Colors.textMuted} />}
                        />

                        <TextInput
                            mode="outlined"
                            label="Password"
                            value={password}
                            onChangeText={(t) => { setPassword(t); setError(''); }}
                            style={styles.input}
                            outlineColor={Colors.border}
                            activeOutlineColor={Colors.healthPrimary}
                            textColor={Colors.textPrimary}
                            secureTextEntry={!showPassword}
                            left={<TextInput.Icon icon="lock-outline" color={Colors.textMuted} />}
                            right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} color={Colors.textMuted} onPress={() => setShowPassword(!showPassword)} />}
                        />

                        <Button
                            mode="contained"
                            onPress={handleLogin}
                            style={styles.loginButton}
                            buttonColor={Colors.healthPrimary}
                            textColor="#000"
                            labelStyle={styles.loginButtonLabel}
                            loading={loading}
                            disabled={loading}>
                            Sign In
                        </Button>

                        <View style={styles.signupRow}>
                            <Text style={styles.signupText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                                <Text style={styles.signupLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const getStyles = (Colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg },
    logoSection: { alignItems: 'center', marginBottom: Spacing.xxl },
    logoCircle: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: Colors.healthSurface,
        borderWidth: 2, borderColor: Colors.healthPrimary + '40',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: Colors.healthPrimary, shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
    },
    appTitle: { fontSize: 42, fontWeight: '900', color: Colors.textPrimary, letterSpacing: 4, marginTop: Spacing.md },
    appSubtitle: { fontSize: 14, color: Colors.textMuted, letterSpacing: 2, marginTop: Spacing.xs, textTransform: 'uppercase' },
    formSection: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
    formTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.xs },
    formSubtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: Spacing.lg },
    errorBanner: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        backgroundColor: Colors.danger + '15', borderRadius: BorderRadius.md,
        padding: Spacing.md, marginBottom: Spacing.md,
        borderWidth: 1, borderColor: Colors.danger + '30',
    },
    errorText: { fontSize: 13, color: Colors.danger, flex: 1 },
    input: { backgroundColor: Colors.surfaceVariant, marginBottom: Spacing.md },
    loginButton: { borderRadius: BorderRadius.md, paddingVertical: 4, marginTop: Spacing.sm },
    loginButtonLabel: { fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
    signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.lg },
    signupText: { fontSize: 14, color: Colors.textSecondary },
    signupLink: { fontSize: 14, fontWeight: '700', color: Colors.healthPrimary },
});

export default LoginScreen;
