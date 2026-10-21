/** @type {import('tailwindcss').Config} */
const F = ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "sans-serif"];

module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#0d631b",
        "on-primary": "#ffffff",
        "primary-container": "#2e7d32",
        "on-primary-container": "#cbffc2",
        "primary-fixed": "#a3f69c",
        "primary-fixed-dim": "#88d982",
        "on-primary-fixed": "#002204",
        "on-primary-fixed-variant": "#005312",
        "secondary": "#835400",
        "on-secondary": "#ffffff",
        "secondary-container": "#fcab28",
        "on-secondary-container": "#694300",
        "secondary-fixed": "#ffddb5",
        "secondary-fixed-dim": "#ffb957",
        "on-secondary-fixed": "#2a1800",
        "on-secondary-fixed-variant": "#643f00",
        "tertiary": "#00632a",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#007f38",
        "on-tertiary-container": "#c8ffcb",
        "tertiary-fixed": "#66ff8e",
        "tertiary-fixed-dim": "#3de273",
        "on-tertiary-fixed": "#002109",
        "on-tertiary-fixed-variant": "#005322",
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        "background": "#eaffe8",
        "on-background": "#0d1f11",
        "surface": "#eaffe8",
        "surface-bright": "#eaffe8",
        "surface-dim": "#c9e0c8",
        "surface-tint": "#1b6d24",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#e2fae1",
        "surface-container": "#ddf4db",
        "surface-container-high": "#d7eed6",
        "surface-container-highest": "#d1e9d0",
        "surface-variant": "#d1e9d0",
        "on-surface": "#0d1f11",
        "on-surface-variant": "#40493d",
        "outline": "#707a6c",
        "outline-variant": "#bfcaba",
        "inverse-surface": "#223524",
        "inverse-on-surface": "#e0f7de",
        "inverse-primary": "#88d982"
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px"
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "0.75rem",
        "space-lg": "1rem",
        "space-xl": "1.5rem",
        "margin-sm": "0.75rem",
        "margin": "1rem",
        "margin-lg": "1.5rem",
        "gutter-sm": "0.75rem",
        "gutter": "1rem"
      },
      fontFamily: Object.fromEntries(
        [
          "headline-xl", "headline-lg", "headline-lg-mobile", "headline-md", "headline-sm",
          "body-xl", "body-lg", "body-md", "body-sm", "label-lg", "label-md", "label-sm"
        ].map(k => [k, F])
      ),
      fontSize: {
        "headline-xl": ["32px", { lineHeight: "40px", fontWeight: "800" }],
        "headline-lg": ["26px", { lineHeight: "34px", fontWeight: "700" }],
        "headline-lg-mobile": ["22px", { lineHeight: "28px", fontWeight: "700" }],
        "headline-md": ["20px", { lineHeight: "26px", fontWeight: "700" }],
        "headline-sm": ["18px", { lineHeight: "24px", fontWeight: "700" }],
        "body-xl": ["18px", { lineHeight: "26px", fontWeight: "500" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "500" }],
        "body-md": ["15px", { lineHeight: "22px", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "18px", fontWeight: "500" }],
        "label-lg": ["16px", { lineHeight: "20px", fontWeight: "700" }],
        "label-md": ["14px", { lineHeight: "18px", fontWeight: "600" }],
        "label-sm": ["12px", { lineHeight: "16px", fontWeight: "700" }]
      }
    }
  },
  plugins: []
};
