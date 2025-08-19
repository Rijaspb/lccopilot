import React, { useEffect, useState } from 'react';
import UploadForm from '../components/UploadForm';
import ValidationResult from '../components/ValidationResult';
import { validateLc, type ValidationResponse } from '../utils/api';
import { supabase } from '../utils/supabase';
import AuthPanel from '../components/AuthPanel';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionToken(data.session?.access_token ?? null);
      setUserEmail(data.session?.user.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionToken(session?.access_token ?? null);
      setUserEmail(session?.user.email ?? null);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const handleSubmit = async ({ text, file }: { text?: string; file?: File }) => {
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await validateLc({ text, file, accessToken: sessionToken ?? undefined });
      setResult(res);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>LC Copilot</h1>
        <p className="muted">Validate Letters of Credit against simplified UCP600 / ISBP / eUCP rules.</p>
        {userEmail && <p className="muted">Signed in as {userEmail}</p>}
      </header>

      <div className="grid">
        <UploadForm onSubmit={handleSubmit} loading={loading} />
        <div>
          {error && <div className="card error">{error}</div>}
          <ValidationResult loading={loading} score={result?.score} issues={result?.issues} />
          <div style={{ marginTop: 12 }}>
            <AuthPanel />
          </div>
        </div>
      </div>

      <footer className="footer">
        <span className="muted">For demonstration only. Not legal advice.</span>
      </footer>
    </div>
  );
}


