// Database helper using expo-sqlite
// This module handles all SQLite operations for the Aura app

import * as SQLite from 'expo-sqlite';

let db = null;

// Simple hash function for local password storage
const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
};

export const initDatabase = async () => {
    try {
        db = await SQLite.openDatabaseAsync('AuraDB.db');

        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        step_goal INTEGER NOT NULL DEFAULT 10000,
        water_goal INTEGER NOT NULL DEFAULT 3000,
        height_cm REAL DEFAULT 0,
        weight_kg REAL DEFAULT 0,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        count INTEGER NOT NULL DEFAULT 0,
        UNIQUE(date)
      );
      CREATE TABLE IF NOT EXISTS water_intake (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        amount_ml INTEGER NOT NULL,
        timestamp TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sleep_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        duration_hours REAL NOT NULL,
        quality_rating INTEGER NOT NULL DEFAULT 3,
        UNIQUE(date)
      );
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'Medium',
        completed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS pomodoro_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        duration INTEGER NOT NULL,
        type TEXT NOT NULL DEFAULT 'work'
      );
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL
      );
    `);

        // Safely add columns if they don't exist (migrations)
        try {
            await db.execAsync(`ALTER TABLE users ADD COLUMN height_cm REAL DEFAULT 0;`);
            console.log('Added height_cm column');
        } catch (e) {
            // Column already exists
        }

        try {
            await db.execAsync(`ALTER TABLE users ADD COLUMN weight_kg REAL DEFAULT 0;`);
            console.log('Added weight_kg column');
        } catch (e) { }
        // New columns for V2 features
        try { await db.execAsync(`ALTER TABLE users ADD COLUMN profile_pic TEXT;`); console.log('Added profile_pic'); } catch (e) { }
        try { await db.execAsync(`ALTER TABLE users ADD COLUMN currency TEXT DEFAULT '$';`); console.log('Added currency'); } catch (e) { }
        try { await db.execAsync(`ALTER TABLE users ADD COLUMN daily_expense_limit REAL DEFAULT 0;`); console.log('Added daily_expense_limit'); } catch (e) { }
        try { await db.execAsync(`ALTER TABLE users ADD COLUMN monthly_expense_limit REAL DEFAULT 0;`); console.log('Added monthly_expense_limit'); } catch (e) { }
        try { await db.execAsync(`ALTER TABLE users ADD COLUMN dob TEXT;`); console.log('Added dob'); } catch (e) { }
        try { await db.execAsync(`ALTER TABLE users ADD COLUMN theme TEXT DEFAULT 'dark';`); console.log('Added theme'); } catch (e) { }

        console.log('Database initialized successfully');
        return true;
    } catch (error) {
        console.error('Database initialization error:', error);
        return false;
    }
};

// ==================== USERS / AUTH ====================
export const createUser = async (name, email, password, stepGoal = 10000, waterGoal = 3000, dob = '', theme = 'dark') => {
    try {
        const passwordHash = simpleHash(password);
        const createdAt = new Date().toISOString();
        await db.runAsync(
            'INSERT INTO users (name, email, password_hash, step_goal, water_goal, created_at, dob, theme) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email.toLowerCase().trim(), passwordHash, stepGoal, waterGoal, createdAt, dob, theme],
        );
        const user = await db.getFirstAsync('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
        return {
            success: true, user: {
                id: user.id, name: user.name, email: user.email,
                stepGoal: user.step_goal, waterGoal: user.water_goal,
                heightCm: user.height_cm || 0, weightKg: user.weight_kg || 0,
                profilePic: user.profile_pic, currency: user.currency || '$',
                dailyLimit: user.daily_expense_limit || 0, monthlyLimit: user.monthly_expense_limit || 0,
                dob: user.dob || '',
                theme: user.theme || 'dark'
            }
        };
    } catch (error) {
        if (error.message && error.message.includes('UNIQUE constraint failed')) {
            return { success: false, error: 'An account with this email already exists' };
        }
        console.error('Error creating user:', error);
        return { success: false, error: 'Failed to create account. Please try again.' };
    }
};

export const validateUser = async (email, password) => {
    try {
        const passwordHash = simpleHash(password);
        const user = await db.getFirstAsync(
            'SELECT * FROM users WHERE email = ? AND password_hash = ?',
            [email.toLowerCase().trim(), passwordHash],
        );
        if (user) {
            return {
                success: true, user: {
                    id: user.id, name: user.name, email: user.email,
                    stepGoal: user.step_goal, waterGoal: user.water_goal,
                    heightCm: user.height_cm || 0, weightKg: user.weight_kg || 0,
                    profilePic: user.profile_pic, currency: user.currency || '$',
                    dailyLimit: user.daily_expense_limit || 0, monthlyLimit: user.monthly_expense_limit || 0,
                    dob: user.dob || '',
                    theme: user.theme || 'dark'
                }
            };
        }
        return { success: false, error: 'Invalid email or password' };
    } catch (error) {
        console.error('Error validating user:', error);
        return { success: false, error: 'Login failed. Please try again.' };
    }
};

export const getUserById = async (id) => {
    try {
        const user = await db.getFirstAsync('SELECT * FROM users WHERE id = ?', [id]);
        if (user) {
            return {
                id: user.id, name: user.name, email: user.email,
                stepGoal: user.step_goal, waterGoal: user.water_goal,
                heightCm: user.height_cm || 0, weightKg: user.weight_kg || 0,
                profilePic: user.profile_pic, currency: user.currency || '$',
                dailyLimit: user.daily_expense_limit || 0, monthlyLimit: user.monthly_expense_limit || 0,
                dob: user.dob || '',
                theme: user.theme || 'dark'
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
};

export const updateUserProfile = async (id, { name, email, stepGoal, waterGoal, heightCm, weightKg, profilePic, currency, dailyLimit, monthlyLimit, dob, theme }) => {
    try {
        // Check email uniqueness if changing email
        const existing = await db.getFirstAsync('SELECT id FROM users WHERE email = ? AND id != ?', [email.toLowerCase().trim(), id]);
        if (existing) {
            return { success: false, error: 'Email already in use by another account.' };
        }

        await db.runAsync(
            `UPDATE users SET 
                name = ?, email = ?, step_goal = ?, water_goal = ?, height_cm = ?, weight_kg = ?,
                profile_pic = ?, currency = ?, daily_expense_limit = ?, monthly_expense_limit = ?, dob = ?, theme = ?
             WHERE id = ?`,
            [name, email.toLowerCase().trim(), stepGoal, waterGoal, heightCm, weightKg, profilePic, currency, dailyLimit, monthlyLimit, dob, theme, id],
        );
        const user = await getUserById(id);
        return { success: true, user };
    } catch (error) {
        console.error('Error updating user profile:', error);
        return { success: false, error: 'Failed to update profile.' };
    }
};

// ==================== STEPS ====================
export const getStepsForDate = async (date) => {
    try {
        const result = await db.getFirstAsync('SELECT count FROM steps WHERE date = ?', [date]);
        return result ? result.count : 0;
    } catch (error) {
        console.error('Error getting steps:', error);
        return 0;
    }
};

export const updateSteps = async (date, count) => {
    try {
        await db.runAsync(
            'INSERT INTO steps (date, count) VALUES (?, ?) ON CONFLICT(date) DO UPDATE SET count = ?',
            [date, count, count],
        );
        return true;
    } catch (error) {
        console.error('Error updating steps:', error);
        return false;
    }
};

export const getStepsForWeek = async (dates) => {
    try {
        const placeholders = dates.map(() => '?').join(',');
        const results = await db.getAllAsync(
            `SELECT date, count FROM steps WHERE date IN (${placeholders}) ORDER BY date ASC`,
            dates,
        );
        return results || [];
    } catch (error) {
        console.error('Error getting weekly steps:', error);
        return [];
    }
};

// ==================== WATER INTAKE ====================
export const addWaterIntake = async (date, amountMl) => {
    try {
        const timestamp = new Date().toISOString();
        await db.runAsync(
            'INSERT INTO water_intake (date, amount_ml, timestamp) VALUES (?, ?, ?)',
            [date, amountMl, timestamp],
        );
        return true;
    } catch (error) {
        console.error('Error adding water intake:', error);
        return false;
    }
};

export const getWaterIntakeForDate = async (date) => {
    try {
        const result = await db.getFirstAsync(
            'SELECT COALESCE(SUM(amount_ml), 0) as total FROM water_intake WHERE date = ?',
            [date],
        );
        return result ? result.total : 0;
    } catch (error) {
        console.error('Error getting water intake:', error);
        return 0;
    }
};

// ==================== SLEEP LOGS ====================
export const saveSleepLog = async (date, durationHours, qualityRating) => {
    try {
        await db.runAsync(
            'INSERT INTO sleep_logs (date, duration_hours, quality_rating) VALUES (?, ?, ?) ON CONFLICT(date) DO UPDATE SET duration_hours = ?, quality_rating = ?',
            [date, durationHours, qualityRating, durationHours, qualityRating],
        );
        return true;
    } catch (error) {
        console.error('Error saving sleep log:', error);
        return false;
    }
};

export const getSleepLogForDate = async (date) => {
    try {
        const result = await db.getFirstAsync(
            'SELECT duration_hours, quality_rating FROM sleep_logs WHERE date = ?',
            [date],
        );
        return result || null;
    } catch (error) {
        console.error('Error getting sleep log:', error);
        return null;
    }
};

// ==================== TODOS ====================
export const addTodo = async (title, priority) => {
    try {
        const createdAt = new Date().toISOString();
        await db.runAsync(
            'INSERT INTO todos (title, priority, completed, created_at) VALUES (?, ?, 0, ?)',
            [title, priority, createdAt],
        );
        return true;
    } catch (error) {
        console.error('Error adding todo:', error);
        return false;
    }
};

export const getTodos = async () => {
    try {
        const results = await db.getAllAsync(
            'SELECT * FROM todos ORDER BY completed ASC, created_at DESC',
        );
        return results || [];
    } catch (error) {
        console.error('Error getting todos:', error);
        return [];
    }
};

export const toggleTodo = async (id, completed) => {
    try {
        await db.runAsync('UPDATE todos SET completed = ? WHERE id = ?', [
            completed ? 1 : 0,
            id,
        ]);
        return true;
    } catch (error) {
        console.error('Error toggling todo:', error);
        return false;
    }
};

export const editTodo = async (id, text, priority) => {
    try {
        await db.runAsync(
            'UPDATE todos SET text = ?, priority = ? WHERE id = ?',
            [text, priority, id],
        );
        return true;
    } catch (error) {
        console.error('Error editing todo:', error);
        return false;
    }
};

export const deleteTodo = async (id) => {
    try {
        await db.runAsync('DELETE FROM todos WHERE id = ?', [id]);
        return true;
    } catch (error) {
        console.error('Error deleting todo:', error);
        return false;
    }
};

export const getCompletedTodosCountForWeek = async (dates) => {
    try {
        const placeholders = dates.map(() => '?').join(',');
        const results = await db.getAllAsync(
            `SELECT DATE(created_at) as date, COUNT(*) as count FROM todos WHERE completed = 1 AND DATE(created_at) IN (${placeholders}) GROUP BY DATE(created_at)`,
            dates,
        );
        return results || [];
    } catch (error) {
        console.error('Error getting completed todos for week:', error);
        return [];
    }
};

// ==================== POMODORO SESSIONS ====================
export const addPomodoroSession = async (date, duration, type) => {
    try {
        await db.runAsync(
            'INSERT INTO pomodoro_sessions (date, duration, type) VALUES (?, ?, ?)',
            [date, duration, type],
        );
        return true;
    } catch (error) {
        console.error('Error adding pomodoro session:', error);
        return false;
    }
};

export const getPomodoroSessionsForDate = async (date) => {
    try {
        const result = await db.getFirstAsync(
            'SELECT COUNT(*) as count FROM pomodoro_sessions WHERE date = ? AND type = ?',
            [date, 'work'],
        );
        return result ? result.count : 0;
    } catch (error) {
        console.error('Error getting pomodoro sessions:', error);
        return 0;
    }
};

// ==================== EXPENSES ====================
export const addExpense = async (date, amount, category, description) => {
    try {
        const createdAt = new Date().toISOString();
        await db.runAsync(
            'INSERT INTO expenses (date, amount, category, description, created_at) VALUES (?, ?, ?, ?, ?)',
            [date, amount, category, description, createdAt],
        );
        return true;
    } catch (error) {
        console.error('Error adding expense:', error);
        return false;
    }
};

export const getExpensesForDate = async (date) => {
    try {
        const results = await db.getAllAsync(
            'SELECT * FROM expenses WHERE date = ? ORDER BY created_at DESC',
            [date],
        );
        return results || [];
    } catch (error) {
        console.error('Error getting expenses:', error);
        return [];
    }
};

export const getDailyExpenseTotal = async (date) => {
    try {
        const result = await db.getFirstAsync(
            'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date = ?',
            [date],
        );
        return result ? result.total : 0;
    } catch (error) {
        console.error('Error getting daily expense total:', error);
        return 0;
    }
};

export const getWeeklyExpenseStats = async (dates) => {
    try {
        const stats = [];
        for (const date of dates) {
            const total = await getDailyExpenseTotal(date);
            stats.push(total);
        }
        return stats;
    } catch (error) {
        console.error('Error getting weekly expense stats:', error);
        return dates.map(() => 0);
    }
};

export const getMonthlyExpenseTotal = async (monthPrefix) => {
    try {
        const result = await db.getFirstAsync(
            "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date LIKE ?",
            [`${monthPrefix}%`]
        );
        return result ? result.total : 0;
    } catch (error) {
        console.error('Error getting monthly expense sum:', error);
        return 0;
    }
};

// ==================== DASHBOARD STATS ====================
export const getDashboardStats = async (date) => {
    try {
        const steps = await getStepsForDate(date);
        const water = await getWaterIntakeForDate(date);
        const sleep = await getSleepLogForDate(date);
        const pomodoros = await getPomodoroSessionsForDate(date);
        const expensesTotal = await getDailyExpenseTotal(date);

        const todoResult = await db.getFirstAsync(
            'SELECT COUNT(*) as total, SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as done FROM todos',
        );
        let todosTotal = 0;
        let todosDone = 0;
        if (todoResult) {
            todosTotal = todoResult.total;
            todosDone = todoResult.done || 0;
        }

        return {
            steps,
            waterMl: water,
            sleepHours: sleep ? sleep.duration_hours : 0,
            sleepQuality: sleep ? sleep.quality_rating : 0,
            pomodoroCount: pomodoros,
            todosTotal,
            todosDone,
            expensesTotal,
        };
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        return {
            steps: 0,
            waterMl: 0,
            sleepHours: 0,
            sleepQuality: 0,
            pomodoroCount: 0,
            todosTotal: 0,
            todosDone: 0,
            expensesTotal: 0,
        };
    }
};
