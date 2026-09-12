<template>
  <div class="chart-container bg-white dark:bg-gray-800 border rounded shadow-sm p-4 col-span-1 md:col-span-2">
    <h3 class="text-lg font-semibold mb-4">Source Data Drill-down</h3>
    <DataTable :value="bySource" v-model:expandedRows="expandedRows" dataKey="sourceKey" responsiveLayout="scroll">
      <Column expander style="width: 3rem" />
      <Column field="sourceLabel" header="Source"></Column>
      <Column field="total" header="Total (Created)"></Column>
      <Column field="processed" header="Processed"></Column>
      <Column field="interacted" header="Interacted"></Column>
      <Column field="interactionRate" header="Interaction Rate">
        <template #body="slotProps">
          {{ slotProps.data.interactionRate }}%
        </template>
      </Column>
      <Column field="nb" header="NB"></Column>
      <Column field="nbRate" header="NB Rate">
        <template #body="slotProps">
          {{ slotProps.data.nbRate }}%
        </template>
      </Column>
      <template #expansion="slotProps">
        <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded my-2 ml-10 border border-gray-100 dark:border-gray-700">
          <h4 class="text-sm font-semibold mb-2">Source Details for {{ slotProps.data.sourceLabel }}</h4>
          <DataTable :value="slotProps.data.details" dataKey="sourceDetailKey">
            <Column field="sourceDetailLabel" header="Detail"></Column>
            <Column field="total" header="Total"></Column>
            <Column field="processed" header="Processed"></Column>
            <Column field="interacted" header="Interacted"></Column>
            <Column field="interactionRate" header="Int. Rate">
              <template #body="detailProps">
                {{ detailProps.data.interactionRate }}%
              </template>
            </Column>
            <Column field="nb" header="NB"></Column>
            <Column field="nbRate" header="NB Rate">
              <template #body="detailProps">
                {{ detailProps.data.nbRate }}%
              </template>
            </Column>
          </DataTable>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

defineProps({
  bySource: {
    type: Array,
    default: () => []
  }
})

const expandedRows = ref([])
</script>
