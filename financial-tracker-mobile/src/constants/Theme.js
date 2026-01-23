export const DarkTheme = {
    background: '#020617',
    cardBg: 'rgba(15, 23, 42, 0.7)',
    border: 'rgba(30, 41, 59, 0.5)',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    success: '#10b981',
    error: '#ef4444',
    white: '#ffffff',
    black: '#000000',
    inputBg: '#1e293b',
    isDark: true,
};

export const LightTheme = {
    background: '#f8fafc', // Slate 50
    cardBg: '#ffffff',
    border: '#e2e8f0', // Slate 200
    text: '#0f172a', // Slate 900
    textMuted: '#64748b', // Slate 500
    primary: '#6366f1', // Indigo 500 - Keep brand color
    secondary: '#8b5cf6',
    accent: '#ec4899',
    success: '#10b981',
    error: '#ef4444',
    white: '#ffffff',
    black: '#000000',
    inputBg: '#f1f5f9', // Slate 100
    isDark: false,
};

// Default for backward compatibility
export const Colors = DarkTheme;

export const Gradients = {
    premium: ['#6366f1', '#8b5cf6', '#ec4899'],
    indigo: ['#4f46e5', '#6366f1'],
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};
