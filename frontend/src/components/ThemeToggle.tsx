import { useState } from 'react';

const KEY = 'cd_theme';

/** Sun/moon button. The theme is the `dark` class on <html>; the choice is remembered in localStorage. */
export default function ThemeToggle({ onDark = false }: { onDark?: boolean }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem(KEY, next ? 'dark' : 'light'); } catch { /* storage can be blocked */ }
    setDark(next);
  }

  const look = onDark
    ? 'border-white/30 text-white hover:bg-white/10'
    : 'border-fg/20 bg-surface/70 text-fg backdrop-blur hover:bg-fg/10';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className={`grid h-9 w-9 place-items-center rounded-lg border transition ${look}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        )}
      </svg>
    </button>
  );
}