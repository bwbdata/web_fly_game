<template>
  <div class="upgrade-view">
    <h1 class="title">升级属性</h1>

    <div class="stats">
      <div class="stat-item">
        <span>当前分数:</span>
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

    <button class="back-btn" @click="goBack">返回主菜单</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'

const router = useRouter()
const gameStore = useGameStore()

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
