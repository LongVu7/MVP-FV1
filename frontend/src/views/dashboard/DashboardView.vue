<template>
  <div class="dashboard-view p-4">
    <div class="header mb-4">
      <h2>Dashboard Report</h2>
    </div>

    <!-- Filters -->
    <DashboardFilters @filter-change="handleFilterChange" :loading="loading" />

    <div v-if="loading" class="text-center mt-4">
      <ProgressSpinner />
    </div>
    
    <div v-else-if="error" class="text-red-500 mt-4 text-center">
      {{ error }}
    </div>
    
    <div v-else-if="data" class="dashboard-content mt-4">
      <!-- Summary Cards -->
      <DashboardSummary :summary="data.summary" />
      
      <!-- Charts Section -->
      <div class="charts-grid mt-4">
        <TimelineChart :timeline="data.timeline" />
        <MajorChart :byMajor="data.byMajor" />
        <RegionChart :byRegion="data.byRegion" />
        <SourceChart :bySource="data.bySource" />
        <AdvisorStatusChart :statusByAdvisor="data.statusByAdvisor" />
        <AdvisorRatesChart :ratesByAdvisor="data.ratesByAdvisor" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDashboard } from '@/composables/useDashboard'
import DashboardFilters from '@/components/dashboard/DashboardFilters.vue'
import DashboardSummary from '@/components/dashboard/DashboardSummary.vue'
import TimelineChart from '@/components/dashboard/TimelineChart.vue'
import MajorChart from '@/components/dashboard/MajorChart.vue'
import RegionChart from '@/components/dashboard/RegionChart.vue'
import SourceChart from '@/components/dashboard/SourceChart.vue'
import AdvisorStatusChart from '@/components/dashboard/AdvisorStatusChart.vue'
import AdvisorRatesChart from '@/components/dashboard/AdvisorRatesChart.vue'

import ProgressSpinner from 'primevue/progressspinner'

const { data, loading, error, fetchDashboard } = useDashboard()

const handleFilterChange = (filters) => {
  fetchDashboard(filters)
}

// Initial fetch with default filters is handled by DashboardFilters emitting on mount
</script>

<style scoped>
.dashboard-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}
@media (min-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
