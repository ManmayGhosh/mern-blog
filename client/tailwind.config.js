/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: '#1b1d24',
        paper: '#eee6d3',
        paperDark: '#e2d7b8',
        line: '#cdbf99',
        seal: '#9c3d34',
        sealDark: '#7c2f28',
        gold: '#b3872f'
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['"Public Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace']
      }
    },
  },
  plugins: [],
}
