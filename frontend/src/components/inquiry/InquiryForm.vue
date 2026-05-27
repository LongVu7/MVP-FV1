<template>
  <div class="inquiry-form-fields">
    <div class="form-grid">
      <div class="form-field">
        <label>Status General</label>
        <Select v-model="localForm.statusGeneral" :options="statusGeneralOptions" placeholder="Select status" fluid @change="emitUpdate" />
      </div>
      <div class="form-field">
        <label>Status Detail</label>
        <Select v-model="localForm.statusDetail" :options="statusDetailOptions" placeholder="Select detail" fluid @change="emitUpdate" />
      </div>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label>Lead Source</label>
        <Select v-model="localForm.leadSource" :options="leadSourceOptions" placeholder="Select source" fluid @change="emitUpdate" />
      </div>
      <div class="form-field">
        <label>First Contact Source</label>
        <Select v-model="localForm.firstContactSource" :options="firstContactSourceOptions" placeholder="Select source" fluid @change="emitUpdate" />
      </div>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label>Priority</label>
        <InputText v-model="localForm.priority" placeholder="e.g. High, Medium, Low" fluid @input="emitUpdate" />
      </div>
      <div class="form-field">
        <label>Data Received</label>
        <DatePicker v-model="localForm.dataReceived" dateFormat="yy-mm-dd" placeholder="Select date" :showIcon="true" fluid @update:modelValue="emitUpdate" />
      </div>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label>Data Source</label>
        <Select v-model="localForm.dataSource" :options="dataSourceOptions" placeholder="Select data source" fluid @change="emitUpdate" />
      </div>
      <div class="form-field">
        <label>Description</label>
        <Textarea v-model="localForm.description" rows="3" placeholder="Enter description" fluid @input="emitUpdate" />
      </div>
    </div>
  </div>
</template>

<script>
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'

export default {
  name: 'InquiryForm',
  components: { InputText, Textarea, Select, DatePicker },
  props: {
    modelValue: { type: Object, required: true }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      localForm: { ...this.modelValue },
      statusGeneralOptions: ['new', 'assigned', 'inProcess', 'converted', 'dead'],
      statusDetailOptions: ['interested', 'considered', 'contactLater', 'kbm', 'notContacted', 'applied'],
      leadSourceOptions: ['online', 'direct', 'database', 'referal', 'internal', 'onlineMass', 'resonance', 'other'],
      firstContactSourceOptions: ['tele', 'walkIn', 'online', 'incomingPhone'],
      dataSourceOptions: ['webGame', 'holland', 'roadShowCity', 'roadShowProvince', 'acquireCity', 'acquireProvince', 'cityInquiry', 'provinceInquiry', 'partnership', 'income', 'openDayInquiry', 'eventInquiry', 'activeContact']
    }
  },
  watch: {
    modelValue: {
      handler(newVal) {
        this.localForm = { ...newVal }
      },
      deep: true
    }
  },
  methods: {
    emitUpdate() {
      this.$emit('update:modelValue', this.localForm)
    }
  }
}
</script>

<style scoped>
.inquiry-form-fields { display: flex; flex-direction: column; gap: 1.25rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-field { display: flex; flex-direction: column; gap: 0.35rem; }
.form-field label { font-size: 0.85rem; font-weight: 600; color: var(--p-text-color); }
@media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
</style>
