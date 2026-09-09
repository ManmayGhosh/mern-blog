import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import api from '../api/client.js';
import PostCard from '../components/PostCard.jsx';
import Loader from '../components/Loader.jsx';
import Reveal from '../components/Reveal.jsx';
import MagneticWrap from '../components/MagneticWrap.jsx';
import { SCENE_META, randomSceneKey } from '../animations/meta.js';
import { useAuth } from '../context/AuthContext.jsx';

const AnimatedScene = lazy(() => import('../components/AnimatedScene.jsx'));
const TITLE = 'Dispatches';

export default function Home() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(1);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [sceneKey, setSceneKey] = useState(() => randomSceneKey());
  const [sceneReason, setSceneReason] = useState('random pick');
  const titleRef = useRef(null);

  const page = Number(searchParams.get('page') || 1);
  const search = searchParams.get('search') || '';

  useEffect(() => {
    if (!titleRef.current) return;
    const letters = titleRef.current.querySelectorAll('.title-letter');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(letters, { opacity: 1, y: 0 });
      return;
    }
    gsap.fromTo(
      letters,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.03, delay: 0.15 }
    );
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get('/posts', { params: { page, search: search || undefined } })
      .then(({ data }) => {
        setPosts(Array.isArray(data.posts) ? data.posts : []);
        setPages(Number(data.pages) || 1);
      })
      .catch(() => {
        setPosts([]);
        setPages(1);
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  // On load, ask the backend for a content-based scene suggestion (falls back to random)
  useEffect(() => {
    api
      .get('/scene/suggest', { params: user ? { author: user.id } : {} })
      .then(({ data }) => {
        if (data.scene) {
          setSceneKey(data.scene);
          setSceneReason(data.reason);
        } else {
          setSceneReason(data.reason || 'random pick');
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const shuffleScene = () => {
    const next = randomSceneKey(sceneKey);
    setSceneKey(next);
    setSceneReason('shuffled manually');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(searchInput ? { search: searchInput } : {});
  };

  return (
    <div>
      <div className="relative h-72 border-b border-line overflow-hidden">
        <Suspense fallback={<div className="absolute inset-0 bg-paperDark/40 animate-pulse" />}>
          <AnimatedScene sceneKey={sceneKey} className="absolute inset-0" />
        </Suspense>
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/40 to-transparent pointer-events-none" />
        <button
          onClick={shuffleScene}
          className="absolute bottom-3 right-3 font-mono text-[0.65rem] uppercase tracking-wide bg-paper/80 border border-line px-2.5 py-1 rounded-sm hover:border-seal hover:text-seal transition-colors"
          title={sceneReason}
        >
          {SCENE_META[sceneKey]?.label || 'shuffle'} · shuffle
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-10">
        <div className="mb-10">
          <h1 ref={titleRef} className="font-display text-4xl font-semibold text-ink flex flex-wrap">
            {TITLE.split('').map((char, i) => (
              <span key={i} className="title-letter inline-block">
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>
          <Reveal delay={0.3}>
            <p className="font-body text-ink/60 mt-2">Notes, essays, and dispatches from the field.</p>

            <form onSubmit={handleSearch} className="mt-6 flex gap-2">
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="search posts..."
                className="flex-1 bg-paper border border-line rounded-sm px-3 py-2 font-body text-sm focus:border-seal"
              />
              <MagneticWrap strength={0.3}>
                <button
                  type="submit"
                  className="font-mono text-xs border border-ink px-4 py-2 rounded-sm hover:bg-ink hover:text-paper transition-colors"
                >
                  search
                </button>
              </MagneticWrap>
            </form>
          </Reveal>
        </div>

        {loading ? (
          <Loader />
        ) : posts.length === 0 ? (
          <p className="font-mono text-sm text-ink/50">
            {search ? `no dispatches found for "${search}"` : 'no dispatches yet — be the first to write one'}
          </p>
        ) : (
          <div>{posts.map((post) => <PostCard key={post._id} post={post} />)}</div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10 font-mono text-sm">
            <button
              disabled={page <= 1}
              onClick={() => setSearchParams({ ...(search && { search }), page: page - 1 })}
              className="disabled:opacity-30 hover:text-seal"
            >
              ← prev
            </button>
            <span className="text-ink/50">
              {page} / {pages}
            </span>
            <button
              disabled={page >= pages}
              onClick={() => setSearchParams({ ...(search && { search }), page: page + 1 })}
              className="disabled:opacity-30 hover:text-seal"
            >
              next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
