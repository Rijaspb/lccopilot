import * as rulesEngine from '../services/rulesEngine';
import fs from 'fs/promises';
import path from 'path';

jest.mock('fs/promises');

const mockRules = [
  {
    id: 'ucp600-article14',
    keyword: 'presentation period',
    description: 'Presentation period must not exceed 21 days from shipment date.',
    severity: 'high' as const,
    suggestion: 'Add: Documents must be presented within 21 days from shipment date.',
  },
  {
    id: 'isbp-shipment-details',
    keyword: 'incoterms',
    description: 'Shipment terms like Incoterms should be clear.',
    severity: 'medium' as const,
    suggestion: 'Include Incoterms (e.g., FOB/CIF).',
  },
  {
    id: 'eucp-format',
    keyword: 'electronic presentation',
    description: 'If electronic presentation is allowed, specify format and platform.',
    severity: 'low' as const,
    suggestion: 'State acceptable electronic document formats.',
  },
];

function setupFsMock() {
  const files = ['ucp600.json', 'isbp.json', 'eucp.json'];
  (fs.readFile as jest.Mock).mockImplementation(async (full: string) => {
    const filename = path.basename(full);
    if (files.includes(filename)) {
      return JSON.stringify(mockRules);
    }
    throw new Error('Not found');
  });
}

describe('rulesEngine.validateAgainstStandards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupFsMock();
  });

  it('returns 100 score and no issues when all keywords present', async () => {
    const text = 'The presentation period is 21 days. Incoterms CIF. Electronic presentation accepted.';
    const result = await rulesEngine.validateAgainstStandards(text);
    expect(result.issues).toHaveLength(0);
    expect(result.score).toBe(100);
  });

  it('detects missing keywords and returns issues', async () => {
    const text = 'This LC mentions only Incoterms CIF.'; // missing presentation period and electronic presentation
    const result = await rulesEngine.validateAgainstStandards(text);
    const clauses = result.issues.map((i) => i.clause).sort();
    expect(clauses).toContain('ucp600-article14');
    expect(clauses).toContain('eucp-format');
    expect(result.score).toBeLessThan(100);
  });

  it('weights severity correctly in score calculation', async () => {
    // present only low and medium, miss high
    const text = 'Incoterms stated. Electronic presentation allowed.';
    const result = await rulesEngine.validateAgainstStandards(text);
    // weights: high=3, medium=2, low=1 total=6; satisfied=medium+low=3 => score=50
    expect(result.score).toBe(50);
  });
});


