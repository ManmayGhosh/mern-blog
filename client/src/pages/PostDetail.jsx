import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import gsap from 'gsap';
import api, { resolveUploadUrl } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';
import CommentSection from '../components/CommentSection.jsx';
import MagneticWrap from '../components/MagneticWrap.jsx';

export default function PostDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const likeBtnRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/posts/${slug}`)
      .then(({ data }) => {
        setPost(data.post);
        setLikeCount(data.post.likes?.length || 0);
        setLiked(user ? data.post.likes?.includes(user.id) : false);
      })
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug, user]);

  const toggleLike = async () => {
    if (!user) return navigate('/login');
    const { data } = await api.post(`/posts/${post._id}/like`);
    setLiked(data.liked);
    setLikeCount(data.likes);
    if (likeBtnRef.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(likeBtnRef.current, { scale: 0.85 }, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this dispatch? This cannot be undone.')) return;
    await api.delete(`/posts/${post._id}`);
    navigate('/');
  };

  if (loading) return <Loader />;
  if (!post)
    return (
      <div className="max-w-2xl mx-auto px-5 py-20 text-center">
        <p className="font-display text-2xl">Dispatch not found</p>
        <Link to="/" className="font-mono text-sm text-seal hover:underline mt-2 inline-block">
          ← back home
        </Link>
      </div>
    );

  const date = new Date(post.createdAt);
  const isAuthor = user?.id === post.author?._id;

  return (
    <article className="max-w-2xl mx-auto px-5 py-10">
      <div className="flex items-start gap-5 mb-6">
        <div className="relative">
          <div className="postmark">
            <span className="text-[0.6rem] uppercase tracking-wide">{format(date, 'MMM')}</span>
            <span className="text-lg font-semibold leading-none">{format(date, 'd')}</span>
            <span className="text-[0.55rem]">{format(date, 'yyyy')}</span>
          </div>
        </div>
        <div className="flex-1">
          <h1 className="font-display text-4xl font-semibold text-ink leading-tight">{post.title}</h1>
          <div className="flex items-center gap-2 mt-3 font-mono text-xs text-ink/60">
            <span>by {post.author?.username}</span>
            <span>&middot;</span>
            <span>{post.views} reads</span>
            {isAuthor && (
              <>
                <span>&middot;</span>
                <Link to={`/edit/${post._id}`} className="text-seal hover:underline">
                  edit
                </Link>
                <span>&middot;</span>
                <button onClick={handleDelete} className="text-seal hover:underline">
                  delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {post.coverImage && (
        <img src={resolveUploadUrl(post.coverImage)} alt={post.title} className="w-full rounded-sm border border-line mb-8" />
      )}

      <div className="prose-marginalia font-body text-[1.05rem]">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      <div className="flex items-center gap-4 mt-8 pt-6 border-t border-line">
        <MagneticWrap strength={0.2}>
          <button
            ref={likeBtnRef}
            onClick={toggleLike}
            className={`font-mono text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-sm border transition-colors ${
              liked ? 'border-seal text-seal bg-seal/10' : 'border-line text-ink/60 hover:border-seal hover:text-seal'
            }`}
          >
            {liked ? '♥' : '♡'} {likeCount}
          </button>
        </MagneticWrap>
        {post.tags?.map((tag) => (
          <span key={tag} className="font-mono text-xs text-gold">
            #{tag}
          </span>
        ))}
      </div>

      <CommentSection postId={post._id} />
    </article>
  );
}
