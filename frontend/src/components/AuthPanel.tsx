import React, { useState } from 'react';
import { supabase } from '../utils/supabase';

export default function AuthPanel() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus('Sending magic link…');
    const siteUrl = (import.meta.env.VITE_SITE_URL as string) || window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: siteUrl,
      },
    });
    if (error) {
      setError(error.message);
      setStatus(null);
    } else {
      setStatus('Check your email for the login link.');
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="card">
      <h2>Sign in</h2>
      <p className="muted">Use your email to receive a magic link.</p>
      <form onSubmit={sendMagicLink}>
        <input className="input" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div className="actions" style={{ marginTop: 8 }}>
          <button className="btn primary" type="submit">Send Link</button>
          <button className="btn" type="button" onClick={logout}>Sign out</button>
        </div>
      </form>
      {status && <p className="muted" style={{ marginTop: 8 }}>{status}</p>}
      {error && <p className="card error" style={{ marginTop: 8 }}>{error}</p>}
    </div>
  );
}


