<template>
  <form @submit.prevent="onSubmit" class="student-form">
    <div class="form-grid">
      <div class="form-field">
        <label for="sf-fullName">Full Name <span class="required">*</span></label>
        <InputText id="sf-fullName" v-model="form.fullName" placeholder="Enter full name" :invalid="!!errors.fullName" fluid />
        <small v-if="errors.fullName" class="form-error">{{ errors.fullName }}</small>
      </div>
      <div class="form-field">
        <label for="sf-gender">Gender</label>
        <Select id="sf-gender" v-model="form.gender" :options="genderOptions" optionLabel="label" optionValue="value" placeholder="Select gender" fluid />
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
        <DatePicker id="sf-birthDate" v-model="form.birthDate" dateFormat="yy-mm-dd" placeholder="Select date" :showIcon="true" fluid />
      </div>
      <div class="form-field">
        <label for="sf-city">City</label>
        <InputText id="sf-city" v-model="form.primaryAddressCity" placeholder="City name" fluid />
      </div>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label for="sf-schoolCity">School City <span class="required">*</span></label>
        <Select id="sf-schoolCity" v-model="selectedCityId" :options="cities" optionLabel="name" optionValue="id" placeholder="Select city" :loading="loadingCities" :invalid="!!errors.schoolCity" filter showClear fluid @change="onCityChange" />
        <small v-if="errors.schoolCity" class="form-error">{{ errors.schoolCity }}</small>
      </div>
      <div class="form-field">
        <label for="sf-school">School <span class="required">*</span></label>
        <Select id="sf-school" v-model="form.schoolId" :options="schools" optionLabel="name" optionValue="id" placeholder="Select school" :loading="loadingSchools" :disabled="!selectedCityId" :invalid="!!errors.school" filter showClear fluid />
        <small v-if="errors.school" class="form-error">{{ errors.school }}</small>
      </div>
    </div>

    <div class="section-divider">Academic Intentions</div>

    <div class="form-grid">
      <div class="form-field">
        <label for="sf-gpa">GPA</label>
        <Select id="sf-gpa" v-model="form.specializedRegister.gpa" :options="gpaOptions" optionLabel="label" optionValue="value" placeholder="Select GPA" showClear fluid />
      </div>
      <div class="form-field">
        <label for="sf-englishCert">English Certificate</label>
        <Select id="sf-englishCert" v-model="form.specializedRegister.englishCertificate" :options="englishCertOptions" optionLabel="label" optionValue="value" placeholder="Select certificate" showClear fluid />
      </div>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label for="sf-interestedMajor">Interested Major</label>
        <Select id="sf-interestedMajor" v-model="form.specializedRegister.interestedMajorId"
          :options="interestedMajors" optionLabel="name" optionValue="id"
          placeholder="Select major" :loading="loadingInterested"
          filter showClear fluid @change="onInterestedMajorChange" />
      </div>
      <div class="form-field">
        <label for="sf-specificMajor">Specific Major</label>
        <Select id="sf-specificMajor" v-model="form.specializedRegister.specificMajorId"
          :options="specificMajors" optionLabel="name" optionValue="id"
          placeholder="Select specific major" :loading="loadingSpecific"
          :disabled="!form.specializedRegister.interestedMajorId"
          filter showClear fluid />
      </div>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label for="sf-programScore">Program Score</label>
        <Select id="sf-programScore" v-model="form.specializedRegister.programScore" :options="programScoreOptions" optionLabel="label" optionValue="value" placeholder="Select Program Score" showClear fluid />
      </div>
      <div class="form-field">
        <label for="sf-admissionYear">Admission Year</label>
        <InputNumber id="sf-admissionYear" v-model="form.specializedRegister.admissionYear" :useGrouping="false" :min="2000" :max="2100" placeholder="e.g. 2024" fluid />
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
import { useSchoolOptions } from '@/composables/useSchoolOptions'
import { useMajorOptions } from '@/composables/useMajorOptions'

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
  setup() {
    const { cities, schools, loadingCities, loadingSchools, fetchCities, fetchSchools } = useSchoolOptions()
    const { interestedMajors, specificMajors, loadingInterested, loadingSpecific, fetchInterestedMajors, fetchSpecificMajors } = useMajorOptions()
    return { 
      cities, schools, loadingCities, loadingSchools, fetchCities, fetchSchools,
      interestedMajors, specificMajors, loadingInterested, loadingSpecific, fetchInterestedMajors, fetchSpecificMajors
    }
  },
  data() {
    return {
      form: { 
        ...this.student,
        specializedRegister: { ...this.student.specializedRegister }
      },
      errors: {},
      warnings: {},
      selectedCityId: null,
      genderOptions: [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' }
      ],
      englishCertOptions: [
        { label: 'IELTS', value: 'IELTS' },
        { label: 'TOEFL', value: 'TOEFL' },
        { label: 'TOEIC', value: 'TOEIC' },
        { label: 'VSTEP', value: 'VSTEP' },
        { label: 'APTIS', value: 'APTIS' },
        { label: 'Linguaskill', value: 'LINGUASKILL' },
        { label: 'PEIC', value: 'PEIC' },
        { label: 'Cambridge Exam', value: 'CAMBRIDGE_EXAM' },
        { label: 'PTE', value: 'PTE' },
        { label: 'Other', value: 'other' }
      ],
      gpaOptions: [
        { label: 'Lower 21', value: 'LOWER_21' },
        { label: 'Grade 11: 21 - 23', value: 'GRADE_11_FROM_21_TO_23' },
        { label: 'Grade 12 (Curriculum 2): 24 - 25', value: 'GRADE_12_CUR_2_FROM_24_TO_25' },
        { label: 'Grade 12: 21 - 23', value: 'GRADE_12_FROM_21_TO_23' },
        { label: 'Grade 11: 24 - 26', value: 'GRADE_11_FROM_24_TO_26' },
        { label: 'Grade 12: 24 - 26', value: 'GRADE_12_FROM_24_TO_26' },
        { label: 'Grade 11: Higher 26', value: 'GRADE_11_HIGHER_26' },
        { label: 'Grade 12 (Curriculum 1): Higher 26', value: 'GRADE_12_CUR_1_HIGHER_26' },
        { label: 'Grade 12: Higher 26', value: 'GRADE_12_HIGHER_26' }
      ],
      programScoreOptions: [
        { label: 'Math G11: Higher 7', value: 'MATH_G11_HIGHER_7' },
        { label: 'Math G11 (Cur 1): Higher 7', value: 'MATH_G11_CUR1_HIGHER_7' },
        { label: 'Math G12: Higher 7', value: 'MATH_G12_HIGHER_7' },
        { label: 'Physics G11: Higher 7', value: 'PHY_G11_HIGHER_7' },
        { label: 'Physics G12 (Cur 1): Higher 7', value: 'PHY_G12_CUR1_HIGHER_7' },
        { label: 'Physics G12: Higher 7', value: 'PHY_G12_HIGHER_7' },
        { label: 'Chemistry G11: Higher 7', value: 'CHEM_G11_HIGHER_7' },
        { label: 'Chemistry G12 (Cur 1): Higher 7', value: 'CHEM_G12_CUR1_HIGHER_7' },
        { label: 'Chemistry G12: Higher 7', value: 'CHEM_G12_HIGHER_7' }
      ]
    }
  },
  watch: {
    student: {
      async handler(newVal) {
        this.form = { 
          ...newVal,
          specializedRegister: { ...newVal.specializedRegister }
        }
        this.errors = {}
        // Restore city selection when editing an existing student with school data
        if (newVal.school?.city?.id) {
          this.selectedCityId = newVal.school.city.id
          this.fetchSchools(this.selectedCityId)
        } else {
          this.selectedCityId = null
          this.schools = []
        }

        // Restore majors
        if (newVal.specializedRegister?.interestedMajorId) {
          this.fetchSpecificMajors(newVal.specializedRegister.interestedMajorId)
        } else {
          this.specificMajors = []
        }
      },
      deep: true
    }
  },
  async created() {
    this.fetchCities()
    // If editing student with existing school, load the school's city dropdown
    if (this.student.school?.city?.id) {
      this.selectedCityId = this.student.school.city.id
      this.fetchSchools(this.selectedCityId)
    }

    // Fetch interested majors
    await this.fetchInterestedMajors()
    if (this.form.specializedRegister?.interestedMajorId) {
      this.fetchSpecificMajors(this.form.specializedRegister.interestedMajorId)
    }
  },
  methods: {
    onCityChange() {
      this.form.schoolId = null
      if (this.selectedCityId) {
        this.fetchSchools(this.selectedCityId)
      } else {
        this.schools = []
      }
    },
    onInterestedMajorChange() {
      this.form.specializedRegister.specificMajorId = null
      this.specificMajors = []
      if (this.form.specializedRegister.interestedMajorId) {
        this.fetchSpecificMajors(this.form.specializedRegister.interestedMajorId)
      }
    },
    validate() {
      const e = {}
      if (!this.form.fullName || !this.form.fullName.trim()) e.fullName = 'Full name is required'
      if (this.form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) e.email = 'Invalid email format'
      
      if (this.form.mobile) {
        if (!/^0\d{9}$/.test(this.form.mobile)) {
          e.mobile = 'Mobile number must be exactly 10 digits long and start with 0';
        }
      }

      // School city and school are both required
      if (!this.selectedCityId && !this.form.schoolId) {
        e.schoolCity = 'School city is required'
        e.school = 'School is required'
      } else if (this.selectedCityId && !this.form.schoolId) {
        e.school = 'Please select a school for the chosen city'
      } else if (!this.selectedCityId && this.form.schoolId) {
        e.schoolCity = 'School city is required when a school is selected'
      }

      this.errors = e
      this.warnings = {}
      return Object.keys(e).length === 0
    },
    getPayload() {
      // Allowlist: only include fields that the backend Zod schemas accept
      const allowedStudentFields = ['fullName', 'gender', 'email', 'mobile', 'otherPhone', 'birthDate', 'parentPhone', 'primaryAddressCity', 'schoolId']
      const allowedSRFields = ['interestedMajorId', 'specificMajorId', 'admissionYear', 'englishCertificate', 'gpa', 'programScore']

      const payload = {}
      for (const key of allowedStudentFields) {
        const value = this.form[key]
        if (value === '' || value === null) {
          payload[key] = null
        } else if (value !== undefined) {
          payload[key] = value
        }
      }
      
      // Handle specializedRegister
      if (this.form.specializedRegister) {
        const srPayload = {}
        for (const key of allowedSRFields) {
          const value = this.form.specializedRegister[key]
          if (value === '' || value === null) {
            srPayload[key] = null
          } else if (value !== undefined) {
            srPayload[key] = value
          }
        }
        if (Object.keys(srPayload).length > 0) {
          payload.specializedRegister = srPayload
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

.section-divider {
  margin-top: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--p-text-color);
  border-bottom: 1px solid var(--p-surface-200);
  padding-bottom: 0.5rem;
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

.form-warning {
  color: var(--p-orange-500);
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
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
