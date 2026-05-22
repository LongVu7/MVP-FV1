<template>
  <div class="student-list">
    <div class="page-header">
      <div class="header-left">
        <h1><i class="pi pi-graduation-cap"></i> Student Management</h1>
        <Tag :value="`${studentCount} students`" severity="info" rounded />
      </div>
      <div class="header-actions">
        <Button label="Import Excel" icon="pi pi-file-import" severity="secondary" outlined @click="$router.push('/students/new')" />
        <Button label="New Student" icon="pi pi-plus" @click="$router.push('/students/new')" />
      </div>
    </div>

    <div class="table-container">
      <DataTable
        :value="students"
        :paginator="true"
        :rows="20"
        :rowsPerPageOptions="[10, 20, 50]"
        :loading="loading"
        v-model:filters="filters"
        :globalFilterFields="['fullName', 'email', 'mobile', 'gender', 'primaryAddressCity', 'englishCertificate']"
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
              <InputText placeholder="Search students..." @input="onGlobalFilter" :value="filters.global.value" class="search-input" />
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
              <Button icon="pi pi-trash" rounded text severity="danger" size="small" v-tooltip.top="'Delete'" @click="confirmDelete(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <ConfirmDialog />
  </div>
</template>

<script>
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
import { getAllStudents, deleteStudent } from '@/helpers/studentHelper'

export default {
  name: 'StudentListView',
  components: { DataTable, Column, Button, InputText, IconField, InputIcon, Tag, ConfirmDialog },
  setup() {
    const toast = useToast()
    const confirm = useConfirm()
    return { toast, confirm }
  },
  data() {
    return {
      students: [],
      loading: true,
      filters: {
        global: { value: null, matchMode: 'contains' }
      }
    }
  },
  computed: {
    studentCount() { return this.students.length }
  },
  mounted() {
    this.fetchStudents()
  },
  methods: {
    async fetchStudents() {
      this.loading = true
      try {
        this.students = await getAllStudents()
      } catch (error) {
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load students: ' + (error.response?.data?.details || error.message), life: 5000 })
      } finally {
        this.loading = false
      }
    },
    confirmDelete(student) {
      this.confirm.require({
        message: `Are you sure you want to delete "${student.fullName}"? This action cannot be undone.`,
        header: 'Delete Student',
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Cancel',
        rejectProps: { severity: 'secondary', text: true },
        acceptLabel: 'Delete',
        acceptProps: { severity: 'danger' },
        accept: async () => {
          try {
            await deleteStudent(student.id)
            this.toast.add({ severity: 'success', summary: 'Deleted', detail: `Student "${student.fullName}" has been deleted`, life: 3000 })
            await this.fetchStudents()
          } catch (error) {
            this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete student: ' + (error.response?.data?.details || error.message), life: 5000 })
          }
        }
      })
    },
    formatDate(dateStr) {
      if (!dateStr) return '—'
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    },
    formatDateTime(dateStr) {
      if (!dateStr) return '—'
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    },
    genderSeverity(gender) {
      if (gender === 'Male') return 'info'
      if (gender === 'Female') return 'warn'
      return 'secondary'
    },
    onGlobalFilter(e) { this.filters.global.value = e.target.value }
  }
}
</script>

<style scoped>
.student-list { padding: 1.5rem 2rem; max-width: 100%; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.header-left { display: flex; align-items: center; gap: 0.75rem; }
.header-left h1 { display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; font-weight: 700; margin: 0; color: var(--p-text-color); }
.header-left h1 i { color: var(--p-primary-color); }
.header-actions { display: flex; gap: 0.5rem; }
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
  .student-list { padding: 1rem; }
  .page-header { flex-direction: column; align-items: flex-start; }
  .search-input { width: 100%; }
}
</style>
