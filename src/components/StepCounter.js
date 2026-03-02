import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, Card, Button, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pedometer } from 'expo-sensors';
import { Spacing, BorderRadius } from '../theme/theme';
import { useTheme } from 'react-native-paper';
import { useAppContext } from '../context/AppContext';
import { updateSteps, getStepsForDate } from '../database/Database';
import { getTodayDate } from '../utils/helpers';

const StepCounter = () => {
    const { colors: Colors } = useTheme();
    const styles = getStyles ? getStyles(Colors) : {};
    const { state, dispatch } = useAppContext();
    const [isAvailable, setIsAvailable] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const subscriptionRef = useRef(null);

    useEffect(() => {
        loadSteps();
        checkAvailability();
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.remove();
            }
        };
    }, []);

    const loadSteps = async () => {
        const today = getTodayDate();
        const savedSteps = await getStepsForDate(today);
        dispatch({ type: 'SET_STEPS', payload: savedSteps });
    };

    const checkAvailability = async () => {
        try {
            const available = await Pedometer.isAvailableAsync();
            setIsAvailable(available);

            if (available) {
                // Try historical fetch first
                const end = new Date();
                const start = new Date();
                start.setHours(0, 0, 0, 0);

                try {
                    const result = await Pedometer.getStepCountAsync(start, end);
                    if (result && result.steps > state.todaySteps) {
                        dispatch({ type: 'SET_STEPS', payload: result.steps });
                        const today = getTodayDate();
                        await updateSteps(today, result.steps);
                    }
                } catch (e) {
                    console.log('Historical pedometer data not accessible on this device:', e.message);
                }

                // Always auto-start live tracking to capture actual phone movement
                startTracking();
            }
        } catch (error) {
            console.log("Pedometer availability check failed:", error);
        }
    };

    const startTracking = () => {
        setIsTracking(true);
        subscriptionRef.current = Pedometer.watchStepCount((result) => {
            const newSteps = state.todaySteps + result.steps;
            dispatch({ type: 'SET_STEPS', payload: newSteps });

            if (newSteps % 10 === 0) {
                const today = getTodayDate();
                updateSteps(today, newSteps);
            }
        });
    };

    const stopTracking = async () => {
        setIsTracking(false);
        if (subscriptionRef.current) {
            subscriptionRef.current.remove();
            subscriptionRef.current = null;
        }
        const today = getTodayDate();
        await updateSteps(today, state.todaySteps);
    };

    const addManualSteps = async (count) => {
        const newSteps = state.todaySteps + count;
        dispatch({ type: 'SET_STEPS', payload: newSteps });
        const today = getTodayDate();
        await updateSteps(today, newSteps);
    };

    const progress = Math.min(state.todaySteps / state.stepGoal, 1);
    const percentage = Math.round(progress * 100);

    return (
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.header}>
                    <View style={styles.iconBg}>
                        <MaterialCommunityIcons
                            name="shoe-print"
                            size={24}
                            color={Colors.healthPrimary}
                        />
                    </View>
                    <Text style={styles.title}>Step Counter</Text>
                    {isTracking && (
                        <View style={styles.liveBadge}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>LIVE</Text>
                        </View>
                    )}
                </View>

                <View style={styles.statsRow}>
                    <Text style={styles.stepCount}>
                        {state.todaySteps.toLocaleString()}
                    </Text>
                    <Text style={styles.goalText}>
                        / {state.stepGoal.toLocaleString()} steps
                    </Text>
                </View>

                <ProgressBar
                    progress={progress}
                    color={Colors.healthPrimary}
                    style={styles.progressBar}
                />
                <Text style={styles.percentText}>{percentage}% of daily goal</Text>

                <View style={styles.buttonRow}>
                    {isAvailable ? (
                        !isTracking ? (
                            <Button
                                mode="contained"
                                onPress={startTracking}
                                style={styles.actionButton}
                                buttonColor={Colors.healthPrimary}
                                textColor="#000"
                                icon="play">
                                Start Tracking
                            </Button>
                        ) : (
                            <Button
                                mode="contained"
                                onPress={stopTracking}
                                style={styles.actionButton}
                                buttonColor={Colors.danger}
                                icon="stop">
                                Stop
                            </Button>
                        )
                    ) : (
                        <>
                            <Button
                                mode="contained"
                                onPress={() => addManualSteps(100)}
                                style={styles.manualButton}
                                buttonColor={Colors.healthPrimary}
                                textColor="#000"
                                icon="plus"
                                compact>
                                +100
                            </Button>
                            <Button
                                mode="contained"
                                onPress={() => addManualSteps(500)}
                                style={styles.manualButton}
                                buttonColor={Colors.healthPrimary}
                                textColor="#000"
                                icon="plus"
                                compact>
                                +500
                            </Button>
                            <Button
                                mode="contained"
                                onPress={() => addManualSteps(1000)}
                                style={styles.manualButton}
                                buttonColor={Colors.healthPrimary}
                                textColor="#000"
                                icon="plus"
                                compact>
                                +1000
                            </Button>
                        </>
                    )}
                </View>

                {!isAvailable && (
                    <Text style={styles.hintText}>
                        Pedometer not available — use manual entry
                    </Text>
                )}
            </Card.Content>
        </Card>
    );
};

const getStyles = (Colors) => StyleSheet.create({
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
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.healthSurface,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BorderRadius.round,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.healthPrimary,
        marginRight: 6,
    },
    liveText: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.healthPrimary,
        letterSpacing: 1,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: Spacing.sm,
    },
    stepCount: {
        fontSize: 42,
        fontWeight: '800',
        color: Colors.healthPrimary,
        letterSpacing: -1,
    },
    goalText: {
        fontSize: 14,
        color: Colors.textMuted,
        marginLeft: Spacing.sm,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.surfaceVariant,
        marginBottom: Spacing.xs,
    },
    percentText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: Spacing.md,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    actionButton: {
        flex: 1,
        borderRadius: BorderRadius.md,
    },
    manualButton: {
        flex: 1,
        borderRadius: BorderRadius.md,
    },
    hintText: {
        fontSize: 12,
        color: Colors.textMuted,
        textAlign: 'center',
        marginTop: Spacing.sm,
        fontStyle: 'italic',
    },
});

export default StepCounter;
