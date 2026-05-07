export function sanitizeText(text: string | undefined | null): string {
  if (!text) return '';
  return text.replace(/\t/g, ' ');
}
