import Phaser from 'phaser'
import { Enemy } from './Enemy'
import { ENEMY_STATS, COLORS, GAME_CONFIG } from '../types'

export class ElectricNet extends Enemy {
  private graphics: Phaser.GameObjects.Graphics
  private speed: number = 30 // 缓慢向下移动
  private netWidth: number = 120 // 电网宽度
  private netHeight: number = 60 // 电网高度
  private lifeTimer: number = 0 // 生命计时器
  private maxLifeTime: number = 15000 // 15秒后自动消失

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(
      scene,
      x,
      y,
      'electricNet',
      9999, // 极高血量，实际上不可摧毁
      ENEMY_STATS.electricNet.damage,
      ENEMY_STATS.electricNet.score
    )

    // 创建电网图形
    this.graphics = scene.add.graphics()
    this.drawElectricNet()
    this.add(this.graphics)

    // 设置物理属性
    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.body.setSize(this.netWidth, this.netHeight)
    this.body.setOffset(-this.netWidth / 2, -this.netHeight / 2)

    // 设置缓慢向下移动
    this.body.setVelocityY(this.speed)

    // 电网闪烁效果
    this.createFlickerEffect()
  }

  private drawElectricNet() {
    this.graphics.clear()
    this.graphics.lineStyle(2, COLORS.WHITE, 0.8)

    // 绘制网格
    const gridSize = 15 // 网格大小
    const halfWidth = this.netWidth / 2
    const halfHeight = this.netHeight / 2

    // 横向线条
    for (let y = -halfHeight; y <= halfHeight; y += gridSize) {
      this.graphics.lineBetween(-halfWidth, y, halfWidth, y)
    }

    // 纵向线条
    for (let x = -halfWidth; x <= halfWidth; x += gridSize) {
      this.graphics.lineBetween(x, -halfHeight, x, halfHeight)
    }

    // 边框加粗
    this.graphics.lineStyle(3, COLORS.WHITE, 1)
    this.graphics.strokeRect(-halfWidth, -halfHeight, this.netWidth, this.netHeight)
  }

  // 创建闪烁效果
  private createFlickerEffect() {
    this.scene.tweens.add({
      targets: this.graphics,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    })
  }

  // 重写 takeDamage 方法，使其不可摧毁
  takeDamage(_damage: number): boolean {
    // 电网不可摧毁，不受伤害
    // 可以添加一些视觉反馈，比如短暂的颜色变化
    this.scene.tweens.add({
      targets: this.graphics,
      alpha: 1,
      duration: 50,
      yoyo: true
    })

    return false // 返回false表示未被摧毁
  }

  // 重写 onDestroy，电网不掉落道具
  protected onDestroy() {
    // 不触发 enemyDestroyed 事件（不掉落道具，不加分）
    // 只是简单销毁
    this.destroy()
  }

  update(_time: number, delta: number) {
    // 更新生命计时器
    this.lifeTimer += delta

    // 15秒后自动消失
    if (this.lifeTimer >= this.maxLifeTime) {
      this.onDestroy()
      return
    }

    // 如果电网移出屏幕底部,销毁
    if (this.y > GAME_CONFIG.HEIGHT + this.netHeight) {
      this.destroy()
    }
  }
}
