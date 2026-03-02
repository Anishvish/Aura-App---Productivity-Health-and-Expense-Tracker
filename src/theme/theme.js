import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
    fontFamily: 'System',
};

export const ColorsDark = {
    background: '#0A0E17',
    surface: '#141925',
    surfaceVariant: '#1C2333',
    card: '#1A1F2E',

    healthPrimary: '#50C878',
    healthLight: '#7DDFA0',
    healthDark: '#3AA35E',
    healthSurface: 'rgba(80, 200, 120, 0.08)',
    healthGlow: 'rgba(80, 200, 120, 0.15)',

    prodPrimary: '#007BFF',
    prodLight: '#4DA3FF',
    prodDark: '#0056B3',
    prodSurface: 'rgba(0, 123, 255, 0.08)',
    prodGlow: 'rgba(0, 123, 255, 0.15)',

    textPrimary: '#FFFFFF',
    textSecondary: '#A0AEC0',
    textMuted: '#636E80',

    priorityHigh: '#FF4757',
    priorityMedium: '#FFA502',
    priorityLow: '#2ED573',

    starFilled: '#FFD700',
    starEmpty: '#3A3F4B',

    danger: '#FF4757',
    warning: '#FFA502',
    success: '#2ED573',
    border: '#2A3040',
    divider: '#1E2535',
};

export const ColorsLight = {
    background: '#F0F4FF',
    surface: '#FFFFFF',
    surfaceVariant: '#E8EDFB',
    card: '#FFFFFF',

    healthPrimary: '#10B981',
    healthLight: '#34D399',
    healthDark: '#059669',
    healthSurface: 'rgba(16, 185, 129, 0.12)',
    healthGlow: 'rgba(16, 185, 129, 0.25)',

    prodPrimary: '#6366F1',
    prodLight: '#818CF8',
    prodDark: '#4F46E5',
    prodSurface: 'rgba(99, 102, 241, 0.1)',
    prodGlow: 'rgba(99, 102, 241, 0.2)',

    textPrimary: '#1E1B4B',
    textSecondary: '#475569',
    textMuted: '#94A3B8',

    priorityHigh: '#EF4444',
    priorityMedium: '#F59E0B',
    priorityLow: '#10B981',

    starFilled: '#F59E0B',
    starEmpty: '#E2E8F0',

    danger: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    border: '#DDD6FE',
    divider: '#C7D2FE',
};

// Default export for backwards compatibility
export const Colors = ColorsDark;

export const darkTheme = {
    ...MD3DarkTheme,
    dark: true,
    colors: {
        ...MD3DarkTheme.colors,
        ...ColorsDark,
        primary: ColorsDark.healthPrimary,
        secondary: ColorsDark.prodPrimary,
        background: ColorsDark.background,
        surface: ColorsDark.surface,
        surfaceVariant: ColorsDark.surfaceVariant,
        onSurface: ColorsDark.textPrimary,
        onSurfaceVariant: ColorsDark.textSecondary,
        error: ColorsDark.danger,
        outline: ColorsDark.border,
        elevation: {
            level0: 'transparent',
            level1: ColorsDark.surface,
            level2: ColorsDark.surfaceVariant,
            level3: ColorsDark.card,
            level4: ColorsDark.card,
            level5: ColorsDark.card,
        },
    },
    fonts: configureFonts({ config: fontConfig }),
};

export const lightTheme = {
    ...MD3LightTheme,
    dark: false,
    colors: {
        ...MD3LightTheme.colors,
        ...ColorsLight,
        primary: ColorsLight.healthPrimary,
        secondary: ColorsLight.prodPrimary,
        background: ColorsLight.background,
        surface: ColorsLight.surface,
        surfaceVariant: ColorsLight.surfaceVariant,
        onSurface: ColorsLight.textPrimary,
        onSurfaceVariant: ColorsLight.textSecondary,
        error: ColorsLight.danger,
        outline: ColorsLight.border,
        elevation: {
            level0: 'transparent',
            level1: ColorsLight.surface,
            level2: ColorsLight.surfaceVariant,
            level3: ColorsLight.card,
            level4: ColorsLight.card,
            level5: ColorsLight.card,
        },
    },
    fonts: configureFonts({ config: fontConfig }),
};

// Default export
export const theme = darkTheme;
export default darkTheme;

export const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const BorderRadius = { sm: 8, md: 12, lg: 16, xl: 24, round: 50 };
