import Phaser from 'phaser'
import { Player } from '../entities/Player'
import { Enemy } from '../entities/Enemy'
import { Bullet } from '../entities/Bullet'
import { EnemyBullet } from '../entities/EnemyBullet'
import { PowerUp } from '../entities/PowerUp'
import { POWERUPS } from '../types'

export class CollisionManager {
  private scene: Phaser.Scene
  private player: Player
  private enemyGroup: Phaser.GameObjects.Group
  private enemyBulletGroup?: Phaser.GameObjects.Group
  private powerUpGroup?: Phaser.GameObjects.Group

  constructor(
    scene: Phaser.Scene,
    player: Player,
    enemyGroup: Phaser.GameObjects.Group,
    powerUpGroup?: Phaser.GameObjects.Group,
    enemyBulletGroup?: Phaser.GameObjects.Group
  ) {
    this.scene = scene
    this.player = player
    this.enemyGroup = enemyGroup
    this.powerUpGroup = powerUpGroup
    this.enemyBulletGroup = enemyBulletGroup

    this.setupCollisions()
  }

  private setupCollisions() {
    // 玩家子弹 vs 敌人
    this.scene.physics.add.overlap(
      this.player.bullets,
      this.enemyGroup,
      this.bulletHitEnemy,
      undefined,
      this
    )

    // 玩家 vs 敌人（撞击）
    this.scene.physics.add.overlap(
      this.player,
      this.enemyGroup,
      this.playerHitEnemy,
      undefined,
      this
    )

    // 玩家 vs 敌人子弹
    if (this.enemyBulletGroup) {
      this.scene.physics.add.overlap(
        this.player,
        this.enemyBulletGroup,
        this.playerHitByEnemyBullet,
        undefined,
        this
      )
    }

    // 玩家 vs 道具
    if (this.powerUpGroup) {
      this.scene.physics.add.overlap(
        this.player,
        this.powerUpGroup,
        this.playerCollectPowerUp,
        undefined,
        this
      )
    }
  }

  // 子弹击中敌人
  private bulletHitEnemy(
    bulletObj: any,
    enemyObj: any
  ) {
    const bullet = bulletObj as Bullet
    const enemy = enemyObj as Enemy

    // 敌人受到伤害
    enemy.takeDamage(bullet.damage)

    // 销毁子弹
    bullet.destroy()
  }

  // 玩家撞击敌人
  private playerHitEnemy(
    _playerObj: any,
    enemyObj: any
  ) {
    const enemy = enemyObj as Enemy

    // 玩家受到伤害
    this.player.takeDamage(enemy.damage)

    // 敌人也被摧毁
    enemy.takeDamage(enemy.hp)
  }

  // 玩家被敌人子弹击中
  private playerHitByEnemyBullet(
    _playerObj: any,
    bulletObj: any
  ) {
    const bullet = bulletObj as EnemyBullet

    // 玩家受到伤害
    this.player.takeDamage(bullet.damage)

    // 销毁子弹
    bullet.destroy()
  }

  // 玩家收集道具
  private playerCollectPowerUp(
    _playerObj: any,
    powerUpObj: any
  ) {
    const powerUp = powerUpObj as PowerUp
    const type = powerUp.powerUpType

    // 获取道具配置
    const config = POWERUPS[type]

    // 应用道具效果
    this.player.applyPowerUp(type, config.value, config.duration, this.scene.time.now)

    // 销毁道具
    powerUp.destroy()
  }
}
