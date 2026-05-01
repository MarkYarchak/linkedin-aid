export interface FilterValue {
  displayValue: string;
  selectionType: string;
  id: string;
}

export interface SearchFilterConfig {
  typeaheadPlaceholder?: string;
  dynamicFetch: boolean;
  exclusionSupported: boolean;
  facetTypeaheadType: string;
  typeaheadSupported: boolean;
  title: string;
  presentationType: string;
  rawTextSupported: boolean;
}

export interface SingleFilterMetadata {
  searchFilterConfig: SearchFilterConfig;
  values: FilterValue[];
  type: string;
}

export interface PersonaFilter {
  singleFilterMetadata: SingleFilterMetadata;
}

export interface Persona {
  personaFilters: PersonaFilter[];
  lastModifiedAt: number;
  entityUrn: string;
  personaType: string;
  personaName: string;
  personaUrn: string;
  personaFiltersUnions: PersonaFilter[];
}

export interface PersonaResultCount {
  persona: Persona;
  displayCount: string;
}

export interface SalesApiCompanies2 {
  employeeCount: number;
  sharedAlumniSchoolIds: number[];
  employeeCountRange: string;
  personaResultCounts: PersonaResultCount[];
  entityUrn: string;
  employeeDisplayCount: string;
  sharedAlumniDisplayCount: string;
  decisionMakersDisplayCount: string;
}
