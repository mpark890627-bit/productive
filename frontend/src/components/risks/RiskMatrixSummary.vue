<template>
  <v-card rounded="lg" elevation="1">
    <v-card-title class="matrix-title">Risk Matrix (P x I)</v-card-title>
    <v-card-text>
      <div class="axis-label top">Impact</div>
      <div class="matrix-wrap">
        <div class="axis-label left">Probability</div>
        <div class="grid">
          <div class="cell header empty"></div>
          <div v-for="impact in [1, 2, 3, 4, 5]" :key="`h-${impact}`" class="cell header">
            {{ impact }}
          </div>

          <template v-for="probability in [5, 4, 3, 2, 1]" :key="`row-${probability}`">
            <div class="cell header">{{ probability }}</div>
            <button
              v-for="impact in [1, 2, 3, 4, 5]"
              :key="`c-${probability}-${impact}`"
              type="button"
              class="cell matrix-btn"
              :class="[
                levelClass(probability * impact),
                isSelected(probability, impact) ? 'selected' : '',
              ]"
              @click="emit('select', { probability, impact })"
            >
              {{ countOf(probability, impact) }}
            </button>
          </template>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { RiskMatrixCell } from '../../types/risk'

const props = defineProps<{
  cells: RiskMatrixCell[]
  selectedProbability: number | null
  selectedImpact: number | null
}>()

const emit = defineEmits<{
  select: [payload: { probability: number; impact: number }]
}>()

const countOf = (probability: number, impact: number) =>
  props.cells.find((cell) => cell.probability === probability && cell.impact === impact)?.count ?? 0

const isSelected = (probability: number, impact: number) =>
  props.selectedProbability === probability && props.selectedImpact === impact

const levelClass = (score: number) => {
  if (score >= 16) return 'critical'
  if (score >= 10) return 'high'
  if (score >= 5) return 'medium'
  return 'low'
}
</script>

<style scoped>
.matrix-title {
  font-size: 16px;
  font-weight: 700;
}

.matrix-wrap {
  position: relative;
  padding-left: 56px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 6px;
}

.cell {
  min-height: 38px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-outline), 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.header {
  background: rgba(var(--v-theme-surface-variant), 0.46);
}

.empty {
  border-style: dashed;
}

.matrix-btn {
  cursor: pointer;
  color: inherit;
}

.matrix-btn.low {
  background: rgba(22, 163, 74, 0.14);
}

.matrix-btn.medium {
  background: rgba(14, 116, 144, 0.14);
}

.matrix-btn.high {
  background: rgba(245, 158, 11, 0.18);
}

.matrix-btn.critical {
  background: rgba(220, 38, 38, 0.2);
}

.matrix-btn.selected {
  outline: 2px solid rgba(var(--v-theme-primary), 1);
  outline-offset: -2px;
}

.axis-label {
  color: #64748b;
  font-size: 12px;
}

.axis-label.top {
  margin-bottom: 8px;
  margin-left: 56px;
}

.axis-label.left {
  position: absolute;
  left: 0;
  top: 44%;
  transform: rotate(-90deg);
  transform-origin: left top;
}
</style>
