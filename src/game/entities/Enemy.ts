import Phaser from 'phaser'
import { COLORS, EnemyType } from '../types'

export abstract class Enemy extends Phaser.GameObjects.Container {
  declare public body: Phaser.Physics.Arcade.Body
  public hp: number
  public maxHp: number
  public damage: number
  public score: number
  public enemyType: EnemyType

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: EnemyType,
    hp: number,
    damage: number,
    score: number
  ) {
    super(scene, x, y)

    this.enemyType = type
    this.hp = hp
    this.maxHp = hp
    this.damage = damage
    this.score = score

    // 添加到场景
    scene.add.existing(this)
    scene.physics.add.existing(this)
  }

  // 受到伤害
  takeDamage(damage: number): boolean {
    this.hp -= damage

    // 闪烁效果
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true
    })

    if (this.hp <= 0) {
      this.onDestroy()
      return true // 返回true表示敌人被摧毁
    }

    return false
  }

  // 摧毁时的处理
  protected onDestroy() {
    // 创建简单的爆炸效果（白色粒子）
    this.createExplosion()

    // 触发敌人死亡事件（包含掉落道具的逻辑）
    this.scene.events.emit('enemyDestroyed', this.score, this.x, this.y, this.enemyType)

    // 销毁对象
    this.destroy()
  }

  // 创建爆炸效果
  private createExplosion() {
    for (let i = 0; i < 8; i++) {
      const particle = this.scene.add.graphics()
      particle.fillStyle(COLORS.WHITE, 1)
      particle.fillCircle(0, 0, 3)
      particle.setPosition(this.x, this.y)

      const angle = (Math.PI * 2 * i) / 8

      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * 50,
        y: this.y + Math.sin(angle) * 50,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          particle.destroy()
        }
      })
    }
  }

  // 抽象方法：子类必须实现
  abstract update(time: number, delta: number): void
}
