import { useRef, useState, useEffect } from 'react';

export default function ImageUploader({ onFileSelect, existingUrl, label = 'Cover image', shape = 'rect' }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(existingUrl || null);

  useEffect(() => {
    setPreview(existingUrl || null);
  }, [existingUrl]);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB');
      return;
    }
    setPreview(URL.createObjectURL(file));
    onFileSelect(file);
  };

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-sm';

  return (
    <div>
      <label className="block font-mono text-xs uppercase tracking-wide text-ink/60 mb-2">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer border border-dashed border-line ${shapeClass} overflow-hidden flex items-center justify-center bg-paperDark/40 hover:border-seal transition-colors ${
          shape === 'circle' ? 'w-24 h-24' : 'w-full h-48'
        }`}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <span className="font-mono text-xs text-ink/50 px-3 text-center">click to upload image</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
