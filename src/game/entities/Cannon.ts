import Phaser from 'phaser'
import { Enemy } from './Enemy'
import { ENEMY_STATS, COLORS, GAME_CONFIG } from '../types'
import { EnemyBullet } from './EnemyBullet'

export class Cannon extends Enemy {
  private bodyGraphics: Phaser.GameObjects.Graphics
  private barrelGraphics: Phaser.GameObjects.Graphics
  private bullets: Phaser.GameObjects.Group
  private fireTimer: number = 0
  private fireRate: number = 1500 // 每1.5秒发射一次
  private playerRef?: Phaser.GameObjects.Container // 玩家引用

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(
      scene,
      x,
      y,
      'cannon',
      ENEMY_STATS.cannon.hp,
      ENEMY_STATS.cannon.damage,
      ENEMY_STATS.cannon.score
    )

    // 创建炮台主体（矩形底座）
    this.bodyGraphics = scene.add.graphics()
    this.drawBody()
    this.add(this.bodyGraphics)

    // 创建炮管（可旋转）
    this.barrelGraphics = scene.add.graphics()
    this.drawBarrel()
    this.add(this.barrelGraphics)

    // 创建子弹组
    this.bullets = scene.add.group({
      classType: EnemyBullet,
      runChildUpdate: true
    })

    // 设置物理属性（固定位置，不移动）
    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.body.setSize(30, 30)
    this.body.setImmovable(true) // 固定不动

    // 尝试获取玩家引用（从场景的数据中获取）
    // 这里使用延迟获取，因为玩家可能在大炮之后创建
  }

  private drawBody() {
    this.bodyGraphics.clear()
    this.bodyGraphics.fillStyle(COLORS.WHITE, 1)
    // 矩形底座
    this.bodyGraphics.fillRect(-15, -10, 30, 20)
  }

  private drawBarrel() {
    this.barrelGraphics.clear()
    this.barrelGraphics.lineStyle(6, COLORS.WHITE, 1)
    // 炮管（从中心向上延伸）
    this.barrelGraphics.lineBetween(0, 0, 0, -20)
    // 炮口（小圆圈）
    this.barrelGraphics.fillStyle(COLORS.WHITE, 1)
    this.barrelGraphics.fillCircle(0, -20, 4)
  }

  // 瞄准玩家
  private aimAtPlayer() {
    if (!this.playerRef) {
      // 尝试从场景中找到玩家
      const gameScene = this.scene as any
      if (gameScene.player) {
        this.playerRef = gameScene.player
      }
    }

    if (this.playerRef) {
      // 计算玩家和大炮之间的角度
      const angle = Phaser.Math.Angle.Between(
        this.x,
        this.y,
        this.playerRef.x,
        this.playerRef.y
      )

      // 旋转炮管（炮管默认朝上，需要减去90度）
      this.barrelGraphics.rotation = angle + Math.PI / 2
    }
  }

  // 发射子弹
  private fire() {
    if (!this.active || !this.playerRef) return

    // 计算发射角度
    const angle = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      this.playerRef.x,
      this.playerRef.y
    )

    // 计算炮口位置（炮管末端）
    const barrelLength = 20
    const barrelAngle = this.barrelGraphics.rotation
    const muzzleX = this.x + Math.cos(barrelAngle - Math.PI / 2) * barrelLength
    const muzzleY = this.y + Math.sin(barrelAngle - Math.PI / 2) * barrelLength

    // 创建子弹
    const bullet = new EnemyBullet(this.scene, muzzleX, muzzleY, this.damage)

    // 设置子弹速度（朝向玩家）
    const bulletSpeed = 250
    bullet.body.setVelocity(
      Math.cos(angle) * bulletSpeed,
      Math.sin(angle) * bulletSpeed
    )

    this.bullets.add(bullet)

    // 发射后座力效果（炮管轻微后退）
    this.scene.tweens.add({
      targets: this.barrelGraphics,
      scaleY: 0.8,
      duration: 100,
      yoyo: true
    })
  }

  update(_time: number, delta: number) {
    if (!this.active) return

    // 实时瞄准玩家
    this.aimAtPlayer()

    // 定时发射
    this.fireTimer += delta
    if (this.fireTimer >= this.fireRate) {
      this.fire()
      this.fireTimer = 0
    }

    // 如果大炮移出屏幕下方太远，销毁
    // （虽然大炮是固定的，但为了防止内存泄漏）
    if (this.y > GAME_CONFIG.HEIGHT + 100) {
      this.destroy()
    }
  }

  // 获取子弹组（供碰撞检测使用）
  getBullets(): Phaser.GameObjects.Group {
    return this.bullets
  }
}
