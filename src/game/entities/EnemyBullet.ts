import Phaser from 'phaser'
import { COLORS } from '../types'

export class EnemyBullet extends Phaser.GameObjects.Graphics {
  public body!: Phaser.Physics.Arcade.Body
  private speed: number = 300
  public damage: number = 10

  constructor(scene: Phaser.Scene, x: number, y: number, damage: number = 10) {
    super(scene)

    this.damage = damage

    // 绘制白色敌人子弹（小圆形）
    this.drawBullet()

    this.setPosition(x, y)

    // 添加物理引擎
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // 设置速度（向下）
    this.body.setVelocityY(this.speed)

    // 设置碰撞体积
    this.body.setSize(6, 6)
  }

  // 绘制敌人子弹
  private drawBullet() {
    this.clear()
    this.fillStyle(COLORS.WHITE, 1)
    this.fillCircle(0, 0, 3)
  }

  update() {
    // 如果子弹飞出屏幕下方，销毁它
    if (this.y > 700) {
      this.destroy()
    }
  }

  // 重置子弹位置（用于对象池）
  reset(x: number, y: number) {
    this.setPosition(x, y)
    this.setActive(true)
    this.setVisible(true)
    this.body.setVelocityY(this.speed)
  }
}
