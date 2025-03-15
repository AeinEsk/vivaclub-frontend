/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                'text-primary': '#111827',
                'text-secondary': '#6B7280',
                'bg-primary': 'white',
                'bg-secondary': '#7C3AED',
                'page-body': '#F5F3FF',
                'border': '#E5E7EB',
                'violet': {
                  50: '#F5F3FF',
                  600: '#7C3AED',
                  700: '#6D28D9',
                },
                'indigo': {
                  50: '#EEF2FF',
                  600: '#4F46E5',
                  700: '#4338CA',
                },
              }
        }
    },
    plugins: [require('@tailwindcss/typography'), require('daisyui')],

    daisyui: {
        themes: [
            {
                light: {
                    ...require('daisyui/src/theming/themes')['light'],
                    primary: '#7C3AED',
                    primaryContent: 'white',
                    neutral: '#01070f',
                    secondary: '#6B7280',
                    success: "oklch(0.75 0.1 141.8)",
                    error: "oklch(0.75 0.13 18.53)",
                    warning: "oklch(0.85 0.13 89.83)"
                }
            },
            'dark'
        ],
        darkTheme: 'light', // name of one of the included themes for dark mode
        base: true, // applies background color and foreground color for root element by default
        utils: true, // adds responsive and modifier utility classes
        logs: true // Shows info about daisyUI version and used config in the console when building your CSS
    }
};
