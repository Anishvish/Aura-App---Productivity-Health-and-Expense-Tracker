import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme/theme';
import { useAppContext } from '../context/AppContext';
import { saveSleepLog, getSleepLogForDate } from '../database/Database';
import { getTodayDate } from '../utils/helpers';

const SleepLogger = () => {
    const { dispatch } = useAppContext();
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');
    const [quality, setQuality] = useState(0);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadSleep();
    }, []);

    const loadSleep = async () => {
        const today = getTodayDate();
        const log = await getSleepLogForDate(today);
        if (log) {
            const h = Math.floor(log.duration_hours);
            const m = Math.round((log.duration_hours - h) * 60);
            setHours(String(h));
            setMinutes(String(m));
            setQuality(log.quality_rating);
            setSaved(true);
        }
    };

    const handleSave = async () => {
        const h = parseInt(hours, 10) || 0;
        const m = parseInt(minutes, 10) || 0;
        const duration = h + m / 60;

        if (duration <= 0 || quality === 0) {
            return;
        }

        const today = getTodayDate();
        await saveSleepLog(today, duration, quality);
        dispatch({
            type: 'SET_SLEEP',
            payload: { hours: duration, quality },
        });
        setSaved(true);
        dispatch({ type: 'REFRESH' });
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => setQuality(i)}
                    activeOpacity={0.6}
                    style={styles.starTouch}>
                    <MaterialCommunityIcons
                        name={i <= quality ? 'star' : 'star-outline'}
                        size={36}
                        color={i <= quality ? Colors.starFilled : Colors.starEmpty}
                    />
                </TouchableOpacity>,
            );
        }
        return stars;
    };

    return (
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.header}>
                    <View style={styles.iconBg}>
                        <MaterialCommunityIcons
                            name="moon-waning-crescent"
                            size={24}
                            color={Colors.healthPrimary}
                        />
                    </View>
                    <Text style={styles.title}>Sleep Log</Text>
                    {saved && (
                        <View style={styles.savedBadge}>
                            <MaterialCommunityIcons
                                name="check-circle"
                                size={16}
                                color={Colors.success}
                            />
                            <Text style={styles.savedText}>Saved</Text>
                        </View>
                    )}
                </View>

                <View style={styles.infoBanner}>
                    <MaterialCommunityIcons name="information" size={16} color={Colors.prodPrimary} style={{ marginRight: Spacing.sm }} />
                    <Text style={styles.infoText}>Native phone sleep sync requires custom HealthKit/Google Fit permissions. Please log manually for now.</Text>
                </View>

                <Text style={styles.label}>Duration</Text>
                <View style={styles.durationRow}>
                    <View style={styles.inputGroup}>
                        <TextInput
                            mode="outlined"
                            value={hours}
                            onChangeText={setHours}
                            keyboardType="numeric"
                            maxLength={2}
                            style={styles.input}
                            outlineColor={Colors.border}
                            activeOutlineColor={Colors.healthPrimary}
                            textColor={Colors.textPrimary}
                            placeholder="0"
                            placeholderTextColor={Colors.textMuted}
                        />
                        <Text style={styles.inputLabel}>hours</Text>
                    </View>
                    <Text style={styles.separator}>:</Text>
                    <View style={styles.inputGroup}>
                        <TextInput
                            mode="outlined"
                            value={minutes}
                            onChangeText={setMinutes}
                            keyboardType="numeric"
                            maxLength={2}
                            style={styles.input}
                            outlineColor={Colors.border}
                            activeOutlineColor={Colors.healthPrimary}
                            textColor={Colors.textPrimary}
                            placeholder="0"
                            placeholderTextColor={Colors.textMuted}
                        />
                        <Text style={styles.inputLabel}>min</Text>
                    </View>
                </View>

                <Text style={styles.label}>Sleep Quality</Text>
                <View style={styles.starsRow}>{renderStars()}</View>
                <Text style={styles.qualityHint}>
                    {quality === 0
                        ? 'Tap to rate'
                        : quality <= 2
                            ? 'Poor sleep 😴'
                            : quality <= 3
                                ? 'Average sleep 😐'
                                : quality <= 4
                                    ? 'Good sleep 😊'
                                    : 'Excellent sleep! 🌟'}
                </Text>

                <Button
                    mode="contained"
                    onPress={handleSave}
                    style={styles.saveButton}
                    buttonColor={Colors.healthPrimary}
                    textColor="#000"
                    icon={saved ? 'content-save-edit' : 'content-save'}
                    disabled={!hours && !minutes}>
                    {saved ? 'Update Log' : 'Save Log'}
                </Button>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    iconBg: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.healthSurface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        flex: 1,
    },
    savedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.success + '15',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BorderRadius.round,
    },
    savedText: {
        fontSize: 12,
        color: Colors.success,
        fontWeight: '600',
        marginLeft: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    infoBanner: {
        flexDirection: 'row',
        backgroundColor: Colors.prodSurface,
        padding: Spacing.sm,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.lg,
        alignItems: 'center'
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
    durationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    inputGroup: {
        alignItems: 'center',
    },
    input: {
        width: 80,
        backgroundColor: Colors.surfaceVariant,
        textAlign: 'center',
        fontSize: 24,
    },
    inputLabel: {
        fontSize: 12,
        color: Colors.textMuted,
        marginTop: 4,
    },
    separator: {
        fontSize: 28,
        color: Colors.textMuted,
        marginHorizontal: Spacing.md,
        fontWeight: '700',
    },
    starsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: Spacing.xs,
    },
    starTouch: {
        padding: 4,
    },
    qualityHint: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    saveButton: {
        borderRadius: BorderRadius.md,
    },
});

export default SleepLogger;
