import { getDisplayImageUrl, isImageExpired } from './image-helper';
import type { Lead } from '@/types/lead/lead';
import type { Company } from '@/types/company/company';
import type { Position } from '@/types/lead/salesApiProfiles';
import type { DecoratedPosition } from '@/types/search/salesApiLeadSearch';
import type { OptionalDeepReadonly } from '@/types/common';

export function getEffectivePositions<T extends Position | DecoratedPosition>(
  leadUrn: string,
  positions: T[],
  relationsMap: OptionalDeepReadonly<Record<string, Record<number, string>>>,
  companiesMap: OptionalDeepReadonly<Record<string, Company>>
): T[] {
  const relations = relationsMap[leadUrn];
  if (!relations) return positions;

  return positions.map(pos => {
    const assignedCompanyUrn = relations[pos.posId];
    if (assignedCompanyUrn) {
      const company = companiesMap[assignedCompanyUrn];
      const newPos = { ...pos } as any;
      newPos.companyUrn = assignedCompanyUrn;
      newPos.companyName = company?.main?.name || pos.companyName;
      newPos.isManuallyLinked = true;

      // Update companyUrnResolutionResult if it exists
      if (newPos.companyUrnResolutionResult) {
        newPos.companyUrnResolutionResult = {
          ...newPos.companyUrnResolutionResult,
          entityUrn: assignedCompanyUrn,
          name: company?.main?.name || newPos.companyUrnResolutionResult.name,
          industry: company?.main?.industry || newPos.companyUrnResolutionResult.industry
        };
      }
      return newPos as T;
    }
    return pos;
  });
}

export function getEffectiveLeadPositions(
  lead: Lead,
  relationsMap: Record<string, Record<number, string>>,
  companiesMap: Record<string, Company>
) {
  const mainPositions = lead.main?.positions || [];
  const searchPositions = lead.searchResult?.currentPositions || [];

  return {
    mainPositions: getEffectivePositions(lead.entityUrn, mainPositions, relationsMap, companiesMap),
    searchPositions: searchPositions
  };
}

export function getLeadAvatarUrl(lead: OptionalDeepReadonly<Lead>): string | null {
  const extraUrl = getDisplayImageUrl(lead.extra?.profilePictureDisplayImage as any);
  const searchUrl = getDisplayImageUrl(lead.searchResult?.profilePictureDisplayImage as any);

  const extraExpired = isImageExpired(extraUrl);
  const searchExpired = isImageExpired(searchUrl);

  if (extraUrl && !extraExpired) return extraUrl;
  if (searchUrl && !searchExpired) return searchUrl;

  // Fallback to whichever is available if both are expired or one is missing
  return extraUrl || searchUrl || null;
}
