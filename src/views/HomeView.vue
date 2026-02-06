<template>
  <div class="home-view">
    <h1 class="title">飞机射击</h1>
    <div class="subtitle">BLACK & WHITE</div>

    <div class="level-select">
      <h2 class="section-title">选择关卡</h2>
      <div class="levels">
        <div
          v-for="level in levels"
          :key="level.id"
          :class="['level-card', { locked: !isLevelUnlocked(level.id), selected: level.id === gameStore.currentLevel }]"
          @click="selectLevel(level.id)"
        >
          <div class="level-number">{{ level.id }}</div>
          <div class="level-name">{{ level.name }}</div>
          <div v-if="!isLevelUnlocked(level.id)" class="lock-icon">🔒</div>
        </div>
      </div>
    </div>

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
import { LEVELS } from '@/game/types'

const router = useRouter()
const gameStore = useGameStore()
const levels = LEVELS

// 检查关卡是否解锁
const isLevelUnlocked = (levelId: number) => {
  return levelId <= gameStore.maxUnlockedLevel
}

// 选择关卡
const selectLevel = (levelId: number) => {
  if (isLevelUnlocked(levelId)) {
    gameStore.setCurrentLevel(levelId)
  }
}

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
  margin-bottom: 40px;
  opacity: 0.7;
}

.level-select {
  margin-bottom: 40px;
}

.section-title {
  font-size: 20px;
  margin-bottom: 20px;
  letter-spacing: 2px;
}

.levels {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.level-card {
  width: 60px;
  height: 80px;
  border: 2px solid #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.level-card:hover:not(.locked) {
  background-color: #fff;
  color: #000;
  transform: scale(1.05);
}

.level-card.selected {
  background-color: #fff;
  color: #000;
}

.level-card.locked {
  opacity: 0.3;
  cursor: not-allowed;
}

.level-number {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.level-name {
  font-size: 10px;
  text-align: center;
  letter-spacing: 1px;
}

.lock-icon {
  position: absolute;
  font-size: 20px;
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
