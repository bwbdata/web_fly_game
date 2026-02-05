import Phaser from 'phaser'
import { SmallPlane } from '../entities/SmallPlane'
import { MediumPlane } from '../entities/MediumPlane'
import { LargePlane } from '../entities/LargePlane'
import { Boss } from '../entities/Boss'
import { GAME_CONFIG } from '../types'

export class EnemyManager {
  private scene: Phaser.Scene
  public enemies: Phaser.GameObjects.Group
  public enemyBullets: Phaser.GameObjects.Group
  private spawnTimer: number = 0
  private spawnInterval: number = 1500 // 波次内敌人生成间隔

  // 波次系统
  public currentWave: number = 0
  private enemiesPerWave: number = 5 // 每波敌人数量
  private enemiesSpawned: number = 0 // 当前波次已生成的敌人数
  private waveInProgress: boolean = false
  private waveBreakTime: number = 2000 // 波次间隔时间（毫秒）
  private waveBreakTimer: number = 0
  private isBossWave: boolean = false // 是否为BOSS波次
  private bossSpawned: boolean = false // BOSS是否已生成
  private waveDuration: number = 10000 // 每波持续时间（10秒）
  private waveTimer: number = 0 // 当前波次计时器

  constructor(scene: Phaser.Scene) {
    this.scene = scene

    // 创建敌人组
    this.enemies = scene.add.group({
      runChildUpdate: true
    })

    // 创建敌人子弹组（统一管理所有敌人的子弹）
    this.enemyBullets = scene.add.group({
      runChildUpdate: true
    })

    // 开始第一波
    this.startNextWave()
  }

  update(time: number, delta: number) {
    // 收集所有敌人的子弹到统一的子弹组
    this.collectEnemyBullets()

    if (this.waveInProgress) {
      if (this.isBossWave) {
        // BOSS波次：生成BOSS
        if (!this.bossSpawned) {
          this.spawnBoss()
          this.bossSpawned = true
          this.enemiesSpawned = 1
        }

        // 检查BOSS是否被击败
        if (this.enemies.getLength() === 0) {
          this.endWave()
        }
      } else {
        // 普通波次：持续生成敌人直到时间结束
        this.waveTimer += delta
        this.spawnTimer += delta

        // 在波次时间内持续生成敌人
        if (this.waveTimer < this.waveDuration && this.spawnTimer >= this.spawnInterval) {
          this.spawnEnemy()
          this.enemiesSpawned++
          this.spawnTimer = 0
        }

        // 波次时间结束且所有敌人被消灭后进入下一波
        if (this.waveTimer >= this.waveDuration && this.enemies.getLength() === 0) {
          this.endWave()
        }
      }
    } else {
      // 波次间隔
      this.waveBreakTimer += delta

      if (this.waveBreakTimer >= this.waveBreakTime) {
        this.startNextWave()
      }
    }
  }

  // 开始下一波
  private startNextWave() {
    this.currentWave++
    this.waveInProgress = true
    this.enemiesSpawned = 0
    this.spawnTimer = 0
    this.waveBreakTimer = 0
    this.waveTimer = 0
    this.bossSpawned = false

    // 检查是否为BOSS波次（每3波，即每30秒+BOSS）
    this.isBossWave = this.currentWave % 3 === 0

    if (this.isBossWave) {
      // BOSS波次：只生成BOSS
      this.spawnInterval = 0
      // 触发BOSS波次开始事件
      this.scene.events.emit('bossWaveStart', this.currentWave)
    } else {
      // 普通波次：10秒内持续生成敌人
      // 根据波次增加生成频率
      this.spawnInterval = Math.max(600, 1200 - this.currentWave * 50) // 生成间隔逐渐缩短，最低600ms
      // 触发波次开始事件
      this.scene.events.emit('waveStart', this.currentWave)
    }
  }

  // 结束当前波
  private endWave() {
    this.waveInProgress = false
    this.waveBreakTimer = 0

    // 触发波次完成事件
    this.scene.events.emit('waveComplete', this.currentWave)
  }

  // 根据波次和随机概率生成不同类型的敌人
  private spawnEnemy() {
    const x = Phaser.Math.Between(30, GAME_CONFIG.WIDTH - 30)
    const y = -50

    const random = Math.random()

    // 根据波次调整敌人类型概率
    if (this.currentWave <= 2) {
      // 第1-2波：只生成小型飞机
      this.spawnSmallPlane(x, y)
    } else if (this.currentWave <= 5) {
      // 第3-5波：70%小型，30%中型
      if (random < 0.7) {
        this.spawnSmallPlane(x, y)
      } else {
        this.spawnMediumPlane(x, y)
      }
    } else if (this.currentWave <= 10) {
      // 第6-10波：50%小型，30%中型，20%大型
      if (random < 0.5) {
        this.spawnSmallPlane(x, y)
      } else if (random < 0.8) {
        this.spawnMediumPlane(x, y)
      } else {
        this.spawnLargePlane(x, y)
      }
    } else {
      // 第10波后：30%小型，40%中型，30%大型
      if (random < 0.3) {
        this.spawnSmallPlane(x, y)
      } else if (random < 0.7) {
        this.spawnMediumPlane(x, y)
      } else {
        this.spawnLargePlane(x, y)
      }
    }
  }

  private spawnSmallPlane(x: number, y: number) {
    const enemy = new SmallPlane(this.scene, x, y)
    this.enemies.add(enemy)
  }

  private spawnMediumPlane(x: number, y: number) {
    const enemy = new MediumPlane(this.scene, x, y)
    this.enemies.add(enemy)
  }

  private spawnLargePlane(x: number, y: number) {
    const enemy = new LargePlane(this.scene, x, y)
    this.enemies.add(enemy)
  }

  private spawnBoss() {
    const boss = new Boss(this.scene, GAME_CONFIG.WIDTH / 2, 100)
    this.enemies.add(boss)
  }

  // 收集所有敌人的子弹到统一的子弹组
  private collectEnemyBullets() {
    this.enemies.getChildren().forEach((enemyObj) => {
      const enemy = enemyObj as any
      if (enemy.getBullets) {
        const bullets = enemy.getBullets()
        bullets.getChildren().forEach((bullet: Phaser.GameObjects.GameObject) => {
          if (bullet.active && !this.enemyBullets.contains(bullet)) {
            this.enemyBullets.add(bullet)
          }
        })
      }
    })
  }

  // 清除所有敌人
  clearAll() {
    this.enemies.clear(true, true)
  }

  // 获取所有存活的敌人
  getAliveEnemies(): Phaser.GameObjects.GameObject[] {
    return this.enemies.getChildren()
  }
}
