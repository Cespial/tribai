const ARTICLE_PATTERNS = [
  /art[íi]culo\s+(\d+[-\d]*(?:\s*-\s*\d+)?)/gi,
  /art\.\s*(\d+[-\d]*(?:\s*-\s*\d+)?)/gi,
  /arts?\.\s*(\d+[-\d]*(?:\s*,\s*\d+[-\d]*)*)/gi,
];

export function extractArticleRefs(text: string): string[] {
  const refs = new Set<string>();

  for (const pattern of ARTICLE_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const raw = match[1];
      const parts = raw.split(/\s*,\s*/);
      for (const part of parts) {
        const cleaned = part.replace(/\s+/g, "").trim();
        if (cleaned && /^\d+[-\d]*$/.test(cleaned)) {
          refs.add(cleaned);
        }
      }
    }
  }

  return Array.from(refs);
}

export function articleNumberToId(num: string): string {
  return `Art. ${num}`;
}

export function buildArticleUrl(articleId: string): string {
  const num = articleId.replace(/^Art\.\s*/, "").trim();
  return `https://estatuto.co/${num}`;
}

export function estimateTokens(text: string): number {
  // Spanish legal text averages ~3.5 chars per token.
  if (text.length === 0) return 0;
  return Math.ceil(text.length / 3.5);
}
