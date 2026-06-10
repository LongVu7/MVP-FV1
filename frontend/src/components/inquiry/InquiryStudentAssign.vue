<template>
  <div class="section-card">
    <div class="card-header">
      <h2><i class="pi pi-user"></i> Student Assignment</h2>
      <template v-if="!readonly">
        <Button 
          v-if="isCreatingStudent" 
          label="Select Student" 
          severity="secondary" 
          size="small" 
          icon="pi pi-search" 
          @click="dialogVisible = true" 
        />
        <Button 
          v-else 
          label="Create New Student" 
          severity="secondary" 
          size="small" 
          icon="pi pi-plus" 
          @click="clearSelectedStudent" 
        />
      </template>
    </div>
    
    <div v-if="isCreatingStudent && !readonly" class="student-create-area">
      <StudentForm 
        ref="studentFormRef" 
        :student="newStudentForm" 
        :hideSubmit="true"
        @update:student="newStudentForm = $event"
      />
    </div>
    
    <div v-else class="selected-entity-area">
      <div v-if="readonly && initialStudent" class="entity-info">
        <div class="entity-avatar"><i class="pi pi-user"></i></div>
        <div class="entity-details">
          <h3>{{ initialStudent.fullName }}</h3>
          <p>{{ initialStudent.email || 'No email' }} | {{ initialStudent.mobile || 'No phone' }}</p>
        </div>
        <Button 
          icon="pi pi-times" 
          severity="danger" 
          text 
          rounded 
          size="small" 
          @click="$emit('remove-student', initialStudent.id)" 
          v-tooltip.top="'Remove student'"
        />
      </div>
      <div v-else-if="!readonly && selectedStudent" class="entity-info">
        <div class="entity-avatar"><i class="pi pi-user"></i></div>
        <div class="entity-details">
          <h3>{{ selectedStudent.fullName }}</h3>
          <p>{{ selectedStudent.email || 'No email' }} | {{ selectedStudent.mobile || 'No phone' }}</p>
        </div>
        <Button 
          icon="pi pi-times" 
          severity="danger" 
          text 
          rounded 
          size="small" 
          @click="clearSelectedStudent" 
          v-tooltip.top="'Remove student'"
        />
      </div>
      <div v-else class="empty-state">
        <p>No students assigned.</p>
      </div>
    </div>

    <!-- Student Selection Dialog -->
    <Dialog v-if="!readonly" v-model:visible="dialogVisible" header="Select Existing Student" :modal="true" :style="{ width: '400px' }">
      <div class="dialog-content">
        <AutoComplete
          v-model="tempSelected"
          :suggestions="studentSuggestions"
          @complete="onSearch"
          optionLabel="fullName"
          placeholder="Search by name or email..."
          fluid
        >
          <template #option="{ option }">
            <div class="autocomplete-item">
              <span class="ac-name">{{ option.fullName }}</span>
              <span class="ac-detail">{{ option.email || 'No email' }}</span>
            </div>
          </template>
        </AutoComplete>
      </div>
      <template #footer>
        <Button label="Cancel" text severity="secondary" @click="dialogVisible = false" />
        <Button label="Confirm" @click="confirmSelection" :disabled="!tempSelected || !tempSelected.id" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import AutoComplete from 'primevue/autocomplete'
import { useStudentSearch } from '@/composables/useStudentSearch'
import StudentForm from '@/components/student/StudentForm.vue'

const props = defineProps({
  readonly: {
    type: Boolean,
    default: false
  },
  initialStudent: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['remove-student'])

const { studentSuggestions, searchStudents } = useStudentSearch()

const isCreatingStudent = ref(true)
const selectedStudent = ref(null)
const tempSelected = ref(null)
const dialogVisible = ref(false)
const studentFormRef = ref(null)

const newStudentForm = ref({
  fullName: '',
  gender: null,
  email: '',
  mobile: '',
  otherPhone: '',
  parentPhone: '',
  birthDate: null,
  gpa: null,
  englishCertificate: '',
  primaryAddressCity: ''
})

watch(
  () => props.initialStudent, (newStudent) => {
    if (newStudent) {
      isCreatingStudent.value = false
      selectedStudent.value = newStudent
    }
  },
  { immediate: true }
)

const onSearch = async (event) => {
  await searchStudents(event.query)
}

const confirmSelection = () => {
  if (tempSelected.value && tempSelected.value.id) {
    selectedStudent.value = tempSelected.value
    isCreatingStudent.value = false
    dialogVisible.value = false
  }
}

// const clearSelectedStudent = () => {
//   selectedStudent.value = null
//   tempSelected.value = null
//   isCreatingStudent.value = true
// }

const clearSelectedStudent = () => {
  //Unlink if the student is from database
  if (selectedStudent.value && props.initialStudent && selectedStudent.value.id === props.initialStudent.id) {
    emit('remove-student', selectedStudent.value.id)
  }
  
  selectedStudent.value = null
  tempSelected.value = null
  isCreatingStudent.value = true
}

const validateAndGetPayload = () => {
  if (props.readonly) return { isCreating: false, studentId: null, studentPayload: null }

  let studentPayload = null;
  if (isCreatingStudent.value) {
    if (studentFormRef.value && !studentFormRef.value.validate()) {
      return { isValid: false }
    }
    
    studentPayload = studentFormRef.value.getPayload()
  }

  return {
    isValid: true,
    isCreating: isCreatingStudent.value,
    studentPayload: isCreatingStudent.value ? studentPayload : null,
    studentId: !isCreatingStudent.value && selectedStudent.value ? selectedStudent.value.id : null
  }
}

defineExpose({
  validateAndGetPayload
})
</script>

<style scoped>
.section-card { 
  background: var(--p-content-background); 
  border: 1px solid var(--p-surface-200); 
  border-radius: 12px; 
  padding: 1.5rem; 
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06); 
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--p-surface-100);
  padding-bottom: 0.75rem;
}

.card-header h2 {
  font-size: 1.15rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--p-text-color);
}

.card-header h2 i {
  color: var(--p-primary-color);
}

.student-create-area {
  padding: 0.5rem 0;
}

.selected-entity-area {
  background: var(--p-surface-50);
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  padding: 1.25rem;
}

.linked-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.entity-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.entity-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--p-primary-100);
  color: var(--p-primary-700);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.entity-details {
  flex: 1;
}

.entity-details h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  color: var(--p-text-color);
}

.entity-details p {
  margin: 0;
  color: var(--p-text-muted-color);
  font-size: 0.9rem;
}

.empty-state {
  color: var(--p-text-muted-color);
  font-style: italic;
  font-size: 0.95rem;
}

.dialog-content {
  padding-top: 0.5rem;
  padding-bottom: 1rem;
}

.autocomplete-item { display: flex; flex-direction: column; gap: 0.1rem; }
.ac-name { font-weight: 600; }
.ac-detail { font-size: 0.8rem; color: var(--p-text-muted-color); }
</style>
