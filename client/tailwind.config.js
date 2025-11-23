/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#7C3AED",
          soft: "#A855F7",
        },
      },
      boxShadow: {
        "glow-purple": "0 0 40px rgba(124, 58, 237, 0.5)",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["dark"],
  },
};
