import Phaser from 'phaser'
import { Enemy } from './Enemy'
import { ENEMY_STATS, COLORS, GAME_CONFIG } from '../types'
import { EnemyBullet } from './EnemyBullet'

export class Boss extends Enemy {
  private graphics: Phaser.GameObjects.Graphics
  private bullets: Phaser.GameObjects.Group
  private fireTimer: number = 0
  private fireRate: number = 1000 // 初始射击间隔
  private moveDirection: number = 1 // 1为右，-1为左
  private moveSpeed: number = 80
  private currentPhase: number = 0
  private hpBar?: Phaser.GameObjects.Graphics
  private hpBarBg?: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(
      scene,
      x,
      y,
      'boss',
      ENEMY_STATS.boss.hp,
      ENEMY_STATS.boss.damage,
      ENEMY_STATS.boss.score
    )

    // 创建图形对象
    this.graphics = scene.add.graphics()
    this.drawBoss()
    this.add(this.graphics)

    // 创建子弹组
    this.bullets = scene.add.group({
      classType: EnemyBullet,
      runChildUpdate: true
    })

    // 设置物理属性
    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.body.setSize(80, 80)

    // 设置初始速度（左右移动）
    this.body.setVelocityX(this.moveSpeed * this.moveDirection)

    // 创建血条
    this.createHpBar()

    // BOSS登场效果
    this.alpha = 0
    scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 1000
    })
  }

  private drawBoss() {
    this.graphics.clear()

    // 绘制大型五边形BOSS
    this.graphics.lineStyle(3, COLORS.WHITE, 1)
    this.graphics.fillStyle(COLORS.BLACK, 1)

    // 五边形主体（更大）
    const points: Phaser.Geom.Point[] = []
    const sides = 5
    const radius = 40
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2
      points.push(new Phaser.Geom.Point(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
      ))
    }

    const polygon = new Phaser.Geom.Polygon(points)
    this.graphics.fillPoints(polygon.points, true)
    this.graphics.strokePoints(polygon.points, true)

    // 内部装饰（小圆）
    this.graphics.lineStyle(2, COLORS.WHITE, 1)
    this.graphics.strokeCircle(0, 0, 15)
  }

  private createHpBar() {
    // 血条背景
    this.hpBarBg = this.scene.add.graphics()
    this.hpBarBg.fillStyle(COLORS.GRAY, 0.5)
    this.hpBarBg.fillRect(50, 50, GAME_CONFIG.WIDTH - 100, 10)

    // 血条
    this.hpBar = this.scene.add.graphics()
    this.updateHpBar()
  }

  private updateHpBar() {
    if (!this.hpBar) return

    this.hpBar.clear()
    const hpPercent = this.hp / this.maxHp
    const barWidth = (GAME_CONFIG.WIDTH - 100) * hpPercent

    // 根据血量改变颜色
    let color = COLORS.WHITE
    if (hpPercent < 0.3) {
      color = 0xFF0000 // 红色
    } else if (hpPercent < 0.6) {
      color = 0xFFFF00 // 黄色
    }

    this.hpBar.fillStyle(color, 1)
    this.hpBar.fillRect(50, 50, barWidth, 10)
  }

  // 检查并切换阶段
  private checkPhase() {
    const hpPercent = this.hp / this.maxHp

    if (hpPercent <= 0.3 && this.currentPhase < 2) {
      // 第三阶段：血量低于30%
      this.currentPhase = 2
      this.fireRate = 500 // 更快的射速
      this.moveSpeed = 120
      this.showPhaseTransition('狂暴模式!')
    } else if (hpPercent <= 0.6 && this.currentPhase < 1) {
      // 第二阶段：血量低于60%
      this.currentPhase = 1
      this.fireRate = 700
      this.moveSpeed = 100
      this.showPhaseTransition('进入第二阶段!')
    }
  }

  private showPhaseTransition(message: string) {
    // 屏幕震动
    this.scene.cameras.main.shake(300, 0.01)

    // 显示阶段提示
    const phaseText = this.scene.add.text(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2,
      message,
      {
        fontSize: '32px',
        color: '#ff0000',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5)

    this.scene.tweens.add({
      targets: phaseText,
      scale: 1.5,
      alpha: 0,
      duration: 1500,
      onComplete: () => {
        phaseText.destroy()
      }
    })
  }

  takeDamage(damage: number): boolean {
    const destroyed = super.takeDamage(damage)
    this.updateHpBar()
    this.checkPhase()
    return destroyed
  }

  protected onDestroy() {
    // 清理血条
    if (this.hpBar) this.hpBar.destroy()
    if (this.hpBarBg) this.hpBarBg.destroy()

    // 更大的爆炸效果
    this.createBigExplosion()

    // 触发BOSS死亡事件
    this.scene.events.emit('bossDefeated')
    this.scene.events.emit('enemyDestroyed', this.score, this.x, this.y, this.enemyType)

    // 销毁对象
    this.destroy()
  }

  private createBigExplosion() {
    // 保存场景引用和位置，因为对象即将被销毁
    const scene = this.scene
    const explosionX = this.x
    const explosionY = this.y

    // 创建多重爆炸效果
    for (let wave = 0; wave < 3; wave++) {
      scene.time.delayedCall(wave * 200, () => {
        for (let i = 0; i < 16; i++) {
          const particle = scene.add.graphics()
          particle.fillStyle(COLORS.WHITE, 1)
          particle.fillCircle(0, 0, 5)
          particle.setPosition(explosionX, explosionY)

          const angle = (Math.PI * 2 * i) / 16
          const speed = 100 + wave * 30

          scene.tweens.add({
            targets: particle,
            x: explosionX + Math.cos(angle) * (80 + wave * 20),
            y: explosionY + Math.sin(angle) * (80 + wave * 20),
            alpha: 0,
            duration: 800,
            onComplete: () => {
              particle.destroy()
            }
          })
        }
      })
    }

    // 屏幕闪光
    const flash = scene.add.graphics()
    flash.fillStyle(0xffffff, 0.8)
    flash.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT)

    scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        flash.destroy()
      }
    })
  }

  private fire() {
    if (!this.active) return

    // 根据阶段使用不同的攻击模式
    switch (this.currentPhase) {
      case 0:
        this.firePattern1() // 基础三连发
        break
      case 1:
        this.firePattern2() // 五连发扇形
        break
      case 2:
        this.firePattern3() // 圆形弹幕
        break
    }
  }

  // 攻击模式1：三连发
  private firePattern1() {
    const angles = [-0.3, 0, 0.3]
    angles.forEach(angle => {
      const bullet = new EnemyBullet(this.scene, this.x, this.y + 40)
      bullet.body.setVelocity(
        Math.sin(angle) * 200,
        Math.cos(angle) * 200
      )
      this.bullets.add(bullet)
    })
  }

  // 攻击模式2：五连发扇形
  private firePattern2() {
    const angles = [-0.5, -0.25, 0, 0.25, 0.5]
    angles.forEach(angle => {
      const bullet = new EnemyBullet(this.scene, this.x, this.y + 40)
      bullet.body.setVelocity(
        Math.sin(angle) * 250,
        Math.cos(angle) * 250
      )
      this.bullets.add(bullet)
    })
  }

  // 攻击模式3：圆形弹幕
  private firePattern3() {
    const bulletCount = 8
    for (let i = 0; i < bulletCount; i++) {
      const angle = (Math.PI * 2 * i) / bulletCount
      const bullet = new EnemyBullet(this.scene, this.x, this.y)
      bullet.body.setVelocity(
        Math.cos(angle) * 200,
        Math.sin(angle) * 200
      )
      this.bullets.add(bullet)
    }
  }

  update(time: number, delta: number) {
    if (!this.active) return

    // 左右移动
    if (this.x <= 60) {
      this.moveDirection = 1
      this.body.setVelocityX(this.moveSpeed * this.moveDirection)
    } else if (this.x >= GAME_CONFIG.WIDTH - 60) {
      this.moveDirection = -1
      this.body.setVelocityX(this.moveSpeed * this.moveDirection)
    }

    // 射击
    this.fireTimer += delta
    if (this.fireTimer >= this.fireRate) {
      this.fire()
      this.fireTimer = 0
    }
  }

  // 获取子弹组（供碰撞检测使用）
  getBullets(): Phaser.GameObjects.Group {
    return this.bullets
  }
}
