/**
 * Design Tokens & Color Palette
 * Tailored for a modern, sleek, high-contrast dark theme with glowing accents.
 */

export const colors = {
  // Backgrounds
  background: '#0a0f1d',
  surface: '#111827',
  surfaceHover: '#1f293d',
  card: '#131c31',
  cardBorder: '#1e293b',
  cardBorderActive: '#38bdf8',

  // Brand Accents
  primary: '#6366f1', // Indigo
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  primaryGradient: ['#6366f1', '#8b5cf6', '#d946ef'],
  
  secondary: '#06b6d4', // Cyan
  secondaryLight: '#22d3ee',
  
  accent: '#f43f5e', // Rose accent

  // Feedback
  success: '#10b981',
  successBg: 'rgba(16, 185, 129, 0.12)',
  warning: '#f59e0b',
  warningBg: 'rgba(245, 158, 11, 0.12)',
  danger: '#ef4444',
  dangerBg: 'rgba(239, 68, 68, 0.12)',
  info: '#3b82f6',
  infoBg: 'rgba(59, 130, 246, 0.12)',

  // Text
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  textOnPrimary: '#ffffff',

  // Utility
  border: '#1e293b',
  divider: 'rgba(255, 255, 255, 0.08)',
  overlay: 'rgba(10, 15, 29, 0.85)'
};

export const typography = {
  fontFamily: 'System',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    hero: 34
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }
};
