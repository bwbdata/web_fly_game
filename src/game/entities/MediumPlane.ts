import Phaser from 'phaser'
import { Enemy } from './Enemy'
import { COLORS, ENEMY_STATS } from '../types'
import { EnemyBullet } from './EnemyBullet'

export class MediumPlane extends Enemy {
  private bullets: Phaser.GameObjects.Group
  private lastFired: number = 0
  private fireRate: number = 1500 // 每1.5秒发射一次
  private graphics: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(
      scene,
      x,
      y,
      'mediumPlane',
      ENEMY_STATS.mediumPlane.hp,
      ENEMY_STATS.mediumPlane.damage,
      ENEMY_STATS.mediumPlane.score
    )

    // 创建子弹组
    this.bullets = scene.add.group({
      classType: EnemyBullet,
      maxSize: 50,
      runChildUpdate: true
    })

    // 创建图形对象
    this.graphics = scene.add.graphics()
    this.drawPlane()
    this.add(this.graphics)

    // 设置碰撞体积
    this.body.setSize(40, 50)
  }

  private drawPlane() {
    this.graphics.clear()
    this.graphics.fillStyle(COLORS.WHITE, 1)

    // 梯形飞机（顶部窄，底部宽）
    this.graphics.beginPath()
    this.graphics.moveTo(0, -25)      // 顶部中心
    this.graphics.lineTo(-15, -25)    // 顶部左
    this.graphics.lineTo(-20, 25)     // 底部左
    this.graphics.lineTo(20, 25)      // 底部右
    this.graphics.lineTo(15, -25)     // 顶部右
    this.graphics.closePath()
    this.graphics.fillPath()
  }

  update(time: number, _delta: number) {
    // 向下移动
    this.y += 1.5

    // 左右摇摆移动
    this.x += Math.sin(time * 0.002) * 2

    // 定期发射子弹
    if (time > this.lastFired + this.fireRate) {
      this.fire()
      this.lastFired = time
    }

    // 如果飞出屏幕下方，销毁
    if (this.y > 700) {
      this.destroy()
    }
  }

  // 发射子弹
  private fire() {
    const bullet = this.bullets.get(this.x, this.y + 25) as EnemyBullet
    if (bullet) {
      bullet.damage = this.damage
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
