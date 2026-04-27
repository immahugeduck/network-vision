export const Colors = {
  background: '#000000',
  surface: '#0A0A0F',
  surfaceElevated: '#111118',
  border: '#1A1A2E',
  blue: '#00A8FF',
  blueLight: '#4DC8FF',
  green: '#00E676',
  orange: '#FF9100',
  red: '#FF1744',
  purple: '#AA00FF',
  textPrimary: '#FFFFFF',
  textSecondary: '#8888AA',
  textMuted: '#444466',
};

export const SeverityColors: Record<string, string> = {
  low: Colors.green,
  medium: Colors.orange,
  high: Colors.red,
  critical: Colors.purple,
};
