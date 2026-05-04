export function parseLinkedInUrn(input: string) {
  const parts = input.split(':')

  if (parts.length < 4 || parts[0] !== 'urn') {
    throw new Error('Invalid URN')
  }

  const [, namespace, entityType, ...rest] = parts

  return {
    scheme: 'urn' as const,
    namespace,
    entityType,
    id: rest.join(':'),
  }
}
