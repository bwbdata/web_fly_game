import Phaser from 'phaser'
import { COLORS, PowerUpType } from '../types'

export class PowerUp extends Phaser.GameObjects.Container {
  public body!: Phaser.Physics.Arcade.Body
  public powerUpType: PowerUpType
  private graphics: Phaser.GameObjects.Graphics
  private icon: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
    super(scene, x, y)

    this.powerUpType = type

    // 创建白色圆形背景
    this.graphics = scene.add.graphics()
    this.graphics.lineStyle(2, COLORS.WHITE, 1)
    this.graphics.strokeCircle(0, 0, 15)
    this.add(this.graphics)

    // 根据类型添加图标
    const iconText = this.getIconText(type)
    this.icon = scene.add.text(0, 0, iconText, {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5)
    this.add(this.icon)

    // 添加到场景
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // 设置碰撞体积
    this.body.setSize(30, 30)
    this.body.setCircle(15)

    // 缓慢下落
    this.body.setVelocityY(50)

    // 添加闪烁动画
    scene.tweens.add({
      targets: this,
      alpha: 0.6,
      duration: 500,
      yoyo: true,
      repeat: -1
    })
  }

  private getIconText(type: PowerUpType): string {
    switch (type) {
      case 'health':
        return '+'
      case 'shield':
        return 'S'
      case 'bomb':
        return 'B'
      case 'attackBoost':
        return 'A'
      case 'fireRateBoost':
        return 'F'
      case 'multiShot':
        return 'M'
      default:
        return '?'
    }
  }

  update() {
    // 如果飞出屏幕底部，销毁
    if (this.y > this.scene.scale.height + 50) {
      this.destroy()
    }
  }
}
