import { ref } from 'vue'
import { searchAccounts as apiSearchAccounts } from '@/helpers/inquiryHelper'

export function useAccountSearch() {
  const accountSuggestions = ref([])

  const searchAccounts = async (query) => {
    if (!query || query.length < 1) return []
    try {
      accountSuggestions.value = await apiSearchAccounts(query)
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
