<template>
  <div class="chart-container bg-white dark:bg-gray-800 border rounded shadow-sm p-4 flex flex-col">
    <h3 class="text-lg font-semibold mb-4">Major Interest (Processed)</h3>
    <div class="flex-1 flex justify-center items-center min-h-[300px]">
      <Chart type="doughnut" :data="chartData" :options="chartOptions" class="w-[80%] max-w-[400px]" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Chart from 'primevue/chart'

const props = defineProps({
  byMajor: {
    type: Array,
    default: () => []
  }
})

const chartData = computed(() => {
  return {
    labels: props.byMajor.map(m => m.majorLabel),
    datasets: [
      {
        data: props.byMajor.map(m => m.processed),
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'
        ],
        hoverBackgroundColor: [
          '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0d9488'
        ]
      }
    ]
  }
})

const chartOptions = {
  cutout: '60%',
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}
</script>
