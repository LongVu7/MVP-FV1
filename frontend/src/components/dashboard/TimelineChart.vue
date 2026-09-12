<template>
  <div class="chart-container bg-white dark:bg-gray-800 border rounded shadow-sm p-4">
    <h3 class="text-lg font-semibold mb-4">Timeline (Monthly)</h3>
    <Chart type="line" :data="chartData" :options="chartOptions" class="h-80 w-full" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Chart from 'primevue/chart'

const props = defineProps({
  timeline: {
    type: Array,
    default: () => []
  }
})

const chartData = computed(() => {
  return {
    labels: props.timeline.map(t => t.month),
    datasets: [
      {
        label: 'Processed',
        data: props.timeline.map(t => t.processed),
        fill: false,
        borderColor: '#4f46e5',
        tension: 0.4
      },
      {
        label: 'Interacted',
        data: props.timeline.map(t => t.interacted),
        fill: false,
        borderColor: '#f59e0b',
        tension: 0.4
      },
      {
        label: 'NB',
        data: props.timeline.map(t => t.nb),
        fill: false,
        borderColor: '#10b981',
        tension: 0.4
      }
    ]
  }
})

const chartOptions = {
  maintainAspectRatio: false,
  aspectRatio: 0.6,
  plugins: {
    legend: {
      position: 'bottom'
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}
</script>
