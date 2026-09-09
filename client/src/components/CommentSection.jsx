import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import EmojiTextarea from './EmojiTextarea.jsx';
import MagneticWrap from './MagneticWrap.jsx';

function Comment({ comment, onReply, onDelete, currentUserId }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const submitReply = async () => {
    if (!replyText.trim()) return;
    await onReply(replyText, comment._id);
    setReplyText('');
    setReplying(false);
  };

  return (
    <div className="py-4 border-b border-line/60">
      <div className="flex items-center gap-2 font-mono text-xs text-ink/50 mb-1">
        <span className="font-medium text-ink">{comment.author?.username}</span>
        <span>&middot;</span>
        <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
      </div>
      <p className="font-body text-ink whitespace-pre-wrap break-words">{comment.text}</p>
      <div className="flex gap-3 mt-1 font-mono text-xs">
        <button onClick={() => setReplying((r) => !r)} className="text-seal hover:underline">
          reply
        </button>
        {comment.author?._id === currentUserId && (
          <button onClick={() => onDelete(comment._id)} className="text-ink/40 hover:text-seal">
            delete
          </button>
        )}
      </div>

      {replying && (
        <div className="mt-3 ml-2">
          <EmojiTextarea value={replyText} onChange={setReplyText} rows={2} placeholder="Write a reply..." />
          <button
            onClick={submitReply}
            className="mt-2 text-xs font-mono border border-ink px-3 py-1 rounded-sm hover:bg-ink hover:text-paper transition-colors"
          >
            post reply
          </button>
        </div>
      )}

      {comment.replies?.length > 0 && (
        <div className="ml-5 mt-2 border-l border-line pl-4">
          {comment.replies.map((reply) => (
            <Comment
              key={reply._id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get(`/comments/post/${postId}`);
      const commentList = Array.isArray(data.comments) ? data.comments : [];
      // Build a tree from the flat list
      const map = {};
      commentList.forEach((c) => (map[c._id] = { ...c, replies: [] }));
      const roots = [];
      commentList.forEach((c) => {
        if (c.parentComment) {
          map[c.parentComment]?.replies.push(map[c._id]);
        } else {
          roots.push(map[c._id]);
        }
      });
      setComments(roots);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const postComment = async (commentText, parentComment = null) => {
    await api.post(`/comments/post/${postId}`, { text: commentText, parentComment });
    await load();
  };

  const deleteComment = async (id) => {
    await api.delete(`/comments/${id}`);
    await load();
  };

  const submitTopLevel = async () => {
    if (!text.trim()) return;
    await postComment(text);
    setText('');
  };

  return (
    <section className="mt-12">
      <h3 className="font-display text-xl font-semibold mb-4">
        {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
      </h3>

      {user ? (
        <div className="mb-6">
          <EmojiTextarea value={text} onChange={setText} rows={3} placeholder="Add to the margin... 💭" />
          <MagneticWrap strength={0.2}>
            <button
              onClick={submitTopLevel}
              className="mt-2 font-mono text-xs border border-ink px-4 py-1.5 rounded-sm hover:bg-ink hover:text-paper transition-colors"
            >
              post comment
            </button>
          </MagneticWrap>
        </div>
      ) : (
        <p className="font-mono text-xs text-ink/50 mb-6">sign in to join the conversation</p>
      )}

      {loading ? (
        <p className="font-mono text-xs text-ink/40">loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="font-mono text-xs text-ink/40">no comments yet — be first</p>
      ) : (
        <div>
          {comments.map((c) => (
            <Comment
              key={c._id}
              comment={c}
              onReply={postComment}
              onDelete={deleteComment}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}
