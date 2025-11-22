/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        sixt: {
          // Signature SIXT colors
          orange: '#FF5000',         // SIXT Orange - primary signature color
          gold: '#FFD700',           // SIXT Gold - secondary brand color
          darkGold: '#DAA520',       // Dark Gold
          black: '#000000',          // Pure Black
          white: '#FFFFFF',          // Pure White
          darkGrey: '#333333',       // Dark Grey
          lightGrey: '#F5F5F5',      // Light Grey
          silver: '#C0C0C0',         // Silver
          
          // Primary brand palette
          primary: '#FF5000',        // Orange (new primary)
          secondary: '#000000',      // Black
          accent: '#1E90FF',         // Dodger Blue (accent)
          
          // Extended palette for UI
          navy: '#001F3F',           // Navy Blue
          darkBlue: '#003D7A',       // Dark Blue
          brightBlue: '#0066CC',     // Bright Blue
          
          // Neutrals
          charcoal: '#2F2F2F',
          concrete: '#F0F0F0',
          
          // Status colors
          success: '#28A745',
          warning: '#FFC107',
          danger: '#DC3545',
          info: '#17A2B8',
        },
      },
      fontFamily: {
        sixt: ['Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

