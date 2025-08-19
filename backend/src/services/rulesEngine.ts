import path from 'path';
import fs from 'fs/promises';

export type Issue = {
  clause: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
};

export type ValidationResult = {
  issues: Issue[];
  score: number; // percentage 0-100
};

export type SimpleRule = {
  id: string;
  keyword: string; // key phrase expected in LC text
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
  // extension points for future enhancements
  pattern?: string; // optional regex to match instead of keyword
  negativePhrases?: string[]; // phrases that contradict the requirement
};

async function resolveStandardsDir(): Promise<string | undefined> {
  // Allow explicit override via env
  const fromEnv = process.env.STANDARDS_DIR;
  const candidates = [
    fromEnv,
    // When running from backend folder in monorepo
    path.resolve(process.cwd(), '..', 'docs', 'standards'),
    // When running from packaged Docker image with docs copied to /app/docs
    path.resolve(process.cwd(), 'docs', 'standards'),
    // Fallback absolute when copied to root
    path.resolve('/', 'docs', 'standards'),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isDirectory()) return candidate;
    } catch {
      // continue
    }
  }
  return undefined;
}

async function loadAllRules(): Promise<SimpleRule[]> {
  const standardsDir = await resolveStandardsDir();
  if (!standardsDir) {
    return [];
  }
  const files = ['ucp600.json', 'isbp.json', 'eucp.json'];
  const all: SimpleRule[][] = await Promise.all(
    files.map(async (fname) => {
      const full = path.join(standardsDir, fname);
      try {
        const raw = await fs.readFile(full, 'utf8');
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          return parsed as SimpleRule[];
        }
        // Support legacy { name, rules } shape
        if (parsed && typeof parsed === 'object' && Array.isArray((parsed as any).rules)) {
          const legacy = (parsed as any).rules as any[];
          return legacy.map((r) =>
            normalizeLegacyRule(r)
          );
        }
        return [];
      } catch {
        return [];
      }
    })
  );
  return all.flat();
}

function normalizeLegacyRule(input: any): SimpleRule {
  return {
    id: input.id ?? input.clause ?? 'rule',
    keyword: input.keyword ?? input.pattern ?? (input.mustInclude?.[0] ?? ''),
    description: input.description ?? 'Rule',
    severity: input.severity ?? 'low',
    suggestion: input.suggestion ?? 'Review LC text to satisfy this rule.',
    pattern: input.pattern,
  };
}

export async function validateAgainstStandards(text: string): Promise<ValidationResult> {
  const rules = await loadAllRules();
  const normalized = normalize(text);

  if (rules.length === 0) {
    return { issues: [], score: 100 };
  }

  const issues: Issue[] = [];
  let totalWeight = 0;
  let satisfiedWeight = 0;

  for (const rule of rules) {
    const weight = severityWeight(rule.severity);
    totalWeight += weight;

    const ok = evaluateRule(rule, normalized);
    if (ok) {
      satisfiedWeight += weight;
    } else {
      issues.push({
        clause: rule.id,
        description: rule.description,
        severity: rule.severity,
        suggestion: rule.suggestion,
      });
    }
  }

  const score = totalWeight === 0 ? 100 : Math.round((satisfiedWeight / totalWeight) * 100);
  return { issues, score };
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').toLowerCase();
}

function severityWeight(severity: SimpleRule['severity']): number {
  switch (severity) {
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
    default:
      return 1;
  }
}

function evaluateRule(rule: SimpleRule, normalizedText: string): boolean {
  // Prefer regex pattern if provided
  if (rule.pattern) {
    try {
      const regex = new RegExp(rule.pattern, 'i');
      if (!regex.test(normalizedText)) return false;
    } catch {
      // Fallback to keyword when invalid pattern
      if (!includesKeyword(normalizedText, rule.keyword)) return false;
    }
  } else if (!includesKeyword(normalizedText, rule.keyword)) {
    return false;
  }

  // If any negative phrase is present, consider violation
  if (rule.negativePhrases && rule.negativePhrases.some((p) => includesKeyword(normalizedText, p))) {
    return false;
  }

  return true;
}

function includesKeyword(text: string, keyword: string | undefined): boolean {
  if (!keyword) return true;
  return text.includes(keyword.toLowerCase());
}


