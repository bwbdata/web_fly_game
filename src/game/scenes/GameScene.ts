import Phaser from 'phaser'
import { GAME_CONFIG, EnemyType, LEVELS, LevelTheme, ILevelConfig } from '../types'
import { Player } from '../entities/Player'
import { EnemyManager } from '../managers/EnemyManager'
import { CollisionManager } from '../managers/CollisionManager'
import { PowerUpManager } from '../managers/PowerUpManager'
import { useGameStore } from '@/stores/game'

export class GameScene extends Phaser.Scene {
  public player?: Player // 改为 public，使敌人（如大炮）可以访问玩家引用进行瞄准
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private isDragging = false
  private enemyManager?: EnemyManager
  private powerUpManager?: PowerUpManager
  private score: number = 0
  private scoreText?: Phaser.GameObjects.Text
  private waveText?: Phaser.GameObjects.Text
  private boostTexts: Map<string, Phaser.GameObjects.Text> = new Map()
  private isGameOver: boolean = false

  // 关卡相关
  private currentLevel: number = 1 // 当前关卡（1-5）
  private levelConfig?: ILevelConfig // 当前关卡配置
  private levelTheme: LevelTheme = 'city' // 当前主题

  // 背景滚动相关
  private background1?: Phaser.GameObjects.Graphics
  private background2?: Phaser.GameObjects.Graphics
  private backgroundScrollSpeed: number = 50 // 滚动速度

  // 暂停相关
  private isPaused: boolean = false
  private pauseOverlay?: Phaser.GameObjects.Graphics
  private pauseMenu?: Phaser.GameObjects.Container


  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: { level?: number } = {}) {
    // 初始化关卡（从store获取当前关卡）
    const gameStore = useGameStore()
    this.currentLevel = data.level || gameStore.currentLevel
    this.levelConfig = LEVELS.find(l => l.id === this.currentLevel) || LEVELS[0]
    this.levelTheme = this.levelConfig.theme
  }

  create() {
    // 重置游戏状态
    this.isGameOver = false
    this.score = 0

    // 创建滚动背景（根据主题）
    this.createBackground()

    // 创建玩家飞机
    this.createPlayer()

    // 创建管理器（传入Boss配置）
    if (this.player) {
      this.enemyManager = new EnemyManager(
        this,
        this.levelConfig?.bossHp || 1000,
        this.levelTheme
      )
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

  // 创建滚动背景
  private createBackground() {
    // 创建两个相同的背景图形，用于无缝循环滚动
    this.background1 = this.add.graphics()
    this.background2 = this.add.graphics()

    // 绘制黑白条纹背景
    this.drawBackgroundPattern(this.background1, 0)
    this.drawBackgroundPattern(this.background2, GAME_CONFIG.HEIGHT)

    // 将背景设置到最底层
    this.background1.setDepth(-1)
    this.background2.setDepth(-1)
  }

  // 绘制背景图案（根据主题）
  private drawBackgroundPattern(graphics: Phaser.GameObjects.Graphics, startY: number) {
    graphics.clear()
    graphics.setPosition(0, startY)

    const totalHeight = GAME_CONFIG.HEIGHT

    switch (this.levelTheme) {
      case 'city':
        this.drawCityBackground(graphics, totalHeight)
        break
      case 'desert':
        this.drawDesertBackground(graphics, totalHeight)
        break
      case 'jungle':
        this.drawJungleBackground(graphics, totalHeight)
        break
      case 'ocean':
        this.drawOceanBackground(graphics, totalHeight)
        break
      case 'space':
        this.drawSpaceBackground(graphics, totalHeight)
        break
      default:
        this.drawCityBackground(graphics, totalHeight)
    }
  }

  // 城市背景：建筑剪影
  private drawCityBackground(graphics: Phaser.GameObjects.Graphics, height: number) {
    const buildingWidth = 50
    const buildingCount = Math.ceil(GAME_CONFIG.WIDTH / buildingWidth)

    for (let i = 0; i < buildingCount; i++) {
      const x = i * buildingWidth
      const buildingHeight = Phaser.Math.Between(100, 200)
      const y = height - buildingHeight

      // 建筑主体（白色轮廓）
      graphics.lineStyle(2, 0xFFFFFF, 0.3)
      graphics.strokeRect(x, y, buildingWidth - 5, buildingHeight)

      // 窗户（小方块）
      for (let wy = y + 10; wy < height - 10; wy += 20) {
        for (let wx = x + 5; wx < x + buildingWidth - 10; wx += 15) {
          graphics.fillStyle(0xFFFFFF, 0.2)
          graphics.fillRect(wx, wy, 8, 8)
        }
      }
    }
  }

  // 沙漠背景：沙丘波浪
  private drawDesertBackground(graphics: Phaser.GameObjects.Graphics, height: number) {
    const duneCount = 5
    for (let i = 0; i < duneCount; i++) {
      const y = (height / duneCount) * i
      graphics.lineStyle(2, 0xFFFFFF, 0.2)
      graphics.beginPath()
      graphics.moveTo(0, y)

      // 绘制波浪线
      for (let x = 0; x <= GAME_CONFIG.WIDTH; x += 20) {
        const waveY = y + Math.sin(x * 0.05 + i) * 15
        graphics.lineTo(x, waveY)
      }
      graphics.strokePath()
    }

    // 仙人掌剪影
    const cactusCount = 3
    for (let i = 0; i < cactusCount; i++) {
      const x = (GAME_CONFIG.WIDTH / cactusCount) * i + 50
      const y = Phaser.Math.Between(height / 2, height - 50)
      graphics.lineStyle(3, 0xFFFFFF, 0.3)
      graphics.lineBetween(x, y, x, y + 40) // 主干
      graphics.lineBetween(x - 10, y + 15, x, y + 15) // 左臂
      graphics.lineBetween(x + 10, y + 20, x, y + 20) // 右臂
    }
  }

  // 雨林背景：树叶和藤蔓
  private drawJungleBackground(graphics: Phaser.GameObjects.Graphics, height: number) {
    // 垂直藤蔓
    const vineCount = 8
    for (let i = 0; i < vineCount; i++) {
      const x = (GAME_CONFIG.WIDTH / vineCount) * i
      graphics.lineStyle(2, 0xFFFFFF, 0.15)
      graphics.lineBetween(x, 0, x + Phaser.Math.Between(-10, 10), height)
    }

    // 大型树叶轮廓
    const leafCount = 6
    for (let i = 0; i < leafCount; i++) {
      const x = Phaser.Math.Between(20, GAME_CONFIG.WIDTH - 20)
      const y = (height / leafCount) * i
      graphics.lineStyle(2, 0xFFFFFF, 0.25)
      graphics.strokeEllipse(x, y, 30, 15)
    }
  }

  // 海洋背景：波浪线条
  private drawOceanBackground(graphics: Phaser.GameObjects.Graphics, height: number) {
    const waveCount = 10
    for (let i = 0; i < waveCount; i++) {
      const y = (height / waveCount) * i
      graphics.lineStyle(2, 0xFFFFFF, 0.2)
      graphics.beginPath()
      graphics.moveTo(0, y)

      for (let x = 0; x <= GAME_CONFIG.WIDTH; x += 10) {
        const waveY = y + Math.sin((x + i * 30) * 0.1) * 10
        graphics.lineTo(x, waveY)
      }
      graphics.strokePath()
    }

    // 鱼群剪影（三角形）
    const fishCount = 5
    for (let i = 0; i < fishCount; i++) {
      const x = Phaser.Math.Between(20, GAME_CONFIG.WIDTH - 20)
      const y = Phaser.Math.Between(50, height - 50)
      graphics.fillStyle(0xFFFFFF, 0.15)
      graphics.fillTriangle(x, y, x - 10, y + 5, x - 10, y - 5)
    }
  }

  // 太空背景：星空点阵
  private drawSpaceBackground(graphics: Phaser.GameObjects.Graphics, height: number) {
    // 星星
    const starCount = 50
    for (let i = 0; i < starCount; i++) {
      const x = Phaser.Math.Between(0, GAME_CONFIG.WIDTH)
      const y = Phaser.Math.Between(0, height)
      const size = Phaser.Math.Between(1, 3)
      graphics.fillStyle(0xFFFFFF, Phaser.Math.Between(30, 80) / 100)
      graphics.fillCircle(x, y, size)
    }

    // 星云效果（半透明圆圈）
    const nebulaCount = 3
    for (let i = 0; i < nebulaCount; i++) {
      const x = Phaser.Math.Between(50, GAME_CONFIG.WIDTH - 50)
      const y = Phaser.Math.Between(50, height - 50)
      const radius = Phaser.Math.Between(30, 60)
      graphics.fillStyle(0xFFFFFF, 0.05)
      graphics.fillCircle(x, y, radius)
    }
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

    // 创建暂停按钮
    this.createPauseButton()
  }

  // 创建暂停按钮
  private createPauseButton() {
    this.add.text(
      GAME_CONFIG.WIDTH - 10,
      GAME_CONFIG.HEIGHT - 30,
      '暂停',
      {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    )
    .setOrigin(1, 1)
    .setInteractive({ useHandCursor: true })
    .setDepth(100)
    .on('pointerdown', () => {
      this.togglePause()
    })
  }

  // 切换暂停状态
  private togglePause() {
    if (this.isPaused) {
      this.resumeGame()
    } else {
      this.pauseGame()
    }
  }

  // 暂停游戏
  private pauseGame() {
    if (this.isGameOver) return

    this.isPaused = true
    this.physics.pause()

    // 创建半透明遮罩
    this.pauseOverlay = this.add.graphics()
    this.pauseOverlay.fillStyle(0x000000, 0.7)
    this.pauseOverlay.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT)
    this.pauseOverlay.setDepth(99)

    // 创建暂停菜单
    this.pauseMenu = this.add.container(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2)
    this.pauseMenu.setDepth(100)

    // 暂停标题
    const pauseTitle = this.add.text(0, -100, '游戏暂停', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // 继续按钮
    const resumeButton = this.add.text(0, 0, '继续游戏', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 30, y: 15 }
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => {
      this.resumeGame()
    })
    .on('pointerover', () => {
      resumeButton.setStyle({ backgroundColor: '#555555' })
    })
    .on('pointerout', () => {
      resumeButton.setStyle({ backgroundColor: '#333333' })
    })

    // 返回主菜单按钮
    const menuButton = this.add.text(0, 70, '返回主菜单', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 30, y: 15 }
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => {
      this.returnToMenu()
    })
    .on('pointerover', () => {
      menuButton.setStyle({ backgroundColor: '#555555' })
    })
    .on('pointerout', () => {
      menuButton.setStyle({ backgroundColor: '#333333' })
    })

    this.pauseMenu.add([pauseTitle, resumeButton, menuButton])
  }

  // 恢复游戏
  private resumeGame() {
    this.isPaused = false
    this.physics.resume()

    // 移除遮罩和菜单
    if (this.pauseOverlay) {
      this.pauseOverlay.destroy()
      this.pauseOverlay = undefined
    }

    if (this.pauseMenu) {
      this.pauseMenu.destroy()
      this.pauseMenu = undefined
    }
  }

  // 返回主菜单
  private returnToMenu() {
    // 结束游戏状态
    const gameStore = useGameStore()
    gameStore.endGame()

    // 跳转到主菜单（通过Vue路由）
    // 不手动停止场景，让Vue的onUnmounted钩子销毁游戏实例
    window.location.hash = '#/'
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
    // 标记游戏为胜利结束
    this.isGameOver = true

    // 停止游戏更新
    this.physics.pause()

    // 显示胜利提示
    const victoryText = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2,
      'BOSS击败!\n通关成功!',
      {
        fontSize: '48px',
        color: '#ffff00',
        fontStyle: 'bold',
        align: 'center'
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

    // 2秒后跳转到升级界面
    this.time.delayedCall(2000, () => {
      this.goToUpgrade()
    })
  }

  // 跳转到升级界面
  private goToUpgrade() {
    // 保存游戏状态
    const gameStore = useGameStore()
    gameStore.completeLevel()
    gameStore.endGame()

    // 跳转到升级界面（通过Vue路由）
    // 不手动停止场景，让Vue的onUnmounted钩子销毁游戏实例
    window.location.hash = '#/upgrade'
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
    // 如果游戏结束或暂停，停止更新
    if (this.isGameOver || this.isPaused) return

    // 更新背景滚动
    this.updateBackground(delta)

    // 更新玩家
    if (this.player) {
      this.player.update(time, this.cursors)
    }

    // 更新敌人管理器
    if (this.enemyManager) {
      this.enemyManager.update(time, delta)
    }
  }

  // 更新背景滚动
  private updateBackground(delta: number) {
    if (!this.background1 || !this.background2) return

    // 根据 delta 计算移动距离（向上滚动，所以是负值）
    const moveDistance = (this.backgroundScrollSpeed * delta) / 1000

    // 移动两个背景
    this.background1.y -= moveDistance
    this.background2.y -= moveDistance

    // 当背景1完全移出屏幕上方时，重置到背景2下方
    if (this.background1.y <= -GAME_CONFIG.HEIGHT) {
      this.background1.y = this.background2.y + GAME_CONFIG.HEIGHT
    }

    // 当背景2完全移出屏幕上方时，重置到背景1下方
    if (this.background2.y <= -GAME_CONFIG.HEIGHT) {
      this.background2.y = this.background1.y + GAME_CONFIG.HEIGHT
    }
  }
}
