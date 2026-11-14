import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          action: 'var(--brand-action)',
          hover: 'var(--brand-hover)',
          active: 'var(--brand-active)',
          soft: 'var(--brand-soft)',
        },
        neutral: {
          surface: 'var(--surface-neutral-weaker)',
          subtle: 'var(--surface-neutral-weak)',
          border: 'var(--border-neutral-weaker)',
          outline: 'var(--border-neutral-weak)',
          strong: 'var(--content-neutral-stronger)',
          default: 'var(--content-neutral-default)',
          muted: 'var(--content-neutral-weak)',
        },
      },
      fontFamily: {
        sans: ['Vazirmatn', 'IRANSans', 'Tahoma', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
