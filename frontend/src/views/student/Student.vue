<template>
  <div class="student-list-view">
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

    <StudentList />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import StudentList from '@/components/student/StudentList.vue'
import { useStudent } from '@/composables/useStudent'

const { students } = useStudent()
const studentCount = computed(() => students.value.length)
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
