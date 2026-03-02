import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, StatusBar } from 'react-native';
import { Text, FAB, Portal, Modal, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius } from '../theme/theme';
import { useAppContext } from '../context/AppContext';
import TodoItem from '../components/TodoItem';
import PomodoroTimer from '../components/PomodoroTimer';
import { addTodo, getTodos, toggleTodo, deleteTodo, editTodo } from '../database/Database';
import { ScrollView } from 'react-native';

const TasksScreen = () => {
    const { dispatch } = useAppContext();
    const [activeTab, setActiveTab] = useState('todos');
    const [todos, setTodosList] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newPriority, setNewPriority] = useState('Medium');

    const [showEditModal, setShowEditModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editPriority, setEditPriority] = useState('Medium');

    const loadTodos = async () => {
        const data = await getTodos();
        setTodosList(data);
        const done = data.filter((t) => t.completed).length;
        dispatch({ type: 'SET_TODOS_STATS', payload: { total: data.length, done } });
    };

    useFocusEffect(useCallback(() => { loadTodos(); }, []));

    const handleAddTodo = async () => {
        if (!newTitle.trim()) return;
        await addTodo(newTitle.trim(), newPriority);
        setNewTitle('');
        setNewPriority('Medium');
        setShowAddModal(false);
        await loadTodos();
    };

    const handleToggle = async (id, completed) => {
        await toggleTodo(id, completed);
        await loadTodos();
    };

    const handleDelete = async (id) => {
        await deleteTodo(id);
        await loadTodos();
    };

    const handleOpenEdit = (todo) => {
        setEditId(todo.id);
        setEditTitle(todo.title);
        setEditPriority(todo.priority);
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editTitle.trim() || !editId) return;
        await editTodo(editId, editTitle.trim(), editPriority);
        setShowEditModal(false);
        await loadTodos();
    };

    const activeTodos = todos.filter((t) => !t.completed);
    const completedTodos = todos.filter((t) => t.completed);

    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Productivity</Text>
                    <Text style={styles.headerSubtitle}>Stay focused, get things done</Text>
                </View>

                <View style={styles.tabRow}>
                    <Button
                        mode={activeTab === 'todos' ? 'contained' : 'outlined'}
                        onPress={() => setActiveTab('todos')}
                        style={styles.tabButton}
                        buttonColor={activeTab === 'todos' ? Colors.prodPrimary : 'transparent'}
                        textColor={activeTab === 'todos' ? '#FFF' : Colors.textSecondary}
                        icon="clipboard-check-outline" compact>
                        To-Do List
                    </Button>
                    <Button
                        mode={activeTab === 'pomodoro' ? 'contained' : 'outlined'}
                        onPress={() => setActiveTab('pomodoro')}
                        style={styles.tabButton}
                        buttonColor={activeTab === 'pomodoro' ? Colors.prodPrimary : 'transparent'}
                        textColor={activeTab === 'pomodoro' ? '#FFF' : Colors.textSecondary}
                        icon="timer-outline" compact>
                        Pomodoro
                    </Button>
                </View>

                {activeTab === 'todos' ? (
                    <View style={styles.todosContainer}>
                        {todos.length === 0 ? (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={Colors.textMuted} />
                                <Text style={styles.emptyTitle}>No tasks yet</Text>
                                <Text style={styles.emptySubtitle}>Tap the + button to add your first task</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={[...activeTodos, ...completedTodos]}
                                keyExtractor={(item) => String(item.id)}
                                renderItem={({ item }) => (
                                    <TodoItem todo={item} onToggle={handleToggle} onDelete={handleDelete} onEdit={handleOpenEdit} />
                                )}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                                ItemSeparatorComponent={() => <View style={styles.separator} />}
                                ListHeaderComponent={
                                    activeTodos.length > 0 ? (
                                        <View style={styles.listHeader}>
                                            <Text style={styles.listHeaderText}>
                                                {activeTodos.length} active • {completedTodos.length} done
                                            </Text>
                                        </View>
                                    ) : null
                                }
                            />
                        )}
                        <FAB icon="plus" style={styles.fab} onPress={() => setShowAddModal(true)} color="#000" customSize={56} />
                    </View>
                ) : (
                    <ScrollView style={styles.pomodoroContainer} contentContainerStyle={styles.pomodoroContent} showsVerticalScrollIndicator={false}>
                        <PomodoroTimer />
                    </ScrollView>
                )}

                <Portal>
                    <Modal visible={showAddModal} onDismiss={() => setShowAddModal(false)} contentContainerStyle={styles.modal}>
                        <Text style={styles.modalTitle}>New Task</Text>
                        <TextInput
                            mode="outlined" label="Task title" value={newTitle} onChangeText={setNewTitle}
                            style={styles.modalInput} outlineColor={Colors.border} activeOutlineColor={Colors.prodPrimary}
                            textColor={Colors.textPrimary} placeholderTextColor={Colors.textMuted} autoFocus
                        />
                        <Text style={styles.priorityLabel}>Priority</Text>
                        <View style={styles.priorityRow}>
                            {['Low', 'Medium', 'High'].map((p) => (
                                <Button
                                    key={p} mode={newPriority === p ? 'contained' : 'outlined'}
                                    onPress={() => setNewPriority(p)} style={styles.priorityButton}
                                    buttonColor={newPriority === p ? (p === 'High' ? Colors.priorityHigh : p === 'Medium' ? Colors.priorityMedium : Colors.priorityLow) : 'transparent'}
                                    textColor={newPriority === p ? '#000' : Colors.textSecondary} compact>
                                    {p}
                                </Button>
                            ))}
                        </View>
                        <View style={styles.modalActions}>
                            <Button mode="outlined" onPress={() => setShowAddModal(false)} style={styles.modalButton} textColor={Colors.textSecondary}>Cancel</Button>
                            <Button mode="contained" onPress={handleAddTodo} style={styles.modalButton} buttonColor={Colors.prodPrimary} disabled={!newTitle.trim()}>Add Task</Button>
                        </View>
                    </Modal>

                    {/* Edit Modal */}
                    <Modal visible={showEditModal} onDismiss={() => setShowEditModal(false)} contentContainerStyle={styles.modal}>
                        <Text style={styles.modalTitle}>Edit Task</Text>
                        <TextInput
                            mode="outlined" label="Task title" value={editTitle} onChangeText={setEditTitle}
                            style={styles.modalInput} outlineColor={Colors.border} activeOutlineColor={Colors.prodPrimary}
                            textColor={Colors.textPrimary} placeholderTextColor={Colors.textMuted} autoFocus
                        />
                        <Text style={styles.priorityLabel}>Priority</Text>
                        <View style={styles.priorityRow}>
                            {['Low', 'Medium', 'High'].map((p) => (
                                <Button
                                    key={p} mode={editPriority === p ? 'contained' : 'outlined'}
                                    onPress={() => setEditPriority(p)} style={styles.priorityButton}
                                    buttonColor={editPriority === p ? (p === 'High' ? Colors.priorityHigh : p === 'Medium' ? Colors.priorityMedium : Colors.priorityLow) : 'transparent'}
                                    textColor={editPriority === p ? '#000' : Colors.textSecondary} compact>
                                    {p}
                                </Button>
                            ))}
                        </View>
                        <View style={styles.modalActions}>
                            <Button mode="outlined" onPress={() => setShowEditModal(false)} style={styles.modalButton} textColor={Colors.textSecondary}>Cancel</Button>
                            <Button mode="contained" onPress={handleSaveEdit} style={styles.modalButton} buttonColor={Colors.prodPrimary} disabled={!editTitle.trim()}>Save Changes</Button>
                        </View>
                    </Modal>
                </Portal>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    safeArea: { flex: 1 },
    header: { padding: Spacing.md, paddingTop: Spacing.xl },
    headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
    tabRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.md },
    tabButton: { flex: 1, borderRadius: BorderRadius.md, borderColor: Colors.border },
    todosContainer: { flex: 1 },
    listContent: { paddingHorizontal: Spacing.md, paddingBottom: 100 },
    listHeader: { marginBottom: Spacing.sm },
    listHeaderText: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
    separator: { height: 4 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.textSecondary, marginTop: Spacing.md },
    emptySubtitle: { fontSize: 14, color: Colors.textMuted, marginTop: Spacing.xs },
    pomodoroContainer: { flex: 1 },
    pomodoroContent: { padding: Spacing.md },
    fab: { position: 'absolute', right: Spacing.md, bottom: Spacing.lg, backgroundColor: Colors.prodPrimary, borderRadius: 28, elevation: 8 },
    modal: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginHorizontal: Spacing.lg },
    modalTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.md },
    modalInput: { backgroundColor: Colors.surfaceVariant, marginBottom: Spacing.md },
    priorityLabel: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.8 },
    priorityRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
    priorityButton: { flex: 1, borderRadius: BorderRadius.md, borderColor: Colors.border },
    modalActions: { flexDirection: 'row', gap: Spacing.sm },
    modalButton: { flex: 1, borderRadius: BorderRadius.md, borderColor: Colors.border },
});

export default TasksScreen;
