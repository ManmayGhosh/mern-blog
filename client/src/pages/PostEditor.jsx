import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client.js';
import EmojiTextarea from '../components/EmojiTextarea.jsx';
import ImageUploader from '../components/ImageUploader.jsx';
import Loader from '../components/Loader.jsx';
import MagneticWrap from '../components/MagneticWrap.jsx';

export default function PostEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [published, setPublished] = useState(true);
  const [coverFile, setCoverFile] = useState(null);
  const [existingCover, setExistingCover] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    api
      .get(`/posts/by-id/${id}`)
      .then(({ data }) => {
        const post = data.post;
        setTitle(post.title);
        setContent(post.content);
        setTags((post.tags || []).join(', '));
        setPublished(post.published);
        setExistingCover(post.coverImage);
      })
      .catch(() => setError('Could not load this post for editing'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('tags', tags);
      formData.append('published', published);
      if (coverFile) formData.append('coverImage', coverFile);

      let res;
      if (isEdit) {
        res = await api.put(`/posts/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      navigate(`/post/${res.data.post.slug}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <h1 className="font-display text-3xl font-semibold mb-6">{isEdit ? 'Edit dispatch' : 'Write a dispatch'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="font-mono text-xs text-seal">{error}</p>}

        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-ink/60 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A field note from..."
            className="w-full bg-paper border border-line rounded-sm px-3 py-2 font-display text-xl focus:border-seal"
          />
        </div>

        <ImageUploader onFileSelect={setCoverFile} existingUrl={existingCover} label="Cover image" />

        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-ink/60 mb-1">
            Content (markdown supported)
          </label>
          <EmojiTextarea
            value={content}
            onChange={setContent}
            rows={14}
            placeholder="Write your dispatch here... use **bold**, *italics*, and 🙂 freely"
          />
        </div>

        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-ink/60 mb-1">
            Tags (comma separated)
          </label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="travel, notebook, field-report"
            className="w-full bg-paper border border-line rounded-sm px-3 py-2 font-mono text-sm focus:border-seal"
          />
        </div>

        <label className="flex items-center gap-2 font-mono text-xs text-ink/70">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          publish immediately
        </label>

        <MagneticWrap strength={0.2}>
          <button
            type="submit"
            disabled={saving}
            className="font-mono text-sm border border-ink px-6 py-2 rounded-sm hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
          >
            {saving ? 'saving...' : isEdit ? 'save changes' : 'publish dispatch'}
          </button>
        </MagneticWrap>
      </form>
    </div>
  );
}
