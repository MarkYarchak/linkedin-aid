import { ref, computed, onMounted, watch } from 'vue';
import { companyService } from '@/services/company-service';
import { parseLinkedInUrn } from '@/helpers/urn';
import { browser } from 'wxt/browser';
import type { Lead } from '@/types/lead/lead';
import type { Company } from '@/types/company/company';
import type { CopyLeadSettings } from '@/types/copy-lead-settings';

export function useCopyLead(lead: Lead, emit: (event: 'close') => void) {
  const currentStep = ref(1);
  const totalSteps = 4;

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
    let text = '';
    const main = lead.main;

    if (main) {
      if (leadFields.value.fullName) text += `Name: ${main.fullName}\n`;
      if (leadFields.value.headline) text += `Headline: ${main.headline}\n`;
      if (leadFields.value.location) text += `Location: ${main.location}\n`;
      if (leadFields.value.summary && main.summary) text += `Summary: ${main.summary}\n`;
    }

    if (selectedPositionUrn.value) {
      const pos = main?.positions.find(p => p.companyUrn === selectedPositionUrn.value);
      if (pos) {
        text += `Current Position: ${pos.title} at ${pos.companyName}\n`;
      }
    }

    if (selectedSkills.value.length > 0) {
      text += `Skills: ${selectedSkills.value.join(', ')}\n`;
    }

    if (selectedInsights.value.length > 0) {
      text += `Insights:\n`;
      selectedInsights.value.forEach(insightId => {
        const insight = lead.insights?.elements.find(e => e.insightId === insightId);
        if (insight?.activityUnion?.postActivity?.message?.text) {
          text += `- ${insight.activityUnion.postActivity.message.text}\n`;
        }
      });
    }

    if (selectedCompany.value) {
      const cMain = selectedCompany.value.main;
      const cExtra = selectedCompany.value.extra;
      text += `\nCompany Info (${cMain?.name}):\n`;
      if (companyFields.value.description && cMain?.description) text += `Description: ${cMain.description}\n`;
      if (companyFields.value.industry && cMain?.industry) text += `Industry: ${cMain.industry}\n`;
      if (companyFields.value.location && cMain?.location) text += `Location: ${cMain.location}\n`;
      if (companyFields.value.yearFounded && cMain?.yearFounded) text += `Founded: ${cMain.yearFounded}\n`;
      if (companyFields.value.type && cMain?.type) text += `Type: ${cMain.type}\n`;
      if (companyFields.value.specialties && cMain?.specialties?.length) text += `Specialties: ${cMain.specialties.join(', ')}\n`;
      if (companyFields.value.employeeCount && cExtra?.employeeDisplayCount) text += `Headcount: ${cExtra.employeeDisplayCount}\n`;
      if (companyFields.value.revenueRange && cMain?.revenueRange) {
        const { estimatedMinRevenue, estimatedMaxRevenue } = cMain.revenueRange;
        const rev = `${estimatedMinRevenue.currencyCode} ${estimatedMinRevenue.amount}${estimatedMinRevenue.unit} - ${estimatedMaxRevenue.amount}${estimatedMaxRevenue.unit}`;
        text += `Revenue: ${rev}\n`;
      }
    }

    return text;
  };

  const copyToClipboard = async () => {
    const text = generateCopyText();
    await navigator.clipboard.writeText(text);

    // Save settings
    const settings: CopyLeadSettings = {
      leadFields: leadFields.value,
      companyFields: companyFields.value,
    };
    await browser.storage.local.set({ copyLeadSettings: settings });

    emit('close');
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
    nextStep,
    prevStep,
    generateCopyText,
    copyToClipboard,
    toggleInsight,
    toggleSkill,
  };
}
