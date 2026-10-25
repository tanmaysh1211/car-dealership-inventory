import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-gradient-to-r from-[#06130f] via-[#0a3d2f] to-[#0d5c46] text-white shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-plate text-lg font-extrabold text-ink shadow-md">A</span>
            Autohaus
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <ThemeToggle onDark />
            {user && (
              <>
                <span className="hidden items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 sm:flex">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 font-bold">{user.name.charAt(0).toUpperCase()}</span>
                  {user.name}
                  {user.role === 'ADMIN' && <span className="rounded bg-plate px-2 py-0.5 text-xs font-bold text-ink">Admin</span>}
                </span>
                <button onClick={() => setConfirming(true)} className="cursor-pointer rounded-lg border border-white/30 px-3 py-1.5 font-semibold transition hover:border-white/70 hover:bg-white/20">
                  Log out
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {confirming && (
        <Modal title="Log out?" onClose={() => setConfirming(false)}>
          <p className="mb-5 text-fg/70">Do you really want to log out?</p>
          <div className="flex justify-end gap-2">
            <button
              autoFocus
              onClick={() => setConfirming(false)}
              className="cursor-pointer rounded-md border border-fg/30 px-4 py-2 font-semibold transition hover:border-fg/60 hover:bg-fg/10"
            >
              Cancel
            </button>
            <button onClick={logout} className="cursor-pointer rounded-md bg-brake px-4 py-2 font-bold text-white shadow-md transition hover:bg-[#8f1d17] hover:shadow-lg">
              Log out
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}