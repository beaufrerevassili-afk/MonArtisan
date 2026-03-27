/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#EBF5FF',
          100: '#DBEAFE',
          500: '#007AFF',
          600: '#0066CC',
          700: '#0055AA',
        },
        success: {
          50:  '#ECFDF5',
          100: '#D1FAE5',
          500: '#34C759',
          600: '#28A745',
        },
        warning: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          500: '#FF9500',
          600: '#E68900',
        },
        danger: {
          50:  '#FFF1F0',
          100: '#FFE4E1',
          500: '#FF3B30',
          600: '#E0352B',
        },
        neutral: {
          0:   '#FFFFFF',
          50:  '#F5F5F7',
          100: '#F2F2F7',
          200: '#E5E5EA',
          300: '#D1D1D6',
          400: '#AEAEB2',
          500: '#8E8E93',
          600: '#636366',
          700: '#48484A',
          800: '#3A3A3C',
          900: '#1D1D1F',
        },
      },
      boxShadow: {
        'xs':   '0 1px 2px rgba(0,0,0,0.04)',
        'sm':   '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'md':   '0 4px 12px rgba(0,0,0,0.08)',
        'lg':   '0 8px 30px rgba(0,0,0,0.10)',
        'xl':   '0 20px 60px rgba(0,0,0,0.12)',
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.08)',
        'modal': '0 25px 80px rgba(0,0,0,0.20)',
      },
      borderRadius: {
        'sm':  '6px',
        'md':  '10px',
        'lg':  '14px',
        'xl':  '18px',
        '2xl': '24px',
        '3xl': '32px',
      },
      animation: {
        'fade-in':    'fadeIn 0.15s ease-out',
        'slide-up':   'slideUp 0.2s ease-out',
        'scale-in':   'scaleIn 0.15s ease-out',
        'spin-slow':  'spin 1.5s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [],
};
