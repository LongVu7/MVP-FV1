import { ref } from 'vue'
import { searchStaff as apiSearchStaff } from '@/helpers/inquiryHelper'

export function useAccountSearch() {
  const accountSuggestions = ref([])

  const searchAccounts = async (query) => {
    if (!query || query.length < 1) return []
    try {
      accountSuggestions.value = await apiSearchStaff(query)
      // console.log(accountSuggestions.value)
      return accountSuggestions.value
    } catch {
      accountSuggestions.value = []
      return []
    }
  }

  return {
    accountSuggestions,
    searchAccounts
  }
}
