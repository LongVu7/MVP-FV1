import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/students',
      name: 'students',
      component: () => import('../views/student/Student.vue'),
    },
    {
      path: '/students/new',
      name: 'student-new',
      component: () => import('../views/student/StudentNew.vue'),
    },
    {
      path: '/students/:id',
      name: 'student-detail',
      component: () => import('../views/student/StudentDetail.vue'),
    },
    {
      path: '/inquiries',
      name: 'inquiries',
      component: () => import('../views/inquiry/Inquiry.vue'),
    },
    {
      path: '/inquiries/new',
      name: 'inquiry-new',
      component: () => import('../views/inquiry/InquiryNew.vue'),
    },
    {
      path: '/inquiries/:id',
      name: 'inquiry-detail',
      component: () => import('../views/inquiry/InquiryDetail.vue'),
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: () => import('../views/account/Account.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: '/accounts/new',
      name: 'account-new',
      component: () => import('../views/account/AccountNew.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: '/accounts/:id',
      name: 'account-detail',
      component: () => import('../views/account/AccountDetail.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: '/groups',
      name: 'groups',
      component: () => import('../views/group/Group.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: '/groups/new',
      name: 'group-new',
      component: () => import('../views/group/GroupNew.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: '/groups/:id',
      name: 'group-detail',
      component: () => import('../views/group/GroupDetail.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: '/schools',
      name: 'schools',
      component: () => import('../views/school/School.vue'),
    },
    {
      path: '/schools/new',
      name: 'school-new',
      component: () => import('../views/school/SchoolNew.vue'),
    },
    {
      path: '/schools/:id',
      name: 'school-detail',
      component: () => import('../views/school/SchoolDetail.vue'),
    },
    {
      path: '/campaigns',
      name: 'campaigns',
      component: () => import('../views/campaign/CampaignList.vue'),
    },
    {
      path: '/campaigns/new',
      name: 'campaign-new',
      component: () => import('../views/campaign/CampaignNew.vue'),
    },
    {
      path: '/campaigns/:id',
      name: 'campaign-detail',
      component: () => import('../views/campaign/CampaignDetail.vue'),
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('../views/report/ReportList.vue'),
    },
    {
      path: '/reports/new',
      name: 'report-new',
      component: () => import('../views/report/ReportNew.vue'),
    },
    {
      path: '/reports/:id',
      name: 'report-detail',
      component: () => import('../views/report/ReportDetail.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

import { useAuthStore } from '@/stores/auth'

// router.beforeEach((to, from, next) => {
//   const authStore = useAuthStore()
  
//   if (to.path !== '/login' && !authStore.isLoggedIn) {
//     next('/login')

//   } else if (to.path === '/login' && authStore.isLoggedIn) {
//     next('/')

//   } else if (to.matched.some(record => record.meta.requiresAdmin) && authStore.user?.roleName !== 'admin') {
//     next('/')
    
//   } else {
//     next()
//   }
// })

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.path !== '/login' && !authStore.isLoggedIn) {
    return '/login'
  }

  if (to.path === '/login' && authStore.isLoggedIn) {
    return '/'
  }

  if (
    to.matched.some(record => record.meta.requiresAdmin) &&
    authStore.user?.roleName?.toLowerCase() !== 'admin'
  ) {
    return '/'
  }
})

export default router
