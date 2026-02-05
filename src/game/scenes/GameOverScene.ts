import Phaser from 'phaser'
import { GAME_CONFIG } from '../types'

export class GameOverScene extends Phaser.Scene {
  private score: number = 0
  private highScore: number = 0

  constructor() {
    super({ key: 'GameOverScene' })
  }

  init(data: { score: number }) {
    this.score = data.score || 0

    // 从 localStorage 读取最高分
    const savedHighScore = localStorage.getItem('highScore')
    this.highScore = savedHighScore ? parseInt(savedHighScore) : 0

    // 更新最高分
    if (this.score > this.highScore) {
      this.highScore = this.score
      localStorage.setItem('highScore', this.highScore.toString())
    }
  }

  create() {
    // 游戏结束标题
    this.add.text(
      GAME_CONFIG.WIDTH / 2,
      150,
      'GAME OVER',
      {
        fontSize: '48px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5)

    // 显示分数
    this.add.text(
      GAME_CONFIG.WIDTH / 2,
      250,
      `Score: ${this.score}`,
      {
        fontSize: '32px',
        color: '#ffffff'
      }
    ).setOrigin(0.5)

    // 显示最高分
    const highScoreColor = this.score >= this.highScore ? '#ffff00' : '#ffffff'
    this.add.text(
      GAME_CONFIG.WIDTH / 2,
      310,
      `High Score: ${this.highScore}`,
      {
        fontSize: '24px',
        color: highScoreColor
      }
    ).setOrigin(0.5)

    // 新纪录提示
    if (this.score >= this.highScore && this.score > 0) {
      const newRecordText = this.add.text(
        GAME_CONFIG.WIDTH / 2,
        360,
        'NEW RECORD!',
        {
          fontSize: '20px',
          color: '#ffff00'
        }
      ).setOrigin(0.5)

      // 闪烁效果
      this.tweens.add({
        targets: newRecordText,
        alpha: 0.3,
        duration: 500,
        yoyo: true,
        repeat: -1
      })
    }

    // 重新开始按钮
    const restartButton = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      450,
      'RESTART',
      {
        fontSize: '28px',
        color: '#ffffff',
        backgroundColor: '#333333',
        padding: { x: 20, y: 10 }
      }
    ).setOrigin(0.5)
    .setInteractive({ useHandCursor: true })

    // 按钮悬停效果
    restartButton.on('pointerover', () => {
      restartButton.setStyle({ backgroundColor: '#555555' })
    })

    restartButton.on('pointerout', () => {
      restartButton.setStyle({ backgroundColor: '#333333' })
    })

    // 点击重新开始
    restartButton.on('pointerdown', () => {
      this.scene.start('GameScene')
    })

    // 返回主菜单按钮
    const menuButton = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      520,
      'MAIN MENU',
      {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#333333',
        padding: { x: 20, y: 10 }
      }
    ).setOrigin(0.5)
    .setInteractive({ useHandCursor: true })

    menuButton.on('pointerover', () => {
      menuButton.setStyle({ backgroundColor: '#555555' })
    })

    menuButton.on('pointerout', () => {
      menuButton.setStyle({ backgroundColor: '#333333' })
    })

    menuButton.on('pointerdown', () => {
      // 返回 Vue 路由的主页
      window.location.href = '/'
    })

    // 提示文字
    this.add.text(
      GAME_CONFIG.WIDTH / 2,
      600,
      'Touch anywhere to restart',
      {
        fontSize: '16px',
        color: '#888888'
      }
    ).setOrigin(0.5)

    // 点击屏幕任意位置重新开始
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // 如果点击的不是按钮区域，则重新开始
      if (pointer.y < 400 || pointer.y > 550) {
        this.scene.start('GameScene')
      }
    })
  }
}
