/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4362FF',
        secondary: '#7530FF',
        accent: '#039855',
        background: '#FFFFFF',
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'lato': ['Lato', 'sans-serif'],
      },
      fontSize: {
        'h1': ['48px', { lineHeight: '1.2', margin: '4px' }],
        'h6': ['28px', { lineHeight: '1.3', margin: '4px' }],
        'body': ['16px', { lineHeight: '1.5', margin: '4px' }],
        'caption': ['14px', { lineHeight: '1.4', margin: '4px' }],
      },
      spacing: {
        '2': '8px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
      },
      borderRadius: {
        'button': '40px',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4362FF 0%, #7530FF 100%)',
      },
    },
  },
  plugins: [],
}
