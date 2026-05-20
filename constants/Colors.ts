import { Platform } from 'react-native';

export const colors = {
  background: '#0F172A',
  surface: '#1E293B',
  card: '#334155',

  primary: '#38BDF8',
  secondary: '#8B5CF6',

  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',

  text: '#FFFFFF',
  mutedText: '#CBD5E1',
  border: '#475569',
};

export const Colors = {
  light: {
    text: colors.text,
    background: colors.background,
    tint: colors.primary,
    icon: colors.mutedText,
    tabIconDefault: colors.mutedText,
    tabIconSelected: colors.primary,
  },
  dark: {
    text: colors.text,
    background: colors.background,
    tint: colors.primary,
    icon: colors.mutedText,
    tabIconDefault: colors.mutedText,
    tabIconSelected: colors.primary,
  },
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