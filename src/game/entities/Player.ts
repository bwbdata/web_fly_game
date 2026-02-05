import Phaser from 'phaser'
import { COLORS, PLAYER_INITIAL } from '../types'
import { Bullet } from './Bullet'

export class Player extends Phaser.GameObjects.Container {
  declare public body: Phaser.Physics.Arcade.Body
  private graphics: Phaser.GameObjects.Graphics
  private speed: number
  public hp: number
  public maxHp: number
  public attack: number
  public defense: number

  // 射击相关
  private baseFireRate: number = 200 // 基础射速：每200ms发射一次
  private fireRate: number = 200
  private lastFired: number = 0
  public bullets: Phaser.GameObjects.Group
  private multiShotCount: number = 1 // 同时发射的子弹数量

  // 增益效果 - 新系统：记录等级和剩余时间
  public boostLevels: Map<string, number> = new Map() // 增益等级
  public boostTimeRemaining: Map<string, number> = new Map() // 剩余时间（毫秒）
  private lastBoostUpdate: number = 0

  // 护盾和炸弹系统
  public shield: number = 0 // 护盾值（吸收伤害）
  public bombs: number = 3 // 炸弹数量
  private shieldGraphics?: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)

    // 初始化属性
    this.hp = PLAYER_INITIAL.hp
    this.maxHp = PLAYER_INITIAL.maxHp
    this.attack = PLAYER_INITIAL.attack
    this.defense = PLAYER_INITIAL.defense
    this.speed = PLAYER_INITIAL.speed

    // 创建白色三角形飞机
    this.graphics = scene.add.graphics()
    this.updateGraphics()

    this.add(this.graphics)

    // 添加到场景
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // 设置碰撞体积
    this.body.setSize(30, 40)
    this.body.setOffset(-15, -20)

    // 创建子弹组
    this.bullets = scene.add.group({
      classType: Bullet,
      maxSize: 100,
      runChildUpdate: true
    })

    // 创建护盾图形
    this.createShieldGraphics()
  }

  // 创建护盾图形
  private createShieldGraphics() {
    this.shieldGraphics = this.scene.add.graphics()
    this.add(this.shieldGraphics)
    this.updateShieldGraphics()
  }

  // 更新护盾图形
  private updateShieldGraphics() {
    if (!this.shieldGraphics) return

    this.shieldGraphics.clear()

    if (this.shield > 0) {
      // 绘制护盾圆圈
      this.shieldGraphics.lineStyle(2, COLORS.WHITE, 0.6)
      this.shieldGraphics.strokeCircle(0, 0, 25)

      // 护盾闪烁效果
      this.scene.tweens.add({
        targets: this.shieldGraphics,
        alpha: 0.3,
        duration: 500,
        yoyo: true,
        repeat: -1
      })
    }
  }

  // 更新飞机图形（飞机大小固定，不随攻击力变化）
  private updateGraphics() {
    this.graphics.clear()
    this.graphics.fillStyle(COLORS.WHITE, 1)

    // 固定大小
    const size = 20
    const width = 15

    this.graphics.beginPath()
    this.graphics.moveTo(0, -size)  // 顶点
    this.graphics.lineTo(-width, size)  // 左下
    this.graphics.lineTo(width, size)   // 右下
    this.graphics.closePath()
    this.graphics.fillPath()
  }

  update(time: number, cursors?: Phaser.Types.Input.Keyboard.CursorKeys) {
    // 更新增益效果
    this.updateBoosts(time)

    // 键盘控制（用于桌面测试）
    if (cursors) {
      const velocity = this.speed

      if (cursors.left?.isDown) {
        this.body.setVelocityX(-velocity)
      } else if (cursors.right?.isDown) {
        this.body.setVelocityX(velocity)
      } else {
        this.body.setVelocityX(0)
      }

      if (cursors.up?.isDown) {
        this.body.setVelocityY(-velocity)
      } else if (cursors.down?.isDown) {
        this.body.setVelocityY(velocity)
      } else {
        this.body.setVelocityY(0)
      }
    }

    // 自动射击
    this.autoFire(time)
  }

  // 更新增益效果
  private updateBoosts(time: number) {
    if (this.lastBoostUpdate === 0) {
      this.lastBoostUpdate = time
      return
    }

    const deltaTime = time - this.lastBoostUpdate
    this.lastBoostUpdate = time

    // 实时减少所有增益的剩余时间
    const boostsToUpdate: string[] = []
    this.boostTimeRemaining.forEach((_remainingTime, boostType) => {
      boostsToUpdate.push(boostType)
    })

    boostsToUpdate.forEach(boostType => {
      const currentTime = this.boostTimeRemaining.get(boostType) || 0
      const newTime = Math.max(0, currentTime - deltaTime)

      if (newTime <= 0) {
        // 时间用完，移除增益
        this.removeBoost(boostType)
      } else {
        // 更新剩余时间
        this.boostTimeRemaining.set(boostType, newTime)

        // 检查是否需要降级（每过10秒降1级）
        const currentLevel = this.boostLevels.get(boostType) || 0
        const expectedLevel = Math.floor(newTime / 10000) + 1

        if (expectedLevel < currentLevel) {
          // 等级需要降低
          this.boostLevels.set(boostType, expectedLevel)
          this.recalculateBoost(boostType)

          if (expectedLevel === 0) {
            // 等级归零，移除增益
            this.removeBoost(boostType)
          }
        }
      }
    })
  }

  // 自动射击
  private autoFire(time: number) {
    if (time > this.lastFired + this.fireRate) {
      this.fire()
      this.lastFired = time
    }
  }

  // 发射子弹
  private fire() {
    if (this.multiShotCount === 1) {
      // 单发
      this.createBullet(this.x, this.y - 25)
    } else {
      // 多发（散射）
      const spread = 15
      for (let i = 0; i < this.multiShotCount; i++) {
        const offset = (i - (this.multiShotCount - 1) / 2) * spread
        this.createBullet(this.x + offset, this.y - 25)
      }
    }
  }

  // 创建子弹
  private createBullet(x: number, y: number) {
    const bullet = this.bullets.get(x, y) as Bullet
    if (bullet) {
      bullet.damage = this.attack
      // 根据攻击力调整子弹大小
      bullet.updateSize(this.attack)
    }
  }

  // 移动到指定位置（触摸控制）
  moveToPosition(x: number, y: number) {
    this.setPosition(x, y)
  }

  // 受到伤害
  takeDamage(damage: number) {
    // 先用护盾吸收伤害
    if (this.shield > 0) {
      this.shield -= damage
      if (this.shield < 0) {
        // 护盾破碎，剩余伤害作用于生命值
        const remainingDamage = Math.abs(this.shield)
        this.shield = 0
        const actualDamage = Math.max(0, remainingDamage - this.defense)
        this.hp -= actualDamage
      }
      this.updateShieldGraphics()
    } else {
      // 没有护盾，直接扣血
      const actualDamage = Math.max(0, damage - this.defense)
      this.hp -= actualDamage
    }

    if (this.hp <= 0) {
      this.hp = 0
      this.onDeath()
    }
  }

  // 死亡处理
  private onDeath() {
    // 重置所有增益效果
    this.attack = PLAYER_INITIAL.attack
    this.fireRate = this.baseFireRate
    this.multiShotCount = 1
    this.boostLevels.clear()
    this.boostTimeRemaining.clear()
    this.lastBoostUpdate = 0
    this.shield = 0
    this.updateShieldGraphics()

    // 触发死亡事件
    this.scene.events.emit('playerDeath')
  }

  // 恢复生命
  heal(amount: number) {
    this.hp = Math.min(this.hp + amount, this.maxHp)
  }

  // 添加护盾
  addShield(amount: number) {
    this.shield += amount
    this.updateShieldGraphics()
  }

  // 使用炸弹
  useBomb() {
    if (this.bombs > 0) {
      this.bombs--
      this.scene.events.emit('bombUsed')
      return true
    }
    return false
  }

  // 添加炸弹
  addBomb() {
    this.bombs++
  }

  // 应用增益效果
  applyPowerUp(type: string, value: number, _duration: number, _currentTime: number) {
    switch (type) {
      case 'health':
        this.heal(value)
        break

      case 'shield':
        this.addShield(value)
        break

      case 'bomb':
        this.addBomb()
        break

      case 'attackBoost':
      case 'fireRateBoost':
      case 'multiShot':
        // 获取当前等级和剩余时间
        const currentLevel = this.boostLevels.get(type) || 0
        const currentTimeRemaining = this.boostTimeRemaining.get(type) || 0

        // 等级+1
        const newLevel = currentLevel + 1
        this.boostLevels.set(type, newLevel)

        // 时间+10秒（累加）
        const newTime = currentTimeRemaining + 10000
        this.boostTimeRemaining.set(type, newTime)

        // 重新计算增益效果
        this.recalculateBoost(type)
        break
    }

    // 触发增益获得事件
    this.scene.events.emit('powerUpCollected', type)
  }

  // 重新计算增益效果（基于当前等级）
  private recalculateBoost(boostType: string) {
    const level = this.boostLevels.get(boostType) || 0

    switch (boostType) {
      case 'attackBoost':
        // 每级+5攻击力
        this.attack = PLAYER_INITIAL.attack + (level * 5)
        break

      case 'fireRateBoost':
        // 每级提升0.5倍射速
        this.fireRate = this.baseFireRate / (1 + level * 0.5)
        break

      case 'multiShot':
        // 每级+1发子弹，最多5发
        this.multiShotCount = Math.min(level + 1, 5)
        break
    }
  }

  // 移除增益效果
  private removeBoost(boostType: string) {
    switch (boostType) {
      case 'attackBoost':
        this.attack = PLAYER_INITIAL.attack
        break

      case 'fireRateBoost':
        this.fireRate = this.baseFireRate
        break

      case 'multiShot':
        this.multiShotCount = 1
        break
    }

    this.boostLevels.delete(boostType)
    this.boostTimeRemaining.delete(boostType)
    this.scene.events.emit('powerUpExpired', boostType)
  }
}
