<template>
  <form @submit.prevent="onSubmit" class="student-form">
    <div class="form-grid">
      <div class="form-field">
        <label for="sf-fullName">Full Name <span class="required">*</span></label>
        <InputText id="sf-fullName" v-model="form.fullName" placeholder="Enter full name" :invalid="!!errors.fullName" fluid />
        <small v-if="errors.fullName" class="form-error">{{ errors.fullName }}</small>
      </div>
      <div class="form-field">
        <label for="sf-gender">Gender <span class="required">*</span></label>
        <Select id="sf-gender" v-model="form.gender" :options="genderOptions" optionLabel="label" optionValue="value" placeholder="Select gender" :invalid="!!errors.gender" fluid />
        <small v-if="errors.gender" class="form-error">{{ errors.gender }}</small>
      </div>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label for="sf-email">Email</label>
        <InputText id="sf-email" v-model="form.email" placeholder="student@email.com" :invalid="!!errors.email" fluid />
        <small v-if="errors.email" class="form-error">{{ errors.email }}</small>
      </div>
      <div class="form-field">
        <label for="sf-mobile">Mobile <span class="required">*</span></label>
        <InputText id="sf-mobile" v-model="form.mobile" placeholder="Phone number" :invalid="!!errors.mobile" fluid />
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
        <DatePicker id="sf-birthDate" v-model="form.birthDate" dateFormat="dd-mm-yy" placeholder="Select date" :showIcon="true" fluid />
      </div>
      <div class="form-field">
        <label for="sf-primaryAddress">Primary address</label>
        <InputText id="sf-primaryAddress" v-model="form.primaryAddress" placeholder="Primary address" fluid />
      </div>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label for="sf-priority">Priority</label>
        <Select id="sf-priority" v-model="form.priority" :options="priorityOptions" optionLabel="label" optionValue="value" placeholder="Select priority" showClear fluid />
      </div>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label for="sf-schoolOldProvince">School Old Province <span class="required">*</span></label>
        <Select id="sf-schoolOldProvince" v-model="selectedOldProvinceId" :options="oldProvinces" optionLabel="name" optionValue="id" placeholder="Select old province" :loading="loadingOldProvinces" :invalid="!!errors.schoolOldProvince" filter showClear fluid @change="onOldProvinceChange" />
        <small v-if="errors.schoolOldProvince" class="form-error">{{ errors.schoolOldProvince }}</small>
      </div>
      <div class="form-field">
        <label for="sf-school">School <span class="required">*</span></label>
        <Select id="sf-school" v-model="form.education.schoolId" :options="schools" optionLabel="name" optionValue="id" placeholder="Select school" :loading="loadingSchools" :disabled="!selectedOldProvinceId" :invalid="!!errors.school" filter showClear fluid />
        <small v-if="errors.school" class="form-error">{{ errors.school }}</small>
      </div>
    </div>
    
    <div class="form-grid">
      <div class="form-field">
        <label for="sf-newProvince">New Province <span class="required">*</span></label>
        <Select id="sf-newProvince" v-model="form.education.newProvinceId" :options="newProvinces" optionLabel="name" optionValue="id" placeholder="Select new province" :loading="loadingNewProvinces" :invalid="!!errors.newProvince" filter showClear fluid />
        <small v-if="errors.newProvince" class="form-error">{{ errors.newProvince }}</small>
      </div>
      <div class="form-field">
        <label for="sf-country">School Country <span class="required">*</span></label>
        <Select id="sf-country" v-model="form.education.countryId" :options="countries" optionLabel="name" optionValue="id" placeholder="Select country" :loading="loadingCountries" :invalid="!!errors.country" filter showClear fluid />
        <small v-if="errors.country" class="form-error">{{ errors.country }}</small>
      </div>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label for="sf-schoolType">School Type <span class="required">*</span></label>
        <Select id="sf-schoolType" v-model="form.education.schoolType" :options="schoolTypeOptions" optionLabel="label" optionValue="value" placeholder="Select school type" :invalid="!!errors.schoolType" showClear fluid />
        <small v-if="errors.schoolType" class="form-error">{{ errors.schoolType }}</small>
      </div>
      <div class="form-field">
        <label for="sf-provinceGroup">Province Group <span class="required">*</span></label>
        <Select id="sf-provinceGroup" v-model="form.education.provinceGroup" :options="provinceGroupOptions" optionLabel="label" optionValue="value" placeholder="Select province group" :invalid="!!errors.provinceGroup" showClear fluid />
        <small v-if="errors.provinceGroup" class="form-error">{{ errors.provinceGroup }}</small>
      </div>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label for="sf-class">Class <span class="required">*</span></label>
        <Select id="sf-class" v-model="form.education.class" :options="classOptions" optionLabel="label" optionValue="value" placeholder="Select class" :invalid="!!errors.class" showClear fluid />
        <small v-if="errors.class" class="form-error">{{ errors.class }}</small>
      </div>
    </div>

    <div class="section-divider">Academic Intentions</div>

    <div class="form-grid">
      <div class="form-field">
        <label for="sf-gpa">GPA <span class="required">*</span></label>
        <Select id="sf-gpa" v-model="form.specializedRegister.gpa" :options="gpaOptions" optionLabel="label" optionValue="value" placeholder="Select GPA" :invalid="!!errors.gpa" showClear fluid />
        <small v-if="errors.gpa" class="form-error">{{ errors.gpa }}</small>
      </div>
      <div class="form-field">
        <label for="sf-englishCert">English Certificate</label>
        <Select id="sf-englishCert" v-model="form.specializedRegister.englishCertificate" :options="englishCertOptions" optionLabel="label" optionValue="value" placeholder="Select certificate" showClear fluid />
      </div>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label for="sf-interestedMajor">Interested Major <span class="required">*</span></label>
        <Select id="sf-interestedMajor" v-model="form.specializedRegister.interestedMajorId"
          :options="interestedMajors" optionLabel="name" optionValue="id"
          placeholder="Select major" :loading="loadingInterested"
          :invalid="!!errors.interestedMajor" filter showClear fluid @change="onInterestedMajorChange" />
        <small v-if="errors.interestedMajor" class="form-error">{{ errors.interestedMajor }}</small>
      </div>
      <div class="form-field">
        <label for="sf-specificMajor">Specific Major <span class="required">*</span></label>
        <Select id="sf-specificMajor" v-model="form.specializedRegister.specificMajorId"
          :options="specificMajors" optionLabel="name" optionValue="id"
          placeholder="Select specific major" :loading="loadingSpecific"
          :disabled="!form.specializedRegister.interestedMajorId"
          :invalid="!!errors.specificMajor" filter showClear fluid />
        <small v-if="errors.specificMajor" class="form-error">{{ errors.specificMajor }}</small>
      </div>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label for="sf-programScore">Program Score <span class="required">*</span></label>
        <Select id="sf-programScore" v-model="form.specializedRegister.programScore" :options="programScoreOptions" optionLabel="label" optionValue="value" placeholder="Select Program Score" :invalid="!!errors.programScore" showClear fluid />
        <small v-if="errors.programScore" class="form-error">{{ errors.programScore }}</small>
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
import { useNewProvinceOptions } from '@/composables/useNewProvinceOptions'
import { useCountryOptions } from '@/composables/useCountryOptions'
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
    const { oldProvinces, schools, loadingOldProvinces, loadingSchools, fetchOldProvinces, fetchSchools } = useSchoolOptions()
    const { newProvinces, loadingNewProvinces, fetchNewProvinces } = useNewProvinceOptions()
    const { countries, loadingCountries, fetchCountries } = useCountryOptions()
    const { interestedMajors, specificMajors, loadingInterested, loadingSpecific, fetchInterestedMajors, fetchSpecificMajors } = useMajorOptions()
    return { 
      oldProvinces, schools, loadingOldProvinces, loadingSchools, fetchOldProvinces, fetchSchools,
      newProvinces, loadingNewProvinces, fetchNewProvinces,
      countries, loadingCountries, fetchCountries,
      interestedMajors, specificMajors, loadingInterested, loadingSpecific, fetchInterestedMajors, fetchSpecificMajors
    }
  },
  data() {
    return {
      form: { 
        ...this.student,
        education: this.student.education ? { ...this.student.education } : {},
        specializedRegister: this.student.specializedRegister ? { ...this.student.specializedRegister } : {}
      },
      errors: {},
      warnings: {},
      selectedOldProvinceId: null,
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
      ],
      schoolTypeOptions: [
        { label: 'A*', value: 'A_STAR' },
        { label: 'A', value: 'A' },
        { label: 'B', value: 'B' },
        { label: 'C', value: 'C' },
        { label: 'D', value: 'D' }
      ],
      provinceGroupOptions: [
        { label: 'Ho Chi Minh', value: 'HO_CHI_MINH' },
        { label: 'Core Province', value: 'CORE_PROVINCE' },
        { label: 'Other Province', value: 'OTHER_PROVINCE' },
        { label: 'Foreign', value: 'FOREIGN' }
      ],
      priorityOptions: [
        { label: 'I', value: 'I' },
        { label: 'II', value: 'II' },
        { label: 'III', value: 'III' },
        { label: 'IV', value: 'IV' },
        { label: 'V', value: 'V' }
      ],
      classOptions: [
        { label: 'Lớp 11', value: 'GRADE_11' },
        { label: 'Lớp 12', value: 'GRADE_12' },
        { label: 'Thí sinh tự do', value: 'FREELANCE' }
      ]
    }
  },
  watch: {
    student: {
      async handler(newVal) {
        this.form = { 
          ...newVal,
          education: newVal.education ? { ...newVal.education } : {},
          specializedRegister: { ...newVal.specializedRegister }
        }
        this.errors = {}
        // Restore old province selection when editing an existing student with school data
        if (newVal.education?.school?.oldProvince?.id) {
          this.selectedOldProvinceId = newVal.education.school.oldProvince.id
          this.fetchSchools(this.selectedOldProvinceId)
        } else {
          this.selectedOldProvinceId = null
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
    this.fetchOldProvinces()
    this.fetchNewProvinces()
    this.fetchCountries()
    // If editing student with existing school, load the school's old province dropdown
    if (this.student.education?.school?.oldProvince?.id) {
      this.selectedOldProvinceId = this.student.education.school.oldProvince.id
      this.fetchSchools(this.selectedOldProvinceId)
    }

    // Fetch interested majors
    await this.fetchInterestedMajors()
    if (this.form.specializedRegister?.interestedMajorId) {
      this.fetchSpecificMajors(this.form.specializedRegister.interestedMajorId)
    }
  },
  methods: {
    onOldProvinceChange() {
      this.form.education.schoolId = null
      if (this.selectedOldProvinceId) {
        this.fetchSchools(this.selectedOldProvinceId)
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
      
      if (!this.form.mobile) {
        e.mobile = 'Mobile is required'
      } else if (!/^0\d{9}$/.test(this.form.mobile)) {
        e.mobile = 'Mobile number must be exactly 10 digits long and start with 0'
      }

      if (!this.form.gender) e.gender = 'Gender is required'

      if (!this.form.education?.newProvinceId) e.newProvince = 'New Province is required'
      if (!this.form.education?.countryId) e.country = 'Country is required'
      if (!this.form.education?.schoolType) e.schoolType = 'School Type is required'
      if (!this.form.education?.provinceGroup) e.provinceGroup = 'Province Group is required'
      if (!this.form.education?.class) e.class = 'Class is required'

      if (!this.form.specializedRegister?.gpa) e.gpa = 'GPA is required'
      if (!this.form.specializedRegister?.interestedMajorId) e.interestedMajor = 'Interested Major is required'
      if (!this.form.specializedRegister?.specificMajorId) e.specificMajor = 'Specific Major is required'
      if (!this.form.specializedRegister?.programScore) e.programScore = 'Program Score is required'

      // Required field validation
      if (!this.selectedOldProvinceId && !this.form.education?.schoolId) {
        e.schoolOldProvince = 'School old province is required'
        e.school = 'School is required'
      } else if (this.selectedOldProvinceId && !this.form.education?.schoolId) {
        e.school = 'Please select a school for the chosen old province'
      } else if (!this.selectedOldProvinceId && this.form.education?.schoolId) {
        e.schoolOldProvince = 'School old province is required when a school is selected'
      }

      this.errors = e
      this.warnings = {}
      return Object.keys(e).length === 0
    },
    getPayload() {
      // Allowlist: only include fields that the backend Zod schemas accept
      const allowedStudentFields = ['fullName', 'gender', 'email', 'mobile', 'otherPhone', 'birthDate', 'parentPhone', 'primaryAddress', 'priority']
      const allowedEducationFields = ['schoolId', 'newProvinceId', 'countryId', 'provinceGroup', 'schoolType', 'class']
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
      
      // Handle education
      if (this.form.education) {
        const eduPayload = {}
        for (const key of allowedEducationFields) {
          const value = this.form.education[key]
          if (value === '' || value === null) {
            eduPayload[key] = null
          } else if (value !== undefined) {
            eduPayload[key] = value
          }
        }
        if (Object.keys(eduPayload).length > 0) {
          payload.education = eduPayload
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
