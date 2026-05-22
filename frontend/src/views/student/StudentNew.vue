<template>
  <div class="student-new">
    <div class="page-header">
      <h1>Add New Student</h1>
      <Button label="Back to List" severity="secondary" icon="pi pi-arrow-left" @click="$router.push('/students')" />
    </div>

    <div class="section-card">
      <h2>Student Information</h2>
      <StudentForm
        :student="studentTemplate"
        :isSubmitting="isSubmitting"
        buttonText="Create Student"
        @submit="createNewStudent"
      />
    </div>

    <div class="section-card">
      <h2>Import from Excel</h2>
      <div class="import-info">
        <i class="pi pi-info-circle"></i>
        <p>Upload one or more Excel files (<code>.xlsx</code>, <code>.xls</code>) containing student data. The system will analyze duplicates before importing.</p>
      </div>
      <FileUpload
        name="excelFiles"
        accept=".xlsx, .xls"
        :multiple="true"
        :maxFileSize="10000000"
        chooseLabel="Choose Excel Files"
        :auto="false"
        customUpload
        ref="fileUpload"
        @uploader="onUpload"
        :disabled="isUploading"
      >
        <template #empty>
          <div class="upload-empty">
            <i class="pi pi-file-excel"></i>
            <span>Drag and drop files here to upload.</span>
          </div>
        </template>
      </FileUpload>
    </div>
  </div>
</template>

<script>
import StudentForm from '../../components/StudentForm.vue'
import Button from 'primevue/button'
import FileUpload from 'primevue/fileupload'
import { useToast } from 'primevue/usetoast'
import { createStudent, importStudents } from '@/helpers/studentHelper'

export default {
  name: 'StudentNewView',
  components: { StudentForm, Button, FileUpload },
  setup() {
    const toast = useToast()
    return { toast }
  },
  data() {
    return {
      studentTemplate: {
        fullName: '',
        gender: null,
        email: '',
        mobile: '',
        otherPhone: '',
        birthDate: null,
        gpa: null,
        englishCertificate: '',
        parentPhone: '',
        primaryAddressCity: ''
      },
      isSubmitting: false,
      isUploading: false
    }
  },
  methods: {
    async createNewStudent(payload) {
      this.isSubmitting = true
      try {
        await createStudent(payload)
        this.toast.add({ severity: 'success', summary: 'Created', detail: `Student "${payload.fullName}" created successfully`, life: 3000 })
        this.$router.push('/students')
      } catch (error) {
        const detail = error.response?.data?.details || error.message || 'Failed to create student'
        this.toast.add({ severity: 'error', summary: 'Error', detail, life: 5000 })
      } finally {
        this.isSubmitting = false
      }
    },
    async onUpload(event) {
      const files = event.files
      if (!files || files.length === 0) return

      this.isUploading = true
      try {
        // Step 1: Analyze
        const analysis = await importStudents(files, false)

        if (analysis.duplicateCount > 0) {
          this.toast.add({ severity: 'warn', summary: 'Duplicates Found', detail: `${analysis.duplicateCount} duplicate(s) detected. They will be updated on import.`, life: 5000 })
        }

        // Step 2: Confirm import
        const result = await importStudents(files, true)
        this.toast.add({ severity: 'success', summary: 'Import Successful', detail: `Inserted: ${result.insertedCount}, Updated: ${result.updatedCount}`, life: 5000 })
        this.$router.push('/students')
      } catch (error) {
        const detail = error.response?.data?.details || error.message || 'Upload failed'
        this.toast.add({ severity: 'error', summary: 'Import Failed', detail, life: 5000 })
        this.$refs.fileUpload.clear()
      } finally {
        this.isUploading = false
      }
    }
  }
}
</script>

<style scoped>
.student-new {
  padding: 1.5rem 2rem;
  max-width: 900px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--p-text-color);
}

.section-card {
  background: var(--p-content-background);
  border: 1px solid var(--p-surface-200);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.section-card h2 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1.25rem 0;
  color: var(--p-text-color);
}

.import-info {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--p-blue-50);
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid var(--p-blue-200);
}

.import-info i {
  color: var(--p-blue-500);
  font-size: 1.25rem;
  margin-top: 0.1rem;
}

.import-info p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.import-info code {
  background: var(--p-blue-100);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.upload-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  gap: 0.5rem;
  color: var(--p-text-muted-color);
}

.upload-empty i {
  font-size: 2rem;
  color: var(--p-green-400);
}
</style>
