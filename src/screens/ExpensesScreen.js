import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, TouchableOpacity, FlatList, Dimensions, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Modal, Portal, Snackbar, Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';
import { Colors, Spacing, BorderRadius } from '../theme/theme';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getExpensesForDate, addExpense, getWeeklyExpenseStats, getMonthlyExpenseTotal } from '../database/Database';
import { getTodayDate, getCurrentWeekDates, getShortDayName } from '../utils/helpers';

const screenWidth = Dimensions.get('window').width;

const CATEGORIES = [
    { id: 'Food', icon: 'food', color: '#FF9F43' },
    { id: 'Transport', icon: 'car', color: '#00CFE8' },
    { id: 'Bills', icon: 'file-document-outline', color: '#EA5455' },
    { id: 'Shopping', icon: 'shopping', color: '#7367F0' },
    { id: 'Entertainment', icon: 'gamepad-variant', color: '#28C76F' },
    { id: 'Other', icon: 'dots-horizontal', color: Colors.textMuted },
];

const ExpensesScreen = () => {
    const { state, refreshDashboard } = useAppContext();
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0, 0, 0, 0]);
    const [monthlyTotal, setMonthlyTotal] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form states
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);

    const loadExpenses = async () => {
        setLoading(true);
        const today = getTodayDate();

        // Load Daily
        const data = await getExpensesForDate(today);
        setExpenses(data);

        // Load Weekly
        const weekDates = getCurrentWeekDates();
        const wData = await getWeeklyExpenseStats(weekDates);
        setWeeklyData(wData);

        // Load Monthly
        const monthPrefix = today.substring(0, 7); // YYYY-MM
        const mTotal = await getMonthlyExpenseTotal(monthPrefix);
        setMonthlyTotal(mTotal);

        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadExpenses();
            refreshDashboard();
        }, [])
    );

    const handleSaveExpense = async () => {
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid expense amount.');
            return;
        }

        const today = getTodayDate();
        const success = await addExpense(today, parseFloat(amount), selectedCategory, desc);

        if (success) {
            setShowModal(false);
            setAmount('');
            setDesc('');
            setSelectedCategory(CATEGORIES[0].id);
            loadExpenses();
            refreshDashboard();
        } else {
            Alert.alert('Error', 'Failed to save expense.');
        }
    };

    const renderExpenseItem = ({ item }) => {
        const cat = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[5];
        return (
            <View style={styles.expenseItem}>
                <View style={[styles.expenseIconBg, { backgroundColor: cat.color + '20' }]}>
                    <MaterialCommunityIcons name={cat.icon} size={24} color={cat.color} />
                </View>
                <View style={styles.expenseInfo}>
                    <Text style={styles.expenseCategory}>{item.category}</Text>
                    {item.description ? <Text style={styles.expenseDesc}>{item.description}</Text> : null}
                </View>
                <Text style={styles.expenseAmount}>{currency}{item.amount.toFixed(2)}</Text>
            </View>
        );
    };

    const currency = user?.currency || '$';
    const dayLabels = getCurrentWeekDates().map(getShortDayName);

    // Limit checks
    const overDaily = user?.dailyLimit > 0 && state.todayExpenses > user.dailyLimit;
    const overMonthly = user?.monthlyLimit > 0 && monthlyTotal > user.monthlyLimit;

    // Chart config
    const chartConfig = {
        backgroundGradientFrom: Colors.prodSurface,
        backgroundGradientTo: Colors.prodSurface,
        color: (opacity = 1) => `rgba(234, 84, 85, ${opacity})`, // Colors.danger
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        barPercentage: 0.6,
        formatYLabel: (yLabel) => Math.round(yLabel).toString(),
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Daily Expenses</Text>
                    <Text style={styles.headerSubtitle}>Track your spending</Text>
                </View>
                <Button
                    mode="contained"
                    icon="plus"
                    onPress={() => setShowModal(true)}
                    buttonColor={Colors.prodPrimary}
                    textColor="#FFF"
                    style={{ borderRadius: BorderRadius.md }}>
                    Add
                </Button>
            </View>

            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Total Spent Today</Text>
                <Text style={[styles.summaryAmount, overDaily && { color: Colors.danger }]}>{currency}{state.todayExpenses.toFixed(2)}</Text>
            </View>

            {(overDaily || overMonthly) && (
                <View style={styles.warningBanner}>
                    <MaterialCommunityIcons name="alert" color="#FFF" size={20} />
                    <Text style={styles.warningText}>
                        {overDaily ? 'Daily' : 'Monthly'} limit exceeded!
                    </Text>
                </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Weekly Overview</Text>
                <View style={styles.chartContainer}>
                    <BarChart
                        data={{
                            labels: dayLabels,
                            datasets: [{ data: weeklyData }]
                        }}
                        width={screenWidth - Spacing.lg * 2}
                        height={200}
                        yAxisLabel={currency}
                        chartConfig={chartConfig}
                        verticalLabelRotation={0}
                        style={styles.chart}
                        showValuesOnTopOfBars={true}
                    />
                </View>

                <View style={styles.transactionsHeader}>
                    <Text style={[styles.sectionTitle, { marginBottom: 0, paddingHorizontal: 0, flex: 1 }]}>Today's Transactions</Text>
                </View>

                {expenses.length > 0 && (
                    <Searchbar
                        placeholder="Search transactions..."
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchBar}
                        inputStyle={styles.searchBarInput}
                        iconColor={Colors.textMuted}
                        placeholderTextColor={Colors.textMuted}
                        elevation={0}
                    />
                )}

                {expenses.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="wallet-outline" size={48} color={Colors.textMuted} />
                        <Text style={styles.emptyStateText}>No expenses logged today.</Text>
                    </View>
                ) : (
                    expenses.filter(e =>
                        e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        e.category.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="magnify-close" size={48} color={Colors.textMuted} />
                            <Text style={styles.emptyStateText}>No expenses match your search.</Text>
                        </View>
                    ) : (
                        expenses
                            .filter(e =>
                                e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                e.category.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map(item => <React.Fragment key={item.id}>{renderExpenseItem({ item })}</React.Fragment>)
                    )
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            <Portal>
                <Modal visible={showModal} onDismiss={() => setShowModal(false)} contentContainerStyle={styles.modalContent}>
                    <Text style={styles.modalTitle}>Add Expense</Text>

                    <TextInput
                        mode="outlined"
                        label={`Amount (${currency})`}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        style={styles.input}
                        outlineColor={Colors.border}
                        activeOutlineColor={Colors.prodPrimary}
                        textColor={Colors.textPrimary}
                        left={<TextInput.Icon icon="currency-usd" color={Colors.textMuted} />}
                    />

                    <TextInput
                        mode="outlined"
                        label="Description (Optional)"
                        value={desc}
                        onChangeText={setDesc}
                        style={styles.input}
                        outlineColor={Colors.border}
                        activeOutlineColor={Colors.prodPrimary}
                        textColor={Colors.textPrimary}
                    />

                    <Text style={styles.categoryTitle}>Category</Text>
                    <View style={styles.categoryGrid}>
                        {CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryChip,
                                    selectedCategory === cat.id && { backgroundColor: cat.color + '20', borderColor: cat.color }
                                ]}
                                onPress={() => setSelectedCategory(cat.id)}>
                                <MaterialCommunityIcons name={cat.icon} size={20} color={selectedCategory === cat.id ? cat.color : Colors.textMuted} />
                                <Text style={[styles.categoryLabel, selectedCategory === cat.id && { color: cat.color }]}>{cat.id}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Button
                        mode="contained"
                        onPress={handleSaveExpense}
                        style={styles.saveBtn}
                        buttonColor={Colors.prodPrimary}>
                        Save Expense
                    </Button>
                </Modal>
            </Portal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg },
    headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
    summaryCard: {
        backgroundColor: Colors.prodSurface, marginHorizontal: Spacing.lg,
        padding: Spacing.xl, borderRadius: BorderRadius.lg, alignItems: 'center',
        borderWidth: 1, borderColor: Colors.prodPrimary + '30',
        marginBottom: Spacing.lg,
    },
    summaryTitle: { fontSize: 14, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
    summaryAmount: { fontSize: 42, fontWeight: '900', color: Colors.prodPrimary, letterSpacing: -1, marginTop: Spacing.xs },
    warningBanner: {
        backgroundColor: Colors.danger, flexDirection: 'row', alignItems: 'center',
        marginHorizontal: Spacing.lg, padding: Spacing.sm, borderRadius: BorderRadius.md,
        marginBottom: Spacing.lg, justifyContent: 'center'
    },
    warningText: { color: '#FFF', fontWeight: '700', marginLeft: Spacing.sm },
    scrollContent: { paddingBottom: 100 },
    chartContainer: {
        backgroundColor: Colors.prodSurface, marginHorizontal: Spacing.lg,
        borderRadius: BorderRadius.lg, paddingVertical: Spacing.lg,
        alignItems: 'center', marginBottom: Spacing.lg,
        borderWidth: 1, borderColor: Colors.border
    },
    chart: { borderRadius: BorderRadius.lg },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
    transactionsHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm
    },
    searchBar: {
        marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
        backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
        borderWidth: 1, borderColor: Colors.border,
        height: 48
    },
    searchBarInput: { color: Colors.textPrimary, fontSize: 15 },
    expenseItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
        padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.sm,
        borderWidth: 1, borderColor: Colors.border,
    },
    expenseIconBg: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
    expenseInfo: { flex: 1 },
    expenseCategory: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
    expenseDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
    expenseAmount: { fontSize: 16, fontWeight: '700', color: Colors.danger },
    emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
    emptyStateText: { color: Colors.textMuted, marginTop: Spacing.sm },
    modalContent: { backgroundColor: Colors.surface, padding: Spacing.lg, margin: Spacing.lg, borderRadius: BorderRadius.lg },
    modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
    input: { backgroundColor: Colors.surfaceVariant, marginBottom: Spacing.md },
    categoryTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.sm, marginTop: Spacing.xs },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.lg },
    categoryChip: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
        borderRadius: BorderRadius.round, backgroundColor: Colors.surfaceVariant, borderWidth: 1, borderColor: Colors.border,
    },
    categoryLabel: { marginLeft: 6, fontSize: 13, color: Colors.textMuted },
    saveBtn: { borderRadius: BorderRadius.md, paddingVertical: 4 },
});

export default ExpensesScreen;
