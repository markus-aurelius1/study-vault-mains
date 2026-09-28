'use client';

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { EMPTY, localStorageAdapter, progressStore } from './store';

const Context = createContext(progressStore);

export function ProgressProvider({ children }: { children: ReactNode }) {
  useEffect(() => { progressStore.hydrate(localStorageAdapter); }, []);
  return <Context.Provider value={progressStore}>{children}</Context.Provider>;
}

export function useProgress() {
  const store = useContext(Context);
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, () => EMPTY);
  const ready = useSyncExternalStore(store.subscribe, store.isHydrated, () => false);
  return { store, snapshot, ready };
}
