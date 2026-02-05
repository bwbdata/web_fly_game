<template>
  <div class="rank-view">
    <h1 class="title">排行榜</h1>

    <div class="rank-list">
      <div class="rank-item highlight">
        <span class="rank-number">🏆</span>
        <span class="rank-label">最高分</span>
        <span class="rank-score">{{ gameStore.highScore }}</span>
      </div>

      <div class="rank-item">
        <span class="rank-number">📊</span>
        <span class="rank-label">本局分数</span>
        <span class="rank-score">{{ gameStore.score }}</span>
      </div>
    </div>

    <div class="info">
      <p>继续游戏以刷新最高分！</p>
    </div>

    <button class="back-btn" @click="goBack">返回主菜单</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'

const router = useRouter()
const gameStore = useGameStore()

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.rank-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #000;
  color: #fff;
  padding: 40px 20px;
}

.title {
  font-size: 32px;
  margin-bottom: 40px;
  letter-spacing: 4px;
}

.rank-list {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border: 1px solid #fff;
}

.rank-item.highlight {
  border: 2px solid #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.rank-number {
  font-size: 24px;
  width: 40px;
}

.rank-label {
  flex: 1;
  font-size: 18px;
}

.rank-score {
  font-size: 24px;
  font-weight: bold;
}

.info {
  margin-bottom: 30px;
  opacity: 0.7;
  text-align: center;
}

.back-btn {
  padding: 12px 40px;
  background-color: transparent;
  color: #fff;
  border: 2px solid #fff;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:hover {
  background-color: #fff;
  color: #000;
}
</style>
