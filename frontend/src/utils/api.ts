export type Issue = {
  clause: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
};

export type ValidationResponse = {
  issues: Issue[];
  score: number;
};

export async function validateLc({ text, file, accessToken }: { text?: string; file?: File; accessToken?: string }): Promise<ValidationResponse> {
  const formData = new FormData();
  if (file) formData.append('file', file);
  if (text) formData.append('text', text);

  const rawBase = import.meta.env.VITE_API_BASE_URL || '';
  const apiBaseUrl = rawBase.replace(/\/+$/, '');
  const url = apiBaseUrl ? `${apiBaseUrl}/api/validate-lc` : '/api/validate-lc';
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || 'Validation failed');
  }
  return res.json();
}


