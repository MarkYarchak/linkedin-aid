export interface SalesApiPersonasResponse {
  elements: Persona[];
  paging: Paging;
}

export interface Persona {
  lastModifiedAt: number;
  personaFilters: PersonaFilter[];
  personaType: string;
  personaLeadInsight: PersonaLeadInsight;
  personaName: string;
  $recipeType: string;
  personaUrn: string;
}

export interface PersonaFilter {
  singleFilterMetadata: SingleFilterMetadata;
}

export interface SingleFilterMetadata {
  searchFilterConfig: SearchFilterConfig;
  values: PersonaFilterValue[];
  type: string;
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

export interface PersonaFilterValue {
  displayValue: string;
  selectionType: 'INCLUDED' | 'EXCLUDED';
  id: string;
}

export interface PersonaLeadInsight {
  count: number;
  facePiles: FacePile[];
}

export interface FacePile {
  artifacts: Artifact[];
  rootUrl: string;
}

export interface Artifact {
  width: number;
  fileIdentifyingUrlPathSegment: string;
  height: number;
}

export interface Paging {
  count: number;
  start: number;
  links: any[];
}
