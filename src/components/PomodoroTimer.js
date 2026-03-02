import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Vibration, Alert, Keyboard } from 'react-native';
import { Text, Card, Button, TextInput, Portal, Modal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius } from '../theme/theme';
import { useAppContext } from '../context/AppContext';
import { addPomodoroSession } from '../database/Database';
import { getTodayDate, formatTime } from '../utils/helpers';

const TIMER_MODES = {
    work: { label: 'Work', duration: 25 * 60 * 1000, color: Colors.prodPrimary },
    shortBreak: { label: 'Short Break', duration: 5 * 60 * 1000, color: Colors.healthPrimary },
    longBreak: { label: 'Long Break', duration: 15 * 60 * 1000, color: Colors.warning },
    custom: { label: 'Custom', duration: 10 * 60 * 1000, color: Colors.starFilled },
};

const PomodoroTimer = () => {
    const { dispatch } = useAppContext();
    const [mode, setMode] = useState('work');
    const [timeRemaining, setTimeRemaining] = useState(TIMER_MODES.work.duration);
    const [isRunning, setIsRunning] = useState(false);
    const [sessionsCompleted, setSessions] = useState(0);
    const intervalRef = useRef(null);
    const targetTimeRef = useRef(null);
    const [customMinutes, setCustomMinutes] = useState('10');
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [tempCustomMinutes, setTempCustomMinutes] = useState('10');

    const currentMode = TIMER_MODES[mode];
    const totalDuration = mode === 'custom' ? parseInt(customMinutes, 10) * 60 * 1000 || 60000 : currentMode.duration;

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const startTimer = () => {
        setIsRunning(true);
        targetTimeRef.current = Date.now() + timeRemaining;
        Keyboard.dismiss();

        intervalRef.current = setInterval(() => {
            const now = Date.now();
            const remaining = targetTimeRef.current - now;

            if (remaining <= 0) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                setTimeRemaining(0);
                setIsRunning(false);
                handleTimerComplete();
            } else {
                setTimeRemaining(remaining);
            }
        }, 100);
    };

    const pauseTimer = () => {
        setIsRunning(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const resetTimer = () => {
        pauseTimer();
        setTimeRemaining(totalDuration);
    };

    const handleTimerComplete = async () => {
        // Haptic feedback + vibration
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) { }
        Vibration.vibrate([0, 500, 200, 500, 200, 500]);

        // Simple Alert
        Alert.alert(
            mode === 'work' ? '🍅 Pomodoro Complete!' : '☕ Break Over!',
            mode === 'work'
                ? 'Great work! Take a well-deserved break.'
                : 'Break is over. Ready to focus again?',
            [{ text: 'OK' }]
        );

        if (mode === 'work') {
            const today = getTodayDate();
            await addPomodoroSession(today, 25, 'work');
            const newCount = sessionsCompleted + 1;
            setSessions(newCount);
            dispatch({ type: 'REFRESH' });
        }
    };

    const handleModeChange = (newMode) => {
        pauseTimer();
        setMode(newMode);
        if (newMode === 'custom') {
            setTempCustomMinutes(customMinutes);
            setShowCustomModal(true);
        } else {
            setTimeRemaining(TIMER_MODES[newMode].duration);
        }
    };

    const applyCustomTime = () => {
        const mins = parseInt(tempCustomMinutes, 10) || 10;
        setCustomMinutes(tempCustomMinutes);
        setTimeRemaining(mins * 60 * 1000);
        setShowCustomModal(false);
    };

    const progress = ((totalDuration - timeRemaining) / totalDuration) * 100;

    return (
        <View>
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.header}>
                        <View style={[styles.iconBg, { backgroundColor: currentMode.color + '18' }]}>
                            <MaterialCommunityIcons
                                name="timer-outline"
                                size={24}
                                color={currentMode.color}
                            />
                        </View>
                        <Text style={styles.title}>Pomodoro Timer</Text>
                        <View style={styles.sessionBadge}>
                            <Text style={styles.sessionText}>🍅 {sessionsCompleted}</Text>
                        </View>
                    </View>

                    <View style={styles.modeRow}>
                        {Object.entries(TIMER_MODES).map(([key, val]) => (
                            <Button
                                key={key}
                                mode={mode === key ? 'contained' : 'outlined'}
                                onPress={() => handleModeChange(key)}
                                style={[
                                    styles.modeButton,
                                    mode === key && { backgroundColor: val.color },
                                ]}
                                labelStyle={[
                                    styles.modeLabel,
                                    mode === key && { color: '#000' },
                                ]}
                                textColor={mode === key ? '#000' : Colors.textSecondary}
                                compact>
                                {val.label}
                            </Button>
                        ))}
                    </View>

                    <View style={styles.timerContainer}>
                        <AnimatedCircularProgress
                            size={220}
                            width={10}
                            fill={progress}
                            tintColor={currentMode.color}
                            backgroundColor={Colors.surfaceVariant}
                            rotation={0}
                            lineCap="round"
                            duration={300}>
                            {() => (
                                <View style={styles.timerContent}>
                                    <Text style={[styles.timerText, { color: currentMode.color }]}>
                                        {formatTime(timeRemaining)}
                                    </Text>
                                    <Text style={styles.timerLabel}>{currentMode.label}</Text>
                                </View>
                            )}
                        </AnimatedCircularProgress>
                    </View>

                    <View style={styles.controls}>
                        <Button
                            mode="outlined"
                            onPress={resetTimer}
                            style={styles.controlButton}
                            textColor={Colors.textSecondary}
                            icon="refresh">
                            Reset
                        </Button>

                        {!isRunning ? (
                            <Button
                                mode="contained"
                                onPress={startTimer}
                                style={[styles.controlButton, styles.mainButton]}
                                buttonColor={currentMode.color}
                                textColor="#000"
                                icon="play"
                                disabled={timeRemaining <= 0}>
                                {timeRemaining <= 0 ? 'Done!' : 'Start'}
                            </Button>
                        ) : (
                            <Button
                                mode="contained"
                                onPress={pauseTimer}
                                style={[styles.controlButton, styles.mainButton]}
                                buttonColor={Colors.warning}
                                textColor="#000"
                                icon="pause">
                                Pause
                            </Button>
                        )}
                    </View>
                </Card.Content>
            </Card>

            <Portal>
                <Modal visible={showCustomModal} onDismiss={() => setShowCustomModal(false)} contentContainerStyle={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Set Custom Timer</Text>
                    <Text style={styles.modalLabel}>Enter duration in minutes:</Text>
                    <TextInput
                        mode="outlined"
                        label="Minutes"
                        value={tempCustomMinutes}
                        onChangeText={setTempCustomMinutes}
                        keyboardType="numeric"
                        maxLength={3}
                        style={styles.modalInput}
                        outlineColor={Colors.border}
                        activeOutlineColor={Colors.starFilled}
                        textColor={Colors.textPrimary}
                    />
                    <View style={styles.modalActions}>
                        <Button mode="outlined" onPress={() => setShowCustomModal(false)} style={styles.actionButton} textColor={Colors.textSecondary} borderColor={Colors.border}>Cancel</Button>
                        <Button mode="contained" onPress={applyCustomTime} style={styles.actionButton} buttonColor={Colors.starFilled} textColor="#000">Set Time</Button>
                    </View>
                </Modal>
            </Portal>
        </View>
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
    sessionBadge: {
        backgroundColor: Colors.surfaceVariant,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: BorderRadius.round,
    },
    sessionText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    modeRow: {
        flexDirection: 'row',
        marginBottom: Spacing.lg,
        gap: 6,
    },
    modeButton: {
        flex: 1,
        borderRadius: BorderRadius.md,
        borderColor: Colors.border,
    },
    modeLabel: {
        fontSize: 10,
        fontWeight: '600',
    },
    timerContainer: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    timerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerText: {
        fontSize: 48,
        fontWeight: '800',
        letterSpacing: 2,
    },
    timerLabel: {
        fontSize: 14,
        color: Colors.textMuted,
        marginTop: 4,
        fontWeight: '500',
    },
    controls: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    controlButton: {
        flex: 1,
        borderRadius: BorderRadius.md,
        borderColor: Colors.border,
    },
    mainButton: {
        flex: 2,
    },
    modalContainer: {
        backgroundColor: Colors.card,
        padding: Spacing.xl,
        margin: Spacing.xl,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.sm
    },
    modalLabel: {
        color: Colors.textSecondary,
        marginBottom: Spacing.md
    },
    modalInput: {
        backgroundColor: Colors.surfaceVariant,
        marginBottom: Spacing.lg
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: Spacing.md
    },
    actionButton: {
        borderRadius: BorderRadius.md
    }
});

export default PomodoroTimer;
