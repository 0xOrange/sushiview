module.exports = {
  purge: ["./src/**/*.html", "./src/**/*.tsx", "./src/**/*.jsx"],
  theme: {
    extend: {},
  },
  variants: {
    padding: ["first"],
    borderColor: ["hover"],
  },
  plugins: [],
  future: {
    removeDeprecatedGapUtilities: true,
  },
};
