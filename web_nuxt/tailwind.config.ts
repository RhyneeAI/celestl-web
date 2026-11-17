import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{vue,js,ts,jsx,tsx}',
    './pages/**/*.{vue,js,ts,jsx,tsx}',
    './layouts/**/*.{vue,js,ts,jsx,tsx}',
    './components/**/*.{vue,js,ts,jsx,tsx}',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Exo 2"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        brand: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        bg: '#0c0c22',
        text: '#fffafa',
        card: '#1a1d32',
        'card-alt': '#1e203a',
        violet: '#16133e',
        lav: '#3f3c68',
        badge: '#7b5d85',
        dim: '#6f6e80',
        muted: '#9a99a8',
        neutral: '#8886a0',

        pst: '#03a8e6',
        prs: '#acff82',
        ftr: '#f768dd',
        byd: '#e14763',
        etr: '#8975a8',
        ins: '#7474dc',

        ok: '#acff82',
        warn: '#ffd76a',
        bad: '#f768dd',
      },
    },
  },
  plugins: [],
} satisfies Config;
