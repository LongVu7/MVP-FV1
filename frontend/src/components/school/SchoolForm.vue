<template>
  <form @submit.prevent="onSubmit" class="school-form">
    <div class="form-grid">
      <div class="form-field">
        <label for="schf-name">School Name <span class="required">*</span></label>
        <InputText id="schf-name" v-model="form.name" placeholder="Enter school name" :invalid="!!errors.name" fluid />
        <small v-if="errors.name" class="form-error">{{ errors.name }}</small>
      </div>
      <div class="form-field">
        <label for="schf-city">City <span class="required">*</span></label>
        <Select id="schf-city" v-model="form.cityId" :options="cities" optionLabel="name" optionValue="id"
          placeholder="Select city" :loading="loadingCities" :invalid="!!errors.cityId" filter fluid />
        <small v-if="errors.cityId" class="form-error">{{ errors.cityId }}</small>
      </div>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label for="schf-type">School Type</label>
        <Select id="schf-type" v-model="form.schoolType" :options="schoolTypeOptions" optionLabel="label" optionValue="value"
          placeholder="Select type" showClear fluid />
      </div>
    </div>

    <div class="form-actions" v-if="!hideSubmit">
      <Button type="submit" :label="buttonText" icon="pi pi-check" :loading="isSubmitting" />
    </div>
  </form>
</template>

<script>
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import { useSchoolOptions } from '@/composables/useSchoolOptions'

export default {
  name: 'SchoolForm',
  components: { InputText, Select, Button },
  props: {
    school: { type: Object, required: true },
    isSubmitting: { type: Boolean, default: false },
    buttonText: { type: String, default: 'Submit' },
    hideSubmit: { type: Boolean, default: false }
  },
  emits: ['submit'],
  setup() {
    const { cities, loadingCities, fetchCities } = useSchoolOptions()
    return { cities, loadingCities, fetchCities }
  },
  data() {
    return {
      form: { ...this.school },
      errors: {},
      schoolTypeOptions: [
        { label: 'A*', value: 'A_STAR' },
        { label: 'A', value: 'A' },
        { label: 'B', value: 'B' },
        { label: 'C', value: 'C' },
        { label: 'D', value: 'D' }
      ]
    }
  },
  watch: {
    school: {
      handler(newVal) {
        this.form = { ...newVal }
        this.errors = {}
      },
      deep: true
    }
  },
  created() {
    this.fetchCities()
  },
  methods: {
    validate() {
      const e = {}
      if (!this.form.name || !this.form.name.trim()) e.name = 'School name is required'
      if (!this.form.cityId) e.cityId = 'City is required'
      this.errors = e
      return Object.keys(e).length === 0
    },
    getPayload() {
      const payload = {}
      for (const [key, value] of Object.entries(this.form)) {
        if (key === 'id' || key === 'createdAt' || key === 'updatedAt' || key === 'city') continue
        if (value !== '' && value !== null && value !== undefined) {
          payload[key] = value
        }
      }
      return payload
    },
    onSubmit() {
      if (!this.validate()) return
      this.$emit('submit', this.getPayload())
    }
  }
}
</script>

<style scoped>
.school-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--p-text-color);
}

.required {
  color: var(--p-red-400);
}

.form-error {
  color: var(--p-red-400);
  font-size: 0.75rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
