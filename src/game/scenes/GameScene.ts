import Phaser from 'phaser'
import { GAME_CONFIG, EnemyType } from '../types'
import { Player } from '../entities/Player'
import { EnemyManager } from '../managers/EnemyManager'
import { CollisionManager } from '../managers/CollisionManager'
import { PowerUpManager } from '../managers/PowerUpManager'

export class GameScene extends Phaser.Scene {
  private player?: Player
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private isDragging = false
  private enemyManager?: EnemyManager
  private powerUpManager?: PowerUpManager
  private score: number = 0
  private scoreText?: Phaser.GameObjects.Text
  private waveText?: Phaser.GameObjects.Text
  private boostTexts: Map<string, Phaser.GameObjects.Text> = new Map()
  private isGameOver: boolean = false

  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    // 重置游戏状态
    this.isGameOver = false
    this.score = 0
    // 创建黑色背景（已由配置设置）

    // 创建玩家飞机
    this.createPlayer()

    // 创建管理器
    if (this.player) {
      this.enemyManager = new EnemyManager(this)
      this.powerUpManager = new PowerUpManager(this)

      // 创建碰撞管理器（传入敌人子弹组）
      new CollisionManager(
        this,
        this.player,
        this.enemyManager.enemies,
        this.powerUpManager.powerUps,
        this.enemyManager.enemyBullets
      )
    }

    // 设置触摸/鼠标控制
    this.setupControls()

    // 创建UI
    this.createUI()

    // 监听敌人被摧毁事件
    this.events.on('enemyDestroyed', this.onEnemyDestroyed, this)

    // 监听道具收集事件
    this.events.on('powerUpCollected', this.onPowerUpCollected, this)

    // 监听玩家死亡事件
    this.events.on('playerDeath', this.onPlayerDeath, this)

    // 监听炸弹使用事件
    this.events.on('bombUsed', this.onBombUsed, this)

    // 监听波次事件
    this.events.on('waveStart', this.onWaveStart, this)
    this.events.on('waveComplete', this.onWaveComplete, this)
    this.events.on('bossWaveStart', this.onBossWaveStart, this)
    this.events.on('bossDefeated', this.onBossDefeated, this)

    // 显示提示文字
    const hintText = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2,
      '触摸屏幕移动飞机\n自动射击已开启\n击毁敌人掉落增益\n双击屏幕使用炸弹',
      {
        fontSize: '18px',
        color: '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5)

    // 3秒后移除提示文字
    this.time.delayedCall(3000, () => {
      hintText.destroy()
    })
  }

  private createPlayer() {
    // 创建玩家实例
    this.player = new Player(
      this,
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT - 80
    )
  }

  private createUI() {
    // 分数显示
    this.scoreText = this.add.text(10, 10, 'Score: 0', {
      fontSize: '20px',
      color: '#ffffff'
    })

    // 波次显示
    this.waveText = this.add.text(GAME_CONFIG.WIDTH / 2, 10, 'Wave: 1', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5, 0)

    // 血条显示
    if (this.player) {
      const hpText = this.add.text(10, 40, `HP: ${this.player.hp}/${this.player.maxHp}`, {
        fontSize: '18px',
        color: '#ffffff'
      })

      // 护盾显示
      const shieldText = this.add.text(10, 65, `Shield: ${this.player.shield}`, {
        fontSize: '16px',
        color: '#00ffff'
      })

      // 炸弹显示
      const bombText = this.add.text(10, 90, `Bombs: ${this.player.bombs}`, {
        fontSize: '16px',
        color: '#ffff00'
      })

      // 增益显示（右上角）
      const boostTypes = [
        { key: 'attackBoost', label: '攻击' },
        { key: 'fireRateBoost', label: '射速' },
        { key: 'multiShot', label: '多发' }
      ]

      boostTypes.forEach((boost, index) => {
        const text = this.add.text(
          GAME_CONFIG.WIDTH - 10,
          10 + index * 25,
          '',
          {
            fontSize: '16px',
            color: '#ffffff',
            align: 'right'
          }
        ).setOrigin(1, 0)

        this.boostTexts.set(boost.key, text)
      })

      // 每帧更新UI
      this.events.on('update', () => {
        if (this.player) {
          // 更新血条
          hpText.setText(`HP: ${this.player.hp}/${this.player.maxHp}`)

          // 更新护盾
          shieldText.setText(`Shield: ${this.player.shield}`)

          // 更新炸弹
          bombText.setText(`Bombs: ${this.player.bombs}`)

          // 更新增益显示
          boostTypes.forEach(boost => {
            const text = this.boostTexts.get(boost.key)
            if (text) {
              const level = this.player!.boostLevels.get(boost.key) || 0
              const timeRemaining = this.player!.boostTimeRemaining.get(boost.key) || 0

              if (level > 0 && timeRemaining > 0) {
                const seconds = Math.ceil(timeRemaining / 1000)
                text.setText(`${boost.label} Lv${level} (${seconds}s)`)
              } else {
                text.setText('')
              }
            }
          })
        }
      })
    }
  }

  private setupControls() {
    // 双击检测
    let lastTapTime = 0

    // 触摸控制
    this.input.on('pointerdown', (_pointer: Phaser.Input.Pointer) => {
      const currentTime = this.time.now

      // 检测双击（300ms内两次点击）
      if (currentTime - lastTapTime < 300) {
        // 双击使用炸弹
        if (this.player && this.player.useBomb()) {
          // 炸弹已使用，事件会在 Player 中触发
        }
        lastTapTime = 0
      } else {
        lastTapTime = currentTime
        this.isDragging = true
      }
    })

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging && this.player) {
        // 飞机跟随手指移动
        let newX = pointer.x
        let newY = pointer.y

        // 限制在屏幕范围内
        newX = Phaser.Math.Clamp(newX, 20, GAME_CONFIG.WIDTH - 20)
        newY = Phaser.Math.Clamp(newY, 20, GAME_CONFIG.HEIGHT - 20)

        this.player.moveToPosition(newX, newY)
      }
    })

    this.input.on('pointerup', () => {
      this.isDragging = false
    })

    // 键盘控制（用于桌面测试）
    this.cursors = this.input.keyboard?.createCursorKeys()
  }

  private onEnemyDestroyed(score: number, x: number, y: number, _enemyType: EnemyType) {
    // 增加分数
    this.score += score
    if (this.scoreText) {
      this.scoreText.setText(`Score: ${this.score}`)
    }

    // 显示得分提示
    const scorePopup = this.add.text(x, y, `+${score}`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5)

    this.tweens.add({
      targets: scorePopup,
      y: y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        scorePopup.destroy()
      }
    })

    // 尝试掉落道具
    if (this.powerUpManager) {
      this.powerUpManager.tryDropPowerUp(x, y)
    }
  }

  private onPowerUpCollected(type: string) {
    // 显示道具收集提示
    const messages: { [key: string]: string } = {
      health: '生命恢复!',
      shield: '护盾获得!',
      bomb: '炸弹+1!',
      attackBoost: '攻击力提升!',
      fireRateBoost: '射速提升!',
      multiShot: '多重射击!'
    }

    const message = messages[type] || '道具获得!'

    const popup = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2 - 50,
      message,
      {
        fontSize: '24px',
        color: '#ffffff'
      }
    ).setOrigin(0.5)

    this.tweens.add({
      targets: popup,
      y: GAME_CONFIG.HEIGHT / 2 - 100,
      alpha: 0,
      duration: 1500,
      onComplete: () => {
        popup.destroy()
      }
    })
  }

  // 炸弹使用处理
  private onBombUsed() {
    // 清除所有敌人和敌人子弹
    if (this.enemyManager) {
      this.enemyManager.enemies.getChildren().forEach((enemy: any) => {
        if (enemy.takeDamage) {
          enemy.takeDamage(9999) // 秒杀所有敌人
        }
      })
      this.enemyManager.enemyBullets.clear(true, true)
    }

    // 屏幕闪光效果
    const flash = this.add.graphics()
    flash.fillStyle(0xffffff, 0.8)
    flash.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT)

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        flash.destroy()
      }
    })

    // 屏幕震动
    this.cameras.main.shake(300, 0.01)

    // 显示提示
    const bombText = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2,
      'BOMB!',
      {
        fontSize: '48px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5)

    this.tweens.add({
      targets: bombText,
      scale: 2,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        bombText.destroy()
      }
    })
  }

  // 波次开始处理
  private onWaveStart(wave: number) {
    // 更新波次显示
    if (this.waveText) {
      this.waveText.setText(`Wave: ${wave}`)
    }

    // 显示波次开始提示
    const waveAnnouncement = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2,
      `第 ${wave} 波`,
      {
        fontSize: '48px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5)

    this.tweens.add({
      targets: waveAnnouncement,
      scale: 1.5,
      alpha: 0,
      duration: 1500,
      onComplete: () => {
        waveAnnouncement.destroy()
      }
    })
  }

  // 波次完成处理
  private onWaveComplete(wave: number) {
    // 显示波次完成提示
    const completeText = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2,
      `第 ${wave} 波完成!`,
      {
        fontSize: '32px',
        color: '#ffffff'
      }
    ).setOrigin(0.5)

    this.tweens.add({
      targets: completeText,
      y: GAME_CONFIG.HEIGHT / 2 - 50,
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        completeText.destroy()
      }
    })
  }

  // BOSS波次开始处理
  private onBossWaveStart(wave: number) {
    // 更新波次显示
    if (this.waveText) {
      this.waveText.setText(`Wave: ${wave} (BOSS)`)
    }

    // 显示BOSS警告
    const bossWarning = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2,
      'BOSS来袭!',
      {
        fontSize: '56px',
        color: '#ff0000',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5)

    // 闪烁效果
    this.tweens.add({
      targets: bossWarning,
      alpha: 0,
      duration: 300,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.tweens.add({
          targets: bossWarning,
          scale: 2,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            bossWarning.destroy()
          }
        })
      }
    })

    // 屏幕震动
    this.cameras.main.shake(500, 0.01)
  }

  // BOSS被击败处理
  private onBossDefeated() {
    // 显示胜利提示
    const victoryText = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2,
      'BOSS击败!',
      {
        fontSize: '48px',
        color: '#ffff00',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5)

    this.tweens.add({
      targets: victoryText,
      scale: 1.5,
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        victoryText.destroy()
      }
    })

    // 屏幕闪光
    const flash = this.add.graphics()
    flash.fillStyle(0xffffff, 0.5)
    flash.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT)

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        flash.destroy()
      }
    })
  }

  // 玩家死亡处理
  private onPlayerDeath() {
    if (this.isGameOver) return
    this.isGameOver = true

    // 停止游戏更新
    this.physics.pause()

    // 显示死亡效果
    this.cameras.main.shake(500, 0.01)
    this.cameras.main.fade(1000, 0, 0, 0)

    // 1秒后切换到游戏结束场景
    this.time.delayedCall(1000, () => {
      this.scene.start('GameOverScene', { score: this.score })
    })
  }

  update(time: number, delta: number) {
    // 如果游戏结束，停止更新
    if (this.isGameOver) return
    // 更新玩家
    if (this.player) {
      this.player.update(time, this.cursors)
    }

    // 更新敌人管理器
    if (this.enemyManager) {
      this.enemyManager.update(time, delta)
    }
  }
}
