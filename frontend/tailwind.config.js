/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Emerald Editorial — Primary
        primary: 'var(--primary)',
        'primary-container': 'var(--primary-container)',
        'on-primary': 'var(--on-primary)',
        'on-primary-container': 'var(--on-primary-container)',
        'inverse-primary': 'var(--inverse-primary)',
        'primary-fixed': '#b0f0d6',
        'primary-fixed-dim': '#95d3ba',

        // Surface
        surface: 'var(--surface)',
        'surface-dim': 'var(--surface-variant)',
        'surface-bright': 'var(--surface)',
        'surface-container-lowest': 'var(--surface-container-lowest)',
        'surface-container-low': 'var(--surface-container-low)',
        'surface-container': 'var(--surface-container)',
        'surface-container-high': 'var(--surface-container-high)',
        'surface-container-highest': 'var(--surface-variant)',
        'surface-variant': 'var(--surface-variant)',

        // On Surface
        'on-surface': 'var(--on-surface)',
        'on-surface-variant': 'var(--on-surface-variant)',
        'inverse-surface': 'var(--inverse-surface)',
        'inverse-on-surface': 'var(--inverse-on-surface)',

        // Secondary
        secondary: 'var(--secondary)',
        'on-secondary': 'var(--on-surface)',
        'secondary-container': 'var(--secondary-container)',
        'on-secondary-container': 'var(--on-surface)',

        // Tertiary (Charcoal)
        tertiary: 'var(--premium-charcoal)',
        'on-tertiary': 'var(--on-primary)',
        'tertiary-container': 'var(--premium-charcoal)',
        'on-tertiary-container': 'var(--on-surface)',

        // Outline
        outline: 'var(--outline)',
        'outline-variant': 'var(--outline-variant)',

        // Error
        error: 'var(--error)',
        'on-error': '#ffffff',
        'error-container': 'var(--error-container)',
        'on-error-container': '#ffffff',

        // Background
        background: 'var(--surface)',
        'on-background': 'var(--on-surface)',

        // Custom Premium Colors
        'premium-charcoal': 'var(--premium-charcoal)',
        'premium-gold': 'var(--premium-gold)',
        'premium-border': 'var(--premium-border)',
        'premium-green': '#064e3b',
      },
      fontFamily: {
        headline: ['Newsreader', 'Georgia', 'serif'],
        body: ['Hanken Grotesk', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'headline-xl': ['40px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-lg': ['32px', { lineHeight: '1.25', fontWeight: '600' }],
        'headline-lg-mobile': ['28px', { lineHeight: '1.2', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '1.3', fontWeight: '500' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.4', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '700' }],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
        'sidebar-width': '260px',
        gutter: '20px',
      },
      boxShadow: {
        premium: '0px 4px 20px rgba(0, 0, 0, 0.04)',
        'premium-md': '0px 8px 32px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
