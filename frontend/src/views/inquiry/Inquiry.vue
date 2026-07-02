<template>
  <div class="inquiry-list-view">
    <div class="page-header">
      <div class="header-left">
        <h1><i class="pi pi-ticket"></i> Inquiry Management</h1>
        <Tag :value="`${pagination?.totalCount || 0} inquiries`" severity="info" rounded />
      </div>
      <div class="header-actions">
        <Button label="New Inquiry" icon="pi pi-plus" @click="$router.push('/inquiries/new')" />
      </div>
    </div>

    <InquiryList 
      :inquiries="inquiries"
      :loading="loading"
      :pagination="pagination"
      @page-change="onPageChange"
      @search="onSearch"
      @delete="onDelete"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import InquiryList from '@/components/inquiry/InquiryList.vue'
import { useInquiry } from '@/composables/useInquiry'
import { useToast } from 'primevue/usetoast'

const { inquiries, pagination, loading, fetchInquiries, deleteInquiry } = useInquiry()
const toast = useToast()

const currentParams = ref({ page: 1, limit: 20, search: '' })

onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  try {
    await fetchInquiries(currentParams.value)
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load inquiries', life: 5000 })
  }
}

const onPageChange = async ({ page, limit }) => {
  currentParams.value.page = page
  currentParams.value.limit = limit
  await loadData()
}

const onSearch = async (searchQuery) => {
  currentParams.value.search = searchQuery
  currentParams.value.page = 1
  await loadData()
}

const onDelete = async (id) => {
  try {
    await deleteInquiry(id)
    toast.add({ severity: 'success', summary: 'Deleted', detail: 'Inquiry deleted', life: 3000 })
    await loadData()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete inquiry', life: 5000 })
  }
}
</script>

<style scoped>
.inquiry-list-view { padding: 1.5rem 2rem; max-width: 100%; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.header-left { display: flex; align-items: center; gap: 0.75rem; }
.header-left h1 { display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; font-weight: 700; margin: 0; color: var(--p-text-color); }
.header-left h1 i { color: var(--p-primary-color); }
.header-actions { display: flex; gap: 0.5rem; }
</style>
