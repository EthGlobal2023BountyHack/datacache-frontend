module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  enabled: true,
  mode: 'jit',
  theme: {
    extend: {
      screens: { '2xl': '1440px' },
      boxShadow: {
        button: '0px 7px 15px rgba(0, 0, 0, 0.3)',
        elevation: '0 70px 100px -50px rgba(0, 0, 0, 1)',
        productCard: '0px 68px 64px -24px rgba(44, 37, 29, 0.12)',
      },
      colors: {
        transparent: 'transparent',
        invisible: 'rgba(1,1,1,0)',
        current: 'currentColor',
        offwhite: '#D9D9D9',
        primary: {
          DEFAULT: '#1859FF',
          light: '#ffffff',
          dark: '#0E0E15',
          blue: {
            DEFAULT: '#1859FF',
            light: '#4978EE',
            dark: '#022581',
          },
        },
        accent: {
          DEFAULT: '#1E1C26',
        },
        secondary: {
          DEFAULT: '#D9D9D9',
          lightGrey: {
            DEFAULT: 'rgba(255, 255, 255, 0.2)',
            dark: 'rgba(255, 255, 255, 0.1)',
          },
        },
        lime: {
          DEFAULT: '#4FFFB5',
        },
        'hot-pink': {
          DEFAULT: '#F3228B',
        },
      },
      fontFamily: {
        header: ['Space Grotesk', 'sans-serif'],
        paragraph: ['Space Grotesk', 'sans-serif'],
      },
      fontSize: {
        xxs: '0.7rem',
        '3xl': ['2rem', '38.4px'],
        '4xl': ['40px', '48px'],
        '5xl': ['48px', '48px'],
        '6xl': ['64px', '64px'],
        '7xl': ['96px', '96px'],
        '8xl': ['128px', '128px'],
        '9xl': ['186px', '186px'],
        '10xl': ['256px', '256px'],
      },
      keyframes: {
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        'fade-out': {
          '0%': {
            opacity: '1',
          },
          '100%': {
            opacity: '0',
          },
        },
      },
      animation: {
        'fade-in-down': 'fade-in-down 1s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
      },
      spacing: {
        xsmall: '.5rem',
        small: '1rem',
        medium: '2rem',
        large: '4rem',
      },
    },
  },

  variants: {
    extend: {},
  },

  plugins: [],
};
