import { ref, computed, onMounted, watch } from 'vue';
import { companyService } from '@/services/company-service';
import { titleTargets, titleStates, generateLeadTitle } from '@/helpers/title-helper';
import { parseLinkedInUrn } from '@/helpers/urn';
import { browser } from 'wxt/browser';
import type { Lead } from '@/types/lead/lead';
import type { Company } from '@/types/company/company';
import type { CopyLeadSettings } from '@/types/copy-lead-settings';

export function useCopyLead(lead: Lead, emit: (event: 'close') => void) {
  const currentStep = ref(1);
  const totalSteps = 5;

  // Lead Fields
  const leadFields = ref({
    fullName: true,
    headline: true,
    location: true,
    summary: true,
  });

  // Positions
  const selectedPositionUrn = ref<string>('');

  const currentPositions = computed(() => {
    return lead.main?.positions?.filter(p => p.current) || [];
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
    }

    // Set default position
    if (lead.main?.defaultPosition) {
      const defPos = lead.main.defaultPosition;
      const found = lead.main.positions.find(p => p.posId === defPos.posId);
      if (found) {
        selectedPositionUrn.value = found.companyUrn || '';
      }
    } else if (currentPositions.value.length > 0) {
      selectedPositionUrn.value = currentPositions.value[0].companyUrn || '';
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
        leadInfo += `Summary:\n${main.summary}\n`;
      }
      sections.push(leadInfo.trim());
    }

    if (selectedPositionUrn.value) {
      const pos = main?.positions.find(p => p.companyUrn === selectedPositionUrn.value);
      if (pos) {
        sections.push(`### CURRENT POSITION\n${pos.title} at ${pos.companyName}`);
      }
    }

    if (selectedSkills.value.length > 0) {
      sections.push(`### SKILLS\n${selectedSkills.value.join(', ')}`);
    }

    if (selectedInsights.value.length > 0) {
      let insightsText = '### RECENT ACTIVITY / POST(S)\n\n';
      selectedInsights.value.forEach((insightId, index) => {
        const insight = lead.insights?.elements.find(e => e.insightId === insightId);
        if (insight?.activityUnion?.postActivity?.message?.text) {
          insightsText += `${insight.activityUnion.postActivity.message.text}\n`;
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
      let companyInfo = `### COMPANY INFO (${cMain?.name})\n`;
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
      if (companyFields.value.description && cMain?.description) companyInfo += `Description:\n${cMain.description}\n`;
      sections.push(companyInfo.trim());
    }

    return sections.join('\n\n');
  };

  const generateTitle = () => {
    const main = lead.main;
    const pos = main?.positions.find(p => p.companyUrn === selectedPositionUrn.value);

    return generateLeadTitle({
      fullName: main?.fullName,
      positionTitle: pos?.title,
      companyName: pos?.companyName,
      targetValue: selectedTarget.value,
      stateValue: selectedState.value,
    });
  };

  const copyToClipboard = async () => {
    const text = generateCopyText();
    await navigator.clipboard.writeText(text);

    // Save settings
    const settings: CopyLeadSettings = {
      leadFields: leadFields.value,
      companyFields: companyFields.value,
      selectedTarget: selectedTarget.value,
      selectedState: selectedState.value,
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
    selectedPositionUrn,
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
    nextStep,
    prevStep,
    generateCopyText,
    generateTitle,
    copyToClipboard,
    toggleInsight,
    toggleSkill,
  };
}
