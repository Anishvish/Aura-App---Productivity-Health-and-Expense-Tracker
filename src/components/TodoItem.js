import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Text, Checkbox } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    GestureHandlerRootView,
    Swipeable,
} from 'react-native-gesture-handler';
import { Colors, Spacing, BorderRadius } from '../theme/theme';

const PRIORITY_CONFIG = {
    High: {
        color: Colors.priorityHigh,
        icon: 'arrow-up-bold',
        bg: Colors.priorityHigh + '15',
    },
    Medium: {
        color: Colors.priorityMedium,
        icon: 'arrow-right-bold',
        bg: Colors.priorityMedium + '15',
    },
    Low: {
        color: Colors.priorityLow,
        icon: 'arrow-down-bold',
        bg: Colors.priorityLow + '15',
    },
};

const TodoItem = ({ todo, onToggle, onDelete, onEdit }) => {
    const priorityConfig = PRIORITY_CONFIG[todo.priority] || PRIORITY_CONFIG.Medium;

    const renderRightActions = (progress, dragX) => {
        const scale = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0.5],
            extrapolate: 'clamp',
        });

        return (
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                    style={styles.editAction}
                    onPress={() => onEdit(todo)}>
                    <Animated.View style={[styles.actionContent, { transform: [{ scale }] }]}>
                        <MaterialCommunityIcons name="pencil" size={24} color="#000" />
                        <Text style={styles.editText}>Edit</Text>
                    </Animated.View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteAction}
                    onPress={() => onDelete(todo.id)}>
                    <Animated.View style={[styles.actionContent, { transform: [{ scale }] }]}>
                        <MaterialCommunityIcons name="trash-can-outline" size={24} color="#FFF" />
                        <Text style={styles.deleteText}>Delete</Text>
                    </Animated.View>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <Swipeable
            renderRightActions={renderRightActions}
            friction={2}
            rightThreshold={40}>
            <View
                style={[
                    styles.container,
                    todo.completed && styles.completedContainer,
                ]}>
                <Checkbox
                    status={todo.completed ? 'checked' : 'unchecked'}
                    onPress={() => onToggle(todo.id, !todo.completed)}
                    color={Colors.healthPrimary}
                    uncheckedColor={Colors.textMuted}
                />

                <View style={styles.textContainer}>
                    <Text
                        style={[
                            styles.title,
                            todo.completed && styles.completedTitle,
                        ]}
                        numberOfLines={2}>
                        {todo.title}
                    </Text>
                </View>

                <View
                    style={[styles.priorityBadge, { backgroundColor: priorityConfig.bg }]}>
                    <MaterialCommunityIcons
                        name={priorityConfig.icon}
                        size={14}
                        color={priorityConfig.color}
                    />
                    <Text style={[styles.priorityText, { color: priorityConfig.color }]}>
                        {todo.priority}
                    </Text>
                </View>

                <TouchableOpacity onPress={() => onEdit(todo)} style={styles.inlineEditBtn}>
                    <MaterialCommunityIcons name="pencil-outline" size={20} color={Colors.textMuted} />
                </TouchableOpacity>

            </View>
        </Swipeable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        paddingVertical: Spacing.sm + 2,
        paddingHorizontal: Spacing.sm,
        marginBottom: 2,
        borderRadius: BorderRadius.md,
    },
    completedContainer: {
        opacity: 0.6,
    },
    textContainer: {
        flex: 1,
        marginLeft: Spacing.xs,
    },
    title: {
        fontSize: 15,
        color: Colors.textPrimary,
        fontWeight: '500',
    },
    completedTitle: {
        textDecorationLine: 'line-through',
        color: Colors.textMuted,
    },
    priorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BorderRadius.round,
        marginLeft: Spacing.sm,
    },
    priorityText: {
        fontSize: 11,
        fontWeight: '700',
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inlineEditBtn: {
        padding: Spacing.sm,
        marginLeft: Spacing.xs,
    },
    editAction: {
        backgroundColor: Colors.priorityMedium,
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        marginBottom: 2,
    },
    deleteAction: {
        backgroundColor: Colors.danger,
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        marginBottom: 2,
        borderTopRightRadius: BorderRadius.md,
        borderBottomRightRadius: BorderRadius.md,
    },
    actionContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    editText: {
        color: '#000',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    deleteText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
});

export default TodoItem;
