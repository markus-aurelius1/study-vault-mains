'use client';

import { useProgress } from '@/lib/progress/provider';
import { weaknessStatuses } from '@/lib/revision/weakness';

export function WeaknessClient() {
  const { snapshot, store, ready } = useProgress();
  if (!ready) return <p className="muted">Loading weakness events…</p>;
  const statuses = weaknessStatuses(snapshot.weaknessEvents).filter((item) => item.recurring || !item.resolved);
  const demonstrate = (status: typeof statuses[number]) => { const now = Date.now(); store.addWeakness({ id: `demo-${now}-${Math.random().toString(36).slice(2, 7)}`, weaknessId: status.weaknessId, kind: 'demonstrated', sourceType: 'manual', sourceId: `manual-${now}`, targetType: status.targetType, targetId: status.targetId, severity: 1, observedAt: now }); };
  return statuses.length ? <div className="grid">{statuses.map((status) => <article className="card" key={status.key}><div className="eyebrow">{status.resolved ? 'Resolved' : status.recurring ? 'Recurring' : 'Observed'}</div><h2>{status.weaknessId}</h2><p>{status.targetId}</p><p className="card-meta">{status.observations} observation(s) · {status.demonstrations}/2 later demonstrations</p>{!status.resolved && <button className="btn" onClick={() => demonstrate(status)}>Record successful demonstration</button>}</article>)}</div> : <p className="empty">No weakness events yet. Practice rubrics can suggest one for your confirmation.</p>;
}
