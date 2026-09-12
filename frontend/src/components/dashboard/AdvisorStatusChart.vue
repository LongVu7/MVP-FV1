<template>
  <div class="chart-container bg-white dark:bg-gray-800 border rounded shadow-sm p-4 col-span-1 md:col-span-2">
    <h3 class="text-lg font-semibold mb-4">Thống kê tình trạng xử lý data</h3>
    <DataTable :value="statusByAdvisor" dataKey="advisorId" responsiveLayout="scroll" :paginator="true" :rows="10" scrollable scrollHeight="400px">
      <Column field="advisorName" header="Tư vấn" frozen class="font-semibold"></Column>
      <Column field="processed" header="Tổng xử lý" class="font-semibold">
        <template #body="{ data }">
          <span class="font-bold">{{ data.processed ?? 0 }}</span>
        </template>
      </Column>
      <Column field="paymentCompletedNb" header="Đã đóng phí (NB)"></Column>
      <Column field="applicationSubmitted" header="Đã nộp hồ sơ"></Column>
      <Column field="considering" header="Cân nhắc"></Column>
      <Column field="interested" header="Quan tâm"></Column>
      <Column field="scheduledCallback" header="Hẹn gọi lại"></Column>
      <Column field="noAnswer" header="Không bắt máy"></Column>
      <Column field="unreachable" header="Không liên lạc được"></Column>
      <Column field="notInterested" header="Không quan tâm"></Column>
      <Column field="wrongNumber" header="Sai số"></Column>

      <!-- Footer total row — aggregates the FULL dataset, not just visible page -->
      <ColumnGroup type="footer">
        <Row>
          <Column footer="Tổng" frozen :colspan="1" class="font-bold" footerStyle="font-weight: bold" />
          <Column :footer="totals.processed" footerStyle="font-weight: bold" />
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
import { computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'

const props = defineProps({
  statusByAdvisor: {
    type: Array,
    default: () => []
  }
})

const STATUS_FIELDS = [
  'processed',
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
  return props.statusByAdvisor.reduce((acc, row) => {
    for (const f of STATUS_FIELDS) {
      acc[f] += row[f] ?? 0
    }
    return acc
  }, seed)
})
</script>
