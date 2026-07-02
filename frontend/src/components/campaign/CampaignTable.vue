<template>
    <DataTable :value="campaigns" :loading="loading" dataKey="id" paginator :rows="10" responsiveLayout="scroll">
        <template #empty> No campaigns found. </template>
        <template #loading> Loading campaigns data. Please wait. </template>

        <Column field="name" header="Campaign Name" sortable style="min-width: 14rem"></Column>
        <Column field="owner.fullName" header="Owner" sortable style="min-width: 10rem"></Column>
        <Column field="status" header="Status" sortable style="min-width: 10rem">
            <template #body="{ data }">
                <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
            </template>
        </Column>
        <Column field="startDate" header="Start Date" sortable style="min-width: 10rem">
            <template #body="{ data }">
                {{ formatDate(data.startDate) }}
            </template>
        </Column>
        <Column field="endDate" header="End Date" sortable style="min-width: 10rem">
            <template #body="{ data }">
                {{ formatDate(data.endDate) }}
            </template>
        </Column>
        
        <Column headerStyle="min-width:10rem;">
            <template #body="{ data }">
                <Button icon="pi pi-pencil" class="mr-2" rounded outlined @click="emit('edit', data.id)" />
                <Button icon="pi pi-trash" rounded outlined severity="danger" @click="emit('delete', data.id)" />
            </template>
        </Column>
    </DataTable>
</template>

<script setup>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

defineProps({
    campaigns: { type: Array, required: true },
    loading: { type: Boolean, default: false }
})

const emit = defineEmits(['edit', 'delete'])

const getStatusSeverity = (status) => {
    switch (status) {
        case 'in_progress': return 'info'
        case 'completed': return 'success'
        case 'scheduled': return 'warning'
        case 'cancelled': return 'danger'
        default: return 'secondary'
    }
}

const formatDate = (value) => {
    if (!value) return ''
    return new Date(value).toLocaleDateString('en-US')
}
</script>
