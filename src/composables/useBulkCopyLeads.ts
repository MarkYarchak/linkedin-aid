import { ref, onMounted } from 'vue';
import { sanitizeText } from '@/helpers/text-helper';
import { getRelativeTime } from '@/helpers/date-helper';
import { browser } from 'wxt/browser';
import type { Lead } from '@/types/lead/lead';
import type { HeroCard } from '@/types/search/salesApiLeadSearch';

export function useBulkCopyLeads(leads: Lead[], heroCard?: HeroCard) {
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
    heroCard: true,
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
  const prefix = ref('');

  onMounted(async () => {
    // Load default settings if any
    const settings = await browser.storage.local.get('bulkCopyLeadSettings');
    const bulkCopySettings = settings.bulkCopyLeadSettings as { leadFields?: any; prefix?: string } | undefined;
    if (bulkCopySettings?.leadFields) {
      leadFields.value = { ...leadFields.value, ...bulkCopySettings.leadFields };
    }
    if (bulkCopySettings?.prefix) {
      prefix.value = bulkCopySettings.prefix;
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
    let result: any;
    const leadData = leads.map(lead => formatLeadJson(lead));

    if (!groupByCompany.value) {
      result = leadData;
    } else {
      const grouped: Record<string, any> = {};
      const noCompanyLeads: any[] = [];

      leads.forEach((lead, index) => {
        const data = leadData[index];
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

      const groupedResult = Object.values(grouped);
      if (noCompanyLeads.length > 0) {
        groupedResult.push({
          companyName: 'No Company',
          leads: noCompanyLeads
        } as any);
      }

      if (groupedResult.length === 1) {
        if (groupedResult[0].companyName === 'No Company') {
          result = groupedResult[0].leads;
        } else {
          result = groupedResult[0];
        }
      } else {
        result = groupedResult;
      }
    }

    if (leadFields.value.heroCard && heroCard) {
      const company = heroCard.entity?.['com.linkedin.sales.company.Company'];
      if (company) {
        const companyHighlight = {
          name: company.name,
          industry: company.industry,
          location: company.location,
          employeeCount: company.employeeCount,
          description: sanitizeText(company.description, true),
        };

        if (Array.isArray(result)) {
          return {
            companyHighlight,
            leads: result
          };
        } else {
          return {
            companyHighlight,
            ...result
          };
        }
      }
    }

    return result;
  };

  const generateCopyText = () => {
    let output = '';

    if (leadFields.value.heroCard && heroCard) {
      const company = heroCard.entity?.['com.linkedin.sales.company.Company'];
      if (company) {
        let heroInfo = `=== COMPANY HIGHLIGHT ===\n`;
        heroInfo += `Company name: ${company.name}\n`;
        if (company.industry) heroInfo += `Industry: ${company.industry}\n`;
        if (company.location) heroInfo += `Location: ${company.location}\n`;
        if (company.employeeDisplayCount) heroInfo += `Size: ${company.employeeDisplayCount}\n`;
        if (company.description) heroInfo += `About: ${sanitizeText(company.description, true)}\n`;
        output += heroInfo.trim() + '\n\n';
      }
    }

    output += `=== LEADS ===\n`;
    output += leads.map(lead => {
        const header = `--- ${lead.searchResult?.fullName || 'Lead'} ---`;
        const content = formatLead(lead);
        return `${header}\n${content}`;
    }).join('\n\n');

    return output;
  };

  const copyToClipboard = async () => {
    let content = viewMode.value === 'json'
      ? JSON.stringify(generateJsonData(), null, 2)
      : generateCopyText();

    if (prefix.value) {
      content = `${prefix.value}\n\n${content}`;
    }

    await navigator.clipboard.writeText(content);

    // Save settings
    const settings = {
      leadFields: leadFields.value,
      prefix: prefix.value,
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
    prefix,
  };
}
