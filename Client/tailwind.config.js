// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        irish: ['"Irish Grover"', "cursive"], // Using Google Fonts example
        // Or if you have a local font:
        // 'irish': ['CustomIrishFont', 'serif'],
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
