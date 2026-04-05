// ─── WebhookFlow Admin — Neon Green Glassmorphic Theme ─────────────────────────

export const colors = {
  // Backgrounds
  bg: 'transparent',
  bgElevated: '#131A16',
  bgCard: 'rgba(19, 26, 22, 0.85)',
  bgCardHover: 'rgba(19, 26, 22, 0.95)',
  bgInput: 'rgba(255, 255, 255, 0.04)',
  bgOverlay: 'rgba(0, 0, 0, 0.6)',

  // Primary / Accent — Neon Green
  primary: '#00E676',
  primarySoft: '#2DF885',
  primaryMuted: 'rgba(0, 230, 118, 0.15)',
  primaryGlow: 'rgba(0, 230, 118, 0.25)',

  // Status Colors
  success: '#00E676',
  successBg: 'rgba(0, 230, 118, 0.12)',
  error: '#FF5252',
  errorBg: 'rgba(255, 82, 82, 0.12)',
  warning: '#FFB300',
  warningBg: 'rgba(255, 179, 0, 0.12)',
  info: '#40C4FF',
  infoBg: 'rgba(64, 196, 255, 0.12)',

  // DLQ / Red Theme
  dlqPrimary: '#FF5252',
  dlqMuted: 'rgba(255, 82, 82, 0.15)',
  dlqGlow: 'rgba(255, 82, 82, 0.25)',


  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#8A9A8E',
  textMuted: '#5A6A5E',
  textInverse: '#0A0F0D',

  // Borders
  border: 'rgba(255, 255, 255, 0.06)',
  borderFocused: 'rgba(0, 230, 118, 0.4)',
  borderCard: 'rgba(255, 255, 255, 0.08)',

  // Tab Bar
  tabBar: '#0D1410',
  tabBarBorder: 'rgba(255, 255, 255, 0.05)',
  tabActive: '#00E676',
  tabInactive: '#5A6A5E',

  // Chart
  chartLine: '#00E676',
  chartLineFailed: '#FF5252',
  chartGrid: 'rgba(255, 255, 255, 0.06)',
  chartDot: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 50,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyBold: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  captionBold: { fontSize: 13, fontWeight: '600' as const },
  small: { fontSize: 11, fontWeight: '400' as const },
  metric: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -1 },
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: {
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
};

const theme = { colors, spacing, borderRadius, typography, shadows };
export default theme;
