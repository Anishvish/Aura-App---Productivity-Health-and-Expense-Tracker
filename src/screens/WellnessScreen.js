import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { Spacing } from '../theme/theme';
import { useTheme } from 'react-native-paper';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import StepCounter from '../components/StepCounter';
import WaterIntake from '../components/WaterIntake';
import SleepLogger from '../components/SleepLogger';
import { getStepsForDate, getWaterIntakeForDate } from '../database/Database';
import { getCurrentWeekDates, getShortDayName, getWellnessQuote } from '../utils/helpers';
import LottieView from 'lottie-react-native';

const screenWidth = Dimensions.get('window').width;

const WellnessScreen = () => {
    const { colors: Colors, dark: isDarkTheme } = useTheme();
    const styles = getStyles ? getStyles(Colors) : {};
    const { refreshDashboard } = useAppContext();
    const [weeklySteps, setWeeklySteps] = React.useState([0, 0, 0, 0, 0, 0, 0]);
    const [weeklyWater, setWeeklyWater] = React.useState([0, 0, 0, 0, 0, 0, 0]);
    const dayLabels = getCurrentWeekDates().map(getShortDayName);

    const loadWeeklyWellness = async () => {
        const dates = getCurrentWeekDates();
        const stepsArr = [];
        const waterArr = [];

        for (const date of dates) {
            stepsArr.push(await getStepsForDate(date));
            waterArr.push(await getWaterIntakeForDate(date));
        }

        setWeeklySteps(stepsArr);
        setWeeklyWater(waterArr);
    };

    useFocusEffect(
        useCallback(() => {
            refreshDashboard();
            loadWeeklyWellness();
        }, [])
    );

    const chartConfig = {
        backgroundColor: Colors.surface,
        backgroundGradientFrom: Colors.surface,
        backgroundGradientTo: Colors.surfaceVariant,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(18, 184, 134, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: { borderRadius: 16 },
        propsForDots: { r: "4", strokeWidth: "2", stroke: Colors.healthPrimary }
    };

    const waterChartConfig = {
        ...chartConfig,
        color: (opacity = 1) => `rgba(0, 207, 232, ${opacity})`, // Colors.prodPrimary
        propsForDots: { r: "4", strokeWidth: "2", stroke: Colors.prodPrimary }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle={isDarkTheme ? "light-content" : "dark-content"} backgroundColor={Colors.background} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                {/* Header with Animation & Quote */}
                <View style={[styles.header, { flexDirection: 'row', alignItems: 'center' }]}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.headerTitle}>Wellness</Text>
                        <Text style={styles.headerSubtitle}>
                            {getWellnessQuote()}
                        </Text>
                    </View>
                    <LottieView
                        source={{ uri: 'https://lottie.host/80a012ff-1bed-4f11-92be-6cd5e49223bb/3sW3L7oH0j.json' }}
                        autoPlay
                        loop
                        style={{ width: 80, height: 80 }}
                    />
                </View>

                {/* Step Counter */}
                <StepCounter />

                {/* Water Intake */}
                <WaterIntake />

                {/* Sleep Logger */}
                <SleepLogger />

                {/* --- WEEKLY REPORTS --- */}
                <View style={styles.reportsHeader}>
                    <MaterialCommunityIcons name="chart-bar" size={24} color={Colors.textPrimary} />
                    <Text style={styles.reportsTitle}>Weekly Wellness Report</Text>
                </View>

                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Steps History</Text>
                    <BarChart
                        data={{
                            labels: dayLabels,
                            datasets: [{ data: weeklySteps }]
                        }}
                        width={screenWidth - Spacing.md * 2}
                        height={200}
                        yAxisSuffix=""
                        chartConfig={chartConfig}
                        verticalLabelRotation={0}
                        style={styles.chart}
                        showValuesOnTopOfBars={true}
                    />
                </View>

                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Water Intake (ml)</Text>
                    <LineChart
                        data={{
                            labels: dayLabels,
                            datasets: [{ data: weeklyWater }]
                        }}
                        width={screenWidth - Spacing.md * 2}
                        height={180}
                        yAxisSuffix=""
                        chartConfig={waterChartConfig}
                        bezier
                        style={styles.chart}
                    />
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
};

const getStyles = (Colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.md,
        paddingTop: Spacing.xl,
    },
    header: {
        marginBottom: Spacing.lg,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    reportsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.xl,
        marginBottom: Spacing.md,
    },
    reportsTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginLeft: Spacing.sm,
    },
    chartContainer: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center'
    },
    chartTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: Spacing.md,
        alignSelf: 'flex-start',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    chart: { borderRadius: 16 },
    bottomSpacer: { height: 130 },
});

export default WellnessScreen;
