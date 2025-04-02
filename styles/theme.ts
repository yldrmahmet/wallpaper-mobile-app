export const colors = {
  // Ana renkler
  primary: '#3498db',
  secondary: '#2ecc71',
  accent: '#e74c3c',
  
  // Arka plan renkleri
  background: {
    primary: '#121212',
    secondary: '#1e1e1e',
    tertiary: '#2d2d2d'
  },
  
  // Metin renkleri
  text: {
    primary: '#FFFFFF',
    secondary: '#BBBBBB',
    muted: '#777777'
  },
  
  // Durum renkleri
  status: {
    success: '#2ecc71',
    info: '#3498db',
    warning: '#f39c12',
    error: '#e74c3c'
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeights: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
  }
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999
};

export default {
  colors,
  spacing,
  typography,
  borderRadius
};