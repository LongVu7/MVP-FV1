<template>
    <div class="p-fluid">
        <div class="formgrid grid">
            <div class="field col">
                <label for="actType">Type *</label>
                <Select id="actType" v-model="activity.type" :options="typeOptions" optionLabel="label" optionValue="value" :disabled="isEditMode" />
            </div>
            <div class="field col">
                <label for="actName">Activity Name *</label>
                <InputText id="actName" v-model="activity.name" />
            </div>
        </div>

        <div v-if="activity.type === 'EMAIL'" class="field">
            <label for="subject">Email Subject</label>
            <InputText id="subject" v-model="activity.subject" />
        </div>

        <div class="field">
            <label>Content</label>
            <p class="text-500 mb-2 text-sm">Use variables: {{fullName}}, {{email}}, {{mobile}}</p>

            <div v-if="activity.type === 'EMAIL'">
                <Editor v-model="activity.content" editorStyle="height: 280px" />
            </div>
            <div v-else>
                <Textarea v-model="activity.content" rows="6" :placeholder="activity.type === 'SMS' ? 'Enter SMS content...' : 'Enter ZNS content...'" />
                <small class="text-500 block mt-1">Characters: {{ characterCount }}</small>
            </div>
        </div>

        <div class="field">
            <label for="scheduledAt">Scheduled At</label>
            <DatePicker id="scheduledAt" v-model="activity.scheduledAt" showTime dateFormat="dd/mm/yy" showIcon />
        </div>

        <div class="flex justify-content-end gap-2 mt-3">
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="emit('cancel')" />
            <Button :label="isEditMode ? 'Update Activity' : 'Create Activity'" icon="pi pi-check" @click="emit('save')" :loading="loading" />
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Editor from 'primevue/editor'
import Textarea from 'primevue/textarea'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'

const props = defineProps({
    modelValue: { type: Object, required: true },
    isEditMode: { type: Boolean, default: false },
    loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'save', 'cancel'])

const activity = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const typeOptions = [
    { label: 'Email Campaign', value: 'EMAIL' },
    { label: 'SMS Campaign', value: 'SMS' },
    { label: 'ZNS Campaign', value: 'ZNS' }
]

const characterCount = computed(() => {
    return activity.value.content ? activity.value.content.length : 0
})
</script>
