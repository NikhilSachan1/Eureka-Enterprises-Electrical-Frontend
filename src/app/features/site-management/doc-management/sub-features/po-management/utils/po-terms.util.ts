export function parsePoTerms(content: string | null | undefined): string[] {
  const trimmed = content?.trim() ?? '';
  if (!trimmed) {
    return [];
  }

  return trimmed
    .split(/\n(?=\d+\.\s)/)
    .map(part => part.trim())
    .filter(Boolean);
}

export function mapPoTermsForForm(
  content: string | null | undefined
): Array<{ content: string }> {
  return parsePoTerms(content).map(term => ({ content: term }));
}

export function joinPoTerms(
  terms: Array<{ content?: string | null }> | null | undefined
): string | null {
  const parts = (terms ?? [])
    .map(term => String(term.content ?? '').trim())
    .filter(Boolean);

  if (!parts.length) {
    return null;
  }

  return parts
    .map((text, index) => {
      const body = text.replace(/^\d+\.\s*/, '').trim();
      return `${index + 1}. ${body}`;
    })
    .join('\n\n');
}
