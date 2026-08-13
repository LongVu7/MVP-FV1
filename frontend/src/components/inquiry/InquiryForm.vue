<template>
  <div class="inquiry-form-fields">
    <!-- Status Data Cascading Dropdowns -->
    <div class="form-grid three-col">
      <div class="form-field">
        <label>Status Interaction</label>
        <Select v-model="selectedInteraction" :options="interactions" optionLabel="label" optionValue="id"
          placeholder="Select interaction" :loading="loadingInteractions" fluid showClear />
      </div>
      <div class="form-field">
        <label>Status General</label>
        <Select v-model="selectedGeneral" :options="generals" optionLabel="label" optionValue="id"
          placeholder="Select general status" :loading="loadingGenerals" :disabled="!selectedInteraction" fluid showClear />
      </div>
      <div class="form-field">
        <label>Status Detail</label>
        <Select v-model="selectedDetail" :options="details" optionLabel="label" optionValue="id"
          placeholder="Select detail" :loading="loadingStatusDetails" :disabled="!selectedGeneral || details.length === 0" fluid showClear />
      </div>
    </div>

    <!-- Source Data Cascading Dropdowns -->
    <div class="form-grid three-col">
      <div class="form-field">
        <label>Source</label>
        <Select v-model="selectedSource" :options="sources" optionLabel="name" optionValue="id"
          placeholder="Select source" :loading="loadingSources" fluid showClear />
      </div>
      <div class="form-field">
        <label>Source Detail</label>
        <Select v-model="selectedSourceDetail" :options="sourceDetails" optionLabel="name" optionValue="id"
          placeholder="Select detail" :loading="loadingSourceDetails" :disabled="!selectedSource" fluid showClear />
      </div>
      <div class="form-field">
        <label>Approach Method</label>
        <Select v-model="selectedApproachMethod" :options="approachMethods" optionLabel="name" optionValue="id"
          placeholder="Select method" :loading="loadingMethods" :disabled="!selectedSourceDetail" fluid showClear />
      </div>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label>Priority</label>
        <InputText :modelValue="modelValue.priority" placeholder="e.g. High, Medium, Low" fluid
          @update:modelValue="emitField('priority', $event)" />
      </div>
      <div class="form-field">
        <label>Data Received</label>
        <DatePicker :modelValue="modelValue.dataReceived" dateFormat="yy-mm-dd" placeholder="Select date"
          :showIcon="true" fluid @update:modelValue="emitField('dataReceived', $event)" />
      </div>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label>Description</label>
        <Textarea :modelValue="modelValue.description" rows="3" placeholder="Enter description" fluid
          @update:modelValue="emitField('description', $event)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { shallowRef, watch, onMounted, nextTick } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import { useSourceData } from '@/composables/useSourceData'
import { getSourceDataById } from '@/helpers/sourceDataHelper'
import { useStatusData } from '@/composables/useStatusData'
import { getStatusDataById } from '@/helpers/statusDataHelper'

const props = defineProps({
  modelValue: { type: Object, required: true },
  initialSourceDataId: { type: Number, default: null },
  initialStatusDataId: { type: Number, default: null }
})

const emit = defineEmits(['update:modelValue'])

// ─── Source Data composable
const {
  sources, sourceDetails, approachMethods,
  loadingSources, loadingSourceDetails, loadingMethods,
  fetchSources, fetchSourceDetails, fetchApproachMethods
} = useSourceData()

// ─── Source Data local selections
const selectedSource = shallowRef(null)
const selectedSourceDetail = shallowRef(null)
const selectedApproachMethod = shallowRef(null)

// ─── Status Data composable
const {
  interactions, generals, details,
  loadingInteractions, loadingGenerals, loadingStatusDetails,
  fetchInteractions, fetchGenerals, fetchDetails
} = useStatusData()

// ─── Status Data local selections
const selectedInteraction = shallowRef(null)
const selectedGeneral = shallowRef(null)
const selectedDetail = shallowRef(null)

let isRestoringSource = false
let isRestoringStatus = false

// ─── Emit helper: shallow-copy to avoid mutating prop
function emitField(field, value) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

// ─── Status Data cascade via watchers
function updateStatusDataId() {
  const id = selectedDetail.value || selectedGeneral.value || selectedInteraction.value || null
  emitField('statusDataId', id)
}

watch(selectedInteraction, (newVal) => {
  if (isRestoringStatus) return
  selectedGeneral.value = null
  selectedDetail.value = null
  generals.value = []
  details.value = []
  updateStatusDataId()

  if (newVal) {
    fetchGenerals(newVal)
  }
})

watch(selectedGeneral, (newVal) => {
  if (isRestoringStatus) return
  selectedDetail.value = null
  details.value = []
  updateStatusDataId()

  if (newVal) {
    fetchDetails(newVal)
  }
})

watch(selectedDetail, () => {
  if (isRestoringStatus) return
  updateStatusDataId()
})

// ─── Source Data cascade via watchers 
function updateSourceDataId() {
  const id = selectedApproachMethod.value || selectedSourceDetail.value || selectedSource.value || null
  emitField('sourceDataId', id)
}

watch(selectedSource, (newVal) => {
  if (isRestoringSource) return
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
  if (isRestoringSource) return
  selectedApproachMethod.value = null
  approachMethods.value = []
  updateSourceDataId()

  if (newVal) {
    fetchApproachMethods(newVal)
  }
})

watch(selectedApproachMethod, () => {
  if (isRestoringSource) return
  updateSourceDataId()
})

// ─── Restore status data selections when editing
async function restoreStatusSelections(statusDataId) {
  isRestoringStatus = true

  try {
    const node = await getStatusDataById(statusDataId)
    if (!node) return

    if (node.level === 'interaction') {
      selectedInteraction.value = node.id
      await fetchGenerals(selectedInteraction.value)
    } else if (node.level === 'general') {
      if (node.parent) {
        selectedInteraction.value = node.parent.id
        await fetchGenerals(selectedInteraction.value)
      }
      selectedGeneral.value = node.id
      await fetchDetails(selectedGeneral.value)
    } else if (node.level === 'detail') {
      if (node.parent) {
        const parentNode = await getStatusDataById(node.parent.id)
        if (parentNode?.parent) {
          selectedInteraction.value = parentNode.parent.id
          await fetchGenerals(selectedInteraction.value)
        }
        selectedGeneral.value = parentNode.id
        await fetchDetails(selectedGeneral.value)
      }
      selectedDetail.value = node.id
    }
  } catch {
    // Silently fail — dropdown simply won't be pre-populated
  } finally {
    await nextTick()
    isRestoringStatus = false
  }
}

// ─── Restore source data selections when editing
async function restoreSourceSelections(sourceDataId) {
  isRestoringSource = true

  try {
    const node = await getSourceDataById(sourceDataId)
    if (!node) return

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
        const parentNode = await getSourceDataById(node.parent.id)
        if (parentNode?.parent) {
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
    await nextTick()
    isRestoringSource = false
  }
}

onMounted(async () => {
  await Promise.all([fetchSources(), fetchInteractions()])
  if (props.initialSourceDataId) {
    await restoreSourceSelections(props.initialSourceDataId)
  }
  if (props.initialStatusDataId) {
    await restoreStatusSelections(props.initialStatusDataId)
  }
})
</script>

<style scoped>
.inquiry-form-fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-grid.three-col {
  grid-template-columns: 1fr 1fr 1fr;
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

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-grid.three-col {
    grid-template-columns: 1fr;
  }
}
</style>
