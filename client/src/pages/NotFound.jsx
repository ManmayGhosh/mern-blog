import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-24 text-center">
      <p className="font-display text-5xl font-semibold text-ink">404</p>
      <p className="font-body text-ink/60 mt-3">This page slipped out of the notebook.</p>
      <Link to="/" className="font-mono text-sm text-seal hover:underline mt-4 inline-block">
        ← back home
      </Link>
    </div>
  );
}
