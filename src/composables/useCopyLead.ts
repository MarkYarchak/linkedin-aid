import { ref, computed, onMounted, watch } from 'vue';
import { companyService } from '@/services/company-service';
import { sanitizeText } from '@/helpers/text-helper';
import { titleTargets, titleStates, generateLeadTitle } from '@/helpers/title-helper';
import { parseLinkedInUrn } from '@/helpers/urn';
import { getRelativeTime } from '@/helpers/date-helper';
import { browser } from 'wxt/browser';
import type { Lead } from '@/types/lead/lead';
import type { Company } from '@/types/company/company';
import type { CopyLeadSettings } from '@/types/copy-lead-settings';

export function useCopyLead(lead: Lead) {
  const currentStep = ref(1);
  const totalSteps = 5;
  const viewMode = ref('text');
  const viewOptions = [
    { label: 'Text', value: 'text' },
    { label: 'JSON', value: 'json' },
  ];

  // Lead Fields
  const leadFields = ref({
    fullName: true,
    headline: true,
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

  // Positions
  const selectedPositionId = ref<number | null>(null);

  const currentPositions = computed(() => {
    return lead.main?.positions?.filter(p => p.current) || [];
  });

  const selectedPositionUrn = computed(() => {
    if (selectedPositionId.value === null) return '';
    const pos = lead.main?.positions.find(p => p.posId === selectedPositionId.value);
    return pos?.companyUrn || '';
  });

  // Insights & Skills
  const selectedInsights = ref<string[]>([]);
  const selectedSkills = ref<string[]>([]);

  // Company Fields
  const companyFields = ref({
    name: true,
    description: true,
    industry: true,
    location: true,
    revenueRange: true,
    specialties: true,
    type: true,
    yearFounded: true,
    employeeCount: true,
  });

  const selectedCompany = ref<Company | null>(null);
  const isLoadingCompany = ref(false);
  const capturedCompanyUrns = ref<string[]>([]);

  const isCopied = ref(false);
  const copyTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

  const selectedTarget = ref(titleTargets[0].value);
  const selectedState = ref(titleStates[0].value);
  const prefix = ref('');
  const wrapText = ref(false);

  const loadCapturedCompanyUrns = async () => {
    const companies = await companyService.findCompanies();
    capturedCompanyUrns.value = Object.keys(companies);
  };

  onMounted(async () => {
    await loadCapturedCompanyUrns();
    // Load default settings if any
    const settings = await browser.storage.local.get('copyLeadSettings');
    if (settings.copyLeadSettings) {
      const s = settings.copyLeadSettings as CopyLeadSettings;
      if (s.leadFields) leadFields.value = { ...leadFields.value, ...s.leadFields };
      if (s.companyFields) companyFields.value = { ...companyFields.value, ...s.companyFields };
      if (s.selectedTarget) selectedTarget.value = s.selectedTarget;
      if (s.selectedState) selectedState.value = s.selectedState;
      if (s.prefix) prefix.value = s.prefix;
      if (s.viewMode) viewMode.value = s.viewMode;
      if (s.wrapText !== undefined) wrapText.value = s.wrapText;
    }

    // Set default position
    if (lead.main?.defaultPosition) {
      const defPos = lead.main.defaultPosition;
      const found = lead.main.positions.find(p => p.posId === defPos.posId);
      if (found) {
        selectedPositionId.value = found.posId;
      }
    } else if (currentPositions.value.length > 0) {
      selectedPositionId.value = currentPositions.value[0].posId;
    }
  });

  watch(selectedPositionUrn, async (newUrn) => {
    if (newUrn) {
      isLoadingCompany.value = true;
      try {
        const id = parseLinkedInUrn(newUrn).id;
        const company = await companyService.findCompanyById(id);
        selectedCompany.value = company || null;
      } catch (e) {
        console.error('Failed to fetch company', e);
        selectedCompany.value = null;
      } finally {
        isLoadingCompany.value = false;
      }
    } else {
      selectedCompany.value = null;
    }
  }, { immediate: true });

  const nextStep = () => {
    if (currentStep.value < totalSteps) currentStep.value++;
  };

  const prevStep = () => {
    if (currentStep.value > 1) currentStep.value--;
  };

  const generateCopyText = () => {
    let sections: string[] = [];
    const main = lead.main;

    if (main) {
      let leadInfo = '### LEAD INFO\n';
      if (leadFields.value.fullName) leadInfo += `Name: ${main.fullName}\n`;
      if (leadFields.value.headline) leadInfo += `Headline: ${main.headline}\n`;
      if (leadFields.value.location) leadInfo += `Location: ${main.location}\n`;
      if (leadFields.value.summary && main.summary) {
        leadInfo += `Summary:\n${sanitizeText(main.summary, true)}\n`;
      }
      if (leadFields.value.mutualConnections && lead.searchResult) {
        const mutualBadge = lead.searchResult.spotlightBadges?.find(b => b.id === 'SECOND_DEGREE_CONNECTION');
        if (mutualBadge) {
          leadInfo += `Mutual Connections: ${mutualBadge.displayValue}\n`;
        }
      }
      if (leadFields.value.recentActivity && lead.searchResult) {
        const activityBadge = lead.searchResult.spotlightBadges?.find(b => b.id === 'POSTED_ON_LINKEDIN');
        if (activityBadge) {
          leadInfo += `Recent Activity: ${activityBadge.displayValue}\n`;
        }
      }
      sections.push(leadInfo.trim());
    }

    if (selectedPositionId.value !== null) {
      const pos = main?.positions.find(p => p.posId === selectedPositionId.value);
      if (pos) {
        let posInfo = '### CURRENT POSITION\n';
        if (leadFields.value.position.title) posInfo += `Title: ${pos.title}\n`;
        if (leadFields.value.position.companyName) posInfo += `Company: ${pos.companyName}\n`;
        if (leadFields.value.position.industry) {
          const industry = pos.companyUrnResolutionResult?.industry ||
                          (selectedCompany.value?.main?.entityUrn === pos.companyUrn ? selectedCompany.value?.main?.industry : null);
          if (industry) {
            posInfo += `Industry: ${industry}\n`;
          }
        }
        if (leadFields.value.position.location && pos.location) posInfo += `Location: ${pos.location}\n`;
        if (leadFields.value.position.startedOn && pos.startedOn) {
          const date = new Date(pos.startedOn.year, (pos.startedOn.month || 1) - 1);
          posInfo += `Started: ${getRelativeTime(date.getTime())}\n`;
        }
        if (leadFields.value.position.description && pos.description) {
          posInfo += `Description:\n${sanitizeText(pos.description, true)}\n`;
        }

        if (posInfo.trim() !== '### CURRENT POSITION') {
          sections.push(posInfo.trim());
        }
      }
    }

    if (selectedSkills.value.length > 0) {
      sections.push(`### SKILLS\n${selectedSkills.value.join(', ')}`);
    }

    if (selectedInsights.value.length > 0) {
      let insightsText = '### RECENT ACTIVITY\n\n';
      selectedInsights.value.forEach((insightId, index) => {
        const insight = lead.insights?.elements.find(e => e.insightId === insightId);
        if (!insight) return;

        let activityText = '';
        let type = '';
        const date = insight.createdAt ? getRelativeTime(insight.createdAt) : '';
        const dateStr = date ? ` (${date})` : '';

        if (insight.activityUnion?.postActivity) {
          const post = insight.activityUnion.postActivity;
          type = post.rootActivity ? 'RESHARED POST' : 'POST';
          activityText = post.message?.text || post.rootActivity?.message?.text || '';
        } else if (insight.activityUnion?.commentActivity) {
          type = 'COMMENT';
          activityText = insight.activityUnion.commentActivity.commentary?.text || '';
        }

        if (activityText) {
          insightsText += `[${type}]${dateStr}\n${sanitizeText(activityText, true)}\n`;
          if (index < selectedInsights.value.length - 1) {
            insightsText += `\n==================================================\n\n`;
          }
        }
      });
      sections.push(insightsText.trim());
    }

    if (selectedCompany.value) {
      const cMain = selectedCompany.value.main;
      const cExtra = selectedCompany.value.extra;
      let companyInfo = `### COMPANY INFO\n`;
      companyInfo += `Name: ${cMain?.name}\n`;
      if (companyFields.value.industry && cMain?.industry) companyInfo += `Industry: ${cMain.industry}\n`;
      if (companyFields.value.location && cMain?.location) companyInfo += `Location: ${cMain.location}\n`;
      if (companyFields.value.yearFounded && cMain?.yearFounded) companyInfo += `Founded: ${cMain.yearFounded}\n`;
      if (companyFields.value.type && cMain?.type) companyInfo += `Type: ${cMain.type}\n`;
      if (companyFields.value.specialties && cMain?.specialties?.length) companyInfo += `Specialties: ${cMain.specialties.join(', ')}\n`;
      if (companyFields.value.employeeCount && cExtra?.employeeDisplayCount) companyInfo += `Headcount: ${cExtra.employeeDisplayCount}\n`;
      if (companyFields.value.revenueRange && cMain?.revenueRange) {
        const { estimatedMinRevenue, estimatedMaxRevenue } = cMain.revenueRange;
        const rev = `${estimatedMinRevenue.currencyCode} ${estimatedMinRevenue.amount}${estimatedMinRevenue.unit} - ${estimatedMaxRevenue.amount}${estimatedMaxRevenue.unit}`;
        companyInfo += `Revenue: ${rev}\n`;
      }
      if (companyFields.value.description && cMain?.description) companyInfo += `Description:\n${sanitizeText(cMain.description, true)}\n`;
      sections.push(companyInfo.trim());
    }

    return sections.join('\n\n');
  };

  const generateJsonData = () => {
    const data: any = {};
    const main = lead.main;

    if (main) {
      data.leadInfo = {};
      if (leadFields.value.fullName) data.leadInfo.fullName = main.fullName;
      if (leadFields.value.headline) data.leadInfo.headline = main.headline;
      if (leadFields.value.location) data.leadInfo.location = main.location;
      if (leadFields.value.summary && main.summary) {
        data.leadInfo.summary = sanitizeText(main.summary, true);
      }
      if (leadFields.value.mutualConnections && lead.searchResult) {
        const mutualBadge = lead.searchResult.spotlightBadges?.find(b => b.id === 'SECOND_DEGREE_CONNECTION');
        if (mutualBadge) {
          data.leadInfo.mutualConnections = mutualBadge.displayValue;
        }
      }
      if (leadFields.value.recentActivity && lead.searchResult) {
        const activityBadge = lead.searchResult.spotlightBadges?.find(b => b.id === 'POSTED_ON_LINKEDIN');
        if (activityBadge) {
          data.leadInfo.recentActivitySummary = activityBadge.displayValue;
        }
      }
    }

    if (selectedPositionId.value !== null) {
      const pos = main?.positions.find(p => p.posId === selectedPositionId.value);
      if (pos) {
        data.currentPosition = {};
        if (leadFields.value.position.title) data.currentPosition.title = pos.title;
        if (leadFields.value.position.companyName) data.currentPosition.companyName = pos.companyName;
        if (leadFields.value.position.industry) {
          const industry = pos.companyUrnResolutionResult?.industry ||
                          (selectedCompany.value?.main?.entityUrn === pos.companyUrn ? selectedCompany.value?.main?.industry : null);
          if (industry) {
            data.currentPosition.industry = industry;
          }
        }
        if (leadFields.value.position.location && pos.location) data.currentPosition.location = pos.location;
        if (leadFields.value.position.startedOn && pos.startedOn) {
          const date = new Date(pos.startedOn.year, (pos.startedOn.month || 1) - 1);
          data.currentPosition.started = getRelativeTime(date.getTime());
        }
        if (leadFields.value.position.description && pos.description) {
          data.currentPosition.description = sanitizeText(pos.description, true);
        }
      }
    }

    if (selectedSkills.value.length > 0) {
      data.skills = selectedSkills.value;
    }

    if (selectedInsights.value.length > 0) {
      data.recentActivity = [];
      selectedInsights.value.forEach((insightId) => {
        const insight = lead.insights?.elements.find(e => e.insightId === insightId);
        if (!insight) return;

        let activityData: any = {};
        const date = insight.createdAt ? getRelativeTime(insight.createdAt) : '';

        if (insight.activityUnion?.postActivity) {
          const post = insight.activityUnion.postActivity;
          activityData.type = post.rootActivity ? 'RESHARED POST' : 'POST';
          activityData.text = sanitizeText(post.message?.text || post.rootActivity?.message?.text || '', true);
        } else if (insight.activityUnion?.commentActivity) {
          activityData.type = 'COMMENT';
          activityData.text = sanitizeText(insight.activityUnion.commentActivity.commentary?.text || '', true);
        }

        if (activityData.text) {
          if (date) activityData.date = date;
          data.recentActivity.push(activityData);
        }
      });
    }

    if (selectedCompany.value) {
      const cMain = selectedCompany.value.main;
      const cExtra = selectedCompany.value.extra;
      data.companyInfo = {};
      data.companyInfo.name = cMain?.name;
      if (companyFields.value.industry && cMain?.industry) data.companyInfo.industry = cMain.industry;
      if (companyFields.value.location && cMain?.location) data.companyInfo.location = cMain.location;
      if (companyFields.value.yearFounded && cMain?.yearFounded) data.companyInfo.yearFounded = cMain.yearFounded;
      if (companyFields.value.type && cMain?.type) data.companyInfo.type = cMain.type;
      if (companyFields.value.specialties && cMain?.specialties?.length) data.companyInfo.specialties = cMain.specialties;
      if (companyFields.value.employeeCount && cExtra?.employeeDisplayCount) data.companyInfo.headcount = cExtra.employeeDisplayCount;
      if (companyFields.value.revenueRange && cMain?.revenueRange) {
        const { estimatedMinRevenue, estimatedMaxRevenue } = cMain.revenueRange;
        data.companyInfo.revenue = `${estimatedMinRevenue.currencyCode} ${estimatedMinRevenue.amount}${estimatedMinRevenue.unit} - ${estimatedMaxRevenue.amount}${estimatedMaxRevenue.unit}`;
      }
      if (companyFields.value.description && cMain?.description) {
        data.companyInfo.description = sanitizeText(cMain.description, true);
      }
    }

    return data;
  };

  const generateTitle = () => {
    const main = lead.main;
    const pos = main?.positions.find(p => p.posId === selectedPositionId.value);

    return generateLeadTitle({
      fullName: main?.fullName,
      positionTitle: pos?.title,
      companyName: pos?.companyName,
      targetValue: selectedTarget.value,
      stateValue: selectedState.value,
    });
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
    const settings: CopyLeadSettings = {
      leadFields: leadFields.value,
      companyFields: companyFields.value,
      selectedTarget: selectedTarget.value,
      selectedState: selectedState.value,
      prefix: prefix.value,
      viewMode: viewMode.value,
      wrapText: wrapText.value,
    };
    await browser.storage.local.set({ copyLeadSettings: settings });

    isCopied.value = true;
    if (copyTimeout.value) clearTimeout(copyTimeout.value);
    copyTimeout.value = setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  };

  const toggleInsight = (id: string) => {
    const index = selectedInsights.value.indexOf(id);
    if (index === -1) selectedInsights.value.push(id);
    else selectedInsights.value.splice(index, 1);
  };

  const toggleSkill = (name: string) => {
    const index = selectedSkills.value.indexOf(name);
    if (index === -1) selectedSkills.value.push(name);
    else selectedSkills.value.splice(index, 1);
  };

  return {
    currentStep,
    totalSteps,
    leadFields,
    selectedPositionId,
    currentPositions,
    selectedInsights,
    selectedSkills,
    companyFields,
    selectedCompany,
    isLoadingCompany,
    capturedCompanyUrns,
    isCopied,
    targets: titleTargets,
    states: titleStates,
    selectedTarget,
    selectedState,
    prefix,
    nextStep,
    prevStep,
    generateCopyText,
    generateJsonData,
    generateTitle,
    copyToClipboard,
    toggleInsight,
    toggleSkill,
    viewMode,
    viewOptions,
    wrapText,
  };
}
