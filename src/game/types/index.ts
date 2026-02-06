// 游戏常量配置
export const GAME_CONFIG = {
  WIDTH: 375,
  HEIGHT: 667,
  BACKGROUND_COLOR: '#000000'
} as const

// 玩家初始属性
export const PLAYER_INITIAL = {
  hp: 100,
  maxHp: 100,
  attack: 10,
  defense: 0,
  speed: 200,
  ultimateCount: 3
} as const

// 敌人属性
export const ENEMY_STATS = {
  smallPlane: { hp: 20, damage: 10, score: 10, speed: 100 },
  mediumPlane: { hp: 30, damage: 15, score: 20, speed: 80 },
  largePlane: { hp: 50, damage: 20, score: 50, speed: 60 },
  cannon: { hp: 50, damage: 15, score: 25 },
  electricNet: { damage: 20, score: 0 },
  boss: { hp: 1000, damage: 30, score: 500, speed: 50 }
} as const

// 保持向后兼容
export const ENEMIES = ENEMY_STATS

// 道具效果
export const POWERUPS = {
  health: { value: 20, duration: 0, dropRate: 0.25 },
  shield: { value: 50, duration: 0, dropRate: 0.15 },
  bomb: { value: 1, duration: 0, dropRate: 0.1 },
  attackBoost: { value: 5, duration: 10000, dropRate: 0.2 },
  fireRateBoost: { value: 0.5, duration: 10000, dropRate: 0.2 }, // 射速提升50%
  multiShot: { value: 2, duration: 10000, dropRate: 0.1 } // 同时发射2发子弹
} as const

// 升级消耗
export const UPGRADE_COSTS = {
  maxHp: 100,
  attack: 80,
  defense: 80,
  ultimate: 150
} as const

// 颜色配置（黑白主题）
export const COLORS = {
  WHITE: 0xFFFFFF,
  BLACK: 0x000000,
  GRAY: 0x808080
} as const

// 玩家接口
export interface IPlayer {
  hp: number
  maxHp: number
  attack: number
  defense: number
  speed: number
  ultimate: {
    count: number
    effect: 'clearScreen'
  }
  position: { x: number; y: number }
  tempBoosts: {
    attack: number
    defense: number
    speed: number
  }
}

// 敌人类型
export type EnemyType = 'smallPlane' | 'mediumPlane' | 'largePlane' | 'cannon' | 'electricNet' | 'boss'

// 敌人接口
export interface IEnemy {
  type: EnemyType
  hp: number
  maxHp: number
  damage: number
  score: number
  position: { x: number; y: number }
}

// 道具类型
export type PowerUpType = 'health' | 'shield' | 'bomb' | 'attackBoost' | 'fireRateBoost' | 'multiShot'

// 道具接口
export interface IPowerUp {
  type: PowerUpType
  position: { x: number; y: number }
}

// 游戏状态
export interface IGameState {
  score: number
  level: number
  isPaused: boolean
  isGameOver: boolean
  isVictory: boolean
}

// Boss阶段配置
export interface IBossPhase {
  hpThreshold: number
  pattern: string
  fireRate: number
  bulletCount: number
}

export const BOSS_PHASES: IBossPhase[] = [
  {
    hpThreshold: 0.5,
    pattern: 'leftRight',
    fireRate: 1000,
    bulletCount: 3
  },
  {
    hpThreshold: 0,
    pattern: 'leftRightFast',
    fireRate: 700,
    bulletCount: 5
  }
]

// 关卡主题类型
export type LevelTheme = 'city' | 'desert' | 'jungle' | 'ocean' | 'space'

// 关卡配置
export interface ILevelConfig {
  id: number // 关卡ID（1-5）
  theme: LevelTheme // 主题
  name: string // 关卡名称
  waves: number // 波次数量（固定3波普通+1波Boss）
  bossHp: number // Boss血量
  bossName: string // Boss名称
}

// 5个关卡配置
export const LEVELS: ILevelConfig[] = [
  {
    id: 1,
    theme: 'city',
    name: '城市上空',
    waves: 3,
    bossHp: 1000,
    bossName: '机械巨塔'
  },
  {
    id: 2,
    theme: 'desert',
    name: '沙漠风暴',
    waves: 3,
    bossHp: 1200,
    bossName: '沙暴之眼'
  },
  {
    id: 3,
    theme: 'jungle',
    name: '热带雨林',
    waves: 3,
    bossHp: 1400,
    bossName: '丛林守护者'
  },
  {
    id: 4,
    theme: 'ocean',
    name: '深海激流',
    waves: 3,
    bossHp: 1600,
    bossName: '深海利维坦'
  },
  {
    id: 5,
    theme: 'space',
    name: '星际战场',
    waves: 3,
    bossHp: 2000,
    bossName: '星际母舰'
  }
]
