import { defineStore } from 'pinia'
import { login as apiLogin, logout as apiLogout, getMe as apiGetMe } from '@/helpers/authHelper'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false
  }),
  getters: {
    isLoggedIn: (state) => !!state.user
  },
  actions: {
    async login(email, password) {
      this.loading = true
      try {
        const data = await apiLogin(email, password)
        this.user = data.user
        return data
      } finally {
        this.loading = false
      }
    },
    async logout() {
      try {
        await apiLogout()
      } finally {
        this.user = null
      }
    },
    async checkAuth() {
      this.loading = true
      try {
        const data = await apiGetMe()
        this.user = data.user
      } catch (error) {
        this.user = null
      } finally {
        this.loading = false
      }
    }
  }
})
