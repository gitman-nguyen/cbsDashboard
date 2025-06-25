/** @type {import('tailwindcss').Config} */
export default {
  content: [
	"./index.html",
	"./src/**/*.{js,jsx}"
	],
  theme: {
    extend: {
      colors: {
      nnavBg: "#2D544C",
      navActive: "#3A6B63",
      navText: "#FFD700",
    },
    borderRadius: {
      DEFAULT: "0.5rem", // rounded-lg
    },
    fontWeight: {
      semibold: 600,
    },
  },
  },
  plugins: [
    require('@tailwindcss/forms')

  ],
}

