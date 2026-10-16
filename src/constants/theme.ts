export const palette = {
  light: {
    background: '#F6F5FB',
    surface: '#FFFFFF',
    surfaceAlt: '#EFEDF7',
    text: '#14121F',
    textSecondary: '#5D5A6E',
    muted: '#8F8BA3',
    border: 'rgba(20, 18, 31, 0.08)',
    primary: '#6D4AFF',
    primarySoft: 'rgba(109, 74, 255, 0.12)',
    onPrimary: '#FFFFFF',
    points: '#B86E00',
    pointsSoft: 'rgba(255, 176, 32, 0.18)',
    success: '#13834A',
    successSoft: 'rgba(19, 131, 74, 0.12)',
    danger: '#C9372C',
    dangerSoft: 'rgba(201, 55, 44, 0.12)',
    tabBar: '#FFFFFF',
  },
  dark: {
    background: '#0E0C17',
    surface: '#1A1726',
    surfaceAlt: '#242036',
    text: '#F3F1FA',
    textSecondary: '#B7B3C9',
    muted: '#857F9E',
    border: 'rgba(255, 255, 255, 0.08)',
    primary: '#8C70FF',
    primarySoft: 'rgba(140, 112, 255, 0.18)',
    onPrimary: '#FFFFFF',
    points: '#FFB020',
    pointsSoft: 'rgba(255, 176, 32, 0.16)',
    success: '#3DD68C',
    successSoft: 'rgba(61, 214, 140, 0.14)',
    danger: '#FF6B5E',
    dangerSoft: 'rgba(255, 107, 94, 0.14)',
    tabBar: '#15121F',
  },
} as const

export type Palette = { [K in keyof typeof palette.light]: string }

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 }
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 }

// Gradient stops for the hero points card
export const cardGradient = ['#6D4AFF', '#9B5CFF', '#E0569B'] as const
