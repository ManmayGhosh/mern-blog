import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import MagneticWrap from '../components/MagneticWrap.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-5 py-16">
      <h1 className="font-display text-3xl font-semibold mb-6">Join Inkwell</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="font-mono text-xs text-seal">{error}</p>}
        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-ink/60 mb-1">Username</label>
          <input
            required
            minLength={3}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-paper border border-line rounded-sm px-3 py-2 font-body focus:border-seal"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-ink/60 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-paper border border-line rounded-sm px-3 py-2 font-body focus:border-seal"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-ink/60 mb-1">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-paper border border-line rounded-sm px-3 py-2 font-body focus:border-seal"
          />
        </div>
        <MagneticWrap strength={0.2} className="w-full">
          <button
            type="submit"
            disabled={loading}
            className="w-full font-mono text-sm border border-ink py-2 rounded-sm hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
          >
            {loading ? 'creating account...' : 'create account'}
          </button>
        </MagneticWrap>
      </form>
      <p className="font-mono text-xs text-ink/50 mt-4">
        already have an account?{' '}
        <Link to="/login" className="text-seal hover:underline">
          sign in
        </Link>
      </p>
    </div>
  );
}
