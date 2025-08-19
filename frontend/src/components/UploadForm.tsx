import React, { useRef, useState } from 'react';

type Props = {
  onSubmit: (payload: { text?: string; file?: File }) => void;
  loading?: boolean;
};

export default function UploadForm({ onSubmit, loading }: Props) {
  const [text, setText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    onSubmit({ text: text.trim() || undefined, file: file || undefined });
  };

  const handleClear = () => {
    setText('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>Validate Letter of Credit</h2>
      <p className="muted">Paste LC text or upload a PDF/text file. We will check it against simplified UCP600/ISBP/eUCP rules.</p>

      <label className="label">Upload File (PDF or TXT)</label>
      <input ref={fileRef} type="file" accept=".pdf,.txt,.text" className="input" />

      <div className="divider">or</div>

      <label className="label">LC Text</label>
      <textarea
        className="textarea"
        rows={10}
        placeholder="Paste LC text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="actions">
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? 'Validating…' : 'Validate'}
        </button>
        <button className="btn" type="button" onClick={handleClear} disabled={loading}>Clear</button>
      </div>
    </form>
  );
}


