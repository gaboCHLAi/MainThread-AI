/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontSize: {
        "responsive-base": [
          "clamp(1rem, 1.2vw, 1.25rem)",
          { lineHeight: "1.5" },
        ],
        "responsive-title": [
          "clamp(1.25rem, 5vw, 3rem)",
          { lineHeight: "1.2" },
        ],
        "responsive-p": ["clamp(0.75rem, 4vw, 2.5rem)", { lineHeight: "1.3" }],
      },
    },
  },
  plugins: [],
};
