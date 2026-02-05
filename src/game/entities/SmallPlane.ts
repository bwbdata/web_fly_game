import Phaser from 'phaser'
import { Enemy } from './Enemy'
import { COLORS, ENEMIES } from '../types'

export class SmallPlane extends Enemy {
  private graphics: Phaser.GameObjects.Graphics
  private speed: number

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(
      scene,
      x,
      y,
      'smallPlane',
      ENEMIES.smallPlane.hp,
      ENEMIES.smallPlane.damage,
      ENEMIES.smallPlane.score
    )

    this.speed = ENEMIES.smallPlane.speed

    // 创建白色小三角形（顶点朝下）
    this.graphics = scene.add.graphics()
    this.graphics.fillStyle(COLORS.WHITE, 1)
    this.graphics.beginPath()
    this.graphics.moveTo(0, 15)   // 底部顶点（朝下）
    this.graphics.lineTo(-10, -10) // 左上
    this.graphics.lineTo(10, -10)  // 右上
    this.graphics.closePath()
    this.graphics.fillPath()

    this.add(this.graphics)

    // 设置碰撞体积
    this.body.setSize(20, 25)
    this.body.setOffset(-10, -10)

    // 设置向下移动的速度
    this.body.setVelocityY(this.speed)
  }

  update(_time: number, _delta: number) {
    // 如果飞出屏幕底部，销毁
    if (this.y > this.scene.scale.height + 50) {
      this.destroy()
    }
  }
}
