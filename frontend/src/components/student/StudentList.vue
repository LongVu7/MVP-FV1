<template>
  <div class="table-container">
    <DataTable
      :value="students"
      lazy
      :paginator="true"
      :rows="pagination?.limit || 20"
      :first="((pagination?.page || 1) - 1) * (pagination?.limit || 20)"
      :totalRecords="pagination?.totalCount || 0"
      :rowsPerPageOptions="[10, 20, 50, 100]"
      :loading="loading"
      @page="onPage"
      dataKey="id"
      removableSort
      stripedRows
      showGridlines
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} students"
    >
      <template #header>
        <div class="table-toolbar">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText placeholder="Search students (phone, email)..." @input="onSearch" :value="searchQuery" class="search-input" />
          </IconField>
        </div>
      </template>

      <template #empty>
        <div class="empty-state">
          <i class="pi pi-inbox"></i>
          <h3>No students found</h3>
          <p>Get started by creating a new student or importing from Excel.</p>
          <div class="empty-actions">
            <Button label="New Student" icon="pi pi-plus" @click="$router.push('/students/new')" />
          </div>
        </div>
      </template>

      <template #loading>
        <div class="loading-state">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
          <p>Loading students...</p>
        </div>
      </template>

      <Column field="fullName" header="Full Name" sortable style="min-width: 180px">
        <template #body="{ data }"><span class="student-name">{{ data.fullName }}</span></template>
      </Column>
      <Column field="email" header="Email" sortable style="min-width: 200px">
        <template #body="{ data }">
          <span v-if="data.email" class="email-text">{{ data.email }}</span>
          <span v-else class="null-text">—</span>
        </template>
      </Column>
      <Column field="gender" header="Gender" sortable style="width: 100px">
        <template #body="{ data }">
          <Tag v-if="data.gender" :value="data.gender" :severity="genderSeverity(data.gender)" />
          <span v-else class="null-text">—</span>
        </template>
      </Column>
      <Column field="mobile" header="Mobile" sortable style="width: 140px">
        <template #body="{ data }">
          <span v-if="data.mobile">{{ data.mobile }}</span>
          <span v-else class="null-text">—</span>
        </template>
      </Column>
      <Column field="birthDate" header="Birth Date" sortable style="width: 130px">
        <template #body="{ data }">{{ formatDate(data.birthDate) }}</template>
      </Column>
      <Column field="gpa" header="GPA" sortable style="width: 80px">
        <template #body="{ data }">
          <span v-if="data.gpa != null" class="gpa-badge">{{ Number(data.gpa).toFixed(2) }}</span>
          <span v-else class="null-text">—</span>
        </template>
      </Column>
      <Column header="School" sortable style="min-width: 160px">
        <template #body="{ data }">
          <span v-if="data.school">{{ data.school.name }}</span>
          <span v-else class="null-text">—</span>
        </template>
      </Column>
      <Column field="primaryAddressCity" header="City" sortable style="width: 140px">
        <template #body="{ data }">
          <span v-if="data.primaryAddressCity">{{ data.primaryAddressCity }}</span>
          <span v-else class="null-text">—</span>
        </template>
      </Column>
      <Column field="createdAt" header="Created" sortable style="width: 160px">
        <template #body="{ data }"><span class="date-text">{{ formatDateTime(data.createdAt) }}</span></template>
      </Column>
      <Column header="Actions" style="width: 120px" :exportable="false" frozen alignFrozen="right">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button icon="pi pi-pencil" rounded text severity="info" size="small" v-tooltip.top="'Edit'" @click="$router.push('/students/' + data.id)" />
            <Button icon="pi pi-trash" rounded text severity="danger" size="small" v-tooltip.top="'Delete'" @click="confirmDeleteAction(data)" />
          </div>
        </template>
      </Column>
    </DataTable>
    
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

const props = defineProps({
  students: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  pagination: { type: Object, default: null }
})

const emit = defineEmits(['page-change', 'search', 'delete'])

const router = useRouter()
const confirm = useConfirm()

const searchQuery = ref('')
let searchTimeout = null

// event.first: skip value, event.rows: limit value
const onPage = (event) => {
  const page = Math.floor(event.first / event.rows) + 1
  emit('page-change', { page, limit: event.rows })
}

const onSearch = (e) => {
  searchQuery.value = e.target.value
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    emit('search', searchQuery.value)
  }, 500)
}

const confirmDeleteAction = (student) => {
  confirm.require({
    message: `Are you sure you want to delete "${student.fullName}"? This action cannot be undone.`,
    header: 'Delete Student',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancel',
    rejectProps: { severity: 'secondary', text: true },
    acceptLabel: 'Delete',
    acceptProps: { severity: 'danger' },
    accept: () => {
      emit('delete', student.id)
    }
  })
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const genderSeverity = (gender) => {
  if (gender === 'Male') return 'info'
  if (gender === 'Female') return 'warn'
  return 'secondary'
}
</script>

<style scoped>
.table-container { background: var(--p-content-background); border-radius: 12px; overflow: hidden; border: 1px solid var(--p-surface-200); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06); }
.table-toolbar { display: flex; justify-content: flex-end; }
.search-input { width: 280px; }
.student-name { font-weight: 600; color: var(--p-text-color); }
.email-text { color: var(--p-primary-color); font-size: 0.9rem; }
.null-text { color: var(--p-text-muted-color); }
.gpa-badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 6px; background: var(--p-primary-50); color: var(--p-primary-600); font-weight: 600; font-size: 0.85rem; }
.date-text { font-size: 0.85rem; color: var(--p-text-muted-color); }
.action-buttons { display: flex; gap: 0.25rem; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 3rem 1rem; gap: 0.5rem; color: var(--p-text-muted-color); }
.empty-state i { font-size: 3rem; margin-bottom: 0.5rem; opacity: 0.4; }
.empty-state h3 { margin: 0; font-size: 1.15rem; font-weight: 600; color: var(--p-text-color); }
.empty-state p { margin: 0; font-size: 0.9rem; }
.empty-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.loading-state { display: flex; flex-direction: column; align-items: center; padding: 2rem; gap: 0.75rem; color: var(--p-text-muted-color); }
@media (max-width: 768px) {
  .search-input { width: 100%; }
}
</style>
