import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Animated, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { createUser } from '../database/Database';

const SignUpScreen = ({ navigation }) => {
    const { signup } = useAuth();
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [stepGoal, setStepGoal] = useState('10000');
    const [waterGoal, setWaterGoal] = useState('3000');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleSignUp = async () => {
        setError('');

        // Validation
        const trimmedContact = contact.trim();
        if (!name.trim()) { setError('Please enter your name'); return; }
        if (!trimmedContact) { setError('Please enter your email or phone number'); return; }

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedContact);
        const isPhone = /^\+?[\d\s-]{10,}$/.test(trimmedContact);

        if (!isEmail && !isPhone) {
            setError('Please enter a valid email address or phone number');
            return;
        }

        if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match'); return; }

        setLoading(true);
        try {
            const parsedStepGoal = parseInt(stepGoal, 10) || 10000;
            const parsedWaterGoal = parseInt(waterGoal, 10) || 3000;

            const result = await createUser(name.trim(), trimmedContact, password, parsedStepGoal, parsedWaterGoal);
            if (result.success) {
                await signup(result.user);
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
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled">

                    {/* Header */}
                    <Animated.View style={[styles.headerSection, { opacity: fadeAnim }]}>
                        <View style={styles.logoSmall}>
                            <MaterialCommunityIcons name="white-balance-sunny" size={32} color={Colors.healthPrimary} />
                        </View>
                        <Text style={styles.headerTitle}>Create Account</Text>
                        <Text style={styles.headerSubtitle}>Start your wellness journey with Aura</Text>
                    </Animated.View>

                    {/* Signup Form */}
                    <Animated.View style={[styles.formSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

                        {error ? (
                            <View style={styles.errorBanner}>
                                <MaterialCommunityIcons name="alert-circle-outline" size={18} color={Colors.danger} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <TextInput
                            mode="outlined"
                            label="Full Name"
                            value={name}
                            onChangeText={(t) => { setName(t); setError(''); }}
                            style={styles.input}
                            outlineColor={Colors.border}
                            activeOutlineColor={Colors.healthPrimary}
                            textColor={Colors.textPrimary}
                            left={<TextInput.Icon icon="account-outline" color={Colors.textMuted} />}
                        />

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

                        <TextInput
                            mode="outlined"
                            label="Confirm Password"
                            value={confirmPassword}
                            onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
                            style={styles.input}
                            outlineColor={Colors.border}
                            activeOutlineColor={Colors.healthPrimary}
                            textColor={Colors.textPrimary}
                            secureTextEntry={!showPassword}
                            left={<TextInput.Icon icon="lock-check-outline" color={Colors.textMuted} />}
                        />

                        {/* Goals Section */}
                        <View style={styles.goalsHeader}>
                            <MaterialCommunityIcons name="target" size={18} color={Colors.prodPrimary} />
                            <Text style={styles.goalsTitle}>Your Daily Goals</Text>
                            <Text style={styles.optionalTag}>Optional</Text>
                        </View>

                        <View style={styles.goalsRow}>
                            <TextInput
                                mode="outlined"
                                label="Step Goal"
                                value={stepGoal}
                                onChangeText={setStepGoal}
                                style={[styles.input, styles.goalInput]}
                                outlineColor={Colors.border}
                                activeOutlineColor={Colors.healthPrimary}
                                textColor={Colors.textPrimary}
                                keyboardType="numeric"
                                left={<TextInput.Icon icon="shoe-print" color={Colors.healthPrimary} />}
                            />
                            <TextInput
                                mode="outlined"
                                label="Water (ml)"
                                value={waterGoal}
                                onChangeText={setWaterGoal}
                                style={[styles.input, styles.goalInput]}
                                outlineColor={Colors.border}
                                activeOutlineColor={Colors.prodPrimary}
                                textColor={Colors.textPrimary}
                                keyboardType="numeric"
                                left={<TextInput.Icon icon="water" color={Colors.prodPrimary} />}
                            />
                        </View>

                        <Button
                            mode="contained"
                            onPress={handleSignUp}
                            style={styles.signupButton}
                            buttonColor={Colors.healthPrimary}
                            textColor="#000"
                            labelStyle={styles.signupButtonLabel}
                            loading={loading}
                            disabled={loading}>
                            Create Account
                        </Button>

                        <View style={styles.loginRow}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={styles.loginLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1, padding: Spacing.lg, paddingTop: Spacing.md },
    headerSection: { alignItems: 'center', marginBottom: Spacing.lg },
    logoSmall: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: Colors.healthSurface,
        borderWidth: 2, borderColor: Colors.healthPrimary + '40',
        justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md,
    },
    headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 14, color: Colors.textMuted, marginTop: Spacing.xs },
    formSection: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
    errorBanner: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        backgroundColor: Colors.danger + '15', borderRadius: BorderRadius.md,
        padding: Spacing.md, marginBottom: Spacing.md,
        borderWidth: 1, borderColor: Colors.danger + '30',
    },
    errorText: { fontSize: 13, color: Colors.danger, flex: 1 },
    input: { backgroundColor: Colors.surfaceVariant, marginBottom: Spacing.md },
    goalsHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md, marginTop: Spacing.xs },
    goalsTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
    optionalTag: { fontSize: 11, color: Colors.textMuted, backgroundColor: Colors.surfaceVariant, paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.sm, overflow: 'hidden' },
    goalsRow: { flexDirection: 'row', gap: Spacing.sm },
    goalInput: { flex: 1 },
    signupButton: { borderRadius: BorderRadius.md, paddingVertical: 4, marginTop: Spacing.sm },
    signupButtonLabel: { fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
    loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.lg },
    loginText: { fontSize: 14, color: Colors.textSecondary },
    loginLink: { fontSize: 14, fontWeight: '700', color: Colors.healthPrimary },
});

export default SignUpScreen;
