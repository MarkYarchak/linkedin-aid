export interface ImageAttribute {
  originalImageUrl: string;
  sourceType: string;
  imageUrl: string;
}

export interface Image {
  attributes: ImageAttribute[];
}

export interface IngestedContentSummary {
  image?: Image;
  description?: string;
  resolvedUrl?: string;
  title?: string;
  publishedAt?: number;
  sourceDomain?: string;
}

export interface ContentSummaryUnion {
  ingestedContentSummary: IngestedContentSummary;
}

export interface ReactionTypeCount {
  type: string;
  count: number;
}

export interface SocialMetadata {
  reactionTypeCounts: ReactionTypeCount[];
  entityUrn: string;
  threadUrn: string;
  reactionsCount: number;
  commentsCount: number;
  canComment: boolean;
}

export interface MemberAttributedEntity {
  member: string;
}

export interface HyperlinkAttributedEntity {
  url: string;
}

export interface AttributedEntityValue {
  "com.linkedin.common.MemberAttributedEntity"?: MemberAttributedEntity;
  "com.linkedin.common.HyperlinkAttributedEntity"?: HyperlinkAttributedEntity;
}

export interface MessageAttribute {
  length: number;
  start: number;
  value: AttributedEntityValue;
}

export interface Message {
  attributes: MessageAttribute[];
  text: string;
}

export interface PostActivity {
  contentSummaryUnion?: ContentSummaryUnion;
  socialMetadata: SocialMetadata;
  activityUrl: string;
  message: Message;
  entityUrn: string;
}

export interface ActivityUnion {
  postActivity: PostActivity;
}

export interface SalesApiInsight {
  createdAt: number;
  insightId: string;
  activityUnion: ActivityUnion;
}

export interface Paging {
  count: number;
  start: number;
  links: any[];
}

export interface SalesApiInsightsV2 {
  elements: SalesApiInsight[];
  paging: Paging;
}
