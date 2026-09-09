import { useState, useEffect } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import ImageUploader from '../components/ImageUploader.jsx';
import PostCard from '../components/PostCard.jsx';
import Loader from '../components/Loader.jsx';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    if (!user) return;
    api
      .get('/posts', { params: { author: user.id, limit: 50 } })
      .then(({ data }) => {
        setPosts(Array.isArray(data.posts) ? data.posts : []);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoadingPosts(false));
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const formData = new FormData();
      formData.append('bio', bio);
      if (avatarFile) formData.append('avatar', avatarFile);
      const { data } = await api.put('/auth/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser(data.user);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <Loader />;

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <h1 className="font-display text-3xl font-semibold mb-6">{user.username}</h1>

      <form onSubmit={handleSave} className="space-y-4 mb-12 pb-10 border-b border-line">
        <ImageUploader onFileSelect={setAvatarFile} existingUrl={user.avatar} label="Avatar" shape="circle" />
        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-ink/60 mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={200}
            className="w-full bg-paper border border-line rounded-sm px-3 py-2 font-body focus:border-seal"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="font-mono text-sm border border-ink px-5 py-1.5 rounded-sm hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
        >
          {saving ? 'saving...' : 'save profile'}
        </button>
        {saved && <span className="font-mono text-xs text-seal ml-3">saved ✓</span>}
      </form>

      <h2 className="font-display text-2xl font-semibold mb-4">Your dispatches</h2>
      {loadingPosts ? (
        <Loader />
      ) : posts.length === 0 ? (
        <p className="font-mono text-sm text-ink/50">nothing written yet</p>
      ) : (
        <div>{posts.map((post) => <PostCard key={post._id} post={post} />)}</div>
      )}
    </div>
  );
}
