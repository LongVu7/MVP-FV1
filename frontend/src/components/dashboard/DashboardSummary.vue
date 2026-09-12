<template>
  <div class="dashboard-summary grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div class="stat-card">
      <div class="stat-title">Total Inquiries</div>
      <div class="stat-value">{{ summary?.total || 0 }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-title">Processed</div>
      <div class="stat-value">{{ summary?.processed || 0 }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-title">Interacted</div>
      <div class="stat-value">{{ summary?.interacted || 0 }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-title">Interaction Rate</div>
      <div class="stat-value">{{ summary?.interactionRate || 0 }}%</div>
    </div>
    <div class="stat-card">
      <div class="stat-title">NB (Payment Completed)</div>
      <div class="stat-value">{{ summary?.nb || 0 }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-title">NB Rate</div>
      <div class="stat-value">{{ summary?.nbRate || 0 }}%</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  summary: {
    type: Object,
    default: () => ({})
  }
})
</script>

<style scoped>
.stat-card {
  background-color: var(--p-content-background, #fff);
  border: 1px solid var(--p-surface-200, #e2e8f0);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.stat-title {
  font-size: 0.875rem;
  color: var(--p-text-secondary-color, #64748b);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--p-text-color, #1e293b);
}
</style>
