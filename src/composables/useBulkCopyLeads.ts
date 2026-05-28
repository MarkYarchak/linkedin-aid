import { ref, onMounted } from 'vue';
import { sanitizeText } from '@/helpers/text-helper';
import { getRelativeTime } from '@/helpers/date-helper';
import { browser } from 'wxt/browser';
import type { Lead } from '@/types/lead/lead';

export function useBulkCopyLeads(leads: Lead[]) {
  const currentStep = ref(1);
  const totalSteps = 2; // Reduced steps for bulk copy: Fields selection and Preview
  const viewMode = ref('text');
  const viewOptions = [
    { label: 'Text', value: 'text' },
    { label: 'JSON', value: 'json' },
  ];

  // Lead Fields
  const leadFields = ref({
    fullName: true,
    location: true,
    summary: true,
    recentActivity: true,
    mutualConnections: true,
    position: {
      title: true,
      companyName: true,
      industry: true,
      location: true,
      startedOn: true,
      description: true,
    },
  });

  const isCopied = ref(false);
  const copyTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
  const groupByCompany = ref(false);

  onMounted(async () => {
    // Load default settings if any
    const settings = await browser.storage.local.get('bulkCopyLeadSettings');
    const bulkCopySettings = settings.bulkCopyLeadSettings as { leadFields?: any } | undefined;
    if (bulkCopySettings?.leadFields) {
      leadFields.value = { ...leadFields.value, ...bulkCopySettings.leadFields };
    }

    // Set to true only if all leads are within the same company
    const companyUrns = leads.map(l => l.searchResult?.currentPositions?.[0]?.companyUrn);
    const uniqueCompanies = new Set(companyUrns);
    groupByCompany.value = uniqueCompanies.size === 1;
  });

  const nextStep = () => {
    if (currentStep.value < totalSteps) currentStep.value++;
  };

  const prevStep = () => {
    if (currentStep.value > 1) currentStep.value--;
  };

  const formatLead = (lead: Lead) => {
    let sections: string[] = [];
    const searchResult = lead.searchResult;

    if (searchResult) {
      let leadInfo = '';
      if (leadFields.value.fullName) leadInfo += `Name: ${searchResult.fullName}\n`;
      if (leadFields.value.location) leadInfo += `Location: ${searchResult.geoRegion}\n`;
      if (leadFields.value.summary && searchResult.summary) {
        leadInfo += `Summary:\n${sanitizeText(searchResult.summary, true)}\n`;
      }
      if (leadFields.value.mutualConnections) {
        const mutualBadge = searchResult.spotlightBadges?.find(b => b.id === 'SECOND_DEGREE_CONNECTION');
        if (mutualBadge) {
          leadInfo += `Mutual Connections: ${mutualBadge.displayValue}\n`;
        }
      }
      if (leadInfo) sections.push(leadInfo.trim());

      const pos = searchResult.currentPositions?.[0];
      if (pos) {
        let posInfo = '';
        if (leadFields.value.position.title) posInfo += `Title: ${pos.title}\n`;
        if (leadFields.value.position.companyName) posInfo += `Company: ${pos.companyName}\n`;
        if (leadFields.value.position.industry && pos.companyUrnResolutionResult?.industry) {
          posInfo += `Industry: ${pos.companyUrnResolutionResult.industry}\n`;
        }
        if (leadFields.value.position.location && pos.companyUrnResolutionResult?.location) {
            posInfo += `Location: ${pos.companyUrnResolutionResult.location}\n`;
        }
        if (leadFields.value.position.startedOn && pos.startedOn) {
          const date = new Date(pos.startedOn.year, (pos.startedOn.month || 1) - 1);
          posInfo += `Started: ${getRelativeTime(date.getTime())}\n`;
        }
        if (leadFields.value.position.description && pos.description) {
          posInfo += `Description:\n${sanitizeText(pos.description, true)}\n`;
        }

        if (posInfo) {
          sections.push(posInfo.trim());
        }
      }

      if (leadFields.value.recentActivity) {
        const activityBadge = searchResult.spotlightBadges?.find(b => b.id === 'POSTED_ON_LINKEDIN');
        if (activityBadge) {
          sections.push(`Recent Activity: ${activityBadge.displayValue}`);
        }
      }
    }

    return sections.join('\n');
  };

  const formatLeadJson = (lead: Lead) => {
    const data: any = {};
    const searchResult = lead.searchResult;

    if (searchResult) {
      if (leadFields.value.fullName) data.fullName = searchResult.fullName;
      if (leadFields.value.location) data.location = searchResult.geoRegion;
      if (leadFields.value.summary && searchResult.summary) {
        data.summary = sanitizeText(searchResult.summary, true);
      }
      if (leadFields.value.mutualConnections) {
        const mutualBadge = searchResult.spotlightBadges?.find(b => b.id === 'SECOND_DEGREE_CONNECTION');
        if (mutualBadge) {
          data.mutualConnections = mutualBadge.displayValue;
        }
      }
      if (leadFields.value.recentActivity) {
        const activityBadge = searchResult.spotlightBadges?.find(b => b.id === 'POSTED_ON_LINKEDIN');
        if (activityBadge) {
          data.recentActivitySummary = activityBadge.displayValue;
        }
      }

      const pos = searchResult.currentPositions?.[0];
      if (pos) {
        data.currentPosition = {};
        if (leadFields.value.position.title) data.currentPosition.title = pos.title;
        if (leadFields.value.position.companyName) data.currentPosition.companyName = pos.companyName;
        if (leadFields.value.position.industry && pos.companyUrnResolutionResult?.industry) {
          data.currentPosition.industry = pos.companyUrnResolutionResult.industry;
        }
        if (leadFields.value.position.location && pos.companyUrnResolutionResult?.location) {
            data.currentPosition.location = pos.companyUrnResolutionResult.location;
        }
        if (leadFields.value.position.startedOn && pos.startedOn) {
          const date = new Date(pos.startedOn.year, (pos.startedOn.month || 1) - 1);
          data.currentPosition.started = getRelativeTime(date.getTime());
        }
        if (leadFields.value.position.description && pos.description) {
          data.currentPosition.description = sanitizeText(pos.description, true);
        }
      }
    }

    return data;
  };

  const generateJsonData = () => {
    if (!groupByCompany.value) {
      return leads.map(lead => formatLeadJson(lead));
    }

    const grouped: Record<string, any> = {};
    const noCompanyLeads: any[] = [];

    leads.forEach(lead => {
      const data = formatLeadJson(lead);
      const companyUrn = lead.searchResult?.currentPositions?.[0]?.companyUrn;
      const companyName = lead.searchResult?.currentPositions?.[0]?.companyName;

      if (companyUrn) {
        if (!grouped[companyUrn]) {
          grouped[companyUrn] = {
            companyName,
            leads: []
          };

          // Optionally include company industry/location if available from the first lead
          const pos = lead.searchResult?.currentPositions?.[0];
          if (pos?.companyUrnResolutionResult) {
            if (pos.companyUrnResolutionResult.industry) {
              grouped[companyUrn].industry = pos.companyUrnResolutionResult.industry;
            }
            if (pos.companyUrnResolutionResult.location) {
              grouped[companyUrn].location = pos.companyUrnResolutionResult.location;
            }
          }
        }

        // Remove redundant company info from lead object if it's already in the group header
        if (data.currentPosition) {
          delete data.currentPosition.companyName;
          if (grouped[companyUrn].industry && data.currentPosition.industry === grouped[companyUrn].industry) {
            delete data.currentPosition.industry;
          }
          if (grouped[companyUrn].location && data.currentPosition.location === grouped[companyUrn].location) {
            delete data.currentPosition.location;
          }
          // If currentPosition is now empty, remove it
          if (Object.keys(data.currentPosition).length === 0) {
            delete data.currentPosition;
          }
        }

        grouped[companyUrn].leads.push(data);
      } else {
        noCompanyLeads.push(data);
      }
    });

    const result = Object.values(grouped);
    if (noCompanyLeads.length > 0) {
      result.push({
        companyName: 'No Company',
        leads: noCompanyLeads
      } as any);
    }

    if (result.length === 1) {
      if (result[0].companyName === 'No Company') return result[0].leads;
      return result[0];
    }
    return result;
  };

  const generateCopyText = () => {
    return leads.map(lead => {
        const header = `--- ${lead.searchResult?.fullName || 'Lead'} ---`;
        const content = formatLead(lead);
        return `${header}\n${content}`;
    }).join('\n\n');
  };

  const copyToClipboard = async () => {
    const content = viewMode.value === 'json'
      ? JSON.stringify(generateJsonData(), null, 2)
      : generateCopyText();

    await navigator.clipboard.writeText(content);

    // Save settings (only lead fields for now)
    const settings = {
      leadFields: leadFields.value,
    };
    await browser.storage.local.set({
        bulkCopyLeadSettings: settings
    });

    isCopied.value = true;
    if (copyTimeout.value) clearTimeout(copyTimeout.value);
    copyTimeout.value = setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  };

  return {
    currentStep,
    totalSteps,
    leadFields,
    isCopied,
    nextStep,
    prevStep,
    generateCopyText,
    generateJsonData,
    copyToClipboard,
    viewMode,
    viewOptions,
    groupByCompany,
  };
}
