import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

import DashboardScreen from '../screens/DashboardScreen';
import TasksScreen from '../screens/TasksScreen';
import WellnessScreen from '../screens/WellnessScreen';
import StatsScreen from '../screens/StatsScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { colors: Colors, dark: isDarkTheme } = useTheme();
    const { isLoggedIn } = useAuth();

    const navTheme = {
        ...DefaultTheme,
        dark: isDarkTheme,
        colors: {
            ...DefaultTheme.colors,
            background: Colors.background,
            card: Colors.surface,
            text: Colors.textPrimary,
            border: Colors.border,
            primary: Colors.healthPrimary,
        },
    };

    const tabScreenOptions = ({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            switch (route.name) {
                case 'Dashboard': iconName = focused ? 'view-dashboard' : 'view-dashboard-outline'; break;
                case 'Tasks': iconName = focused ? 'clipboard-check' : 'clipboard-check-outline'; break;
                case 'Wellness': iconName = focused ? 'heart-pulse' : 'heart-outline'; break;
                case 'Expenses': iconName = focused ? 'wallet' : 'wallet-outline'; break;
                case 'Profile': iconName = focused ? 'account-circle' : 'account-circle-outline'; break;
                default: iconName = 'circle';
            }
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: route.name === 'Expenses' ? Colors.warning :
            route.name === 'Tasks' ? Colors.prodPrimary : Colors.healthPrimary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
            borderTopWidth: 1,
            height: 65,
            paddingBottom: 8,
            paddingTop: 8,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
    });

    const MainTabs = () => (
        <Tab.Navigator screenOptions={tabScreenOptions}>
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Tasks" component={TasksScreen} />
            <Tab.Screen name="Wellness" component={WellnessScreen} />
            <Tab.Screen name="Expenses" component={ExpensesScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );

    const AuthStack = () => (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Navigator>
    );

    return (
        <NavigationContainer theme={navTheme}>
            {isLoggedIn ? <MainTabs /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default AppNavigator;
