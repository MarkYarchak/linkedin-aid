export function sanitizeText(text: string | undefined | null, collapseNewLines = false): string {
  if (!text) return '';
  let result = text.replace(/\t/g, ' ');
  if (collapseNewLines) {
    result = result.replace(/\n\s*\n/g, '\n');
  }
  return result;
}
