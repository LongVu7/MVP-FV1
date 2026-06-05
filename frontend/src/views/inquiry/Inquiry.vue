<template>
  <div class="inquiry-list-view">
    <div class="page-header">
      <div class="header-left">
        <h1><i class="pi pi-ticket"></i> Inquiry Management</h1>
        <Tag :value="`${inquiryCount} inquiries`" severity="info" rounded />
      </div>
      <div class="header-actions">
        <Button label="New Inquiry" icon="pi pi-plus" @click="$router.push('/inquiries/new')" />
      </div>
    </div>

    <InquiryList />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import InquiryList from '@/components/inquiry/InquiryList.vue'
import { useInquiry } from '@/composables/useInquiry'

const { inquiries, fetchInquiries } = useInquiry()
const inquiryCount = computed(() => inquiries.value.length)

onMounted(async () => {
  try {
    await fetchInquiries()
  } catch (e) {
    // handled
  }
})
</script>

<style scoped>
.inquiry-list-view { padding: 1.5rem 2rem; max-width: 100%; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.header-left { display: flex; align-items: center; gap: 0.75rem; }
.header-left h1 { display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; font-weight: 700; margin: 0; color: var(--p-text-color); }
.header-left h1 i { color: var(--p-primary-color); }
.header-actions { display: flex; gap: 0.5rem; }
</style>
