// ─── Design System — tokens partagés ─────────────────────────────────────────
// Inspiré de Planity (rigueur, whitespace) + touche premium (or, noir)

export const DS = {
  // Fonds
  bg:         '#FFFFFF',
  bgSoft:     '#F8F7F4',
  bgMuted:    '#F2F1ED',
  surface:    '#F4F3EF',

  // Texte
  ink:        '#0A0A0A',
  ink2:       '#2C2C2C',
  muted:      '#6B6B6B',
  subtle:     '#A0A0A0',

  // Bordures
  border:     '#E8E6E1',
  borderLight:'#F0EFEB',

  // Accent principal — indigo premium (entre Planity violet et luxe)
  accent:     '#4F46E5',
  accentHover:'#4338CA',
  accentLight:'#EEEEFF',
  accentMuted:'rgba(79,70,229,0.08)',

  // Or — touche LVMH/premium
  gold:       '#C9A96E',
  goldLight:  '#F9F4E8',
  goldDark:   '#A07840',

  // Sémantique
  green:      '#16A34A',
  greenBg:    '#F0FDF4',
  red:        '#DC2626',
  redBg:      '#FEF2F2',
  amber:      '#D97706',
  amberBg:    '#FFFBEB',

  // Rayons — Airbnb-style generous rounding
  r:  { xs:6, sm:10, md:14, lg:18, xl:22, xxl:28, full:100 },

  // Ombres — Airbnb-clean (neutral, no blue tint)
  shadow: {
    xs:  '0 1px 2px rgba(0,0,0,0.04)',
    sm:  '0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03)',
    md:  '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
    lg:  '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
    xl:  '0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
  },

  // Typographie
  font: "-apple-system,'SF Pro Display','Inter','Helvetica Neue',Arial,sans-serif",

  // Nav height
  navH:    58,
  bannerH: 40,
};

export default DS;
