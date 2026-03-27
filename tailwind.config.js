/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── CSS-var semantic tokens (shadcn-style) ── */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        /* ── Named brand tokens for authoring convenience ── */
        navy: {
          50:  '#f4f6f8',
          100: '#e5eaef',
          200: '#ccd5e2',
          300: '#a7b9cc',
          400: '#7a96b1',
          500: '#567798',
          600: '#3b5b82',   /* navy light */
          700: '#2f4668',   /* ★ primary navy: DEFAULT */
          800: '#253853',
          900: '#1e293b',   /* navy dark */
          950: '#0f172a',   /* deep dark bg */
          light: '#3b5b82',
          DEFAULT: '#2f4668',
          dark: '#1e293b',
        },
        teal: {
          50:  '#e6f7f5',   /* teal soft */
          100: '#c2ebe4',
          200: '#90dad0',
          300: '#58c5b8',
          400: '#3abfab',
          500: '#2cb1a1',   /* ★ primary teal: DEFAULT */
          600: '#239b8c',   /* teal hover */
          700: '#1c7d71',
          800: '#17665d',
          900: '#14534c',
          950: '#092b27',
          soft: '#e6f7f5',
          hover: '#239b8c',
          DEFAULT: '#2cb1a1',
        },
      },

      fontFamily: {
        sans:   ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'Inter', 'system-ui', 'sans-serif'],
      },

      /* 8-px grid extensions beyond Tailwind defaults */
      spacing: {
        '18': '4.5rem',    /* 72px */
        '22': '5.5rem',    /* 88px */
        '30': '7.5rem',    /* 120px */
        '60': '15rem',     /* 240px – sidebar expanded */
        '18px': '18px',
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      boxShadow: {
        'premium':       '0 10px 30px -10px rgba(0,0,0,.08), 0 4px 12px -8px rgba(0,0,0,.04)',
        'premium-hover': '0 20px 40px -15px rgba(0,0,0,.12)',
        'glow-teal':     '0 0 24px -4px rgba(44,177,161,.35)',
        'glow-navy':     '0 0 24px -4px rgba(30,41,59,.40)',
        'card-hover':    '0 24px 48px -12px rgba(0,0,0,.12)',
        'luxury':        '0 10px 30px -5px rgba(0,0,0,.08), 0 5px 15px -10px rgba(0,0,0,.04)',
      },

      backgroundImage: {
        'auth-gradient':   'linear-gradient(135deg, #1e293b 0%, #2f4668 50%, #0f172a 100%)',
        'teal-gradient':   'linear-gradient(135deg, #2cb1a1 0%, #239b8c 100%)',
        'hero-mesh':       'radial-gradient(ellipse at 20% 40%, rgba(44,177,161,.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 60%, rgba(30,41,59,.3) 0%, transparent 60%)',
      },

      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 12px -4px rgba(6,182,212,.4)' },
          '50%':      { boxShadow: '0 0 28px -4px rgba(6,182,212,.7)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },

      animation: {
        'fade-in-up':    'fadeInUp 0.5s ease-out forwards',
        'fade-in-left':  'fadeInLeft 0.5s ease-out forwards',
        'slide-in-right':'slideInRight 0.4s ease-out forwards',
        'glow-pulse':    'glowPulse 2s ease-in-out infinite',
        'float':         'float 4s ease-in-out infinite',
        'scale-in':      'scaleIn 0.35s ease-out forwards',
        'spin-slow':     'spin 3s linear infinite',
      },

      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
