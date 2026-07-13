<script setup>
import { shallowRef, computed, watch, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import { useSourceData } from '@/composables/useSourceData'
import { useStatusTree } from '@/composables/useStatusTree'

const props = defineProps({
  modelValue: { type: Object, required: true },
  initialSourceDataId: { type: Number, default: null }
})

const emit = defineEmits(['update:modelValue'])

// ─── Source Data composable
const {
  sources, sourceDetails, approachMethods,
  loadingSources, loadingDetails, loadingMethods,
  fetchSources, fetchSourceDetails, fetchApproachMethods
} = useSourceData()

// ─── Source Data local selections (not part of modelValue)
const selectedSource = shallowRef(null)
const selectedSourceDetail = shallowRef(null)
const selectedApproachMethod = shallowRef(null)

// ─── Status cascade options (derived from modelValue)
const interactionRef = computed(() => props.modelValue.statusInteraction)
const generalRef = computed(() => props.modelValue.statusGeneral)

const {
  interactionOptions,
  generalOptions,
  detailOptions,
  showDetailDropdown
} = useStatusTree(interactionRef, generalRef)

// ─── Static options
const dataSourceOptions = [
  'webGame', 'holland', 'roadShowCity', 'roadShowProvince',
  'acquireCity', 'acquireProvince', 'cityInquiry', 'provinceInquiry',
  'partnership', 'income', 'openDayInquiry', 'eventInquiry', 'activeContact'
]

// ─── Emit helper: shallow-copy to avoid mutating prop
function emitField(field, value) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

function emitFields(updates) {
  emit('update:modelValue', { ...props.modelValue, ...updates })
}

// ─── Status cascade handlers
function onInteractionChange(event) {
  emitFields({
    statusInteraction: event.value,
    statusGeneral: null,
    statusDetail: null
  })
}

function onGeneralChange(event) {
  emitFields({
    statusGeneral: event.value,
    statusDetail: null
  })
}

function onDetailChange(event) {
  emitField('statusDetail', event.value)
}

let isRestoring = false

// ─── Source Data cascade via watchers (watchers fire on clear + select + programmatic changes)
function updateSourceDataId() {
  const id = selectedApproachMethod.value || selectedSourceDetail.value || selectedSource.value || null
  emitField('sourceDataId', id)
}

watch(selectedSource, (newVal) => {
  if (isRestoring) return
  selectedSourceDetail.value = null
  selectedApproachMethod.value = null
  sourceDetails.value = []
  approachMethods.value = []
  updateSourceDataId()

  if (newVal) {
    fetchSourceDetails(newVal)
  }
})

watch(selectedSourceDetail, (newVal) => {
  if (isRestoring) return
  selectedApproachMethod.value = null
  approachMethods.value = []
  updateSourceDataId()

  if (newVal) {
    fetchApproachMethods(newVal)
  }
})

watch(selectedApproachMethod, (newVal) => {
  if (isRestoring) return
  updateSourceDataId()
})

// ─── Restore source data selections when editing
async function restoreSelections(sourceDataId) {
  isRestoring = true
  const api = (await import('@/helpers/helper.js')).default

  try {
    const response = await api.get(`/source-data/${sourceDataId}`)
    const node = response.data.data

    if (node.level === 'source') {
      selectedSource.value = node.id
      await fetchSourceDetails(selectedSource.value)
    } else if (node.level === 'sourceDetail') {
      if (node.parent) {
        selectedSource.value = node.parent.id
        await fetchSourceDetails(selectedSource.value)
      }
      selectedSourceDetail.value = node.id
      await fetchApproachMethods(selectedSourceDetail.value)
    } else if (node.level === 'approachMethod') {
      if (node.parent) {
        const parentResponse = await api.get(`/source-data/${node.parent.id}`)
        const parentNode = parentResponse.data.data
        if (parentNode.parent) {
          selectedSource.value = parentNode.parent.id
          await fetchSourceDetails(selectedSource.value)
        }
        selectedSourceDetail.value = parentNode.id
        await fetchApproachMethods(selectedSourceDetail.value)
      }
      selectedApproachMethod.value = node.id
    }
  } catch {
    // Silently fail — dropdown simply won't be pre-populated
  } finally {
    // Use nextTick to ensure watchers run before we unset the flag
    import('vue').then(({ nextTick }) => {
      nextTick(() => {
        isRestoring = false
      })
    })
  }
}

onMounted(async () => {
  await fetchSources()
  if (props.initialSourceDataId) {
    await restoreSelections(props.initialSourceDataId)
  }
})
</script>

<template>
  <div class="inquiry-form-fields">
    <!-- Status Cascading Dropdowns -->
    <div class="form-grid three-col">
      <div class="form-field">
        <label>Status Interaction</label>
        <Select
          :modelValue="modelValue.statusInteraction"
          :options="interactionOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select interaction"
          fluid
          showClear
          @change="onInteractionChange"
        />
      </div>
      <div class="form-field">
        <label>Status General</label>
        <Select
          :modelValue="modelValue.statusGeneral"
          :options="generalOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select general status"
          :disabled="!modelValue.statusInteraction"
          fluid
          showClear
          @change="onGeneralChange"
        />
      </div>
      <div class="form-field">
        <label>Status Detail</label>
        <Select
          :modelValue="modelValue.statusDetail"
          :options="detailOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select detail"
          :disabled="!showDetailDropdown"
          fluid
          showClear
          @change="onDetailChange"
        />
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
        />
      </div>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label>Priority</label>
        <InputText :modelValue="modelValue.priority" placeholder="e.g. High, Medium, Low" fluid @update:modelValue="emitField('priority', $event)" />
      </div>
      <div class="form-field">
        <label>Data Received</label>
        <DatePicker :modelValue="modelValue.dataReceived" dateFormat="yy-mm-dd" placeholder="Select date" :showIcon="true" fluid @update:modelValue="emitField('dataReceived', $event)" />
      </div>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label>Data Source</label>
        <Select :modelValue="modelValue.dataSource" :options="dataSourceOptions" placeholder="Select data source" fluid @change="emitField('dataSource', $event.value)" />
      </div>
      <div class="form-field">
        <label>Description</label>
        <Textarea :modelValue="modelValue.description" rows="3" placeholder="Enter description" fluid @update:modelValue="emitField('description', $event)" />
      </div>
    </div>
  </div>
</template>

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
