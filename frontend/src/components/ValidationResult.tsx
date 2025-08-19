import React from 'react';
import type { Issue } from '../utils/api';

type Props = {
  score?: number;
  issues?: Issue[];
  loading?: boolean;
};

function severityColor(sev: Issue['severity']): string {
  switch (sev) {
    case 'high':
      return '#ef4444';
    case 'medium':
      return '#f59e0b';
    case 'low':
    default:
      return '#10b981';
  }
}

export default function ValidationResult({ score, issues, loading }: Props) {
  if (loading) {
    return <div className="card"><p>Running checks…</p></div>;
  }

  if (score == null && !issues) {
    return null;
  }

  const hasIssues = (issues?.length ?? 0) > 0;
  return (
    <div className="card">
      <div className="score">
        <span>Compliance score</span>
        <strong>{score}%</strong>
      </div>
      {!hasIssues && <p className="muted">No issues found. Your LC appears compliant with the simplified rules.</p>}
      {hasIssues && (
        <div className="issues">
          {issues!.map((iss, idx) => (
            <div className="issue-card" key={idx} style={{ borderLeftColor: severityColor(iss.severity) }}>
              <div className="issue-header">
                <span className="badge" style={{ backgroundColor: severityColor(iss.severity) }}>{iss.severity}</span>
                <strong>{iss.clause}</strong>
              </div>
              <p>{iss.description}</p>
              <p className="suggestion">Suggestion: {iss.suggestion}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


