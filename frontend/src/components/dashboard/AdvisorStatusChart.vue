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
    datasets: [
      { label: 'Đã đóng phí (NB)', data: mapData('paymentCompletedNb'), backgroundColor: '#10b981' }, // Emerald
      { label: 'Đã nộp hồ sơ', data: mapData('applicationSubmitted'), backgroundColor: '#3b82f6' }, // Blue
      { label: 'Cân nhắc', data: mapData('considering'), backgroundColor: '#f59e0b' }, // Amber
      { label: 'Quan tâm', data: mapData('interested'), backgroundColor: '#6366f1' }, // Indigo
      { label: 'Hẹn gọi lại', data: mapData('scheduledCallback'), backgroundColor: '#8b5cf6' }, // Violet
      { label: 'Không bắt máy', data: mapData('noAnswer'), backgroundColor: '#ef4444' }, // Red
      { label: 'Không liên lạc được', data: mapData('unreachable'), backgroundColor: '#f43f5e' }, // Rose
      { label: 'Không quan tâm', data: mapData('notInterested'), backgroundColor: '#9ca3af' }, // Gray 400
      { label: 'Sai số', data: mapData('wrongNumber'), backgroundColor: '#d1d5db' }, // Gray 300
    ]
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
