'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { CommandPalette } from '../search/CommandPalette';

export function AppShell({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState(false);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement as HTMLElement | null)?.tagName ?? '');
      if ((event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey)) || (event.key === '/' && !typing)) { event.preventDefault(); setSearch(true); }
    };
    addEventListener('keydown', onKey); return () => removeEventListener('keydown', onKey);
  }, []);
  const toggleTheme = () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('mains.theme', next);
  };
  return <>
    <header className="app-header"><div className="header-in">
      <Link className="brand" href="/"><span className="brand-mark">M</span><span>Mains Study Vault</span></Link>
      <nav className="nav-links" aria-label="Primary">
        <Link href="/syllabus">Syllabus</Link><Link href="/revision">Revision</Link><Link href="/weaknesses">Weaknesses</Link>
        <button className="search-btn" onClick={() => setSearch(true)} aria-label="Search"><span>Search</span> <kbd>Ctrl K</kbd></button>
        <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">◐</button><Link href="/settings" aria-label="Settings">Settings</Link>
      </nav>
    </div></header>
    <main>{children}</main>
    {search && <CommandPalette onClose={() => setSearch(false)} />}
  </>;
}
