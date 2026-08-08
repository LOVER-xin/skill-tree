// 技能掌握程度枚举
export enum SkillLevel {
  UNKNOWN = '认识',      // 认识
  AWARE = '了解',        // 了解
  CAPABLE = '会用',      // 会用
  FAMILIAR = '熟悉',     // 熟悉
  PROFICIENT = '精通',   // 精通
  MASTER = '大神',       // 大神
}

// 技能状态
export enum SkillStatus {
  LOCKED = 'locked',       // 锁定
  AVAILABLE = 'available', // 可学习
  LEARNING = 'learning',   // 学习中
  COMPLETED = 'completed', // 已完成
}

// 技能节点接口
export interface SkillNode {
  id: string
  name: string
  description: string
  category: string
  level: SkillLevel
  status: SkillStatus
  xp: number               // 当前经验值
  maxXp: number            // 升级所需经验值
  prerequisites: string[]  // 前置技能ID
  children: string[]       // 子技能ID
  estimatedHours: number   // 预估学习时间
  tags: string[]           // 技能标签
  position: {
    x: number
    y: number
  }
  aiRecommendation?: {
    priority: number       // AI推荐优先级 (1-10)
    reason: string         // 推荐理由
    learningPath: string[] // 建议学习路径
  }
  teachSteps?: TeachStep[] // 教学步骤（深度学习路径，逐步递进）
}

/** 教学步骤类型：concept 概念 → practice 实践 → project 项目 → quiz 测验 */
export type TeachStepType = 'concept' | 'practice' | 'project' | 'quiz'

/** 测验题目 */
export interface TeachQuizQuestion {
  question: string
  options: string[]
  answerIndex: number // 正确答案下标
  explanation: string // 答错时的解析
}

/** 学习资源类型：课程 / 文章 / 视频 */
export type ResourceType = 'course' | 'article' | 'video'

/** 学习资源：课程、文章、视频推荐（推进学习的关键内容） */
export interface LearningResource {
  id: string
  type: ResourceType
  title: string
  url: string
  source?: string // 来源平台/网站，如 MDN、freeCodeCamp
  durationMinutes?: number // 预估学习时长
  description?: string
  aiGenerated?: boolean // AI 推荐（链接请自行验证）
}

/** 教学步骤：一个技能内部的深度学习单元（从浅入深） */
export interface TeachStep {
  id: string
  title: string
  description: string
  type: TeachStepType
  durationMinutes: number
  completed?: boolean       // 是否完成
  completedAt?: Date
  quizQuestions?: TeachQuizQuestion[] // type=quiz 时的题目（答对全部才可完成）
  resources?: LearningResource[] // 推荐的课程/文章/视频
}

// 技能树模板
export interface SkillTreeTemplate {
  id: string
  name: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration: number // 预估完成时间(天)
  skills: SkillNode[]
  tags: string[]
}

// 用户技能进度
export interface UserSkillProgress {
  skillId: string
  level: SkillLevel
  xp: number
  completedTasks: string[]
  startDate: Date
  lastUpdate: Date
  timeSpent: number // 分钟
}

// 任务接口
export interface Task {
  id: string
  title: string
  description: string
  skillId?: string         // 关联的技能ID
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  estimatedMinutes: number
  actualMinutes?: number
  dueDate?: Date
  tags: string[]
  subtasks: SubTask[]
  aiGenerated: boolean     // 是否为AI生成的任务
}

export interface SubTask {
  id: string
  title: string
  completed: boolean
  estimatedMinutes: number
}

// 用户信息
export interface User {
  id: string
  name: string
  email: string
  age: number
  avatar?: string
  level: number            // 用户等级
  totalXp: number         // 总经验值
  dailyLearningHours: number // 每日学习时间配置
  lifeTimeLeft: number    // 剩余寿命(天)，基于100年计算
  preferences: UserPreferences
  achievements: Achievement[]
}

export interface UserPreferences {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  difficultyPreference: 'easy' | 'medium' | 'hard'
  notificationEnabled: boolean
  themes: 'light' | 'dark' | 'auto'
}

// 成就系统
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  type: 'skill' | 'learning' | 'social' | 'streak' | 'creation' | 'milestone'
  condition: string        // 解锁条件（人类可读）
  progressType?: 'completedTasks' | 'masteredSkills' | 'notes' | 'joinedCircles' | 'totalXp' | 'level' | 'currentStreak' | 'totalLikes' | 'aiAdoptions' | 'customSkills'
  progressTarget?: number  // 解锁所需数值（配合 progressType 显示进度条）
  unlockedAt?: Date
  xpReward: number
}

// 圈子接口
export interface Circle {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  memberCount: number
  skillTags: string[]      // 相关技能标签
  resources?: LearningResource[] // 该技能方向的资源库（课程/文章/视频）
  posts: Post[]
  isPrivate: boolean
  createdAt: Date
}

export interface Post {
  id: string
  authorId: string
  authorName: string
  authorAvatar?: string
  content: string
  images?: string[]
  skillTags: string[]      // 关联的技能标签
  taskId?: string          // 关联的任务ID
  likes: number
  comments: Comment[]
  createdAt: Date
}

export interface Comment {
  id: string
  authorId: string
  authorName: string
  content: string
  likes: number
  createdAt: Date
}

// 笔记接口 (类似flomo)
export interface Note {
  id: string
  content: string
  skillTags: string[]      // 关联的技能标签
  taskId?: string          // 关联的任务ID
  images?: string[]
  mood?: 'excited' | 'happy' | 'neutral' | 'frustrated' | 'confused'
  visibility: 'private' | 'circle' | 'public'
  createdAt: Date
  updatedAt: Date
}

// AI推荐接口
export interface AIRecommendation {
  type: 'skill' | 'task' | 'circle' | 'note'
  targetId: string
  title: string
  reason: string
  confidence: number       // 推荐置信度 (0-1)
  priority: number         // 优先级 (1-10)
  estimatedBenefit: string // 预估收益
}

// 游戏化元素
export interface GameStats {
  currentStreak: number    // 当前连续学习天数
  longestStreak: number    // 最长连续学习天数
  totalSkillsUnlocked: number
  totalTasksCompleted: number
  totalNotesCreated: number
  favoriteSkillCategories: string[]
  weeklyProgress: DailyProgress[]
}

export interface DailyProgress {
  date: Date
  learningMinutes: number
  tasksCompleted: number
  skillsProgressed: number
  notesCreated: number
  xpGained: number
}
