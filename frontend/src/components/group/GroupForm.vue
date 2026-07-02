<template>
  <form @submit.prevent="onSubmit" class="group-form">
    <div class="form-grid">
      <div class="form-field">
        <label for="gf-name">Group Name <span class="required">*</span></label>
        <InputText id="gf-name" v-model="form.name" placeholder="Enter group name" :invalid="!!errors.name" fluid />
        <small v-if="errors.name" class="form-error">{{ errors.name }}</small>
      </div>

      <div class="form-field">
        <label for="gf-leader">Group Leader</label>
        <Select
          id="gf-leader"
          v-model="form.groupLeaderId"
          :options="leaderOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select a group leader"
          showClear
          fluid
        />
      </div>
    </div>

    <div class="form-actions">
      <Button type="submit" :label="buttonText" icon="pi pi-check" :loading="isSubmitting" />
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'

const props = defineProps({
  group: { type: Object, required: true },
  accounts: { type: Array, default: () => [] },
  isSubmitting: { type: Boolean, default: false },
  buttonText: { type: String, default: 'Submit' }
})

const emit = defineEmits(['submit'])

const form = ref({ ...props.group })
const errors = ref({})

watch(() => props.group, (newVal) => {
  form.value = { ...newVal }
  errors.value = {}
}, { deep: true })

const leaderOptions = computed(() =>
  props.accounts.map(acc => ({
    label: acc.fullName ? `${acc.fullName} (${acc.email})` : acc.email,
    value: acc.id
  }))
)

const validate = () => {
  const e = {}
  if (!form.value.name || !form.value.name.trim()) {
    e.name = 'Group name is required'
  }
  errors.value = e
  return Object.keys(e).length === 0
}

const getPayload = () => {
  const payload = {}
  payload.name = form.value.name.trim()
  payload.groupLeaderId = form.value.groupLeaderId || null
  return payload
}

const onSubmit = () => {
  if (!validate()) return
  emit('submit', getPayload())
}
</script>


<style scoped>
.group-form {
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
