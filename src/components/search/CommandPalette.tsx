'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Row { id: string; kind: string; title: string; text: string; paper: string; href: string; rank: number }
let cached: Row[] | null = null;

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState<Row[]>(cached ?? []), [query, setQuery] = useState(''), [cursor, setCursor] = useState(0);
  const input = useRef<HTMLInputElement>(null), router = useRouter();
  useEffect(() => { fetch('/data/search.json').then((r) => r.json()).then((data: { rows: Row[] }) => { cached = data.rows; setRows(data.rows); }); input.current?.focus(); }, []);
  const hits = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean); if (!terms.length) return [];
    return rows.map((row) => { const hay = `${row.title} ${row.text}`.toLowerCase(); return { row, score: row.rank + terms.reduce((n, term) => n + (hay.startsWith(term) ? 20 : hay.includes(term) ? 5 : -1000), 0) }; }).filter((x) => x.score > -500).sort((a, b) => b.score - a.score).slice(0, 35);
  }, [rows, query]);
  const go = (href: string) => { onClose(); router.push(href); };
  return <div className="palette-overlay" onMouseDown={onClose}><div className="palette" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Search">
    <input ref={input} value={query} onChange={(e) => { setQuery(e.target.value); setCursor(0); }} placeholder="Search topics, demands, arguments, evidence and PYQs…" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(Math.min(cursor + 1, hits.length - 1)); } if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(Math.max(0, cursor - 1)); } if (e.key === 'Enter' && hits[cursor]) go(hits[cursor].row.href); }} />
    <div className="results">{query && !hits.length ? <p className="empty">No matching content.</p> : hits.map(({ row }, index) => <button key={`${row.kind}-${row.id}`} className={`result ${cursor === index ? 'active' : ''}`} onMouseMove={() => setCursor(index)} onClick={() => go(row.href)}><b>{row.title}</b><small>{row.paper} · {row.kind} · {row.text.slice(0, 130)}</small></button>)}</div>
  </div></div>;
}
