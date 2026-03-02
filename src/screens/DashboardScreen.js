import React, { useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Spacing, BorderRadius } from '../theme/theme';
import { useTheme } from 'react-native-paper';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import LottieView from 'lottie-react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import OverviewCard from '../components/OverviewCard';
import { getStepsForDate } from '../database/Database';
import { getGreeting, formatWaterAmount, getMotivationalMessage, getTodayDate, getCurrentWeekDates, getShortDayName } from '../utils/helpers';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = ({ navigation }) => {
    const { colors: Colors, dark: isDarkTheme } = useTheme();
    const styles = getStyles ? getStyles(Colors) : {};
    const { state, refreshDashboard } = useAppContext();
    const { user, logout } = useAuth();
    const [weeklySteps, setWeeklySteps] = React.useState([0, 0, 0, 0, 0, 0, 0]);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(15)).current;

    const loadWeeklyTrends = async () => {
        const dates = getCurrentWeekDates();
        const stepsData = [];
        for (const date of dates) {
            stepsData.push(await getStepsForDate(date));
        }
        setWeeklySteps(stepsData);
    };

    useFocusEffect(
        useCallback(() => {
            refreshDashboard();
            loadWeeklyTrends();

            // Trigger animation on focus
            fadeAnim.setValue(0);
            slideAnim.setValue(15);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
            ]).start();
        }, [])
    );

    const greeting = getGreeting(user?.name?.split(' ')[0]);
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });

    const stepProgress = Math.min((state.todaySteps / state.stepGoal) * 100, 100) || 0;
    const waterProgress = Math.min((state.todayWater / state.waterGoal) * 100, 100) || 0;
    const taskProgress = state.todosTotal > 0 ? (state.todosDone / state.todosTotal) * 100 : 0;
    // For expenses, assuming a nominal budget of $100 per day for the visual
    const expenseProgress = Math.min((state.todayExpenses / 100) * 100, 100) || 0;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle={isDarkTheme ? "light-content" : "dark-content"} backgroundColor={Colors.background} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], flex: 1 }}>
                        <Text style={styles.greeting}>{greeting}</Text>
                        <Text style={styles.date}>{dateString}</Text>
                    </Animated.View>
                    <View style={styles.headerRight}>
                        <View style={styles.appBadge}>
                            <Text style={styles.appName}>Aura</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.motivationCard}>
                    <LottieView
                        source={{ uri: 'https://lottie.host/80a012ff-1bed-4f11-92be-6cd5e49223bb/3sW3L7oH0j.json' }} // Fallback minimal URI
                        autoPlay
                        loop
                        style={{ width: 60, height: 60, marginRight: Spacing.sm }}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.motivationTitle}>Aura AI says:</Text>
                        <Text style={styles.motivationText}>
                            {getMotivationalMessage(state)}
                        </Text>
                    </View>
                </View>

                {/* --- TREND CHART --- */}
                <Text style={styles.sectionTitle}>
                    <MaterialCommunityIcons name="chart-line-variant" size={18} color={Colors.healthPrimary} />
                    {' '}Weekly Activity Trend
                </Text>

                <View style={styles.chartContainer}>
                    <LineChart
                        data={{
                            labels: getCurrentWeekDates().map(getShortDayName),
                            datasets: [{ data: weeklySteps }]
                        }}
                        width={screenWidth - Spacing.md * 2}
                        height={180}
                        yAxisSuffix=""
                        chartConfig={{
                            backgroundColor: Colors.surface,
                            backgroundGradientFrom: Colors.surface,
                            backgroundGradientTo: Colors.surfaceVariant,
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(18, 184, 134, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            style: { borderRadius: 16 },
                            propsForDots: { r: "4", strokeWidth: "2", stroke: Colors.healthPrimary }
                        }}
                        bezier
                        style={styles.chart}
                    />
                </View>

                <Text style={styles.sectionTitle}>
                    <MaterialCommunityIcons name="heart-pulse" size={18} color={Colors.healthPrimary} />
                    {' '}Health Overview
                </Text>

                <OverviewCard
                    title="Steps"
                    value={state.todaySteps.toLocaleString()}
                    subtitle={`Goal: ${state.stepGoal.toLocaleString()}`}
                    icon="shoe-print"
                    progress={stepProgress}
                    accentColor={Colors.healthPrimary}
                    onPress={() => navigation.navigate('Wellness')}
                />
                <OverviewCard
                    title="Water Intake"
                    value={formatWaterAmount(state.todayWater)}
                    subtitle={`Goal: ${formatWaterAmount(state.waterGoal)}`}
                    icon="water"
                    progress={waterProgress}
                    accentColor={Colors.prodPrimary}
                    onPress={() => navigation.navigate('Wellness')}
                />
                <OverviewCard
                    title="Sleep"
                    value={state.todaySleep.hours > 0 ? `${state.todaySleep.hours.toFixed(1)}h` : 'Not logged'}
                    subtitle={state.todaySleep.quality > 0
                        ? `Quality: ${'★'.repeat(state.todaySleep.quality)}${'☆'.repeat(5 - state.todaySleep.quality)}`
                        : 'Tap to log'}
                    icon="moon-waning-crescent"
                    progress={state.todaySleep.hours > 0 ? Math.min((state.todaySleep.hours / 8) * 100, 100) : 0}
                    accentColor={Colors.healthPrimary}
                    onPress={() => navigation.navigate('Wellness')}
                />

                <Text style={styles.sectionTitle}>
                    <MaterialCommunityIcons name="lightning-bolt" size={18} color={Colors.prodPrimary} />
                    {' '}Productivity
                </Text>

                <OverviewCard
                    title="Tasks"
                    value={`${state.todosDone}/${state.todosTotal}`}
                    subtitle="completed today"
                    icon="clipboard-check"
                    progress={taskProgress}
                    accentColor={Colors.prodPrimary}
                    onPress={() => navigation.navigate('Tasks')}
                />
                <OverviewCard
                    title="Pomodoro Sessions"
                    value={String(state.pomodoroCount)}
                    subtitle="Focus sessions today"
                    icon="timer"
                    progress={Math.min((state.pomodoroCount / 4) * 100, 100)}
                    accentColor={Colors.prodPrimary}
                    onPress={() => navigation.navigate('Tasks')}
                />

                <Text style={styles.sectionTitle}>
                    <MaterialCommunityIcons name="wallet-outline" size={18} color={Colors.warning} />
                    {' '}Finance
                </Text>

                <OverviewCard
                    title="Daily Expenses"
                    value={`${user?.currency || '$'}${state.todayExpenses.toFixed(2)}`}
                    subtitle="Total spent today"
                    icon="currency-usd"
                    progress={expenseProgress}
                    accentColor={Colors.warning}
                    onPress={() => navigation.navigate('Expenses')}
                />

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
};

const getStyles = (Colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollView: { flex: 1 },
    scrollContent: { padding: Spacing.md, paddingTop: Spacing.xl },
    header: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: Spacing.lg,
    },
    greeting: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
    date: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    appBadge: {
        backgroundColor: Colors.healthPrimary + '20', paddingHorizontal: 16,
        paddingVertical: 8, borderRadius: BorderRadius.round,
        borderWidth: 1, borderColor: Colors.healthPrimary + '40',
    },
    appName: { fontSize: 16, fontWeight: '800', color: Colors.healthPrimary, letterSpacing: 2 },
    logoutBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: Colors.surfaceVariant, justifyContent: 'center', alignItems: 'center',
    },
    motivationCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: Colors.starFilled + '10', borderRadius: BorderRadius.md,
        padding: Spacing.sm, marginBottom: Spacing.lg,
        borderWidth: 1, borderColor: Colors.starFilled + '30',
    },
    motivationTitle: { fontSize: 13, fontWeight: '700', color: Colors.starFilled, marginBottom: 2 },
    motivationText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
    chartContainer: {
        backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
        marginBottom: Spacing.lg, alignItems: 'center', paddingVertical: Spacing.sm,
        borderWidth: 1, borderColor: Colors.border, overflow: 'hidden'
    },
    chart: { borderRadius: BorderRadius.lg },
    sectionTitle: {
        fontSize: 16, fontWeight: '700', color: Colors.textPrimary,
        marginBottom: Spacing.md, marginTop: Spacing.sm, letterSpacing: 0.3,
    },
    bottomSpacer: { height: 100 },
});

export default DashboardScreen;
