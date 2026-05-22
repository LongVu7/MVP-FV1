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
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
