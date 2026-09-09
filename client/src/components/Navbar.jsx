import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import MagneticWrap from './MagneticWrap.jsx';

const navLinkClass =
  'relative text-ink hover:text-seal transition-colors after:content-[""] after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-seal after:transition-all after:duration-300 hover:after:w-full';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-20">
      <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl font-semibold text-ink tracking-tight">
          Inkwell
        </Link>
        <nav className="flex items-center gap-5 font-mono text-sm">
          {user ? (
            <>
              <Link to="/new" className={navLinkClass}>
                write
              </Link>
              <Link to={`/profile`} className={navLinkClass}>
                {user.username}
              </Link>
              <button onClick={handleLogout} className="text-ink/60 hover:text-seal transition-colors">
                sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={navLinkClass}>
                sign in
              </Link>
              <MagneticWrap strength={0.3}>
                <Link
                  to="/register"
                  className="block border border-ink px-3 py-1.5 rounded-sm hover:bg-ink hover:text-paper transition-colors"
                >
                  join
                </Link>
              </MagneticWrap>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
