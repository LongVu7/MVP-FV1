<template>
    <div class="p-fluid">
        <div class="field">
            <label for="name">Campaign Name *</label>
            <InputText id="name" v-model="campaign.name" required autofocus />
        </div>

        <div class="field">
            <label for="description">Description</label>
            <Textarea id="description" v-model="campaign.description" rows="3" />
        </div>

        <div class="formgrid grid">
            <div class="field col">
                <label for="owner">Campaign Owner *</label>
                <Select id="owner" v-model="campaign.ownerId" :options="accounts" optionLabel="fullName" optionValue="id" placeholder="Select owner" filter />
            </div>
            <div class="field col">
                <label for="status">Status *</label>
                <Select id="status" v-model="campaign.status" :options="statusOptions" optionLabel="label" optionValue="value" />
            </div>
        </div>

        <div class="formgrid grid">
            <div class="field col">
                <label for="startDate">Start Date *</label>
                <DatePicker id="startDate" v-model="campaign.startDate" dateFormat="dd/mm/yy" showIcon />
            </div>
            <div class="field col">
                <label for="endDate">End Date</label>
                <DatePicker id="endDate" v-model="campaign.endDate" dateFormat="dd/mm/yy" showIcon />
            </div>
        </div>

        <div class="field">
            <label for="notes">Notes</label>
            <Textarea id="notes" v-model="campaign.notes" rows="2" />
        </div>

        <div class="flex justify-content-end gap-2 mt-4">
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="emit('cancel')" />
            <Button :label="isEditMode ? 'Update Campaign' : 'Create Campaign'" icon="pi pi-check" @click="emit('save')" :loading="loading" />
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import { getAllAccounts } from '@/helpers/accountHelper'

const props = defineProps({
    modelValue: { type: Object, required: true },
    isEditMode: { type: Boolean, default: false },
    loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'save', 'cancel'])

const campaign = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const accounts = ref([])

const statusOptions = [
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' }
]

onMounted(async () => {
    try {
        accounts.value = await getAllAccounts()
    } catch (e) {
        // Accounts fail silently — dropdown just stays empty
    }
})
</script>
