import Link from 'next/link';
export default function NotFound() { return <div className="page reading"><div className="eyebrow">Not found</div><h1>This page is not in the Vault.</h1><Link className="btn" href="/">Return to dashboard</Link></div>; }
