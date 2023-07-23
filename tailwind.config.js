/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        "bounce-short": "bounces 2s ease-in-out 1",
      },
      keyframes: {
        bounces: {
          "0%": {
            transform: "scale(1)",
          },

          "25%": {
            transform: "scale(1.15)",
          },

          "50%": {
            transform: "scale(0.85)",
          },

          "75%": {
            transform: "scale(1.15)",
          },

          "100%": {
            transform: "scale(1)",
          },
        },
      },
      colors: {
        "state-pending": "#FAC25B",
        "state-successful": "#5FB927",
        "state-failed": "#FF5A46",
      },
    },
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#661AE6",

          secondary: "#D926AA",

          accent: "#1FB2A5",

          neutral: "#191D24",

          "base-100": "#2A303C",

          info: "#3ABFF8",

          success: "#36D399",

          warning: "#FBBD23",

          error: "#F87272",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};
