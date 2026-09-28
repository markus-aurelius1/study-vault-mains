import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AppShell } from '@/components/shell/AppShell';
import { ProgressProvider } from '@/lib/progress/provider';

export const metadata: Metadata = { title: 'Mains Study Vault', description: 'Answer generation, active recall, revision and PYQ practice for UPSC Mains.' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body>
    <Script id="theme" strategy="beforeInteractive">{`try{const t=localStorage.getItem('mains.theme');if(t)document.documentElement.dataset.theme=t;const s=JSON.parse(localStorage.getItem('mains.display')||'{}');for(const k of ['size','width','density','font'])if(s[k])document.documentElement.dataset[k]=s[k]}catch{}`}</Script>
    <ProgressProvider><AppShell>{children}</AppShell></ProgressProvider>
  </body></html>;
}
