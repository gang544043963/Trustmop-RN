/**
 * TrustMop brand color palette and theme constants.
 */

import { Platform } from 'react-native';

// Brand colors
export const Colors = {
  primary: '#2563EB',       // Primary blue
  primaryLight: '#DBEAFE',  // Light blue tint
  primaryDark: '#1D4ED8',   // Dark blue

  accent: '#F59E0B',        // Amber accent
  accentLight: '#FEF3C7',
  accentDark: '#D97706',

  // Neutral grays
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Semantic
  success: '#16A34A',
  successLight: '#DCFCE7',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  warning: '#D97706',
  warningLight: '#FEF3C7',

  white: '#FFFFFF',
  black: '#000000',

  // Light/dark mode surfaces
  light: {
    text: '#111827',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    border: '#E5E7EB',
    tint: '#2563EB',
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#2563EB',
  },
  dark: {
    text: '#F9FAFB',
    background: '#111827',
    surface: '#1F2937',
    border: '#374151',
    tint: '#60A5FA',
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#60A5FA',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
