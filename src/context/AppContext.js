import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getDashboardStats } from '../database/Database';
import { getTodayDate } from '../utils/helpers';
import { useAuth } from './AuthContext';

const AppContext = createContext();

const initialState = {
    todaySteps: 0,
    stepGoal: 10000,
    todayWater: 0,
    waterGoal: 3000,
    todaySleep: { hours: 0, quality: 0 },
    pomodoroCount: 0,
    todosTotal: 0,
    todosDone: 0,
    todayExpenses: 0,
    refreshKey: 0,
};

const appReducer = (state, action) => {
    switch (action.type) {
        case 'SET_STEPS':
            return { ...state, todaySteps: action.payload };
        case 'SET_WATER':
            return { ...state, todayWater: action.payload };
        case 'SET_SLEEP':
            return { ...state, todaySleep: action.payload };
        case 'SET_POMODORO_COUNT':
            return { ...state, pomodoroCount: action.payload };
        case 'SET_TODOS_STATS':
            return {
                ...state,
                todosTotal: action.payload.total,
                todosDone: action.payload.done,
            };
        case 'SET_WATER_GOAL':
            return { ...state, waterGoal: action.payload };
        case 'SET_STEP_GOAL':
            return { ...state, stepGoal: action.payload };
        case 'SET_USER_GOALS':
            return { ...state, stepGoal: action.payload.stepGoal, waterGoal: action.payload.waterGoal };
        case 'REFRESH':
            return { ...state, refreshKey: state.refreshKey + 1 };
        case 'LOAD_DASHBOARD':
            return {
                ...state,
                todaySteps: action.payload.steps,
                todayWater: action.payload.waterMl,
                todaySleep: {
                    hours: action.payload.sleepHours,
                    quality: action.payload.sleepQuality,
                },
                pomodoroCount: action.payload.pomodoroCount,
                todosTotal: action.payload.todosTotal,
                todosDone: action.payload.todosDone,
                todayExpenses: action.payload.expensesTotal,
            };
        default:
            return state;
    }
};

export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const { user } = useAuth();

    // Load user's custom goals
    useEffect(() => {
        if (user) {
            dispatch({
                type: 'SET_USER_GOALS',
                payload: { stepGoal: user.stepGoal || 10000, waterGoal: user.waterGoal || 3000 },
            });
        }
    }, [user]);

    const refreshDashboard = async () => {
        try {
            const today = getTodayDate();
            const stats = await getDashboardStats(today);
            dispatch({ type: 'LOAD_DASHBOARD', payload: stats });
        } catch (error) {
            console.error('Error refreshing dashboard:', error);
        }
    };

    useEffect(() => {
        refreshDashboard();
    }, [state.refreshKey]);

    return (
        <AppContext.Provider value={{ state, dispatch, refreshDashboard }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

export default AppContext;

