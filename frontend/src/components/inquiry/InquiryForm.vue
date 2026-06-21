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

    <!-- Source Data Cascading Dropdowns -->
    <div class="form-grid three-col">
      <div class="form-field">
        <label>Source</label>
        <Select 
          v-model="selectedSource" 
          :options="sources" 
          optionLabel="name" 
          optionValue="id" 
          placeholder="Select source" 
          :loading="loadingSources"
          fluid 
          showClear
          @change="onSourceChange" 
        />
      </div>
      <div class="form-field">
        <label>Source Detail</label>
        <Select 
          v-model="selectedSourceDetail" 
          :options="sourceDetails" 
          optionLabel="name" 
          optionValue="id" 
          placeholder="Select detail" 
          :loading="loadingDetails"
          :disabled="!selectedSource"
          fluid 
          showClear
          @change="onSourceDetailChange" 
        />
      </div>
      <div class="form-field">
        <label>Approach Method</label>
        <Select 
          v-model="selectedApproachMethod" 
          :options="approachMethods" 
          optionLabel="name" 
          optionValue="id" 
          placeholder="Select method" 
          :loading="loadingMethods"
          :disabled="!selectedSourceDetail"
          fluid 
          showClear
          @change="onApproachMethodChange" 
        />
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
import { useSourceData } from '@/composables/useSourceData'

export default {
  name: 'InquiryForm',
  components: { InputText, Textarea, Select, DatePicker },
  props: {
    modelValue: { type: Object, required: true },
    initialSourceDataId: { type: Number, default: null }
  },
  emits: ['update:modelValue'],
  setup() {
    const {
      sources, sourceDetails, approachMethods,
      loadingSources, loadingDetails, loadingMethods,
      fetchSources, fetchSourceDetails, fetchApproachMethods
    } = useSourceData()

    return {
      sources, sourceDetails, approachMethods,
      loadingSources, loadingDetails, loadingMethods,
      fetchSources, fetchSourceDetails, fetchApproachMethods
    }
  },
  data() {
    return {
      localForm: { ...this.modelValue },
      selectedSource: null,
      selectedSourceDetail: null,
      selectedApproachMethod: null,
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
  async mounted() {
    await this.fetchSources()

    // Restore cascading selections when editing an existing inquiry
    if (this.initialSourceDataId) {
      await this.restoreSelections(this.initialSourceDataId)
    }
  },
  methods: {
    emitUpdate() {
      this.$emit('update:modelValue', this.localForm)
    },

    onSourceChange() {
      // Reset dependent dropdowns
      this.selectedSourceDetail = null
      this.selectedApproachMethod = null
      this.sourceDetails = []
      this.approachMethods = []
      this.updateSourceDataId()

      if (this.selectedSource) {
        this.fetchSourceDetails(this.selectedSource)
      }
    },

    onSourceDetailChange() {
      // Reset approach method
      this.selectedApproachMethod = null
      this.approachMethods = []
      this.updateSourceDataId()

      if (this.selectedSourceDetail) {
        this.fetchApproachMethods(this.selectedSourceDetail)
      }
    },

    onApproachMethodChange() {
      this.updateSourceDataId()
    },

    updateSourceDataId() {
      // Pick the deepest selected option as sourceDataId
      this.localForm.sourceDataId = this.selectedApproachMethod || this.selectedSourceDetail || this.selectedSource || null
      this.emitUpdate()
    },

    async restoreSelections(sourceDataId) {
      // Walk up the hierarchy to find all ancestors
      const { getChildrenById } = await import('@/helpers/sourceDataHelper')
      const api = (await import('@/helpers/helper.js')).default

      try {
        // Fetch the selected node to determine its level
        const response = await api.get(`/source-data/${sourceDataId}`)
        const node = response.data.data

        if (node.level === 'source') {
          this.selectedSource = node.id
          await this.fetchSourceDetails(this.selectedSource)
        } else if (node.level === 'sourceDetail') {
          // Restore parent (source), then load children
          if (node.parent) {
            this.selectedSource = node.parent.id
            await this.fetchSourceDetails(this.selectedSource)
          }
          this.selectedSourceDetail = node.id
          await this.fetchApproachMethods(this.selectedSourceDetail)
        } else if (node.level === 'approachMethod') {
          // Restore grandparent (source) → parent (sourceDetail) → self
          if (node.parent) {
            const parentResponse = await api.get(`/source-data/${node.parent.id}`)
            const parentNode = parentResponse.data.data

            if (parentNode.parent) {
              this.selectedSource = parentNode.parent.id
              await this.fetchSourceDetails(this.selectedSource)
            }
            this.selectedSourceDetail = parentNode.id
            await this.fetchApproachMethods(this.selectedSourceDetail)
          }
          this.selectedApproachMethod = node.id
        }
      } catch {
        // Silently fail — dropdown simply won't be pre-populated
      }
    }
  }
}
</script>

<style scoped>
.inquiry-form-fields { display: flex; flex-direction: column; gap: 1.25rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-grid.three-col { grid-template-columns: 1fr 1fr 1fr; }
.form-field { display: flex; flex-direction: column; gap: 0.35rem; }
.form-field label { font-size: 0.85rem; font-weight: 600; color: var(--p-text-color); }
@media (max-width: 640px) { 
  .form-grid { grid-template-columns: 1fr; } 
  .form-grid.three-col { grid-template-columns: 1fr; }
}
</style>
