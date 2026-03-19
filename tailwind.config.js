/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./screens/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: "#ff9066",
                "primary-dim": "#ff743b",
                "on-primary": "#581a00",
                background: "#0e0e0e",
                surface: "#0e0e0e",
                "surface-container-low": "#131313",
                "surface-container-highest": "#262626",
                "surface-variant": "rgba(38, 38, 38, 0.6)",
                "outline-variant": "rgba(72, 72, 72, 0.15)",
                "on-surface-variant": "#ababab",
            },
            fontFamily: {
                jakarta: ["PlusJakartaSans-Regular"],
                "jakarta-bold": ["PlusJakartaSans-Bold"],
                "jakarta-medium": ["PlusJakartaSans-Medium"],
                "jakarta-semibold": ["PlusJakartaSans-SemiBold"],
                manrope: ["Manrope-Regular"],
                "manrope-bold": ["Manrope-Bold"],
                "manrope-medium": ["Manrope-Medium"],
                "manrope-semibold": ["Manrope-SemiBold"],
            },
        },
    },
    plugins: [],
}
