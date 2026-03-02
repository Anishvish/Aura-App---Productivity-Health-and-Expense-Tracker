import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Dimensions } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius } from '../theme/theme';
import { getStepsForWeek, getCompletedTodosCountForWeek } from '../database/Database';
import { getCurrentWeekDates, getShortDayName, formatDate } from '../utils/helpers';

const screenWidth = Dimensions.get('window').width - Spacing.md * 2;

const chartConfig = {
    backgroundColor: Colors.card,
    backgroundGradientFrom: Colors.card,
    backgroundGradientTo: Colors.card,
    decimalCount: 0,
    color: (opacity = 1) => `rgba(80, 200, 120, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(160, 174, 192, ${opacity})`,
    style: { borderRadius: BorderRadius.lg },
    propsForBackgroundLines: { strokeDasharray: '', stroke: Colors.border, strokeWidth: 0.5 },
    propsForDots: { r: '5', strokeWidth: '2', stroke: Colors.prodPrimary },
    fillShadowGradientFrom: Colors.healthPrimary,
    fillShadowGradientTo: 'transparent',
    fillShadowGradientOpacity: 0.3,
    barPercentage: 0.6,
};

const StatsScreen = () => {
    const [weekOffset, setWeekOffset] = useState(0);
    const [stepsData, setStepsData] = useState(null);
    const [todosData, setTodosData] = useState(null);

    const getWeekDatesWithOffset = (offset) => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + mondayOffset + i + offset * 7);
            dates.push(formatDate(d));
        }
        return dates;
    };

    const loadData = useCallback(async () => {
        const weekDates = getWeekDatesWithOffset(weekOffset);
        const labels = weekDates.map((d) => getShortDayName(d));

        const stepsRaw = await getStepsForWeek(weekDates);
        const stepsMap = {};
        stepsRaw.forEach((s) => { stepsMap[s.date] = s.count; });
        const stepValues = weekDates.map((d) => stepsMap[d] || 0);
        setStepsData({
            labels,
            datasets: [{ data: stepValues.some(v => v > 0) ? stepValues : [0, 0, 0, 0, 0, 0, 0] }],
        });

        const todosRaw = await getCompletedTodosCountForWeek(weekDates);
        const todosMap = {};
        todosRaw.forEach((t) => { todosMap[t.date] = t.count; });
        const todoValues = weekDates.map((d) => todosMap[d] || 0);
        setTodosData({
            labels,
            datasets: [{ data: todoValues.some(v => v > 0) ? todoValues : [0, 0, 0, 0, 0, 0, 0] }],
        });
    }, [weekOffset]);

    useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

    const weekDates = getWeekDatesWithOffset(weekOffset);
    const weekStart = new Date(weekDates[0] + 'T00:00:00');
    const weekEnd = new Date(weekDates[6] + 'T00:00:00');
    const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Insights</Text>
                    <Text style={styles.headerSubtitle}>Your weekly performance</Text>
                </View>

                <View style={styles.weekNav}>
                    <Button mode="text" onPress={() => setWeekOffset(weekOffset - 1)} textColor={Colors.textSecondary} icon="chevron-left" compact>Prev</Button>
                    <Text style={styles.weekLabel}>{weekLabel}</Text>
                    <Button mode="text" onPress={() => setWeekOffset(weekOffset + 1)} textColor={Colors.textSecondary} icon="chevron-right" contentStyle={{ flexDirection: 'row-reverse' }} disabled={weekOffset >= 0} compact>Next</Button>
                </View>

                <View style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <View style={styles.chartIconBg}>
                            <MaterialCommunityIcons name="shoe-print" size={20} color={Colors.healthPrimary} />
                        </View>
                        <Text style={styles.chartTitle}>Steps</Text>
                    </View>
                    {stepsData ? (
                        <BarChart data={stepsData} width={screenWidth - Spacing.md * 2} height={200} chartConfig={chartConfig} style={styles.chart} fromZero showValuesOnTopOfBars withInnerLines={false} />
                    ) : (
                        <Text style={styles.noData}>Loading...</Text>
                    )}
                </View>

                <View style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <View style={[styles.chartIconBg, { backgroundColor: Colors.prodSurface }]}>
                            <MaterialCommunityIcons name="check-circle" size={20} color={Colors.prodPrimary} />
                        </View>
                        <Text style={styles.chartTitle}>Tasks Completed</Text>
                    </View>
                    {todosData ? (
                        <LineChart
                            data={todosData} width={screenWidth - Spacing.md * 2} height={200}
                            chartConfig={{ ...chartConfig, color: (o = 1) => `rgba(0, 123, 255, ${o})`, fillShadowGradientFrom: Colors.prodPrimary }}
                            style={styles.chart} bezier fromZero withInnerLines={false}
                        />
                    ) : (
                        <Text style={styles.noData}>Loading...</Text>
                    )}
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollView: { flex: 1 },
    scrollContent: { padding: Spacing.md, paddingTop: Spacing.xl },
    header: { marginBottom: Spacing.md },
    headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
    weekNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg, backgroundColor: Colors.card, borderRadius: BorderRadius.md, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.xs },
    weekLabel: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
    chartCard: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md, elevation: 4 },
    chartHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
    chartIconBg: { width: 36, height: 36, borderRadius: BorderRadius.sm, backgroundColor: Colors.healthSurface, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.sm },
    chartTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
    chart: { borderRadius: BorderRadius.md, marginLeft: -Spacing.md },
    noData: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing.xl },
    bottomSpacer: { height: 100 },
});

export default StatsScreen;
