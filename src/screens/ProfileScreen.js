import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Alert, Image, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Spacing, BorderRadius } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../database/Database';

const ProfileScreen = () => {
    const { user, logout, updateUser } = useAuth();
    const [editingProfile, setEditingProfile] = useState(false);
    const [editingFinance, setEditingFinance] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [profilePic, setProfilePic] = useState(user?.profilePic || null);
    const [stepGoal, setStepGoal] = useState(String(user?.stepGoal || 10000));
    const [waterGoal, setWaterGoal] = useState(String(user?.waterGoal || 3000));

    // Height & DOB Handling
    const [heightUnit, setHeightUnit] = useState('cm');
    const [heightCm, setHeightCm] = useState(String(user?.heightCm || ''));
    const [heightFt, setHeightFt] = useState(user?.heightCm ? Math.floor(user.heightCm / 30.48).toString() : '');
    const [heightIn, setHeightIn] = useState(user?.heightCm ? Math.round((user.heightCm / 30.48 - Math.floor(user.heightCm / 30.48)) * 12).toString() : '');
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [weightKg, setWeightKg] = useState(String(user?.weightKg || ''));
    const [dob, setDob] = useState(user?.dob || '');
    const [themePreference, setThemePreference] = useState(user?.theme || 'dark');

    // Finance settings
    const [currency, setCurrency] = useState(user?.currency || '$');
    const [dailyLimit, setDailyLimit] = useState(String(user?.dailyLimit || 0));
    const [monthlyLimit, setMonthlyLimit] = useState(String(user?.monthlyLimit || 0));

    const [saving, setSaving] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);

    const getBMI = () => {
        const h = parseFloat(heightCm);
        const w = parseFloat(weightKg);
        if (h > 0 && w > 0) {
            const heightM = h / 100;
            return (w / (heightM * heightM)).toFixed(1);
        }
        return null;
    };

    const getBMICategory = (bmi) => {
        const val = parseFloat(bmi);
        if (val < 18.5) return { label: 'Underweight', color: Colors.prodPrimary };
        if (val < 25) return { label: 'Normal', color: Colors.healthPrimary };
        if (val < 30) return { label: 'Overweight', color: Colors.warning };
        return { label: 'Obese', color: Colors.danger };
    };

    const handleSave = async () => {
        if (!name.trim() || !email.trim()) { Alert.alert('Error', 'Name and Email cannot be empty'); return; }
        setSaving(true);
        try {
            let finalHeightCm = parseFloat(heightCm) || 0;
            if (heightUnit === 'ft') {
                const ft = parseFloat(heightFt) || 0;
                const inch = parseFloat(heightIn) || 0;
                finalHeightCm = Math.round((ft * 30.48) + (inch * 2.54));
            }

            const result = await updateUserProfile(user.id, {
                name: name.trim(),
                email: email.trim(),
                stepGoal: parseInt(stepGoal, 10) || 10000,
                waterGoal: parseInt(waterGoal, 10) || 3000,
                heightCm: finalHeightCm,
                weightKg: parseFloat(weightKg) || 0,
                profilePic: profilePic,
                currency: currency,
                dailyLimit: parseFloat(dailyLimit) || 0,
                monthlyLimit: parseFloat(monthlyLimit) || 0,
                dob: dob,
                theme: themePreference
            });
            if (result.success) {
                updateUser(result.user);
                setEditingProfile(false);
                setEditingFinance(false);
                setSnackbarVisible(true);
            } else {
                Alert.alert('Error', result.error);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Sorry', 'We need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setProfilePic(result.assets[0].uri);
            if (!editingProfile && !editingFinance) {
                // Instantly save if picked when not in full edit mode
                await handleSaveInstant(result.assets[0].uri);
            }
        }
    };

    const handleSaveInstant = async (newPicUri) => {
        const result = await updateUserProfile(user.id, {
            name: user.name,
            email: user.email,
            stepGoal: user.stepGoal || 10000,
            waterGoal: user.waterGoal || 3000,
            heightCm: user.heightCm || 0,
            weightKg: user.weightKg || 0,
            profilePic: newPicUri,
            currency: user?.currency || '$',
            dailyLimit: user?.dailyLimit || 0,
            monthlyLimit: user?.monthlyLimit || 0,
            dob: user?.dob || '',
            theme: themePreference
        });
        if (result.success) {
            updateUser(result.user);
            setSnackbarVisible(true);
        }
    };

    const bmi = getBMI();
    const bmiCategory = bmi ? getBMICategory(bmi) : null;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarCircle}>
                        {profilePic ? (
                            <Image source={{ uri: profilePic }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'A'}</Text>
                        )}
                        <View style={styles.editIconBadge}>
                            <MaterialCommunityIcons name="camera" size={14} color="#000" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.profileName}>{user?.name}</Text>
                    <Text style={styles.profileEmail}>{user?.email}</Text>
                </View>

                {/* BMI Card */}
                <View style={styles.bmiCard}>
                    <View style={styles.bmiHeader}>
                        <MaterialCommunityIcons name="human" size={22} color={Colors.healthPrimary} />
                        <Text style={styles.bmiTitle}>BMI Index</Text>
                    </View>
                    {bmi ? (
                        <View style={styles.bmiContent}>
                            <Text style={[styles.bmiValue, { color: bmiCategory.color }]}>{bmi}</Text>
                            <View style={[styles.bmiCategoryBadge, { backgroundColor: bmiCategory.color + '20', borderColor: bmiCategory.color + '40' }]}>
                                <Text style={[styles.bmiCategoryText, { color: bmiCategory.color }]}>{bmiCategory.label}</Text>
                            </View>
                            <View style={styles.bmiBar}>
                                <View style={[styles.bmiBarSegment, { flex: 18.5, backgroundColor: Colors.prodPrimary + '60' }]} />
                                <View style={[styles.bmiBarSegment, { flex: 6.5, backgroundColor: Colors.healthPrimary + '60' }]} />
                                <View style={[styles.bmiBarSegment, { flex: 5, backgroundColor: Colors.warning + '60' }]} />
                                <View style={[styles.bmiBarSegment, { flex: 10, backgroundColor: Colors.danger + '60' }]} />
                            </View>
                            <View style={styles.bmiLabels}>
                                <Text style={styles.bmiLabel}>Under</Text>
                                <Text style={styles.bmiLabel}>Normal</Text>
                                <Text style={styles.bmiLabel}>Over</Text>
                                <Text style={styles.bmiLabel}>Obese</Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.bmiEmpty}>
                            <MaterialCommunityIcons name="scale-bathroom" size={32} color={Colors.textMuted} />
                            <Text style={styles.bmiEmptyText}>Add your height & weight to see your BMI</Text>
                        </View>
                    )}
                </View>

                {/* Profile Details / Edit */}
                <View style={styles.detailsCard}>
                    <View style={styles.detailsHeader}>
                        <Text style={styles.detailsTitle}>Profile Details</Text>
                        {!editingProfile && (
                            <Button mode="text" onPress={() => setEditingProfile(true)} textColor={Colors.healthPrimary} compact icon="pencil">
                                Edit
                            </Button>
                        )}
                    </View>

                    {editingProfile ? (
                        <View>
                            <TextInput
                                mode="outlined" label="Full Name" value={name} onChangeText={setName}
                                style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.healthPrimary}
                                textColor={Colors.textPrimary} left={<TextInput.Icon icon="account" color={Colors.textMuted} />}
                            />
                            <TextInput
                                mode="outlined" label="Email Address" value={email} onChangeText={setEmail}
                                style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.healthPrimary}
                                textColor={Colors.textPrimary} left={<TextInput.Icon icon="email" color={Colors.textMuted} />}
                                keyboardType="email-address" autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.8}>
                                <View pointerEvents="none">
                                    <TextInput
                                        mode="outlined" label="Date of Birth" value={dob}
                                        style={styles.input} outlineColor={Colors.border} activeOutlineColor={Colors.healthPrimary}
                                        textColor={Colors.textPrimary} left={<TextInput.Icon icon="calendar" color={Colors.textMuted} />}
                                    />
                                </View>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={dob ? new Date(dob) : new Date(2000, 0, 1)}
                                    mode="date"
                                    display="default"
                                    maximumDate={new Date()}
                                    onChange={(event, selectedDate) => {
                                        setShowDatePicker(false);
                                        if (selectedDate) setDob(selectedDate.toISOString().split('T')[0]);
                                    }}
                                />
                            )}

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs, justifyContent: 'space-between' }}>
                                <Text style={styles.priorityLabel}>Height Unit</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <Button mode={heightUnit === 'cm' ? 'contained' : 'outlined'} onPress={() => setHeightUnit('cm')} compact style={{ marginRight: 8 }} buttonColor={heightUnit === 'cm' ? Colors.healthPrimary : 'transparent'}>cm</Button>
                                    <Button mode={heightUnit === 'ft' ? 'contained' : 'outlined'} onPress={() => setHeightUnit('ft')} compact buttonColor={heightUnit === 'ft' ? Colors.healthPrimary : 'transparent'}>ft/in</Button>
                                </View>
                            </View>

                            <View style={styles.row}>
                                {heightUnit === 'cm' ? (
                                    <TextInput
                                        mode="outlined" label="Height (cm)" value={heightCm} onChangeText={setHeightCm}
                                        style={[styles.input, styles.halfInput]} outlineColor={Colors.border}
                                        activeOutlineColor={Colors.healthPrimary} textColor={Colors.textPrimary}
                                        keyboardType="numeric" left={<TextInput.Icon icon="human-male-height" color={Colors.textMuted} />}
                                    />
                                ) : (
                                    <>
                                        <TextInput
                                            mode="outlined" label="Feet" value={heightFt} onChangeText={setHeightFt}
                                            style={[styles.input, styles.halfInput]} outlineColor={Colors.border}
                                            activeOutlineColor={Colors.healthPrimary} textColor={Colors.textPrimary}
                                            keyboardType="numeric" left={<TextInput.Icon icon="human-male-height" color={Colors.textMuted} />}
                                        />
                                        <TextInput
                                            mode="outlined" label="Inches" value={heightIn} onChangeText={setHeightIn}
                                            style={[styles.input, styles.halfInput]} outlineColor={Colors.border}
                                            activeOutlineColor={Colors.healthPrimary} textColor={Colors.textPrimary}
                                            keyboardType="numeric"
                                        />
                                    </>
                                )}
                                <TextInput
                                    mode="outlined" label="Weight (kg)" value={weightKg} onChangeText={setWeightKg}
                                    style={[styles.input, styles.halfInput]} outlineColor={Colors.border}
                                    activeOutlineColor={Colors.healthPrimary} textColor={Colors.textPrimary}
                                    keyboardType="numeric" left={<TextInput.Icon icon="weight-kilogram" color={Colors.textMuted} />}
                                />
                            </View>
                            <View style={styles.row}>
                                <TextInput
                                    mode="outlined" label="Step Goal" value={stepGoal} onChangeText={setStepGoal}
                                    style={[styles.input, styles.halfInput]} outlineColor={Colors.border}
                                    activeOutlineColor={Colors.healthPrimary} textColor={Colors.textPrimary}
                                    keyboardType="numeric" left={<TextInput.Icon icon="shoe-print" color={Colors.healthPrimary} />}
                                />
                                <TextInput
                                    mode="outlined" label="Water Goal (ml)" value={waterGoal} onChangeText={setWaterGoal}
                                    style={[styles.input, styles.halfInput]} outlineColor={Colors.border}
                                    activeOutlineColor={Colors.prodPrimary} textColor={Colors.textPrimary}
                                    keyboardType="numeric" left={<TextInput.Icon icon="water" color={Colors.prodPrimary} />}
                                />
                            </View>
                            <View style={styles.editActions}>
                                <Button mode="outlined" onPress={() => setEditingProfile(false)} style={styles.actionBtn}
                                    textColor={Colors.textSecondary} borderColor={Colors.border}>Cancel</Button>
                                <Button mode="contained" onPress={handleSave} style={styles.actionBtn}
                                    buttonColor={Colors.healthPrimary} textColor="#000" loading={saving}>Save</Button>
                            </View>
                        </View>
                    ) : (
                        <View>
                            <DetailRow icon="account" label="Name" value={user?.name || 'Not set'} color={Colors.healthPrimary} />
                            <DetailRow icon="email" label="Email" value={user?.email || 'Not set'} />
                            <DetailRow icon="calendar" label="Date of Birth" value={user?.dob || 'Not set'} />
                            <DetailRow icon="ruler" label="Height" value={user?.heightCm ? `${user.heightCm} cm (${Math.floor(user.heightCm / 30.48)}'${Math.round((user.heightCm / 30.48 - Math.floor(user.heightCm / 30.48)) * 12)}")` : 'Not set'} />
                            <DetailRow icon="weight-kilogram" label="Weight" value={user?.weightKg ? `${user.weightKg} kg` : 'Not set'} />
                            <DetailRow icon="shoe-print" label="Step Goal" value={`${(user?.stepGoal || 10000).toLocaleString()} steps`} color={Colors.healthPrimary} />
                            <DetailRow icon="water" label="Water Goal" value={`${user?.waterGoal || 3000} ml`} color={Colors.prodPrimary} />
                        </View>
                    )}
                </View>

                {/* Finance Settings */}
                <View style={styles.detailsCard}>
                    <View style={styles.detailsHeader}>
                        <Text style={styles.detailsTitle}>Finance Settings</Text>
                        {!editingFinance && (
                            <Button mode="text" onPress={() => setEditingFinance(true)} textColor={Colors.warning} compact icon="pencil">
                                Edit
                            </Button>
                        )}
                    </View>

                    {editingFinance ? (
                        <View>
                            <Text style={styles.priorityLabel}>Currency Symbol</Text>
                            <View style={styles.currencyRow}>
                                {['$', '₹', '€', '£'].map((c) => (
                                    <Button
                                        key={c} mode={currency === c ? 'contained' : 'outlined'}
                                        onPress={() => setCurrency(c)} style={styles.currencyButton}
                                        buttonColor={currency === c ? Colors.warning : 'transparent'}
                                        textColor={currency === c ? '#000' : Colors.textSecondary} compact>
                                        {c}
                                    </Button>
                                ))}
                            </View>
                            <View style={styles.row}>
                                <TextInput
                                    mode="outlined" label={`Daily Limit (${currency})`} value={dailyLimit} onChangeText={setDailyLimit}
                                    style={[styles.input, styles.halfInput]} outlineColor={Colors.border}
                                    activeOutlineColor={Colors.warning} textColor={Colors.textPrimary}
                                    keyboardType="numeric" left={<TextInput.Icon icon="calendar-today" color={Colors.warning} />}
                                />
                                <TextInput
                                    mode="outlined" label={`Monthly Limit (${currency})`} value={monthlyLimit} onChangeText={setMonthlyLimit}
                                    style={[styles.input, styles.halfInput]} outlineColor={Colors.border}
                                    activeOutlineColor={Colors.warning} textColor={Colors.textPrimary}
                                    keyboardType="numeric" left={<TextInput.Icon icon="calendar-month" color={Colors.warning} />}
                                />
                            </View>
                            <View style={styles.editActions}>
                                <Button mode="outlined" onPress={() => setEditingFinance(false)} style={styles.actionBtn}
                                    textColor={Colors.textSecondary} borderColor={Colors.border}>Cancel</Button>
                                <Button mode="contained" onPress={handleSave} style={styles.actionBtn}
                                    buttonColor={Colors.warning} textColor="#000" loading={saving}>Save</Button>
                            </View>
                        </View>
                    ) : (
                        <View>
                            <DetailRow icon="currency-usd" label="Currency" value={user?.currency || '$'} color={Colors.warning} />
                            <DetailRow icon="calendar-today" label="Daily Limit" value={user?.dailyLimit ? `${user.currency || '$'}${user.dailyLimit}` : 'No limit'} color={Colors.warning} />
                            <DetailRow icon="calendar-month" label="Monthly Limit" value={user?.monthlyLimit ? `${user.currency || '$'}${user.monthlyLimit}` : 'No limit'} color={Colors.warning} />
                        </View>
                    )}
                </View>

                {/* App Settings */}
                <View style={styles.detailsCard}>
                    <View style={styles.detailsHeader}>
                        <Text style={styles.detailsTitle}>App Settings</Text>
                    </View>
                    <View style={styles.settingRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialCommunityIcons name="theme-light-dark" size={24} color={Colors.prodPrimary} style={{ marginRight: Spacing.sm }} />
                            <Text style={styles.settingText}>Dark Mode</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Button
                                mode={themePreference === 'dark' ? 'contained' : 'outlined'}
                                onPress={() => { setThemePreference('dark'); setEditingProfile(true); }} // Piggyback save button visibility
                                compact
                                style={{ marginRight: 8 }}
                                buttonColor={themePreference === 'dark' ? Colors.prodPrimary : 'transparent'}>
                                Dark
                            </Button>
                            <Button
                                mode={themePreference === 'light' ? 'contained' : 'outlined'}
                                onPress={() => { setThemePreference('light'); setEditingProfile(true); }}
                                compact
                                buttonColor={themePreference === 'light' ? Colors.healthPrimary : 'transparent'}>
                                Light
                            </Button>
                        </View>
                    </View>
                    {themePreference !== (user?.theme || 'dark') && (
                        <Text style={styles.restartWarning}>⚠️ Save Profile & completely restart the app to apply theme.</Text>
                    )}
                </View>

                {/* About Aura */}
                <View style={styles.detailsCard}>
                    <View style={styles.detailsHeader}>
                        <Text style={styles.detailsTitle}>About Aura</Text>
                    </View>
                    <View style={styles.aboutContent}>
                        <View style={styles.appBadgeLarge}>
                            <Text style={styles.appNameLarge}>Aura</Text>
                        </View>
                        <Text style={styles.aboutVersion}>Version 2.0.0</Text>
                        <Text style={styles.aboutDescription}>
                            Your personal Health & Productivity Hub. Track your wellness, manage your tasks, monitor your expenses, and boost your focus with the Pomodoro timer.
                        </Text>
                        <Text style={styles.aboutMadeWith}>Made with ❤️</Text>
                    </View>
                </View>

                {/* Logout */}
                <Button
                    mode="outlined"
                    onPress={logout}
                    style={styles.logoutButton}
                    textColor={Colors.danger}
                    icon="logout">
                    Sign Out
                </Button>

                <View style={{ height: 100 }} />
            </ScrollView>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                style={{ backgroundColor: Colors.healthPrimary }}
                action={{
                    label: 'Dismiss',
                    labelStyle: { color: '#000' },
                    onPress: () => setSnackbarVisible(false),
                }}>
                <Text style={{ color: '#000', fontWeight: 'bold' }}>Profile updated successfully! ✨</Text>
            </Snackbar>
        </SafeAreaView>
    );
};

const DetailRow = ({ icon, label, value, color = Colors.textMuted }) => (
    <View style={detailStyles.row}>
        <View style={[detailStyles.iconBg, { backgroundColor: color + '15' }]}>
            <MaterialCommunityIcons name={icon} size={18} color={color} />
        </View>
        <Text style={detailStyles.label}>{label}</Text>
        <Text style={detailStyles.value}>{value}</Text>
    </View>
);

const detailStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border + '40' },
    iconBg: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    label: { fontSize: 14, color: Colors.textSecondary, flex: 1 },
    value: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollContent: { padding: Spacing.md },
    profileHeader: { alignItems: 'center', paddingVertical: Spacing.lg },
    avatarCircle: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: Colors.healthPrimary + '20',
        borderWidth: 3, borderColor: Colors.healthPrimary,
        justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md,
    },
    avatarText: { fontSize: 32, fontWeight: '800', color: Colors.healthPrimary },
    avatarImage: { width: '100%', height: '100%', borderRadius: 40 },
    editIconBadge: {
        position: 'absolute', bottom: -5, right: -5,
        backgroundColor: Colors.healthPrimary, width: 28, height: 28,
        borderRadius: 14, justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: Colors.background
    },
    profileName: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
    profileEmail: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
    bmiCard: {
        backgroundColor: Colors.card, borderRadius: BorderRadius.lg,
        padding: Spacing.lg, marginBottom: Spacing.md,
        borderWidth: 1, borderColor: Colors.border, elevation: 4,
    },
    bmiHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
    bmiTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
    bmiContent: { alignItems: 'center' },
    bmiValue: { fontSize: 48, fontWeight: '900', letterSpacing: -1 },
    bmiCategoryBadge: {
        paddingHorizontal: 16, paddingVertical: 6, borderRadius: BorderRadius.round,
        borderWidth: 1, marginTop: Spacing.sm, marginBottom: Spacing.md,
    },
    bmiCategoryText: { fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
    bmiBar: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', width: '100%', marginTop: Spacing.sm },
    bmiBarSegment: { height: '100%' },
    bmiLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 4 },
    bmiLabel: { fontSize: 10, color: Colors.textMuted },
    bmiEmpty: { alignItems: 'center', paddingVertical: Spacing.lg },
    bmiEmptyText: { fontSize: 13, color: Colors.textMuted, marginTop: Spacing.sm, textAlign: 'center' },
    detailsCard: {
        backgroundColor: Colors.card, borderRadius: BorderRadius.lg,
        padding: Spacing.lg, marginBottom: Spacing.md,
        borderWidth: 1, borderColor: Colors.border, elevation: 4,
    },
    detailsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
    detailsTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
    input: { backgroundColor: Colors.surfaceVariant, marginBottom: Spacing.md },
    row: { flexDirection: 'row', gap: Spacing.sm },
    halfInput: { flex: 1 },
    priorityLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
    currencyRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
    currencyButton: { flex: 1, borderRadius: BorderRadius.md, borderColor: Colors.border },
    editActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
    actionBtn: { flex: 1, borderRadius: BorderRadius.md, borderColor: Colors.border },
    logoutButton: { borderRadius: BorderRadius.md, borderColor: Colors.danger + '40', marginTop: Spacing.sm },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
    settingText: { color: Colors.textPrimary, fontSize: 16, fontWeight: '500' },
    restartWarning: { color: Colors.warning, fontSize: 12, marginTop: Spacing.sm, fontStyle: 'italic' },
    aboutContent: { alignItems: 'center', paddingVertical: Spacing.md },
    appBadgeLarge: { backgroundColor: Colors.healthPrimary + '20', paddingHorizontal: 20, paddingVertical: 10, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm },
    appNameLarge: { color: Colors.healthPrimary, fontWeight: '900', fontSize: 24, letterSpacing: 1 },
    aboutVersion: { color: Colors.textSecondary, fontSize: 14, marginBottom: Spacing.md, fontWeight: '700' },
    aboutDescription: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
    aboutMadeWith: { color: Colors.prodPrimary, fontSize: 12, fontWeight: '600' }
});

export default ProfileScreen;
