<template>
  <div class="game-view">
    <PhaserGame />
  </div>
</template>

<script setup lang="ts">
import PhaserGame from '@/components/PhaserGame.vue'
import { useGameStore } from '@/stores/game'
import { onMounted } from 'vue'

const gameStore = useGameStore()

onMounted(() => {
  gameStore.startGame()
})
</script>

<style scoped>
.game-view {
  width: 100%;
  height: 100%;
  background-color: #000;
}
</style>
