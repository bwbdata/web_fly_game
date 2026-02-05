<template>
  <div id="phaser-game" ref="gameContainer" class="phaser-game-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { createPhaserGame } from '@/game/main'
import type Phaser from 'phaser'

const gameContainer = ref<HTMLDivElement>()
let game: Phaser.Game | null = null

onMounted(() => {
  if (gameContainer.value) {
    game = createPhaserGame('phaser-game')
  }
})

onUnmounted(() => {
  if (game) {
    game.destroy(true)
    game = null
  }
})
</script>

<style scoped>
.phaser-game-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
