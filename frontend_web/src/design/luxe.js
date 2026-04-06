// Freample Design Tokens — source unique
// Fusionne les tokens luxe (pages publiques, immo) et DS (patron, client, artisan)

// Dark mode detection helper
export function isDark() {
  if (typeof document === 'undefined') return false;
  return document.documentElement.getAttribute('data-theme') === 'dark' ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches &&
     document.documentElement.getAttribute('data-theme') !== 'light');
}

const LUXE = {
  // Fonds
  bg: '#FAFAF8',
  bgSoft: '#F8F7F4',
  bgMuted: '#F2F1ED',
  surface: '#F4F3EF',
  white: '#FFFFFF',
  noir: '#0A0A0A',
  cream: '#F5F2EC',

  // Texte
  text: '#1A1A1A',
  textSec: '#333333',
  textLight: '#555555',
  ink: '#0A0A0A',
  ink2: '#2C2C2C',
  muted: '#333333',
  subtle: '#555555',

  // Bordures
  border: '#E8E6E1',
  borderLight: '#F0EDE8',

  // Or — premium
  gold: '#A68B4B',
  goldLight: '#F5EFE0',
  goldDark: '#7A6232',

  // Accent — indigo
  accent: '#4F46E5',
  accentHover: '#4338CA',
  accentLight: '#EEEEFF',
  accentMuted: 'rgba(79,70,229,0.08)',

  // Sémantique
  green: '#16A34A',
  greenBg: '#F0FDF4',
  red: '#DC2626',
  redBg: '#FEF2F2',
  blue: '#2563EB',
  blueBg: '#EFF6FF',
  orange: '#D97706',
  orangeBg: '#FFFBEB',
  amber: '#D97706',
  amberBg: '#FFFBEB',

  // Rayons
  r: { xs:6, sm:10, md:14, lg:18, xl:22, xxl:28, full:100 },

  // Ombres
  shadow: {
    xs: '0 1px 2px rgba(0,0,0,0.04)',
    sm: '0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03)',
    md: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
    lg: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
    xl: '0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
  },

  // Typographie
  font: "'Inter', -apple-system, 'Helvetica Neue', Arial, sans-serif",
  serif: "'Cormorant Garamond', 'Georgia', serif",

  // Layout
  navH: 58,
  bannerH: 40,
};

export default LUXE;
