<template>
  <div class="chart-container bg-white dark:bg-gray-800 border rounded shadow-sm p-4 col-span-1 md:col-span-2">
    <h3 class="text-lg font-semibold mb-4">2. Biểu đồ tình trạng xử lý data</h3>
    
    <div class="chart-wrapper" style="min-height: 400px;">
      <Chart type="bar" :data="chartData" :options="chartOptions" class="h-full w-full" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Chart from 'primevue/chart'
import { ADVISOR_STATUS_CONFIG } from '@/constants/report'

const props = defineProps({
  statusByAdvisor: {
    type: Array,
    default: () => []
  }
})

const chartData = computed(() => {
  const labels = props.statusByAdvisor.map(a => a.advisorName || 'Unknown')
  const mapData = (field) => props.statusByAdvisor.map(a => a[field] || 0)

  return {
    labels,
    datasets: ADVISOR_STATUS_CONFIG.map(status => ({
      label: status.label,
      data: mapData(status.key),
      backgroundColor: status.color
    }))
  }
})

const chartOptions = {
  maintainAspectRatio: false,
  aspectRatio: 0.8,
  plugins: {
    legend: {
      position: 'bottom'
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    x: {
      stacked: true,
      grid: {
        display: false
      }
    },
    y: {
      stacked: true,
      beginAtZero: true
    }
  }
}
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
}
</style>
