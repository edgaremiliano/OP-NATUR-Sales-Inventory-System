/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                chocolate: {
                    900: '#1e120b',
                    800: '#2c1b11',
                    700: '#3b2417', // Color principal
                    600: '#5c3924',
                    500: '#805033',
                },
                gold: {
                    400: '#d4af37',
                    300: '#e5c158',
                    200: '#f3d986',
                },
                beige: {
                    100: '#f5f5dc',
                    50: '#fafcf5',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}