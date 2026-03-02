import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Colors, Spacing, BorderRadius } from '../theme/theme';
import { useAppContext } from '../context/AppContext';
import { addWaterIntake, getWaterIntakeForDate } from '../database/Database';
import { getTodayDate, formatWaterAmount } from '../utils/helpers';

const WATER_AMOUNTS = [250, 500, 750];

const WaterIntake = () => {
    const { state, dispatch } = useAppContext();

    useEffect(() => {
        loadWater();
    }, []);

    const loadWater = async () => {
        const today = getTodayDate();
        const total = await getWaterIntakeForDate(today);
        dispatch({ type: 'SET_WATER', payload: total });
    };

    const handleAddWater = async (amount) => {
        const today = getTodayDate();
        await addWaterIntake(today, amount);
        const newTotal = state.todayWater + amount;
        dispatch({ type: 'SET_WATER', payload: newTotal });
    };

    const progress = Math.min((state.todayWater / state.waterGoal) * 100, 100);
    const remaining = Math.max(state.waterGoal - state.todayWater, 0);

    return (
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.header}>
                    <View style={styles.iconBg}>
                        <MaterialCommunityIcons
                            name="water"
                            size={24}
                            color={Colors.prodPrimary}
                        />
                    </View>
                    <Text style={styles.title}>Water Intake</Text>
                </View>

                <View style={styles.centerContent}>
                    <AnimatedCircularProgress
                        size={180}
                        width={14}
                        fill={progress}
                        tintColor={Colors.prodPrimary}
                        backgroundColor={Colors.surfaceVariant}
                        rotation={0}
                        lineCap="round"
                        duration={800}>
                        {() => (
                            <View style={styles.circleContent}>
                                <MaterialCommunityIcons
                                    name="water-outline"
                                    size={28}
                                    color={Colors.prodPrimary}
                                />
                                <Text style={styles.circleValue}>
                                    {formatWaterAmount(state.todayWater)}
                                </Text>
                                <Text style={styles.circleGoal}>
                                    of {formatWaterAmount(state.waterGoal)}
                                </Text>
                            </View>
                        )}
                    </AnimatedCircularProgress>

                    {remaining > 0 ? (
                        <Text style={styles.remainingText}>
                            {formatWaterAmount(remaining)} remaining
                        </Text>
                    ) : (
                        <Text style={[styles.remainingText, { color: Colors.success }]}>
                            ✓ Goal reached! Great job!
                        </Text>
                    )}
                </View>

                <View style={styles.buttonRow}>
                    {WATER_AMOUNTS.map((amount) => (
                        <TouchableOpacity
                            key={amount}
                            style={styles.waterButton}
                            onPress={() => handleAddWater(amount)}
                            activeOpacity={0.7}>
                            <MaterialCommunityIcons
                                name="cup-water"
                                size={18}
                                color={Colors.prodPrimary}
                            />
                            <Text style={styles.waterButtonText}>+{amount}ml</Text>
                        </TouchableOpacity>
                    ))}
                </View>
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
        marginBottom: Spacing.md,
    },
    iconBg: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.prodSurface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    centerContent: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    circleContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    circleValue: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.prodPrimary,
        marginTop: 4,
    },
    circleGoal: {
        fontSize: 12,
        color: Colors.textMuted,
        marginTop: 2,
    },
    remainingText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: Spacing.md,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    waterButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.prodSurface,
        paddingVertical: Spacing.sm + 2,
        marginHorizontal: 4,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.prodPrimary + '30',
    },
    waterButtonText: {
        color: Colors.prodPrimary,
        fontWeight: '700',
        fontSize: 14,
        marginLeft: 6,
    },
});

export default WaterIntake;
