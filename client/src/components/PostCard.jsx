import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import gsap from 'gsap';
import Reveal from './Reveal.jsx';
import { resolveUploadUrl } from '../api/client.js';

export default function PostCard({ post }) {
  const date = new Date(post.createdAt);
  const cardRef = useRef(null);

  const handleMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(el, {
      rotateX: -py * 3,
      rotateY: px * 3,
      duration: 0.4,
      ease: 'power2.out',
      transformPerspective: 800
    });
  };

  const handleLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' });
  };

  return (
    <Reveal>
      <Link
        ref={cardRef}
        to={`/post/${post.slug}`}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="group flex gap-5 items-start py-7 border-b border-line last:border-b-0 will-change-transform"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="relative">
          <div className="postmark">
            <span className="text-[0.6rem] uppercase tracking-wide">{format(date, 'MMM')}</span>
            <span className="text-lg font-semibold leading-none">{format(date, 'd')}</span>
            <span className="text-[0.55rem]">{format(date, 'yyyy')}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-display text-2xl font-semibold text-ink group-hover:text-seal transition-colors">
            {post.title}
          </h2>
          <p className="font-body text-ink/70 mt-2 line-clamp-2">{post.excerpt}</p>
          <div className="flex items-center gap-3 mt-3 font-mono text-xs text-ink/50">
            <span>by {post.author?.username}</span>
            <span>&middot;</span>
            <span>{post.views} reads</span>
            <span>&middot;</span>
            <span>{post.likes?.length || 0} ♡</span>
            {post.tags?.length > 0 && (
              <>
                <span>&middot;</span>
                <span className="text-gold">#{post.tags[0]}</span>
              </>
            )}
          </div>
        </div>

        {post.coverImage && (
          <img
            src={resolveUploadUrl(post.coverImage)}
            alt=""
            className="w-24 h-24 object-cover rounded-sm border border-line hidden sm:block"
          />
        )}
      </Link>
    </Reveal>
  );
}
