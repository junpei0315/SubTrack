const { AppColors } = require('./constants/colors.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        accent: AppColors.accent,
        'accent-brand': AppColors.accentBrand,
        background: AppColors.background,
        'background-darker': AppColors.backgroundDarker,
        'background-black': AppColors.backgroundBlack,
        'background-splash': AppColors.backgroundSplash,
        card: AppColors.card,
        'card-alt': AppColors.cardAlt,
        surface: AppColors.surface,
        foreground: AppColors.text,
        subtle: AppColors.subtle,
        muted: AppColors.muted,
        'muted-dark': AppColors.mutedDark,
        border: AppColors.border,
        'border-muted': AppColors.borderMuted,
        error: AppColors.error,
        'error-alt': AppColors.errorAlt,
        success: AppColors.success,
        'sign-out': AppColors.signOut,
        weekend: AppColors.weekend,
      },
    },
  },
  plugins: [],
};
