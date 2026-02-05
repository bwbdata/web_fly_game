<template>
  <div class="home-view">
    <h1 class="title">飞机射击</h1>
    <div class="subtitle">BLACK & WHITE</div>

    <div class="menu">
      <button class="menu-btn" @click="startGame">开始游戏</button>
      <button class="menu-btn" @click="goToRank">排行榜</button>
    </div>

    <div class="high-score">
      最高分: {{ gameStore.highScore }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'

const router = useRouter()
const gameStore = useGameStore()

const startGame = () => {
  gameStore.resetGame()
  router.push('/game')
}

const goToRank = () => {
  router.push('/rank')
}
</script>

<style scoped>
.home-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #000;
  color: #fff;
}

.title {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 10px;
  letter-spacing: 4px;
}

.subtitle {
  font-size: 16px;
  letter-spacing: 8px;
  margin-bottom: 60px;
  opacity: 0.7;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.menu-btn {
  width: 200px;
  height: 50px;
  background-color: transparent;
  color: #fff;
  border: 2px solid #fff;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s;
  letter-spacing: 2px;
}

.menu-btn:hover {
  background-color: #fff;
  color: #000;
}

.menu-btn:active {
  transform: scale(0.95);
}

.high-score {
  font-size: 14px;
  opacity: 0.6;
}
</style>
