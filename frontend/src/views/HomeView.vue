
<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Welcome to Admissions CRM</h1>
      <p class="subtitle">Manage student records, track inquiries, and optimize your recruitment workflow.</p>
    </div>

    <div class="stats-grid">
      <!-- Students Card -->
      <div class="stat-card" @click="router.push('/students')">
        <div class="stat-icon stat-icon--students">
          <i class="pi pi-graduation-cap"></i>
        </div>
        <div class="stat-body">
          <span class="stat-value" :class="{ loading: loading }">
            {{ loading ? '...' : studentCount }}
          </span>
          <span class="stat-label">Total Students</span>
        </div>
        <i class="pi pi-arrow-right stat-arrow"></i>
      </div>

      <!-- Inquiries Card -->
      <div class="stat-card" @click="router.push('/inquiries')">
        <div class="stat-icon stat-icon--inquiries">
          <i class="pi pi-ticket"></i>
        </div>
        <div class="stat-body">
          <span class="stat-value" :class="{ loading: loading }">
            {{ loading ? '...' : inquiryCount }}
          </span>
          <span class="stat-label">Open Inquiries</span>
        </div>
        <i class="pi pi-arrow-right stat-arrow"></i>
      </div>

      <!-- Staff Card -->
      <div class="stat-card" @click="router.push('/staffs')">
        <div class="stat-icon stat-icon--staff">
          <i class="pi pi-users"></i>
        </div>
        <div class="stat-body">
          <span class="stat-value" :class="{ loading: loading }">
            {{ loading ? '...' : staffCount }}
          </span>
          <span class="stat-label">Active Staff</span>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <h2>Quick Actions</h2>
      <div class="action-grid">
        <Button label="View Students" icon="pi pi-graduation-cap" severity="info" outlined
        @click="router.push('/students')" class="action-btn" />
        <Button label="Add New Student" icon="pi pi-user-plus" outlined @click="router.push('/students')"
        class="action-btn" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import { getAllStudents } from '@/helpers/studentHelper'

const router = useRouter()
const studentCount = ref(0)
const loading = ref(true)
const inquiryCount = ref(0)
const staffCount = ref(0)

onMounted(async () => {
  try {
    const students = await getAllStudents()
    studentCount.value = students.length

    const inquiries = await getAllInquiries()
    inquiryCount.value = inquiries.length

    const staffs = await getAllStaff()
    staffCount.value = staffs.length
  } catch {
    studentCount.value = 0
    inquiryCount.value = 0
    staffCount.value = 0
  } finally {
    loading.value = false
  }
})
</script>




<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1100px;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--p-text-color);
}

.subtitle {
  font-size: 1rem;
  color: var(--p-text-muted-color);
  margin: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--p-content-background);
  border: 1px solid var(--p-surface-200);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

:root.p-dark .stat-card {
  border-color: var(--p-surface-700);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border-color: var(--p-primary-300);
}

.stat-card--disabled {
  opacity: 0.5;
  cursor: default;
  pointer-events: none;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  flex-shrink: 0;
}

.stat-icon--students {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.stat-icon--inquiries {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
}

.stat-icon--staff {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
}

.stat-body {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--p-text-color);
  line-height: 1.2;
}

.stat-value.loading {
  opacity: 0.4;
}

.stat-label {
  font-size: 0.82rem;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 0.15rem;
}

.stat-arrow {
  color: var(--p-text-muted-color);
  font-size: 0.95rem;
  transition: transform 0.2s;
}

.stat-card:hover .stat-arrow {
  transform: translateX(3px);
  color: var(--p-primary-color);
}

/* Quick Actions */
.quick-actions h2 {
  font-size: 1.15rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: var(--p-text-color);
}

.action-grid {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-btn {
  min-width: 180px;
}

@media (max-width: 640px) {
  .dashboard {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
