import { defineStore } from 'pinia'
import { ref } from 'vue'
import { PLAYER_INITIAL } from '@/game/types'

export const useGameStore = defineStore('game', () => {
  // 玩家属性
  const playerStats = ref<{
    hp: number
    maxHp: number
    attack: number
    defense: number
    speed: number
    ultimateCount: number
  }>({
    hp: PLAYER_INITIAL.hp,
    maxHp: PLAYER_INITIAL.maxHp,
    attack: PLAYER_INITIAL.attack,
    defense: PLAYER_INITIAL.defense,
    speed: PLAYER_INITIAL.speed,
    ultimateCount: PLAYER_INITIAL.ultimateCount
  })

  // 游戏状态
  const score = ref(0)
  const level = ref(1)
  const highScore = ref(0)
  const isGameActive = ref(false)

  // 加载本地存储的最高分
  const loadHighScore = () => {
    const saved = localStorage.getItem('highScore')
    if (saved) {
      highScore.value = parseInt(saved)
    }
  }

  // 保存最高分
  const saveHighScore = () => {
    if (score.value > highScore.value) {
      highScore.value = score.value
      localStorage.setItem('highScore', highScore.value.toString())
    }
  }

  // 重置游戏
  const resetGame = () => {
    playerStats.value = {
      hp: PLAYER_INITIAL.hp,
      maxHp: PLAYER_INITIAL.maxHp,
      attack: PLAYER_INITIAL.attack,
      defense: PLAYER_INITIAL.defense,
      speed: PLAYER_INITIAL.speed,
      ultimateCount: PLAYER_INITIAL.ultimateCount
    }
    score.value = 0
    level.value = 1
    isGameActive.value = false
  }

  // 开始游戏
  const startGame = () => {
    isGameActive.value = true
  }

  // 结束游戏
  const endGame = () => {
    isGameActive.value = false
    saveHighScore()
  }

  // 增加分数
  const addScore = (points: number) => {
    score.value += points
  }

  // 升级属性
  const upgradeMaxHp = (cost: number) => {
    if (score.value >= cost) {
      score.value -= cost
      playerStats.value.maxHp += 20
      playerStats.value.hp = playerStats.value.maxHp
      return true
    }
    return false
  }

  const upgradeAttack = (cost: number) => {
    if (score.value >= cost) {
      score.value -= cost
      playerStats.value.attack += 5
      return true
    }
    return false
  }

  const upgradeDefense = (cost: number) => {
    if (score.value >= cost) {
      score.value -= cost
      playerStats.value.defense += 5
      return true
    }
    return false
  }

  const upgradeUltimate = (cost: number) => {
    if (score.value >= cost) {
      score.value -= cost
      playerStats.value.ultimateCount += 1
      return true
    }
    return false
  }

  // 初始化
  loadHighScore()

  return {
    playerStats,
    score,
    level,
    highScore,
    isGameActive,
    resetGame,
    startGame,
    endGame,
    addScore,
    upgradeMaxHp,
    upgradeAttack,
    upgradeDefense,
    upgradeUltimate
  }
})
