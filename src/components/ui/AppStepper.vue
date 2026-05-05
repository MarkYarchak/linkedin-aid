<script lang="ts" setup>
interface Props {
  currentStep: number;
  totalSteps: number;
}

defineProps<Props>();
</script>

<template>
  <div class="stepper">
    <template v-for="step in totalSteps" :key="step">
      <div :class="['step', { active: currentStep === step, completed: currentStep > step }]">
        <span v-if="currentStep > step" class="check">✓</span>
        <span v-else>{{ step }}</span>
      </div>
      <div
        v-if="step < totalSteps"
        :class="['step-line', { completed: currentStep > step }]"
      ></div>
    </template>
  </div>
</template>

<style scoped>
.stepper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
  padding: 0 4px;
}

.step {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f3f4f6;
  border: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  z-index: 1;
  transition: all 0.2s ease;
}

.step.active {
  background: #fff;
  border-color: #0a66c2;
  color: #0a66c2;
  box-shadow: 0 0 0 4px rgba(10, 102, 194, 0.1);
}

.step.completed {
  background: #057642;
  border-color: #057642;
  color: white;
}

.step-line {
  flex: 1;
  height: 2px;
  background: #e5e7eb;
  margin: 0 8px;
  transition: background-color 0.3s ease;
}

.step-line.completed {
  background: #057642;
}

.check {
  font-size: 1rem;
}
</style>
