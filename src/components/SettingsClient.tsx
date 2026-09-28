'use client';

import { useRef, useState } from 'react';
import { useProgress } from '@/lib/progress/provider';
import { migrate } from '@/lib/progress/store';

export function SettingsClient() {
  const { snapshot, store, ready } = useProgress(), file = useRef<HTMLInputElement>(null), [message, setMessage] = useState('');
  const display = (key: string, value: string) => { document.documentElement.dataset[key] = value; const current = JSON.parse(localStorage.getItem('mains.display') ?? '{}') as Record<string, string>; current[key] = value; localStorage.setItem('mains.display', JSON.stringify(current)); };
  const exportState = () => { const blob = new Blob([JSON.stringify({ app: 'mains-study-vault', exportedAt: new Date().toISOString(), snapshot }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `mains-study-vault-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url); };
  const importState = async (selected: File | undefined) => { if (!selected) return; try { const value = JSON.parse(await selected.text()) as { app?: string; snapshot?: unknown }; if (value.app !== 'mains-study-vault' || !value.snapshot) throw new Error('Not a Mains Study Vault backup'); store.replaceAll(migrate(value.snapshot)); setMessage('Backup imported.'); } catch (error) { setMessage((error as Error).message); } };
  return <>{[['Reading font', 'font', [['','Hyperlegible'],['serif','Serif'],['system','System']]], ['Text size', 'size', [['small','Small'],['','Medium'],['large','Large']]], ['Reading width', 'width', [['narrow','Narrow'],['','Normal'],['wide','Wide']]], ['Density', 'density', [['compact','Compact'],['','Comfortable']]]].map(([label, key, options]) => <label className="settings-row" key={String(key)}><span>{String(label)}</span><select onChange={(e) => display(String(key), e.target.value)}>{(options as string[][]).map(([value, name]) => <option value={value} key={name}>{name}</option>)}</select></label>)}
    <section className="section"><h2>Study-state backup</h2><p className="muted">Academic content is not embedded in the backup. Stable canonical IDs reconnect state after import.</p><div className="mode-switch"><button disabled={!ready} className="btn" onClick={exportState}>Export JSON</button><button className="btn" onClick={() => file.current?.click()}>Import JSON</button><input ref={file} hidden type="file" accept="application/json" onChange={(e) => importState(e.target.files?.[0])} /><button className="btn ghost" onClick={() => { if (confirm('Reset all local study, recall, practice and weakness state?')) store.reset(); }}>Reset study state</button></div>{message && <p>{message}</p>}</section>
  </>;
}
