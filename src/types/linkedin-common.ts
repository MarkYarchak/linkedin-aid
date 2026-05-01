export interface Artifact {
  width: number;
  height: number;
  fileIdentifyingUrlPathSegment: string;
}

export interface DisplayImage {
  artifacts: Artifact[];
  rootUrl: string;
}
