export const THEMES = ['light', 'dark', 'system'] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_COOKIE = 'financas_theme';
export const THEME_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const isTheme = (value: string | undefined): value is Theme =>
  THEMES.some((theme) => theme === value);

/** Valor do cookie → tema; qualquer outra coisa segue o sistema. */
export const parseTheme = (value: string | undefined): Theme => (isTheme(value) ? value : 'system');

/** Classe do `<html>`: só os temas forçados têm classe; `system` usa `prefers-color-scheme`. */
export const themeClass = (theme: Theme): string | undefined =>
  theme === 'system' ? undefined : theme;
