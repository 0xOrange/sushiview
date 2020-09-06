module.exports = {
  purge: ['./pages/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'orange-500': '#fa7814',
      },
    },
  },
  variants: {
    padding: ['first'],
    margin: ['first'],
    borderColor: ['hover'],
  },
  plugins: [],
  future: {
    removeDeprecatedGapUtilities: true,
  },
}
