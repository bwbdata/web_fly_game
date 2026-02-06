<template>
  <div class="upgrade-view">
    <h1 class="title">关卡完成!</h1>

    <div class="stats">
      <div class="stat-item">
        <span>当前关卡:</span>
        <span class="value">{{ currentLevelName }}</span>
      </div>
      <div class="stat-item">
        <span>获得分数:</span>
        <span class="value">{{ gameStore.score }}</span>
      </div>
    </div>

    <div class="upgrade-list">
      <div class="upgrade-item">
        <div class="upgrade-info">
          <div class="upgrade-name">生命值上限 +20</div>
          <div class="upgrade-current">当前: {{ gameStore.playerStats.maxHp }}</div>
        </div>
        <button class="upgrade-btn" @click="upgrade('maxHp', 100)">
          升级 (100分)
        </button>
      </div>

      <div class="upgrade-item">
        <div class="upgrade-info">
          <div class="upgrade-name">攻击力 +5</div>
          <div class="upgrade-current">当前: {{ gameStore.playerStats.attack }}</div>
        </div>
        <button class="upgrade-btn" @click="upgrade('attack', 80)">
          升级 (80分)
        </button>
      </div>

      <div class="upgrade-item">
        <div class="upgrade-info">
          <div class="upgrade-name">防御力 +5</div>
          <div class="upgrade-current">当前: {{ gameStore.playerStats.defense }}</div>
        </div>
        <button class="upgrade-btn" @click="upgrade('defense', 80)">
          升级 (80分)
        </button>
      </div>

      <div class="upgrade-item">
        <div class="upgrade-info">
          <div class="upgrade-name">大招次数 +1</div>
          <div class="upgrade-current">当前: {{ gameStore.playerStats.ultimateCount }}</div>
        </div>
        <button class="upgrade-btn" @click="upgrade('ultimate', 150)">
          升级 (150分)
        </button>
      </div>
    </div>

    <div class="action-buttons">
      <button v-if="hasNextLevel" class="next-level-btn" @click="goToNextLevel">
        进入下一关
      </button>
      <button v-else class="complete-btn" @click="goBack">
        完成所有关卡!
      </button>
      <button class="retry-btn" @click="retryLevel">重新挑战本关</button>
      <button class="back-btn" @click="goBack">返回主菜单</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { LEVELS } from '@/game/types'

const router = useRouter()
const gameStore = useGameStore()

// 计算当前关卡信息
const currentLevelName = computed(() => {
  const level = LEVELS.find(l => l.id === gameStore.currentLevel)
  return level ? level.name : '未知关卡'
})

// 判断是否有下一关
const hasNextLevel = computed(() => {
  return gameStore.currentLevel < 5
})

const upgrade = (type: string, cost: number) => {
  let success = false

  switch (type) {
    case 'maxHp':
      success = gameStore.upgradeMaxHp(cost)
      break
    case 'attack':
      success = gameStore.upgradeAttack(cost)
      break
    case 'defense':
      success = gameStore.upgradeDefense(cost)
      break
    case 'ultimate':
      success = gameStore.upgradeUltimate(cost)
      break
  }

  if (!success) {
    alert('分数不足！')
  }
}

// 进入下一关
const goToNextLevel = () => {
  gameStore.goToNextLevel()
  gameStore.startGame()
  router.push('/game')
}

// 重新挑战本关
const retryLevel = () => {
  gameStore.startGame()
  router.push('/game')
}

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.upgrade-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #000;
  color: #fff;
  padding: 40px 20px;
  overflow-y: auto;
}

.title {
  font-size: 32px;
  margin-bottom: 30px;
  letter-spacing: 4px;
}

.stats {
  margin-bottom: 30px;
}

.stat-item {
  display: flex;
  gap: 10px;
  font-size: 18px;
}

.value {
  font-weight: bold;
}

.upgrade-list {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.upgrade-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #fff;
}

.upgrade-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.upgrade-name {
  font-size: 16px;
  font-weight: bold;
}

.upgrade-current {
  font-size: 14px;
  opacity: 0.7;
}

.upgrade-btn {
  padding: 10px 20px;
  background-color: transparent;
  color: #fff;
  border: 1px solid #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.upgrade-btn:hover {
  background-color: #fff;
  color: #000;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 400px;
}

.next-level-btn,
.complete-btn,
.retry-btn {
  padding: 15px 40px;
  background-color: #fff;
  color: #000;
  border: 2px solid #fff;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.next-level-btn:hover,
.complete-btn:hover,
.retry-btn:hover {
  background-color: transparent;
  color: #fff;
}

.retry-btn {
  background-color: transparent;
  color: #fff;
}

.retry-btn:hover {
  background-color: #fff;
  color: #000;
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
