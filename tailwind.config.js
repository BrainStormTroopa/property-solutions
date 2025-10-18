/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'rps-charcoal': '#3E4447',
        'rps-dark-charcoal': '#2A2D2F',
        'rps-red': '#C94641',
        'rps-light-red': '#E86E69',
        'rps-cream': '#F5F4F3',
        'rps-light-gray': '#E8EAEB',
        'rps-medium-gray': '#6B7276',
        'rps-white': '#FFFFFF',
      },
    },
  },
  plugins: [],
};
