<template>
  <div class="chart-container bg-white dark:bg-gray-800 border rounded shadow-sm p-4 col-span-1 md:col-span-2">
    <h3 class="text-lg font-semibold mb-4">Conversion Rates by Advisor</h3>
    <DataTable :value="ratesByAdvisor" dataKey="advisorId" responsiveLayout="scroll" :paginator="true" :rows="10">
      <Column field="advisorName" header="Advisor" class="font-semibold"></Column>
      <Column field="processed" header="Processed"></Column>
      <Column field="interacted" header="Interacted"></Column>
      <Column field="interactionRate" header="Int. Rate">
        <template #body="{ data }">
          {{ data.interactionRate }}%
        </template>
      </Column>
      <Column field="nb" header="NB"></Column>
      <Column field="nbRate" header="NB Rate">
        <template #body="{ data }">
          {{ data.nbRate }}%
        </template>
      </Column>
      <Column field="notInterestedRate" header="Not Int. Rate">
        <template #body="{ data }">
          {{ data.notInterestedRate }}%
        </template>
      </Column>
      <Column field="wrongNumberRate" header="Wrong No. Rate">
        <template #body="{ data }">
          {{ data.wrongNumberRate }}%
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

defineProps({
  ratesByAdvisor: {
    type: Array,
    default: () => []
  }
})
</script>
