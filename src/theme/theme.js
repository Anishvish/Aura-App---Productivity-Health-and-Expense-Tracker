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
    background: '#F7FAFC',
    surface: '#FFFFFF',
    surfaceVariant: '#EDF2F7',
    card: '#FFFFFF',

    healthPrimary: '#38A169',
    healthLight: '#48BB78',
    healthDark: '#276749',
    healthSurface: 'rgba(56, 161, 105, 0.1)',
    healthGlow: 'rgba(56, 161, 105, 0.2)',

    prodPrimary: '#3182CE',
    prodLight: '#4299E1',
    prodDark: '#2B6CB0',
    prodSurface: 'rgba(49, 130, 206, 0.1)',
    prodGlow: 'rgba(49, 130, 206, 0.2)',

    textPrimary: '#1A202C',
    textSecondary: '#4A5568',
    textMuted: '#A0AEC0',

    priorityHigh: '#E53E3E',
    priorityMedium: '#DD6B20',
    priorityLow: '#38A169',

    starFilled: '#ECC94B',
    starEmpty: '#E2E8F0',

    danger: '#E53E3E',
    warning: '#DD6B20',
    success: '#38A169',
    border: '#E2E8F0',
    divider: '#CBD5E0',
};

// Default export for backwards compatibility
export const Colors = ColorsDark;

export const darkTheme = {
    ...MD3DarkTheme,
    dark: true,
    colors: {
        ...MD3DarkTheme.colors,
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
