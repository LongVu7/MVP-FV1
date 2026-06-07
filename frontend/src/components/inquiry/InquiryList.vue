<template>
  <div class="table-container">
    <DataTable
      :value="inquiries"
      :paginator="true"
      :rows="20"
      :rowsPerPageOptions="[10, 20, 50]"
      :loading="loading"
      v-model:filters="filters"
      :globalFilterFields="['statusGeneral', 'priority', 'leadSource', 'description']"
      dataKey="id"
      removableSort
      stripedRows
      showGridlines
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} inquiries"
    >
      <template #header>
        <div class="table-toolbar">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText placeholder="Search inquiries..." @input="onGlobalFilter" :value="filters.global.value" class="search-input" />
          </IconField>
        </div>
      </template>

      <template #empty>
        <div class="empty-state">
          <i class="pi pi-inbox"></i>
          <h3>No inquiries found</h3>
          <p>Create a new inquiry to get started.</p>
          <Button label="New Inquiry" icon="pi pi-plus" @click="$router.push('/inquiries/new')" />
        </div>
      </template>
      
      <Column header="Students" style="min-width: 150px">
        <template #body="{ data }">
          <span v-if="data.students && data.students.length">{{ data.students.map(s => s.fullName).join(', ') }}</span>
          <span v-else class="null-text">—</span>
        </template>
      </Column>
      <Column field="statusGeneral" header="Status" sortable style="width: 120px">
        <template #body="{ data }">
          <Tag v-if="data.statusGeneral" :value="data.statusGeneral" :severity="statusSeverity(data.statusGeneral)" />
          <span v-else class="null-text">—</span>
        </template>
      </Column>
      <Column field="priority" header="Priority" sortable style="width: 100px">
        <template #body="{ data }">
          <span v-if="data.priority">{{ data.priority }}</span>
          <span v-else class="null-text">—</span>
        </template>
      </Column>
      <Column field="leadSource" header="Lead Source" sortable style="width: 130px">
        <template #body="{ data }">
          <span v-if="data.leadSource">{{ data.leadSource }}</span>
          <span v-else class="null-text">—</span>
        </template>
      </Column>
      <Column header="Assigned Account" style="min-width: 150px">
        <template #body="{ data }">
          <span v-if="data.assignedTo">{{ data.assignedTo.fullName }}</span>
          <span v-else class="null-text">—</span>
        </template>
      </Column>
      <Column field="description" header="Description" style="min-width: 200px">
        <template #body="{ data }">
          <span v-if="data.description" class="desc-text">{{ data.description.length > 60 ? data.description.substring(0, 60) + '...' : data.description }}</span>
          <span v-else class="null-text">—</span>
        </template>
      </Column>
      <Column field="createdAt" header="Created" sortable style="width: 150px">
        <template #body="{ data }">
          <span class="date-text">{{ formatDate(data.createdAt) }}</span>
        </template>
      </Column>
      <Column header="Actions" style="width: 120px" :exportable="false" frozen alignFrozen="right">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button icon="pi pi-pencil" rounded text severity="info" size="small" v-tooltip.top="'Edit'" @click="$router.push('/inquiries/' + data.id)" />
            <Button icon="pi pi-trash" rounded text severity="danger" size="small" v-tooltip.top="'Delete'" @click="confirmDeleteAction(data)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { useInquiry } from '@/composables/useInquiry'

const router = useRouter()
const toast = useToast()
const confirm = useConfirm()
const { inquiries, loading, fetchInquiries, deleteInquiry } = useInquiry()

const filters = ref({ global: { value: null, matchMode: 'contains' } })

onMounted(() => {
  loadData()
})

const loadData = async () => {
  try {
    await fetchInquiries()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load inquiries', life: 5000 })
  }
}

const confirmDeleteAction = (inquiry) => {
  confirm.require({
    message: `Are you sure you want to delete inquiry #${inquiry.id}? Student records will be preserved.`,
    header: 'Delete Inquiry',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancel',
    rejectProps: { severity: 'secondary', text: true },
    acceptLabel: 'Delete',
    acceptProps: { severity: 'danger' },
    accept: async () => {
      try {
        await deleteInquiry(inquiry.id)
        toast.add({ severity: 'success', summary: 'Deleted', detail: `Inquiry #${inquiry.id} deleted`, life: 3000 })
        await loadData()
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete inquiry', life: 5000 })
      }
    }
  })
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const statusSeverity = (status) => {
  const map = { new: 'info', assigned: 'warn', inProcess: 'warn', converted: 'success', dead: 'danger' }
  return map[status] || 'secondary'
}

const onGlobalFilter = (e) => {
  filters.value.global.value = e.target.value
}
</script>

<style scoped>
.table-container { background: var(--p-content-background); border-radius: 12px; overflow: hidden; border: 1px solid var(--p-surface-200); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06); }
.table-toolbar { display: flex; justify-content: flex-end; }
.search-input { width: 280px; }
.null-text { color: var(--p-text-muted-color); }
.desc-text { font-size: 0.88rem; }
.date-text { font-size: 0.85rem; color: var(--p-text-muted-color); }
.action-buttons { display: flex; gap: 0.25rem; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 3rem 1rem; gap: 0.5rem; color: var(--p-text-muted-color); }
.empty-state i { font-size: 3rem; margin-bottom: 0.5rem; opacity: 0.4; }
.empty-state h3 { margin: 0; font-size: 1.15rem; font-weight: 600; color: var(--p-text-color); }
.empty-state p { margin: 0 0 1rem 0; font-size: 0.9rem; }
</style>
