// Utility helper functions for Aura

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = () => {
    const now = new Date();
    return formatDate(now);
};

/**
 * Format a Date object to YYYY-MM-DD string
 */
export const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Get the dates of the current week (Mon-Sun)
 */
export const getCurrentWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const dates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + mondayOffset + i);
        dates.push(formatDate(d));
    }
    return dates;
};

/**
 * Get short day name from date string
 */
export const getShortDayName = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
};

/**
 * Format milliseconds to MM:SS string
 */
export const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/**
 * Format water amount for display
 */
export const formatWaterAmount = (ml) => {
    if (ml >= 1000) {
        return `${(ml / 1000).toFixed(1)}L`;
    }
    return `${ml}ml`;
};

/**
 * Get a randomly selected motivational greeting
 */
export const getGreeting = (name) => {
    const hour = new Date().getHours();
    let timeOfDay = 'Good Morning';
    if (hour >= 12 && hour < 17) timeOfDay = 'Good Afternoon';
    else if (hour >= 17) timeOfDay = 'Good Evening';

    const prepends = [
        "Ready to crush it today?",
        "Let's make it happen!",
        "Time to shine!",
        "Great to see you!",
        "Stay focused, stay strong!",
        "Another day to excel."
    ];
    const randomPrepend = prepends[Math.floor(Math.random() * prepends.length)];

    return `${timeOfDay}${name ? `, ${name}` : ''}. ${randomPrepend}`;
};

/**
 * Get a motivational message for the dashboard
 */
export const getMotivationalMessage = (stats) => {
    const messages = [
        'Keep pushing toward your goals! 💪',
        'Every step counts. You\'re doing great! 🌟',
        'Stay hydrated, stay healthy! 💧',
        'Consistency is the key to success! 🔑',
        'Your wellness journey continues! 🌿',
    ];

    if (stats && stats.steps > 5000) {
        return 'Amazing step count! Keep it going! 🏃‍♂️';
    }
    if (stats && stats.waterMl > 2000) {
        return 'Great hydration today! 💧';
    }

    return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Get a random wellness quote
 */
export const getWellnessQuote = () => {
    const quotes = [
        "Take care of your body. It's the only place you have to live.",
        "Wellness is a connection of paths: knowledge and action.",
        "A healthy outside starts from the inside.",
        "The groundwork of all happiness is healh.",
        "To keep the body in good health is a duty.",
        "Physical fitness is the first requisite of happiness."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
};
