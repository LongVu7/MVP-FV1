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
      @sort="onSort"
      dataKey="id"
      removableSort
      stripedRows
      showGridlines
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} students"
    >
      <template #header>
        <div class="table-toolbar">
          <Select v-model="selectedBirthYear" :options="birthYearOptions" optionLabel="label" optionValue="value" placeholder="Birth Year" showClear @change="onFilterChange" class="filter-select" />
          <Select v-model="selectedOldProvinceId" :options="oldProvinces" optionLabel="name" optionValue="id" placeholder="Old Province" showClear @change="onFilterChange" class="filter-select" />

          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText placeholder="Search..." @input="onSearch" :value="searchQuery" class="search-input" />
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
      <Column field="priority" header="Priority" sortable style="width: 100px">
        <template #body="{ data }">
          <span v-if="data.priority">{{ data.priority }}</span>
          <span v-else class="null-text">—</span>
        </template>
      </Column>
      <Column field="mobile" header="Mobile" sortable style="width: 140px">
        <template #body="{ data }">
          <span v-if="data.mobile">{{ data.mobile }}</span>
          <span v-else class="null-text">—</span>
        </template>
      </Column>
      <Column field="birthDate" header="Birth Date" sortable style="width: 160px">
        <template #body="{ data }">{{ formatDate(data.birthDate) }}</template>
      </Column>
      <Column header="GPA" style="min-width: 160px">
        <template #body="{ data }">
          <span v-if="data.specializedRegister?.gpa" class="gpa-badge">{{ gpaLabel(data.specializedRegister.gpa) }}</span>
          <span v-else class="null-text">—</span>
        </template>
      </Column>
      <Column field="education.class" header="Class" sortable style="min-width: 140px">
        <template #body="{ data }">
          <span v-if="data.education?.class">{{ formatClass(data.education.class) }}</span>
          <span v-else class="null-text">—</span>
        </template>
      </Column>
      <Column field="education.school.name" header="School" sortable style="min-width: 160px">
        <template #body="{ data }">
          <span v-if="data.education?.school">{{ data.education.school.name }}</span>
          <span v-else class="null-text">—</span>
        </template>
      </Column>
      <Column field="primaryAddress" header="Primary address" sortable style="width: 140px">
        <template #body="{ data }">
          <span v-if="data.primaryAddress">{{ data.primaryAddress }}</span>
          <span v-else class="null-text">—</span>
        </template>
      </Column>
      <Column field="education.school.oldProvince.name" header="Old Province" sortable style="min-width: 140px">
        <template #body="{ data }">
          <span v-if="data.education?.school?.oldProvince">{{ data.education.school.oldProvince.name }}</span>
          <span v-else class="null-text">—</span>
        </template>
      </Column>
      <Column field="education.newProvince.name" header="New Province" sortable style="min-width: 140px">
        <template #body="{ data }">
          <span v-if="data.education?.newProvince">{{ data.education.newProvince.name }}</span>
          <span v-else class="null-text">—</span>
        </template>
      </Column>
      <Column field="education.country.name" header="Country" sortable style="min-width: 140px">
        <template #body="{ data }">
          <span v-if="data.education?.country">{{ data.education.country.name }}</span>
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
import Select from 'primevue/select'
import { useConfirm } from 'primevue/useconfirm'
import { useSchoolOptions } from '@/composables/useSchoolOptions'

import { onMounted } from 'vue'

const props = defineProps({
  students: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  pagination: { type: Object, default: null }
})

const emit = defineEmits(['page-change', 'search', 'delete', 'sort', 'filter'])

const router = useRouter()
const confirm = useConfirm()

const { oldProvinces, fetchOldProvinces } = useSchoolOptions()

onMounted(() => {
  fetchOldProvinces()
})

const searchQuery = ref('')
const selectedOldProvinceId = ref(null)
const selectedBirthYear = ref(null)
let searchTimeout = null

const classOptions = [
  { label: 'Lớp 11', value: 'GRADE_11' },
  { label: 'Lớp 12', value: 'GRADE_12' },
  { label: 'Thí sinh tự do', value: 'FREELANCE' }
]

const priorityOptions = [
  { label: 'I', value: 'I' },
  { label: 'II', value: 'II' },
  { label: 'III', value: 'III' },
  { label: 'IV', value: 'IV' },
  { label: 'V', value: 'V' }
]



const currentYear = new Date().getFullYear()
const birthYearOptions = Array.from({ length: 40 }, (_, i) => {
  const year = currentYear - i
  return { label: year.toString(), value: year }
})

// event.first: offset value, event.rows: limit value
const onPage = (event) => {
  const page = Math.floor(event.first / event.rows) + 1
  emit('page-change', { page, limit: event.rows })
}

const onSort = (event) => {
  emit('sort', { sortField: event.sortField, sortOrder: event.sortOrder })
}

const onSearch = (e) => {
  searchQuery.value = e.target.value
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    emit('search', searchQuery.value)
  }, 500)
}

const onFilterChange = () => {
  emit('filter', {
    oldProvinceId: selectedOldProvinceId.value,
    birthYear: selectedBirthYear.value
  })
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
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const gpaLabel = (g) => {
  if (g === 'LOWER_21') return '3 môn <21đ'
  if (g === 'G11_21_TO_23') return '3 môn lớp 11 từ 21-23đ'
  if (g === 'G12_SEM1_21_TO_23') return '3 môn HK1 12 từ 21-23đ'
  if (g === 'G12_21_TO_23') return '3 môn cả năm 12 từ 21-23đ'
  if (g === 'G11_24_TO_26') return '3 môn lớp 11 từ 24-26đ'
  if (g === 'G12_SEM1_24_TO_26') return '3 môn HK1 12 từ 24-26đ'
  if (g === 'G12_24_TO_26') return '3 môn cả năm 12 từ 24-26đ'
  if (g === 'G11_HIGHER_26') return '3 môn lớp 11 >26đ'
  if (g === 'G12_SEM1_HIGHER_26') return '3 môn HK1 12 >26đ'
  if (g === 'G12_HIGHER_26') return '3 môn cả năm 12 >26đ'
  if (g === 'OTHER') return 'Khác'
  return g
}



const formatClass = (value) => {
  const opt = classOptions.find(o => o.value === value)
  return opt ? opt.label : value
}

const genderSeverity = (gender) => {
  if (gender === 'Male') return 'info'
  if (gender === 'Female') return 'warn'
  return 'secondary'
}
</script>

<style scoped>
.table-container { background: var(--p-content-background);  border-radius: 12px; overflow: hidden; border: 1px solid var(--p-surface-200); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06); }
.table-toolbar { display: flex; justify-content: flex-end; gap: 0.5rem; flex-wrap: wrap; }
.filter-select { width: 140px; }
.search-input { width: 220px; }
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
