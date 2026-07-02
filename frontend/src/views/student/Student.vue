<template>
  <div class="student-list-view">
    <div class="page-header">
      <div class="header-left">
        <h1><i class="pi pi-graduation-cap"></i> Student Management</h1>
        <Tag :value="`${pagination?.totalCount || 0} students`" severity="info" rounded />
      </div>
      <div class="header-actions">
        <!-- <Button label="Import Excel" icon="pi pi-file-import" severity="secondary" outlined @click="$router.push('/students/new')" /> -->
        <Button label="New Student" icon="pi pi-plus" @click="$router.push('/students/new')" />
      </div>
    </div>

    <StudentList 
      :students="students"
      :loading="loading"
      :pagination="pagination"
      @page-change="onPageChange"
      @search="onSearch"
      @delete="onDelete"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import StudentList from '@/components/student/StudentList.vue'
import { useStudent } from '@/composables/useStudent'
import { useToast } from 'primevue/usetoast'

const { students, pagination, loading, fetchStudents, deleteStudent } = useStudent()
const toast = useToast()

const currentParams = ref({ page: 1, limit: 20, search: '' })

onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  try {
    await fetchStudents(currentParams.value)
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load students', life: 5000 })
  }
}

const onPageChange = async ({ page, limit }) => {
  currentParams.value.page = page
  currentParams.value.limit = limit
  await loadData()
}

const onSearch = async (searchQuery) => {
  currentParams.value.search = searchQuery
  currentParams.value.page = 1
  await loadData()
}

const onDelete = async (id) => {
  try {
    await deleteStudent(id)
    toast.add({ severity: 'success', summary: 'Deleted', detail: 'Student has been deleted', life: 3000 })
    await loadData()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete student', life: 5000 })
  }
}
</script>

<style scoped>
.student-list-view { padding: 1.5rem 2rem; max-width: 100%; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.header-left { display: flex; align-items: center; gap: 0.75rem; }
.header-left h1 { display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; font-weight: 700; margin: 0; color: var(--p-text-color); }
.header-left h1 i { color: var(--p-primary-color); }
.header-actions { display: flex; gap: 0.5rem; }

@media (max-width: 768px) {
  .student-list-view { padding: 1rem; }
  .page-header { flex-direction: column; align-items: flex-start; }
}
</style>
