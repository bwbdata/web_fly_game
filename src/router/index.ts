import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import GameView from '@/views/GameView.vue'
import UpgradeView from '@/views/UpgradeView.vue'
import RankView from '@/views/RankView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/game',
      name: 'game',
      component: GameView
    },
    {
      path: '/upgrade',
      name: 'upgrade',
      component: UpgradeView
    },
    {
      path: '/rank',
      name: 'rank',
      component: RankView
    }
  ]
})

export default router
