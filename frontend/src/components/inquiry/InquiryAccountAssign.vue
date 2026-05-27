<template>
  <div class="section-card">
    <div class="card-header">
      <h2><i class="pi pi-briefcase"></i> Account Assignment</h2>
      <Button 
        label="Select Account" 
        severity="secondary" 
        size="small" 
        icon="pi pi-search" 
        @click="dialogVisible = true" 
      />
    </div>
    
    <div class="selected-entity-area">
      <div class="entity-info" v-if="selectedAccount">
        <div class="entity-avatar"><i class="pi pi-id-card"></i></div>
        <div class="entity-details">
          <h3>{{ selectedAccount.fullName }}</h3>
          <p>{{ selectedAccount.email }} | {{ selectedAccount.role?.name || 'Account' }}</p>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>No account assigned. Inquiry will be unassigned.</p>
      </div>
    </div>

    <!-- Account Selection Dialog -->
    <Dialog v-model:visible="dialogVisible" header="Select Account" :modal="true" :style="{ width: '400px' }">
      <div class="dialog-content">
        <AutoComplete
          v-model="tempSelected"
          :suggestions="accountSuggestions"
          @complete="onSearch"
          optionLabel="fullName"
          placeholder="Search by name or email..."
          fluid
        >
          <template #option="{ option }">
            <div class="autocomplete-item">
              <span class="ac-name">{{ option.fullName }}</span>
              <span class="ac-detail">{{ option.email }} ({{ option.role?.name || 'N/A' }})</span>
            </div>
          </template>
        </AutoComplete>
      </div>
      <template #footer>
        <Button label="Cancel" text severity="secondary" @click="dialogVisible = false" />
        <Button label="Confirm" @click="confirmSelection" :disabled="!tempSelected || !tempSelected.id" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import AutoComplete from 'primevue/autocomplete'
import { useAccountSearch } from '@/composables/useAccountSearch'

const props = defineProps({
  initialAccount: {
    type: Object,
    default: null
  }
})

const { accountSuggestions, searchAccounts } = useAccountSearch()

const selectedAccount = ref(props.initialAccount)
const tempSelected = ref(null)
const dialogVisible = ref(false)

watch(() => props.initialAccount, (newVal) => {
  if (newVal) selectedAccount.value = newVal
}, { immediate: true })

const onSearch = async (event) => {
  await searchAccounts(event.query)
}

const confirmSelection = () => {
  if (tempSelected.value && tempSelected.value.id) {
    selectedAccount.value = tempSelected.value
    dialogVisible.value = false
  }
}

const getPayload = () => {
  return selectedAccount.value ? selectedAccount.value.id : null
}

defineExpose({
  getPayload
})
</script>

<style scoped>
.section-card { 
  background: var(--p-content-background); 
  border: 1px solid var(--p-surface-200); 
  border-radius: 12px; 
  padding: 1.5rem; 
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06); 
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--p-surface-100);
  padding-bottom: 0.75rem;
}

.card-header h2 {
  font-size: 1.15rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--p-text-color);
}

.card-header h2 i {
  color: var(--p-primary-color);
}

.selected-entity-area {
  background: var(--p-surface-50);
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  padding: 1.25rem;
}

.entity-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.entity-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--p-primary-100);
  color: var(--p-primary-700);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.entity-details h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  color: var(--p-text-color);
}

.entity-details p {
  margin: 0;
  color: var(--p-text-muted-color);
  font-size: 0.9rem;
}

.empty-state {
  color: var(--p-text-muted-color);
  font-style: italic;
  font-size: 0.95rem;
}

.dialog-content {
  padding-top: 0.5rem;
  padding-bottom: 1rem;
}

.autocomplete-item { display: flex; flex-direction: column; gap: 0.1rem; }
.ac-name { font-weight: 600; }
.ac-detail { font-size: 0.8rem; color: var(--p-text-muted-color); }
</style>
