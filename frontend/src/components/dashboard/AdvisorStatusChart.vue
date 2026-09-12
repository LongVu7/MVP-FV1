<template>
  <div class="chart-container bg-white dark:bg-gray-800 border rounded shadow-sm p-4 col-span-1 md:col-span-2">
    <h3 class="text-lg font-semibold mb-4">Current Status by Advisor (Processed Cohort)</h3>
    <DataTable :value="statusByAdvisor" dataKey="advisorId" responsiveLayout="scroll" :paginator="true" :rows="10" scrollable scrollHeight="400px">
      <Column field="advisorName" header="Advisor" frozen class="font-semibold"></Column>
      <Column field="paymentCompletedNb" header="NB"></Column>
      <Column field="applicationSubmitted" header="App Sub"></Column>
      <Column field="considering" header="Considering"></Column>
      <Column field="interested" header="Interested"></Column>
      <Column field="scheduledCallback" header="Scheduled"></Column>
      <Column field="noAnswer" header="No Answer"></Column>
      <Column field="unreachable" header="Unreachable"></Column>
      <Column field="notInterested" header="Not Int"></Column>
      <Column field="wrongNumber" header="Wrong No."></Column>
    </DataTable>
  </div>
</template>

<script setup>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

defineProps({
  statusByAdvisor: {
    type: Array,
    default: () => []
  }
})
</script>
