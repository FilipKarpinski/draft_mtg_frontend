export const SCORE_OPTIONS = [
  { value: '0-0', label: '0:0' },
  { value: '2-0', label: '2:0' },
  { value: '2-1', label: '2:1' },
  { value: '1-2', label: '1:2' },
  { value: '0-2', label: '0:2' },
];

export const DECK_COLOR_OPTIONS = [
  { value: 'red', label: 'Red' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'black', label: 'Black' },
  { value: 'white', label: 'White' },
];

export const COLOR_MAP = {
  red: { color: 'red', bg: '#ff6b6b' },
  blue: { color: 'blue', bg: '#4dabf7' },
  green: { color: 'green', bg: '#51cf66' },
  black: { color: 'dark', bg: '#495057' },
  white: { color: 'gray', bg: '#f8f9fa', border: '2px solid #dee2e6', textColor: '#212529' },
};

export const createColorGradient = (colors: string[]): string => {
  if (colors.length === 0) return 'var(--mantine-color-gray-1)';
  if (colors.length === 1) {
    const colorBg = COLOR_MAP[colors[0] as keyof typeof COLOR_MAP]?.bg;
    return colorBg || 'var(--mantine-color-gray-1)';
  }
  
  const gradientColors = colors.map(color => COLOR_MAP[color as keyof typeof COLOR_MAP]?.bg || '#ccc');
  return `linear-gradient(135deg, ${gradientColors.join(', ')})`;
}; 