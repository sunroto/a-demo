import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/texts', name: 'texts', component: () => import('../views/SelectTextView.vue') },
    {
      path: '/dictation/:textId',
      name: 'dictation',
      component: () => import('../views/DictationView.vue'),
    },
    { path: '/result', name: 'result', component: () => import('../views/ResultView.vue') },
  ],
})
