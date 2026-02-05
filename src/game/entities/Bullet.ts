import Phaser from 'phaser'
import { COLORS, PLAYER_INITIAL } from '../types'

export class Bullet extends Phaser.GameObjects.Graphics {
  declare public body: Phaser.Physics.Arcade.Body
  private speed: number = 400
  public damage: number = 10

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene)

    // 绘制白色子弹（小椭圆）
    this.drawBullet(PLAYER_INITIAL.attack)

    this.setPosition(x, y)

    // 添加物理引擎
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // 设置速度（向上）
    this.body.setVelocityY(-this.speed)

    // 设置碰撞体积
    this.body.setSize(4, 8)
  }

  // 根据攻击力绘制子弹（攻击力越高，子弹越大，但有上限）
  private drawBullet(attack: number) {
    this.clear()
    this.fillStyle(COLORS.WHITE, 1)

    // 根据攻击力调整大小，但限制最大值
    // 子弹间距约15像素，所以最大宽度不超过12像素
    const scale = Math.min(1 + (attack - PLAYER_INITIAL.attack) * 0.1, 3)
    const width = Math.min(4 * scale, 12)  // 最大宽度12
    const height = Math.min(8 * scale, 24) // 最大高度24

    this.fillEllipse(0, 0, width, height)
  }

  // 更新子弹大小
  updateSize(attack: number) {
    this.drawBullet(attack)

    // 更新碰撞体积
    const scale = Math.min(1 + (attack - PLAYER_INITIAL.attack) * 0.1, 3)
    const width = Math.min(4 * scale, 12)
    const height = Math.min(8 * scale, 24)
    this.body.setSize(width, height)
  }

  update() {
    // 如果子弹飞出屏幕上方，销毁它
    if (this.y < -10) {
      this.destroy()
    }
  }

  // 重置子弹位置（用于对象池）
  reset(x: number, y: number) {
    this.setPosition(x, y)
    this.setActive(true)
    this.setVisible(true)
    this.body.setVelocityY(-this.speed)
  }
}
