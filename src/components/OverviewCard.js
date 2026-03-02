import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Colors, Spacing, BorderRadius } from '../theme/theme';

const OverviewCard = ({
    title,
    value,
    subtitle,
    icon,
    accentColor = Colors.healthPrimary,
    progress = null, // 0 to 100
    onPress,
}) => {
    return (
        <Card
            style={[styles.card, { borderLeftColor: accentColor }]}
            onPress={onPress}
            mode="contained">
            <Card.Content style={styles.content}>
                <View style={styles.iconContainer}>
                    {progress !== null ? (
                        <AnimatedCircularProgress
                            size={56}
                            width={4}
                            fill={progress > 100 ? 100 : progress}
                            tintColor={accentColor}
                            backgroundColor={Colors.surfaceVariant}
                            rotation={0}
                            lineCap="round"
                        >
                            {() => (
                                <View style={[styles.iconBg, { backgroundColor: accentColor + '18', width: 44, height: 44 }]}>
                                    <MaterialCommunityIcons name={icon} size={24} color={accentColor} />
                                </View>
                            )}
                        </AnimatedCircularProgress>
                    ) : (
                        <View style={[styles.iconBg, { backgroundColor: accentColor + '18' }]}>
                            <MaterialCommunityIcons name={icon} size={28} color={accentColor} />
                        </View>
                    )}
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
                    {subtitle ? (
                        <Text style={styles.subtitle}>{subtitle}</Text>
                    ) : null}
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
        borderLeftWidth: 4,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    iconContainer: {
        marginRight: Spacing.md,
    },
    iconBg: {
        width: 52,
        height: 52,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 2,
    },
    value: {
        fontSize: 26,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 12,
        color: Colors.textMuted,
        marginTop: 2,
    },
});

export default OverviewCard;
