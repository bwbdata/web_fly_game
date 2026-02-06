import Phaser from 'phaser'
import { SmallPlane } from '../entities/SmallPlane'
import { MediumPlane } from '../entities/MediumPlane'
import { LargePlane } from '../entities/LargePlane'
import { Cannon } from '../entities/Cannon'
import { ElectricNet } from '../entities/ElectricNet'
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
  private enemiesSpawned: number = 0 // 当前波次已生成的敌人数
  private waveInProgress: boolean = false
  private waveBreakTime: number = 2000 // 波次间隔时间（毫秒）
  private waveBreakTimer: number = 0
  private isBossWave: boolean = false // 是否为BOSS波次
  private bossSpawned: boolean = false // BOSS是否已生成
  private waveDuration: number = 10000 // 每波持续时间（10秒）
  private waveTimer: number = 0 // 当前波次计时器
  private readonly MAX_WAVES = 3 // 固定3波普通敌人（第4波是Boss）
  private bossHp: number = 1000 // Boss血量（从外部传入）
  private bossTheme: string = 'default' // Boss主题（从外部传入）

  constructor(scene: Phaser.Scene, bossHp: number = 1000, bossTheme: string = 'default') {
    this.scene = scene
    this.bossHp = bossHp
    this.bossTheme = bossTheme

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

  update(_time: number, delta: number) {
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

    // 检查是否为BOSS波次（第4波固定为Boss）
    this.isBossWave = this.currentWave === this.MAX_WAVES + 1

    if (this.isBossWave) {
      // BOSS波次：只生成BOSS
      this.spawnInterval = 0
      // 触发BOSS波次开始事件
      this.scene.events.emit('bossWaveStart', this.currentWave)
    } else {
      // 普通波次：10秒内持续生成敌人
      // 根据波次增加生成频率
      this.spawnInterval = Math.max(600, 1200 - this.currentWave * 100) // 生成间隔逐渐缩短
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
      // 第3-5波：60%小型，25%中型，15%大炮
      if (random < 0.6) {
        this.spawnSmallPlane(x, y)
      } else if (random < 0.85) {
        this.spawnMediumPlane(x, y)
      } else {
        this.spawnCannon(x)
      }
    } else if (this.currentWave <= 10) {
      // 第6-10波：35%小型，25%中型，20%大型，12%大炮，8%电网
      if (random < 0.35) {
        this.spawnSmallPlane(x, y)
      } else if (random < 0.6) {
        this.spawnMediumPlane(x, y)
      } else if (random < 0.8) {
        this.spawnLargePlane(x, y)
      } else if (random < 0.92) {
        this.spawnCannon(x)
      } else {
        this.spawnElectricNet(x, y)
      }
    } else {
      // 第10波后：20%小型，30%中型，25%大型，15%大炮，10%电网
      if (random < 0.2) {
        this.spawnSmallPlane(x, y)
      } else if (random < 0.5) {
        this.spawnMediumPlane(x, y)
      } else if (random < 0.75) {
        this.spawnLargePlane(x, y)
      } else if (random < 0.9) {
        this.spawnCannon(x)
      } else {
        this.spawnElectricNet(x, y)
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

  private spawnCannon(x: number) {
    // 大炮固定在屏幕上方（Y坐标固定）
    const y = Phaser.Math.Between(80, 150)
    const cannon = new Cannon(this.scene, x, y)
    this.enemies.add(cannon)
  }

  private spawnElectricNet(x: number, y: number) {
    // 电网从屏幕上方生成
    const net = new ElectricNet(this.scene, x, y)
    this.enemies.add(net)
  }

  private spawnBoss() {
    const boss = new Boss(this.scene, GAME_CONFIG.WIDTH / 2, 100, this.bossTheme, this.bossHp)
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
