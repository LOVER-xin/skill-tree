import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  User,
  SkillNode,
  SkillTreeTemplate,
  Task,
  Circle,
  Note,
  Achievement,
  GameStats,
  SkillStatus,
} from '../types'
import {
  seedTrees,
  seedTasks,
  seedCircles,
  seedNotes,
  seedAchievements,
  seedUser,
  seedGameStats,
  seedActivities,
  ActivityItem,
} from '../data/seed'
import { generateId } from '../utils'

/** 等级公式：每 500 XP 升一级 */
export const getLevel = (totalXp: number) => Math.floor(totalXp / 500) + 1

/** 子任务完成奖励 XP */
export const SUBTASK_XP = 15
/** 任务完成奖励 XP（按优先级） */
export const TASK_XP: Record<string, number> = { low: 30, medium: 50, high: 80 }
/** 技能掌握奖励 XP */
export const SKILL_XP = 100

interface AppState {
  // 用户
  user: User
  updateUser: (updates: Partial<User>) => void

  // 技能树
  trees: SkillTreeTemplate[]
  activeTreeId: string
  setActiveTree: (treeId: string) => void
  updateSkill: (treeId: string, skillId: string, updates: Partial<SkillNode>) => void
  startSkill: (skillId: string) => void
  completeSkill: (skillId: string) => void
  addSkill: (treeId: string, skill: Omit<SkillNode, 'id' | 'children' | 'status' | 'xp'> & { xp?: number }) => void
  deleteSkill: (treeId: string, skillId: string) => void
  resetTree: (treeId: string) => void

  // 任务
  tasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'status' | 'subtasks' | 'aiGenerated'> & { subtasks?: Task['subtasks'] }) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  deleteTask: (taskId: string) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  setTaskStatus: (taskId: string, status: Task['status']) => void

  // 圈子
  circles: Circle[]
  joinedCircleIds: string[]
  joinCircle: (circleId: string) => void
  leaveCircle: (circleId: string) => void

  // 笔记
  notes: Note[]
  noteLikes: Record<string, number>
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateNote: (noteId: string, updates: Partial<Note>) => void
  deleteNote: (noteId: string) => void
  toggleLikeNote: (noteId: string) => void

  // 成就
  achievements: Achievement[]
  gameStats: GameStats

  // 活动
  activities: ActivityItem[]

  // 内部：加 XP + 成就检查
  addXp: (amount: number, reason?: string) => void
  checkAchievements: () => void
  recordActivity: (text: string, type: ActivityItem['type']) => void
  bumpDailyProgress: (patch: Partial<GameStats['weeklyProgress'][number]>) => void
}

/** 序列化：Date → ISO 字符串；反序列化：ISO 字符串 → Date */
const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
const dateReviver = (_key: string, value: unknown) => {
  if (typeof value === 'string' && isoDatePattern.test(value)) return new Date(value)
  return value
}

/** 根据前置技能状态同步整棵树的解锁状态：前置全部完成 → LOCKED 变为 AVAILABLE */
function syncTreeStatuses(tree: SkillTreeTemplate): SkillTreeTemplate {
  const statusMap = new Map(tree.skills.map((s) => [s.id, s.status]))
  const updated = tree.skills.map((skill) => {
    if (skill.status !== SkillStatus.LOCKED) return skill
    const prereqsDone = skill.prerequisites.every((p) => statusMap.get(p) === SkillStatus.COMPLETED)
    if (prereqsDone) {
      return { ...skill, status: SkillStatus.AVAILABLE }
    }
    return skill
  })
  return { ...tree, skills: updated }
}

/** 为新增技能寻找画布上的空位 */
function findFreePosition(skills: SkillNode[]): { x: number; y: number } {
  const taken = skills.map((s) => `${Math.round(s.position.x / 100)}-${Math.round(s.position.y / 100)}`)
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      const x = 100 + col * 110
      const y = 90 + row * 80
      if (!taken.includes(`${col}-${row}`)) return { x, y }
    }
  }
  return { x: 400, y: 300 }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: seedUser,
      updateUser: (updates) =>
        set((state) => ({
          user: { ...state.user, ...updates },
          activities: [
            { id: generateId(), text: '更新了个人资料', type: 'note' as const, time: new Date() },
            ...state.activities,
          ].slice(0, 30),
        })),

      trees: seedTrees,
      activeTreeId: seedTrees[0].id,
      setActiveTree: (treeId) => set({ activeTreeId: treeId }),

      updateSkill: (treeId, skillId, updates) =>
        set((state) => ({
          trees: state.trees.map((tree) =>
            tree.id !== treeId
              ? tree
              : syncTreeStatuses({
                  ...tree,
                  skills: tree.skills.map((s) => (s.id === skillId ? { ...s, ...updates } : s)),
                })
          ),
        })),

      startSkill: (skillId) => {
        const { trees, activeTreeId } = get()
        const tree = trees.find((t) => t.id === activeTreeId)
        const skill = tree?.skills.find((s) => s.id === skillId)
        if (!skill || skill.status === SkillStatus.LOCKED) return
        if (skill.status === SkillStatus.AVAILABLE) {
          get().updateSkill(activeTreeId, skillId, { status: SkillStatus.LEARNING })
          get().recordActivity(`开始了「${skill.name}」的学习`, 'skill')
        }
      },

      completeSkill: (skillId) => {
        const { trees, activeTreeId, user } = get()
        const tree = trees.find((t) => t.id === activeTreeId)
        const skill = tree?.skills.find((s) => s.id === skillId)
        if (!skill || skill.status === SkillStatus.COMPLETED) return
        get().updateSkill(activeTreeId, skillId, { status: SkillStatus.COMPLETED, xp: skill.maxXp })
        get().addXp(SKILL_XP, `掌握技能「${skill.name}」`)
        get().recordActivity(`掌握了「${skill.name}」技能`, 'skill')
        // 关联该技能的任务如果没有开始，标记为进行中
        const related = get().tasks.filter((t) => t.skillId === skillId && t.status === 'todo')
        related.forEach((t) => get().updateTask(t.id, { status: 'in-progress' }))
        if (user) void user
      },

      addSkill: (treeId, skill) => {
        const tree = get().trees.find((t) => t.id === treeId)
        if (!tree) return
        const newNode: SkillNode = {
          ...skill,
          id: generateId(),
          status: SkillStatus.AVAILABLE,
          xp: skill.xp ?? 0,
          children: [],
          position: skill.position ?? findFreePosition(tree.skills),
        }
        set((state) => ({
          trees: state.trees.map((t) =>
            t.id === treeId ? { ...t, skills: [...t.skills, newNode] } : t
          ),
        }))
        get().recordActivity(`在「${tree.name}」中添加了新技能「${skill.name}」`, 'skill')
      },

      deleteSkill: (treeId, skillId) =>
        set((state) => ({
          trees: state.trees.map((tree) => {
            if (tree.id !== treeId) return tree
            const skills = tree.skills
              .filter((s) => s.id !== skillId)
              .map((s) => ({
                ...s,
                prerequisites: s.prerequisites.filter((p) => p !== skillId),
                children: s.children.filter((c) => c !== skillId),
              }))
            return syncTreeStatuses({ ...tree, skills })
          }),
        })),

      resetTree: (treeId) => {
        const original = seedTrees.find((t) => t.id === treeId)
        if (!original) return
        set((state) => ({
          trees: state.trees.map((t) => (t.id === treeId ? { ...original, skills: original.skills.map((s) => ({ ...s })) } : t)),
        }))
      },

      tasks: seedTasks,
      addTask: (task) => {
        const newNode: Task = {
          ...task,
          id: generateId(),
          status: 'todo',
          subtasks: task.subtasks ?? [],
          aiGenerated: false,
          dueDate: task.dueDate ?? undefined,
        }
        set((state) => ({ tasks: [newNode, ...state.tasks] }))
        get().recordActivity(`创建了任务「${task.title}」`, 'task')
      },
      updateTask: (taskId, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
        })),
      deleteTask: (taskId) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId) })),

      toggleSubtask: (taskId, subtaskId) => {
        const task = get().tasks.find((t) => t.id === taskId)
        if (!task) return
        const subtasks = task.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        )
        const allDone = subtasks.length > 0 && subtasks.every((st) => st.completed)
        const wasCompleted = task.status === 'completed'
        const updates: Partial<Task> = { subtasks }
        if (allDone && !wasCompleted) {
          updates.status = 'completed'
          updates.actualMinutes = task.estimatedMinutes
          get().addXp(TASK_XP[task.priority] ?? 50, `完成任务「${task.title}」`)
          get().recordActivity(`完成了「${task.title}」任务`, 'task')
          get().bumpDailyProgress({ tasksCompleted: 1, xpGained: TASK_XP[task.priority] ?? 50 })
        } else if (!allDone && wasCompleted) {
          updates.status = 'in-progress'
        }
        get().updateTask(taskId, updates)
      },

      setTaskStatus: (taskId, status) => {
        const task = get().tasks.find((t) => t.id === taskId)
        if (!task) return
        const updates: Partial<Task> = { status }
        if (status === 'completed' && task.status !== 'completed') {
          updates.subtasks = task.subtasks.map((st) => ({ ...st, completed: true }))
          get().addXp(TASK_XP[task.priority] ?? 50, `完成任务「${task.title}」`)
          get().recordActivity(`完成了「${task.title}」任务`, 'task')
        }
        get().updateTask(taskId, updates)
      },

      circles: seedCircles,
      joinedCircleIds: ['circle-frontend', 'circle-ai'],
      joinCircle: (circleId) => {
        if (get().joinedCircleIds.includes(circleId)) return
        set((state) => ({
          joinedCircleIds: [...state.joinedCircleIds, circleId],
          circles: state.circles.map((c) =>
            c.id === circleId ? { ...c, memberCount: c.memberCount + 1 } : c
          ),
        }))
        const circle = get().circles.find((c) => c.id === circleId)
        if (circle) get().recordActivity(`加入了「${circle.name}」圈子`, 'circle')
      },
      leaveCircle: (circleId) => {
        set((state) => ({
          joinedCircleIds: state.joinedCircleIds.filter((id) => id !== circleId),
          circles: state.circles.map((c) =>
            c.id === circleId ? { ...c, memberCount: Math.max(0, c.memberCount - 1) } : c
          ),
        }))
      },

      notes: seedNotes,
      noteLikes: { 'note-react-hooks': 12, 'note-ts-inference': 8, 'note-css-layout': 3, 'note-js-eventloop': 5 },
      addNote: (note) => {
        const now = new Date()
        const newNode: Note = { ...note, id: generateId(), createdAt: now, updatedAt: now }
        set((state) => ({ notes: [newNode, ...state.notes] }))
        get().recordActivity('发布了新的学习笔记', 'note')
        get().bumpDailyProgress({ notesCreated: 1 })
      },
      updateNote: (noteId, updates) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === noteId ? { ...n, ...updates, updatedAt: new Date() } : n
          ),
        })),
      deleteNote: (noteId) =>
        set((state) => ({ notes: state.notes.filter((n) => n.id !== noteId) })),
      toggleLikeNote: (noteId) =>
        set((state) => ({
          noteLikes: {
            ...state.noteLikes,
            [noteId]: (state.noteLikes[noteId] ?? 0) + (state.noteLikes[noteId] ? -1 : 1),
          },
        })),

      achievements: seedAchievements,
      gameStats: seedGameStats,

      activities: seedActivities,

      addXp: (amount, reason) => {
        const { user, achievements } = get()
        const totalXp = user.totalXp + amount
        const oldLevel = getLevel(user.totalXp)
        const newLevel = getLevel(totalXp)
        set({
          user: { ...user, totalXp, level: newLevel },
        })
        if (newLevel > oldLevel) {
          get().recordActivity(`升级啦！达到 Lv.${newLevel}`, 'achievement')
        }
        if (reason) void reason
        if (achievements) void achievements
        get().checkAchievements()
      },

      checkAchievements: () => {
        const { achievements, user, tasks, trees, notes, joinedCircleIds, gameStats } = get()
        const completedTasks = tasks.filter((t) => t.status === 'completed').length
        const masteredSkills = trees.flatMap((t) => t.skills).filter((s) => s.status === SkillStatus.COMPLETED).length
        const frontendMastered = trees
          .find((t) => t.id === 'tree-frontend')
          ?.skills.some((s) => s.status === SkillStatus.COMPLETED)
        const backendMastered = trees
          .find((t) => t.id === 'tree-backend')
          ?.skills.some((s) => s.status === SkillStatus.COMPLETED)

        const shouldUnlock: Record<string, boolean> = {
          'ach-first-task': completedTasks >= 1,
          'ach-task-master': completedTasks >= 10,
          'ach-skill-master': masteredSkills >= 5,
          'ach-streak': gameStats.currentStreak >= 3,
          'ach-note-writer': notes.length >= 5,
          'ach-social': joinedCircleIds.length >= 3,
          'ach-xp-1000': user.totalXp >= 1000,
          'ach-fullstack': !!(frontendMastered && backendMastered),
        }

        let changed = false
        const updated = achievements.map((a) => {
          if (!a.unlockedAt && shouldUnlock[a.id]) {
            changed = true
            get().recordActivity(`解锁了成就「${a.name}」`, 'achievement')
            return { ...a, unlockedAt: new Date() }
          }
          return a
        })
        if (changed) set({ achievements: updated })
      },

      recordActivity: (text, type) =>
        set((state) => ({
          activities: [{ id: generateId(), text, type, time: new Date() }, ...state.activities].slice(0, 30),
        })),

      bumpDailyProgress: (patch) =>
        set((state) => {
          const weekly = [...state.gameStats.weeklyProgress]
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const idx = weekly.findIndex((d) => {
            const date = new Date(d.date)
            date.setHours(0, 0, 0, 0)
            return date.getTime() === today.getTime()
          })
          if (idx === -1) return { gameStats: state.gameStats }
          weekly[idx] = { ...weekly[idx], ...patch }
          return {
            gameStats: {
              ...state.gameStats,
              weeklyProgress: weekly,
              totalTasksCompleted:
                state.gameStats.totalTasksCompleted + (patch.tasksCompleted ?? 0),
              totalNotesCreated:
                state.gameStats.totalNotesCreated + (patch.notesCreated ?? 0),
            },
          }
        }),
    }),
    {
      name: 'ai-skill-tree-data',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const raw = localStorage.getItem(name)
          if (!raw) return null
          return JSON.parse(raw, dateReviver)
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => localStorage.removeItem(name),
      })),
      version: 1,
    }
  )
)

/** 便捷选择器：当前激活的技能树 */
export const useActiveTree = () => {
  const trees = useAppStore((s) => s.trees)
  const activeTreeId = useAppStore((s) => s.activeTreeId)
  return trees.find((t) => t.id === activeTreeId) ?? trees[0]
}

/** 便捷选择器：全部技能节点（所有树） */
export const useAllSkills = () => {
  const trees = useAppStore((s) => s.trees)
  return trees.flatMap((t) => t.skills)
}
