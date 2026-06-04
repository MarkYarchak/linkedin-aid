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

/** Persona id used in lead-search PERSONA filters (second id in salesPersona tuple URNs). */
export function getPersonaSearchIdFromUrn(personaUrn: string): string {
  const { id } = parseLinkedInUrn(personaUrn)
  const tupleMatch = id.match(/^\((\d+),(\d+)\)$/)
  if (tupleMatch) return tupleMatch[2]
  return id
}

export function normalizePersonaSearchId(personaIdOrUrn: string): string {
  if (personaIdOrUrn.startsWith('urn:')) {
    return getPersonaSearchIdFromUrn(personaIdOrUrn)
  }
  const tupleMatch = personaIdOrUrn.match(/^\((\d+),(\d+)\)$/)
  if (tupleMatch) return tupleMatch[2]
  return personaIdOrUrn
}
