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
/** 任务完成时推进关联技能 XP 的比例 */
export const TASK_TO_SKILL_XP_RATIO = 0.2

/** 需要参与撤销/重做的数据快照 */
interface Snapshot {
  user: User
  trees: SkillTreeTemplate[]
  activeTreeId: string
  tasks: Task[]
  circles: Circle[]
  joinedCircleIds: string[]
  notes: Note[]
  noteLikes: Record<string, number>
  achievements: Achievement[]
  gameStats: GameStats
  aiAdoptions: number // 采纳 AI 推荐次数（技能/任务/圈子）
  customSkills: number // 自定义创建技能数
}

interface AppState extends Snapshot {
  // 用户
  updateUser: (updates: Partial<User>) => void

  // 技能树
  setActiveTree: (treeId: string) => void
  updateSkill: (treeId: string, skillId: string, updates: Partial<SkillNode>) => void
  startSkill: (skillId: string) => void
  completeSkill: (skillId: string) => void
  addSkill: (treeId: string, skill: Omit<SkillNode, 'id' | 'children' | 'status' | 'xp'> & { xp?: number; custom?: boolean }) => void
  deleteSkill: (treeId: string, skillId: string) => void
  resetTree: (treeId: string) => void
  addTree: (input: { name: string; description?: string; category?: string }) => string
  deleteTree: (treeId: string) => void
  applyLayout: (treeId: string, positions: Record<string, { x: number; y: number }>) => void

  // 任务
  addTask: (task: Omit<Task, 'id' | 'status' | 'subtasks' | 'aiGenerated'> & { subtasks?: Task['subtasks'] }) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  deleteTask: (taskId: string) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  setTaskStatus: (taskId: string, status: Task['status']) => void

  // 圈子
  joinCircle: (circleId: string) => void
  leaveCircle: (circleId: string) => void
  addCircle: (circle: Omit<Circle, 'id' | 'posts' | 'isPrivate' | 'createdAt' | 'memberCount'> & { memberCount?: number }) => string

  // 笔记
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateNote: (noteId: string, updates: Partial<Note>) => void
  deleteNote: (noteId: string) => void
  toggleLikeNote: (noteId: string) => void

  // 成就
  achievements: Achievement[]
  gameStats: GameStats
  aiAdoptions: number
  customSkills: number

  // 活动
  activities: ActivityItem[]

  // 撤销/重做
  past: Snapshot[]
  future: Snapshot[]
  undo: () => void
  redo: () => void

  // 内部
  addXp: (amount: number, reason?: string) => void
  progressSkillXp: (skillId: string, delta?: number) => void
  recordAIAdoption: (kind: 'skill' | 'task' | 'circle') => void
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
    (set, get) => {
      /** 取当前可撤销快照 */
      const snapshot = (): Snapshot => {
        const s = get()
        return {
          user: s.user,
          trees: s.trees,
          activeTreeId: s.activeTreeId,
          tasks: s.tasks,
          circles: s.circles,
          joinedCircleIds: s.joinedCircleIds,
          notes: s.notes,
          noteLikes: s.noteLikes,
          achievements: s.achievements,
          gameStats: s.gameStats,
          aiAdoptions: s.aiAdoptions,
          customSkills: s.customSkills,
        }
      }

      /** 在变更前压入历史栈（最多 50 步） */
      const pushHistory = () => {
        const s = get()
        set({
          past: [...s.past.slice(-49), snapshot()],
          future: [],
        })
      }

      return {
        user: seedUser,
        updateUser: (updates) => {
          pushHistory()
          set((state) => ({
            user: { ...state.user, ...updates },
            activities: [
              { id: generateId(), text: '更新了个人资料', type: 'note' as const, time: new Date() },
              ...state.activities,
            ].slice(0, 30),
          }))
        },

        trees: seedTrees,
        activeTreeId: seedTrees[0].id,
        setActiveTree: (treeId) => set({ activeTreeId: treeId }),

        updateSkill: (treeId, skillId, updates) => {
          pushHistory()
          set((state) => ({
            trees: state.trees.map((tree) =>
              tree.id !== treeId
                ? tree
                : syncTreeStatuses({
                    ...tree,
                    skills: tree.skills.map((s) => (s.id === skillId ? { ...s, ...updates } : s)),
                  })
            ),
          }))
        },

        startSkill: (skillId) => {
          const { trees } = get()
          // 全树查找（跨树技能也能开始学习）
          for (const tree of trees) {
            const skill = tree.skills.find((s) => s.id === skillId)
            if (!skill || skill.status === SkillStatus.LOCKED) continue
            if (skill.status === SkillStatus.AVAILABLE) {
              get().updateSkill(tree.id, skillId, { status: SkillStatus.LEARNING })
              get().recordActivity(`开始了「${skill.name}」的学习`, 'skill')
            }
            return
          }
        },

        completeSkill: (skillId) => {
          const { trees } = get()
          for (const tree of trees) {
            const skill = tree.skills.find((s) => s.id === skillId)
            if (!skill || skill.status === SkillStatus.COMPLETED) continue
            get().updateSkill(tree.id, skillId, { status: SkillStatus.COMPLETED, xp: skill.maxXp })
            get().addXp(SKILL_XP, `掌握技能「${skill.name}」`)
            get().recordActivity(`掌握了「${skill.name}」技能`, 'skill')
            // 关联该技能的任务如果没有开始，标记为进行中
            const related = get().tasks.filter((t) => t.skillId === skillId && t.status === 'todo')
            related.forEach((t) => get().updateTask(t.id, { status: 'in-progress' }))
            return
          }
        },

        addSkill: (treeId, skill) => {
          const tree = get().trees.find((t) => t.id === treeId)
          if (!tree) return
          pushHistory()
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
            ...(skill.custom
              ? { customSkills: state.customSkills + 1 }
              : {}),
          }))
          get().recordActivity(`在「${tree.name}」中添加了新技能「${skill.name}」`, 'skill')
          get().checkAchievements()
        },

        deleteSkill: (treeId, skillId) => {
          pushHistory()
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
          }))
        },

        resetTree: (treeId) => {
          const original = seedTrees.find((t) => t.id === treeId)
          if (!original) return
          pushHistory()
          set((state) => ({
            trees: state.trees.map((t) =>
              t.id === treeId ? { ...original, skills: original.skills.map((s) => ({ ...s })) } : t
            ),
          }))
        },

        addTree: (input) => {
          pushHistory()
          const id = `tree-${generateId()}`
          const newTree: SkillTreeTemplate = {
            id,
            name: input.name.trim(),
            description: input.description?.trim() || '自定义技能树',
            category: input.category?.trim() || '自定义',
            difficulty: 'beginner',
            estimatedDuration: 0,
            tags: [input.category?.trim() || '自定义'],
            skills: [],
          }
          set((state) => ({
            trees: [...state.trees, newTree],
            activeTreeId: id,
          }))
          get().recordActivity(`创建了技能树「${newTree.name}」`, 'skill')
          return id
        },

        deleteTree: (treeId) => {
          const { trees, activeTreeId } = get()
          if (trees.length <= 1) {
            get().recordActivity('无法删除最后一棵技能树', 'skill')
            return
          }
          const tree = trees.find((t) => t.id === treeId)
          pushHistory()
          const remaining = trees.filter((t) => t.id !== treeId)
          set({
            trees: remaining,
            activeTreeId: activeTreeId === treeId ? remaining[0].id : activeTreeId,
          })
          if (tree) get().recordActivity(`删除了技能树「${tree.name}」`, 'skill')
        },

        applyLayout: (treeId, positions) => {
          const tree = get().trees.find((t) => t.id === treeId)
          if (!tree) return
          pushHistory()
          set((state) => ({
            trees: state.trees.map((t) =>
              t.id !== treeId
                ? t
                : {
                    ...t,
                    skills: t.skills.map((s) =>
                      positions[s.id] ? { ...s, position: positions[s.id] } : s
                    ),
                  }
            ),
          }))
          get().recordActivity(`重新布局了技能树「${tree.name}」`, 'skill')
        },

        tasks: seedTasks,
        addTask: (task) => {
          pushHistory()
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
        deleteTask: (taskId) => {
          pushHistory()
          set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId) }))
        },

        toggleSubtask: (taskId, subtaskId) => {
          pushHistory()
          const task = get().tasks.find((t) => t.id === taskId)
          if (!task) return
          const subtasks = task.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          )
          const allDone = subtasks.length > 0 && subtasks.every((st) => st.completed)
          const wasCompleted = task.status === 'completed'
          const taskXp = TASK_XP[task.priority] ?? 50
          const updates: Partial<Task> = { subtasks }
          if (allDone && !wasCompleted) {
            // 完成结算
            updates.status = 'completed'
            updates.actualMinutes = task.estimatedMinutes
            get().addXp(taskXp, `完成任务「${task.title}」`)
            get().recordActivity(`完成了「${task.title}」任务`, 'task')
            get().bumpDailyProgress({ tasksCompleted: 1, xpGained: taskXp })
            // 数据闭环：任务完成 → 推进关联技能 XP
            if (task.skillId) get().progressSkillXp(task.skillId, 1)
          } else if (!allDone && wasCompleted) {
            // 对称回退：取消完成时扣回 XP 与统计（防重复刷取）
            updates.status = 'in-progress'
            get().addXp(-taskXp)
            get().bumpDailyProgress({ tasksCompleted: -1, xpGained: -taskXp })
            if (task.skillId) get().progressSkillXp(task.skillId, -1)
          }
          get().updateTask(taskId, updates)
        },

        setTaskStatus: (taskId, status) => {
          pushHistory()
          const task = get().tasks.find((t) => t.id === taskId)
          if (!task) return
          const wasCompleted = task.status === 'completed'
          const taskXp = TASK_XP[task.priority] ?? 50
          const updates: Partial<Task> = { status }
          if (status === 'completed' && !wasCompleted) {
            updates.subtasks = task.subtasks.map((st) => ({ ...st, completed: true }))
            get().addXp(taskXp, `完成任务「${task.title}」`)
            get().recordActivity(`完成了「${task.title}」任务`, 'task')
            get().bumpDailyProgress({ tasksCompleted: 1, xpGained: taskXp })
            if (task.skillId) get().progressSkillXp(task.skillId, 1)
          } else if (status !== 'completed' && wasCompleted) {
            // 对称回退（与 toggleSubtask 口径一致）
            get().addXp(-taskXp)
            get().bumpDailyProgress({ tasksCompleted: -1, xpGained: -taskXp })
            if (task.skillId) get().progressSkillXp(task.skillId, -1)
          }
          get().updateTask(taskId, updates)
        },

        circles: seedCircles,
        joinedCircleIds: ['circle-frontend', 'circle-ai'],
        joinCircle: (circleId) => {
          if (get().joinedCircleIds.includes(circleId)) return
          pushHistory()
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
          pushHistory()
          set((state) => ({
            joinedCircleIds: state.joinedCircleIds.filter((id) => id !== circleId),
            circles: state.circles.map((c) =>
              c.id === circleId ? { ...c, memberCount: Math.max(0, c.memberCount - 1) } : c
            ),
          }))
        },
        addCircle: (circle) => {
          pushHistory()
          const id = `circle-${generateId()}`
          const newNode: Circle = {
            ...circle,
            id,
            memberCount: circle.memberCount ?? 1,
            posts: [],
            isPrivate: false,
            createdAt: new Date(),
          }
          set((state) => ({
            circles: [...state.circles, newNode],
            joinedCircleIds: [...state.joinedCircleIds, id],
          }))
          get().recordActivity(`创建并加入了圈子「${newNode.name}」`, 'circle')
          return id
        },

        notes: seedNotes,
        noteLikes: { 'note-react-hooks': 12, 'note-ts-inference': 8, 'note-css-layout': 3, 'note-js-eventloop': 5 },
        addNote: (note) => {
          pushHistory()
          const now = new Date()
          const newNode: Note = { ...note, id: generateId(), createdAt: now, updatedAt: now }
          set((state) => ({ notes: [newNode, ...state.notes] }))
          get().recordActivity('发布了新的学习笔记', 'note')
          get().bumpDailyProgress({ notesCreated: 1 })
        },
        updateNote: (noteId, updates) => {
          pushHistory()
          set((state) => ({
            notes: state.notes.map((n) =>
              n.id === noteId ? { ...n, ...updates, updatedAt: new Date() } : n
            ),
          }))
        },
        deleteNote: (noteId) => {
          pushHistory()
          set((state) => ({ notes: state.notes.filter((n) => n.id !== noteId) }))
        },
        toggleLikeNote: (noteId) =>
          set((state) => ({
            noteLikes: {
              ...state.noteLikes,
              [noteId]: (state.noteLikes[noteId] ?? 0) + (state.noteLikes[noteId] ? -1 : 1),
            },
          })),

        achievements: seedAchievements,
        gameStats: seedGameStats,
        aiAdoptions: 0,
        customSkills: 0,

        activities: seedActivities,

        past: [],
        future: [],

        undo: () => {
          const { past, future } = get()
          if (past.length === 0) return
          const prev = past[past.length - 1]
          set({
            ...prev,
            past: past.slice(0, -1),
            future: [snapshot(), ...future].slice(0, 50),
          })
        },

        redo: () => {
          const { past, future } = get()
          if (future.length === 0) return
          const next = future[0]
          set({
            ...next,
            past: [...past, snapshot()].slice(-50),
            future: future.slice(1),
          })
        },

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

        /** 任务完成 → 关联技能 XP 推进（全树查找，跨树任务关联修复）；delta 支持回退 */
        progressSkillXp: (skillId: string, delta = 1) => {
          const { trees } = get()
          for (const tree of trees) {
            const skill = tree.skills.find((s) => s.id === skillId)
            if (!skill || skill.status === SkillStatus.COMPLETED) continue
            const gained = Math.round(skill.maxXp * TASK_TO_SKILL_XP_RATIO) * delta
            const newXp = Math.max(0, Math.min(skill.maxXp, skill.xp + gained))
            get().updateSkill(tree.id, skillId, { xp: newXp })
            if (delta > 0) get().bumpDailyProgress({ skillsProgressed: 1 })
            else get().bumpDailyProgress({ skillsProgressed: -1 })
            return
          }
        },

        recordAIAdoption: (kind: 'skill' | 'task' | 'circle') => {
          pushHistory()
          set((state) => ({ aiAdoptions: state.aiAdoptions + 1 }))
          get().recordActivity(`采纳了 AI 推荐的${kind === 'skill' ? '技能' : kind === 'task' ? '任务' : '圈子'}`, 'achievement')
          get().checkAchievements()
        },

        checkAchievements: () => {
          const { achievements, user, tasks, trees, notes, joinedCircleIds, gameStats, aiAdoptions, customSkills } = get()
          const completedTasks = tasks.filter((t) => t.status === 'completed').length
          const masteredSkills = trees.flatMap((t) => t.skills).filter((s) => s.status === SkillStatus.COMPLETED).length
          const frontendMastered = trees
            .find((t) => t.id === 'tree-frontend')
            ?.skills.some((s) => s.status === SkillStatus.COMPLETED)
          const backendMastered = trees
            .find((t) => t.id === 'tree-backend')
            ?.skills.some((s) => s.status === SkillStatus.COMPLETED)
          const totalLikes = Object.values(get().noteLikes).reduce((a, b) => a + b, 0)

          const shouldUnlock: Record<string, boolean> = {
            'ach-first-task': completedTasks >= 1,
            'ach-task-master': completedTasks >= 10,
            'ach-task-legend': completedTasks >= 30,
            'ach-skill-master': masteredSkills >= 5,
            'ach-skill-10': masteredSkills >= 10,
            'ach-fullstack': !!(frontendMastered && backendMastered),
            'ach-streak': gameStats.currentStreak >= 3,
            'ach-streak-7': gameStats.currentStreak >= 7,
            'ach-note-writer': notes.length >= 5,
            'ach-note-20': notes.length >= 20,
            'ach-social': joinedCircleIds.length >= 3,
            'ach-social-5': joinedCircleIds.length >= 5,
            'ach-xp-1000': user.totalXp >= 1000,
            'ach-xp-5000': user.totalXp >= 5000,
            'ach-lv5': getLevel(user.totalXp) >= 5,
            'ach-like-50': totalLikes >= 50,
            'ach-ai-first': aiAdoptions >= 1,
            'ach-custom-skill': customSkills >= 1,
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

            // H2 修复：当天不在 weeklyProgress 时插入新条目并裁剪到 7 天（跨天统计不停摆）
            const idx = weekly.findIndex((d) => {
              const date = new Date(d.date)
              date.setHours(0, 0, 0, 0)
              return date.getTime() === today.getTime()
            })
            let nextWeekly = weekly
            if (idx === -1) {
              nextWeekly = [
                {
                  date: today,
                  learningMinutes: 0,
                  tasksCompleted: 0,
                  skillsProgressed: 0,
                  notesCreated: 0,
                  xpGained: 0,
                },
                ...weekly,
              ].slice(0, 7)
              nextWeekly[0] = { ...nextWeekly[0], ...patch }
            } else {
              nextWeekly = weekly.map((d, i) => (i === idx ? { ...d, ...patch } : d))
            }

            // H1 修复：连续学习天数 —— 今天首次学习活动时更新（昨天活跃 +1，断档归 1）
            const todayEntry = idx !== -1 ? weekly[idx] : null
            const alreadyActiveToday = todayEntry
              ? todayEntry.learningMinutes > 0 ||
                todayEntry.tasksCompleted > 0 ||
                todayEntry.skillsProgressed > 0 ||
                todayEntry.notesCreated > 0 ||
                todayEntry.xpGained > 0
              : false
            const hasNewActivity =
              (patch.tasksCompleted ?? 0) !== 0 ||
              (patch.notesCreated ?? 0) !== 0 ||
              (patch.skillsProgressed ?? 0) !== 0 ||
              (patch.xpGained ?? 0) !== 0
            let currentStreak = state.gameStats.currentStreak
            if (hasNewActivity && !alreadyActiveToday) {
              const yesterday = new Date(Date.now() - 86400000)
              yesterday.setHours(0, 0, 0, 0)
              const yIdx = nextWeekly.findIndex((d) => {
                const date = new Date(d.date)
                date.setHours(0, 0, 0, 0)
                return date.getTime() === yesterday.getTime()
              })
              const yesterdayActive =
                yIdx !== -1 &&
                (nextWeekly[yIdx].learningMinutes > 0 ||
                  nextWeekly[yIdx].tasksCompleted > 0 ||
                  nextWeekly[yIdx].notesCreated > 0 ||
                  nextWeekly[yIdx].xpGained > 0)
              currentStreak = yesterdayActive ? currentStreak + 1 : 1
            }

            return {
              gameStats: {
                ...state.gameStats,
                weeklyProgress: nextWeekly,
                currentStreak,
                longestStreak: Math.max(state.gameStats.longestStreak, currentStreak),
                totalTasksCompleted: Math.max(
                  0,
                  state.gameStats.totalTasksCompleted + (patch.tasksCompleted ?? 0)
                ),
                totalNotesCreated: Math.max(
                  0,
                  state.gameStats.totalNotesCreated + (patch.notesCreated ?? 0)
                ),
              },
            }
          }),
      }
    },
    {
      name: 'ai-skill-tree-data',
      // createJSONStorage 负责 JSON 序列化；reviver 把 ISO 日期字符串还原为 Date
      storage: createJSONStorage(() => localStorage, {
        reviver: dateReviver,
      }),
      version: 2,
      // 撤销历史不持久化（刷新后清空，避免占用存储）
      partialize: (state) => {
        const { past, future, ...rest } = state
        void past
        void future
        return rest
      },
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
