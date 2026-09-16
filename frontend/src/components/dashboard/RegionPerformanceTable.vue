<template>
  <div class="chart-container bg-white dark:bg-gray-800 border rounded shadow-sm p-4 col-span-1 md:col-span-2">
    <h3 class="text-lg font-semibold mb-4">Thống kê tình trạng theo Tỉnh/TP</h3>
    <DataTable :value="regionPerformance" dataKey="regionGroup" responsiveLayout="scroll">
      <Column v-for="col in COLUMNS" :key="col.field" :field="col.isRate ? undefined : col.field" :header="col.header"
        :class="col.class">
        <template #body="{ data }">
          <span :class="col.class">{{ col.isRate ? data[col.field] + '%' : data[col.field] }}</span>
        </template>
      </Column>

      <ColumnGroup type="footer">
        <Row>
          <Column footer="Total" class="font-bold" footerStyle="font-weight: bold" />
          <Column v-for="col in COLUMNS.slice(1)" :key="'footer-' + col.field"
            :footer="col.isRate ? totals[col.field] + '%' : totals[col.field]"
            :footerStyle="col.bold ? 'font-weight: bold' : undefined" />
        </Row>
      </ColumnGroup>
    </DataTable>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'

const props = defineProps({
  regionPerformance: {
    type: Array,
    default: () => []
  }
})

const COLUMNS = [
  { field: 'regionLabel', header: 'Tỉnh', class: 'font-semibold' },
  { field: 'totalProcessed', header: 'Tổng data xử lý' },
  { field: 'interacted', header: 'Tương tác được' },
  { field: 'interactionRate', header: '% tương tác được / Tổng data xử lý', isRate: true },
  { field: 'nb', header: 'Đã đóng phí (NB)' },
  { field: 'nbRate', header: 'Tỷ lệ NB / Tương tác được', isRate: true },
  { field: 'notInteracted', header: 'Chưa tương tác được' },
  { field: 'notInteractedRate', header: '% chưa tương tác được / Tổng data xử lý', isRate: true },
  { field: 'wrongNumberRate', header: '% Sai số', isRate: true },
  { field: 'notInterestedRate', header: '% Không quan tâm', isRate: true },
  { field: 'unprocessed', header: 'Chưa xử lý' }
]

const COUNT_FIELDS = ['totalProcessed', 'interacted', 'nb', 'notInteracted', 'wrongNumber', 'notInterested', 'unprocessed']

function calcRate(num, den) {
  if (!den || den === 0) return 0
  return Number(((num / den) * 100).toFixed(2))
}

const totals = computed(() => {
  const seed = Object.fromEntries(COUNT_FIELDS.map(f => [f, 0]))

  props.regionPerformance.forEach(src => {
    COUNT_FIELDS.forEach(f => { seed[f] += src[f] || 0 })
  })

  return {
    totalProcessed: seed.totalProcessed,
    interacted: seed.interacted,
    interactionRate: calcRate(seed.interacted, seed.totalProcessed),
    nb: seed.nb,
    nbRate: calcRate(seed.nb, seed.interacted),
    notInteracted: seed.notInteracted,
    notInteractedRate: calcRate(seed.notInteracted, seed.totalProcessed),
    wrongNumberRate: calcRate(seed.wrongNumber, seed.totalProcessed),
    notInterestedRate: calcRate(seed.notInterested, seed.totalProcessed),
    unprocessed: seed.unprocessed
  }
})
</script>
