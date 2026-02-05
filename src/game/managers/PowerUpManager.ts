import Phaser from 'phaser'
import { PowerUp } from '../entities/PowerUp'
import { PowerUpType, POWERUPS } from '../types'

export class PowerUpManager {
  private scene: Phaser.Scene
  public powerUps: Phaser.GameObjects.Group

  constructor(scene: Phaser.Scene) {
    this.scene = scene

    // 创建道具组
    this.powerUps = scene.add.group({
      classType: PowerUp,
      runChildUpdate: true
    })
  }

  // 尝试掉落道具
  tryDropPowerUp(x: number, y: number) {
    // 随机决定是否掉落道具
    const dropChance = Math.random()
    let cumulativeRate = 0

    // 按照掉落概率依次检查
    const powerUpTypes: PowerUpType[] = ['health', 'shield', 'bomb', 'attackBoost', 'fireRateBoost', 'multiShot']

    for (const type of powerUpTypes) {
      cumulativeRate += POWERUPS[type].dropRate
      if (dropChance < cumulativeRate) {
        this.spawnPowerUp(x, y, type)
        return
      }
    }

    // 如果没有掉落任何道具（总概率 < 1）
  }

  // 生成道具
  private spawnPowerUp(x: number, y: number, type: PowerUpType) {
    const powerUp = new PowerUp(this.scene, x, y, type)
    this.powerUps.add(powerUp)
  }

  // 清除所有道具
  clearAll() {
    this.powerUps.clear(true, true)
  }
}
