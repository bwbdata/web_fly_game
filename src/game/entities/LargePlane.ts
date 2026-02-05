import Phaser from 'phaser'
import { Enemy } from './Enemy'
import { COLORS, ENEMY_STATS } from '../types'
import { EnemyBullet } from './EnemyBullet'

export class LargePlane extends Enemy {
  private bullets: Phaser.GameObjects.Group
  private lastFired: number = 0
  private fireRate: number = 1000 // 每1秒发射一次
  private graphics: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(
      scene,
      x,
      y,
      'largePlane',
      ENEMY_STATS.largePlane.hp,
      ENEMY_STATS.largePlane.damage,
      ENEMY_STATS.largePlane.score
    )

    // 创建子弹组
    this.bullets = scene.add.group({
      classType: EnemyBullet,
      maxSize: 100,
      runChildUpdate: true
    })

    // 创建图形对象
    this.graphics = scene.add.graphics()
    this.drawPlane()
    this.add(this.graphics)

    // 设置碰撞体积
    this.body.setSize(60, 70)
  }

  private drawPlane() {
    this.graphics.clear()
    this.graphics.fillStyle(COLORS.WHITE, 1)

    // 五边形飞机
    this.graphics.beginPath()
    this.graphics.moveTo(0, -35)      // 顶部
    this.graphics.lineTo(-25, -10)    // 左上
    this.graphics.lineTo(-20, 35)     // 左下
    this.graphics.lineTo(20, 35)      // 右下
    this.graphics.lineTo(25, -10)     // 右上
    this.graphics.closePath()
    this.graphics.fillPath()
  }

  update(time: number, delta: number) {
    // 向下移动（较慢）
    this.y += 1

    // 左右移动
    const moveRange = 100
    const moveSpeed = 0.001
    this.x = this.x + Math.sin(time * moveSpeed) * 1.5

    // 定期发射三发子弹（散射）
    if (time > this.lastFired + this.fireRate) {
      this.fire()
      this.lastFired = time
    }

    // 如果飞出屏幕下方，销毁
    if (this.y > 700) {
      this.destroy()
    }
  }

  // 发射三发散射子弹
  private fire() {
    const spread = 20
    for (let i = -1; i <= 1; i++) {
      const bullet = this.bullets.get(this.x + i * spread, this.y + 35) as EnemyBullet
      if (bullet) {
        bullet.damage = this.damage
      }
    }
  }

  // 获取子弹组（用于碰撞检测）
  getBullets(): Phaser.GameObjects.Group {
    return this.bullets
  }

  // 重写销毁方法，确保子弹也被清理
  destroy(fromScene?: boolean) {
    this.bullets.clear(true, true)
    super.destroy(fromScene)
  }
}
