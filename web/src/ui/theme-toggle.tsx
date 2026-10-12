'use client';

import { useState } from 'react';
import { Segmented } from './segmented';
import { THEME_COOKIE, THEME_MAX_AGE_SECONDS, THEMES, themeClass, type Theme } from './theme';

const OPTIONS = [
  { value: 'light', label: 'Claro', icon: 'sun' },
  { value: 'dark', label: 'Escuro', icon: 'moon' },
  { value: 'system', label: 'Sistema', icon: 'desktop' },
] as const satisfies readonly { value: Theme; label: string; icon: string }[];

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove(...THEMES);
  const cls = themeClass(theme);
  if (cls) root.classList.add(cls);
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${THEME_MAX_AGE_SECONDS}; samesite=lax`;
}

/** Claro / Escuro / Sistema; aplica na hora e guarda num cookie lido pelo servidor. */
export function ThemeToggle({ initial }: { readonly initial: Theme }) {
  const [theme, setTheme] = useState<Theme>(initial);
  return (
    <Segmented
      size="sm"
      options={OPTIONS}
      value={theme}
      onChange={(next) => {
        setTheme(next);
        applyTheme(next);
      }}
    />
  );
}
