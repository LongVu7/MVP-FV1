<template>
  <div class="chart-container bg-white dark:bg-gray-800 border rounded shadow-sm p-4 col-span-1 md:col-span-2">
    <h3 class="text-lg font-semibold mb-4">Thống kê tình trạng theo nguồn</h3>
    <DataTable :value="bySource" v-model:expandedRows="expandedRows" dataKey="sourceKey" responsiveLayout="scroll">
      <Column expander style="width: 3rem" />
      <Column field="sourceLabel" header="Nguồn" class="font-semibold"></Column>
      <Column field="paymentCompletedNb" header="Đã đóng phí (NB)"></Column>
      <Column field="applicationSubmitted" header="Đã nộp hồ sơ"></Column>
      <Column field="considering" header="Cân nhắc"></Column>
      <Column field="interested" header="Quan tâm"></Column>
      <Column field="scheduledCallback" header="Hẹn gọi lại"></Column>
      <Column field="noAnswer" header="Không bắt máy"></Column>
      <Column field="unreachable" header="Không liên lạc được"></Column>
      <Column field="notInterested" header="Không quan tâm"></Column>
      <Column field="wrongNumber" header="Sai số"></Column>
      <Column field="totalProcessed" header="Tổng data xử lý" class="font-bold"></Column>

      <!-- Expandable Source Details -->
      <template #expansion="slotProps">
        <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded my-2 ml-10 border border-gray-100 dark:border-gray-700">
          <DataTable :value="slotProps.data.details" dataKey="sourceDetailKey">
            <Column field="sourceDetailLabel" header="Chi tiết Nguồn" class="font-semibold text-gray-600"></Column>
            <Column field="paymentCompletedNb" header="Đã đóng phí (NB)"></Column>
            <Column field="applicationSubmitted" header="Đã nộp hồ sơ"></Column>
            <Column field="considering" header="Cân nhắc"></Column>
            <Column field="interested" header="Quan tâm"></Column>
            <Column field="scheduledCallback" header="Hẹn gọi lại"></Column>
            <Column field="noAnswer" header="Không bắt máy"></Column>
            <Column field="unreachable" header="Không liên lạc được"></Column>
            <Column field="notInterested" header="Không quan tâm"></Column>
            <Column field="wrongNumber" header="Sai số"></Column>
            <Column field="totalProcessed" header="Tổng data xử lý" class="font-bold text-gray-700"></Column>
          </DataTable>
        </div>
      </template>

      <!-- Footer Tổng row -->
      <ColumnGroup type="footer">
        <Row>
          <Column footer="Total" frozen :colspan="2" class="font-bold" footerStyle="font-weight: bold" />
          <Column :footer="totals.totalProcessed" footerStyle="font-weight: bold" />
          <Column :footer="totals.paymentCompletedNb" />
          <Column :footer="totals.applicationSubmitted" />
          <Column :footer="totals.considering" />
          <Column :footer="totals.interested" />
          <Column :footer="totals.scheduledCallback" />
          <Column :footer="totals.noAnswer" />
          <Column :footer="totals.unreachable" />
          <Column :footer="totals.notInterested" />
          <Column :footer="totals.wrongNumber" />
        </Row>
      </ColumnGroup>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'

const props = defineProps({
  bySource: {
    type: Array,
    default: () => []
  }
})

const expandedRows = ref([])

const STATUS_FIELDS = [
  'totalProcessed',
  'paymentCompletedNb',
  'applicationSubmitted',
  'considering',
  'interested',
  'scheduledCallback',
  'noAnswer',
  'unreachable',
  'notInterested',
  'wrongNumber'
]

const totals = computed(() => {
  const seed = Object.fromEntries(STATUS_FIELDS.map(f => [f, 0]))
  return props.bySource.reduce((acc, sourceGroup) => {
    for (const f of STATUS_FIELDS) {
      acc[f] += sourceGroup[f] ?? 0
    }
    return acc
  }, seed)
})
</script>
