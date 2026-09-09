import { useRef, useState, Suspense, lazy } from 'react';

const EmojiPicker = lazy(() => import('emoji-picker-react'));

export default function EmojiTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  className = '',
  textareaClassName = ''
}) {
  const [showPicker, setShowPicker] = useState(false);
  const textareaRef = useRef(null);

  const insertEmoji = (emojiData) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next = value.slice(0, start) + emojiData.emoji + value.slice(end);
    onChange(next);
    setShowPicker(false);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + emojiData.emoji.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className={`relative ${className}`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full bg-paper border border-line rounded-sm px-3 py-2 font-body text-ink placeholder:text-ink/40 focus:border-seal resize-y ${textareaClassName}`}
      />
      <button
        type="button"
        onClick={() => setShowPicker((s) => !s)}
        aria-label="Insert emoji"
        className="absolute bottom-2 right-2 text-lg leading-none hover:scale-110 transition-transform"
      >
        🙂
      </button>
      {showPicker && (
        <div className="absolute z-30 bottom-12 right-0 shadow-lg">
          <Suspense fallback={<div className="w-[320px] h-[400px] bg-paper border border-line rounded flex items-center justify-center font-mono text-xs text-ink/40">loading...</div>}>
            <EmojiPicker onEmojiClick={insertEmoji} lazyLoadEmojis autoFocusSearch={false} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
