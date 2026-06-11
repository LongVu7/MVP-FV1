<template>
  <form @submit.prevent="onSubmit" class="student-form">
    <div class="form-grid">
      <div class="form-field">
        <label for="sf-fullName">Full Name <span class="required">*</span></label>
        <InputText id="sf-fullName" v-model="form.fullName" placeholder="Enter full name" :invalid="!!errors.fullName"
          fluid />
        <small v-if="errors.fullName" class="form-error">{{ errors.fullName }}</small>
      </div>
      <div class="form-field">
        <label for="sf-gender">Gender</label>
        <Select id="sf-gender" v-model="form.gender" :options="genderOptions" optionLabel="label" optionValue="value"
          placeholder="Select gender" fluid />
      </div>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label for="sf-email">Email</label>
        <InputText id="sf-email" v-model="form.email" placeholder="student@email.com" :invalid="!!errors.email" fluid />
        <small v-if="errors.email" class="form-error">{{ errors.email }}</small>
      </div>
      <div class="form-field">
        <label for="sf-mobile">Mobile</label>
        <InputText id="sf-mobile" v-model="form.mobile" placeholder="Phone number" fluid />
        <small v-if="errors.mobile" class="form-error">{{ errors.mobile }}</small>
      </div>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label for="sf-otherPhone">Other Phone</label>
        <InputText id="sf-otherPhone" v-model="form.otherPhone" placeholder="Alternative phone" fluid />
      </div>
      <div class="form-field">
        <label for="sf-parentPhone">Parent Phone</label>
        <InputText id="sf-parentPhone" v-model="form.parentPhone" placeholder="Parent contact" fluid />
      </div>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label for="sf-birthDate">Birth Date</label>
        <DatePicker id="sf-birthDate" v-model="form.birthDate" dateFormat="yy-mm-dd" placeholder="Select date"
          :showIcon="true" fluid />
      </div>
      <div class="form-field">
        <label for="sf-gpa">GPA</label>
        <InputNumber id="sf-gpa" v-model="form.gpa" :min="0" :max="10" :minFractionDigits="0" :maxFractionDigits="2"
          placeholder="0.00" :invalid="!!errors.gpa" fluid />
        <small v-if="errors.gpa" class="form-error">{{ errors.gpa }}</small>
      </div>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label for="sf-englishCert">English Certificate</label>
        <InputText id="sf-englishCert" v-model="form.englishCertificate" placeholder="e.g. IELTS 7.0" fluid />
      </div>
      <div class="form-field">
        <label for="sf-city">City</label>
        <InputText id="sf-city" v-model="form.primaryAddressCity" placeholder="City name" fluid />
      </div>
    </div>

    <div class="form-actions" v-if="!hideSubmit">
      <Button type="submit" :label="buttonText" icon="pi pi-check" :loading="isSubmitting" />
    </div>
  </form>
</template>

<script>
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'

export default {
  name: 'StudentForm',
  components: { InputText, InputNumber, Select, DatePicker, Button },
  props: {
    student: { type: Object, required: true },
    isSubmitting: { type: Boolean, default: false },
    buttonText: { type: String, default: 'Submit' },
    hideSubmit: { type: Boolean, default: false }
  },
  emits: ['submit'],
  data() {
    return {
      form: { ...this.student },
      errors: {},
      genderOptions: [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' }
      ]
    }
  },
  watch: {
    student: {
      handler(newVal) {
        this.form = { ...newVal }
        this.errors = {}
      },
      deep: true
    }
  },
  methods: {
    validate() {
      const e = {}
      if (!this.form.fullName || !this.form.fullName.trim()) e.fullName = 'Full name is required'
      if (this.form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) e.email = 'Invalid email format'
      if (this.form.gpa != null && (this.form.gpa < 0 || this.form.gpa > 10)) e.gpa = 'GPA must be between 0 and 10'
      if (this.form.mobile) {
        if (!/^0\d{9}$/.test(this.form.mobile)) {
          e.mobile = 'Mobile number must be exactly 10 digits long and start with 0';
        }
      }
      this.errors = e
      return Object.keys(e).length === 0
    },
    getPayload() {
      const payload = {}
      for (const [key, value] of Object.entries(this.form)) {
        if (key === 'id' || key === 'createdAt' || key === 'updatedAt') continue
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
.student-form {
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
