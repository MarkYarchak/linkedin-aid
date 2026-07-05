export interface TitleTarget {
  label: string;
  emoji: string;
  value: string;
}

export interface TitleState {
  label: string;
  emoji: string;
  value: string;
}

export const titleTargets: TitleTarget[] = [
  { label: 'SaaS / Software / Tech Product', emoji: '🔵', value: 'tech' },
  { label: 'AI / Data / Automation / Deep Tech', emoji: '🟣', value: 'ai' },
  { label: 'Professional Services / Consulting / Agencies', emoji: '🟢', value: 'services' },
  { label: 'Finance / Real Estate / Capital', emoji: '🟠', value: 'finance' },
];

export const titleStates: TitleState[] = [
  { label: 'Pending', emoji: '⚪', value: 'pending' },
  { label: 'Request sent', emoji: '🟡', value: 'sent' },
  { label: 'Accepted', emoji: '🟢', value: 'accepted' },
  { label: 'Hot', emoji: '🔥', value: 'hot' },
  { label: 'Couldn\'t interact', emoji: '⚫', value: 'failed' },
  { label: 'Declined', emoji: '🔴', value: 'declined' },
  { label: 'Keep in mind', emoji: '⏳', value: 'later' },
];

export function generateLeadTitle(params: {
  fullName?: string;
  positionTitle?: string;
  companyName?: string;
  targetValue: string;
  stateValue: string;
  customTargets?: TitleTarget[];
  customStates?: TitleState[];
}) {
  const targets = params.customTargets || titleTargets;
  const states = params.customStates || titleStates;

  const target = targets.find(t => t.value === params.targetValue);
  const state = states.find(s => s.value === params.stateValue);

  const targetEmoji = target?.emoji || '🔵';
  const stateEmoji = state?.emoji || '🟡';
  const fullName = params.fullName || 'Lead Full Name';
  const positionTitle = params.positionTitle || 'Selected company position';
  const companyName = params.companyName || 'Company name';

  return `${targetEmoji} ${fullName} / ${positionTitle} / ${companyName} ${stateEmoji}`;
}
