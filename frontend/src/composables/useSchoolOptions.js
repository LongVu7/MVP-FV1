import { ref, watch } from 'vue'
import { getAllCities, getSchoolOptions } from '@/helpers/schoolHelper'

export function useSchoolOptions() {
  const cities = ref([])
  const schools = ref([])
  const loadingCities = ref(false)
  const loadingSchools = ref(false)

  const fetchCities = async () => {
    loadingCities.value = true
    try {
      cities.value = await getAllCities()
    } catch (err) {
      cities.value = []
    } finally {
      loadingCities.value = false
    }
  }

  const fetchSchools = async (cityId) => {
    if (!cityId) {
      schools.value = []
      return
    }
    loadingSchools.value = true
    try {
      schools.value = await getSchoolOptions(cityId)
    } catch (err) {
      schools.value = []
    } finally {
      loadingSchools.value = false
    }
  }

  return {
    cities,
    schools,
    loadingCities,
    loadingSchools,
    fetchCities,
    fetchSchools
  }
}
