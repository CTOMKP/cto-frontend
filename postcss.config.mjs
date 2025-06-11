const config = {
  plugins: ["@tailwindcss/postcss"],
  theme: {
    extend: {
      backgroundImage: {
        'cta-gradient': 'linear-gradient(to right, #FF0075, #FF4A15, #FFCB45)',
      },
    },
  }
};

export default config;
