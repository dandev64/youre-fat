/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'surface-bright': '#f8f6fa',
        'surface': '#f8f6fa',
        'outline': '#77767a',
        'surface-tint': '#65518a',
        'surface-container-highest': '#dddce2',
        'background': '#f8f6fa',
        'secondary-fixed-dim': '#ffacc6',
        'surface-variant': '#dddce2',
        'on-error': '#ffefef',
        'error-container': '#f74b6d',
        'surface-container-lowest': '#ffffff',
        'secondary-fixed': '#ffc1d3',
        'on-surface-variant': '#5b5b5f',
        'on-primary-container': '#4b386e',
        'inverse-primary': '#d6beff',
        'on-background': '#2e2e32',
        'surface-container-low': '#f2f0f4',
        'secondary': '#923f5f',
        'error': '#b41340',
        'on-secondary-container': '#7a2b4a',
        'surface-container-high': '#e3e2e7',
        'primary-fixed': '#d6beff',
        'on-surface': '#2e2e32',
        'inverse-surface': '#0d0e11',
        'outline-variant': '#adacb0',
        'primary-container': '#d6beff',
        'primary-dim': '#59467d',
        'tertiary': '#1d608a',
        'tertiary-container': '#95cfff',
        'on-primary': '#f8efff',
        'surface-container': '#e9e7ec',
        'primary-fixed-dim': '#c8b1f0',
        'on-secondary-fixed': '#611737',
        'surface-dim': '#d4d4d9',
        'primary': '#65518a',
        'secondary-container': '#ffc1d3',
        'on-tertiary-container': '#00466a',
        'on-secondary': '#ffeff1'
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Be Vietnam Pro', 'sans-serif'],
        label: ['Be Vietnam Pro', 'sans-serif']
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        full: '9999px'
      }
    }
  },
  plugins: []
}
