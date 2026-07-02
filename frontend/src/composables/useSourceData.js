import { ref } from 'vue'
import { getRootOptions, getChildrenById } from '@/helpers/sourceDataHelper'

export function useSourceData() {
  const sources = ref([])
  const sourceDetails = ref([])
  const approachMethods = ref([])
  const loadingSources = ref(false)
  const loadingDetails = ref(false)
  const loadingMethods = ref(false)

  const fetchSources = async () => {
    loadingSources.value = true
    try {
      sources.value = await getRootOptions()
    } catch {
      sources.value = []
    } finally {
      loadingSources.value = false
    }
  }

  const fetchSourceDetails = async (sourceId) => {
    if (!sourceId) {
      sourceDetails.value = []
      return
    }
    loadingDetails.value = true
    try {
      sourceDetails.value = await getChildrenById(sourceId)
    } catch {
      sourceDetails.value = []
    } finally {
      loadingDetails.value = false
    }
  }

  const fetchApproachMethods = async (sourceDetailId) => {
    if (!sourceDetailId) {
      approachMethods.value = []
      return
    }
    loadingMethods.value = true
    try {
      approachMethods.value = await getChildrenById(sourceDetailId)
    } catch {
      approachMethods.value = []
    } finally {
      loadingMethods.value = false
    }
  }

  return {
    sources,
    sourceDetails,
    approachMethods,
    loadingSources,
    loadingDetails,
    loadingMethods,
    fetchSources,
    fetchSourceDetails,
    fetchApproachMethods
  }
}
