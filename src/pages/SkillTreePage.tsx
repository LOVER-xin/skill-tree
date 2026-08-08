import { useState } from 'react'
import {
  TreePine,
  Lock,
  CheckCircle,
  PlayCircle,
  Star,
  Plus,
  Sparkles,
  Trash2,
  X,
  RotateCcw,
  Undo2,
  Redo2,
  Pencil,
  GitBranch,
  FolderPlus,
  FolderMinus,
  Bot,
  LayoutGrid,
  AlertTriangle,
  ScanSearch,
  GraduationCap,
} from 'lucide-react'
import { SkillStatus, SkillLevel, SkillNode } from '../types'
import { useAppStore, useActiveTree } from '../store'
import { recommendSkills, SkillRecommendation } from '../utils/recommend'
import { getSkillLevelFromXp } from '../utils'
import {
  aiRecommendSkills,
  aiGenerateSkillBranches,
  aiGenerateTeachSteps,
  aiAuditTree,
  hasAIConfig,
  AIError,
  AISkillSuggestion,
  AITreeIssue,
  AITeachStepSuggestion,
} from '../utils/ai'
import { computeTreeLayout, computeDepths, findSkillPosition, NODE_W } from '../utils/layout'
import { TeachStep, TeachStepType } from '../types'

type RecommendSource = 'local' | 'ai'

interface SkillForm {
  name: string
  description: string
  category: string
  estimatedHours: number
  prerequisites: string[]
}

const emptyForm: SkillForm = { name: '', description: '', category: '', estimatedHours: 20, prerequisites: [] }

export function SkillTreePage() {
  const tree = useActiveTree()
  const trees = useAppStore((s) => s.trees)
  const activeTreeId = useAppStore((s) => s.activeTreeId)
  const setActiveTree = useAppStore((s) => s.setActiveTree)
  const updateSkill = useAppStore((s) => s.updateSkill)
  const startSkill = useAppStore((s) => s.startSkill)
  const completeSkill = useAppStore((s) => s.completeSkill)
  const addSkill = useAppStore((s) => s.addSkill)
  const deleteSkill = useAppStore((s) => s.deleteSkill)
  const resetTree = useAppStore((s) => s.resetTree)
  const addTree = useAppStore((s) => s.addTree)
  const deleteTree = useAppStore((s) => s.deleteTree)
  const applyLayout = useAppStore((s) => s.applyLayout)
  const recordActivity = useAppStore((s) => s.recordActivity)
  const recordAIAdoption = useAppStore((s) => s.recordAIAdoption)
  const undo = useAppStore((s) => s.undo)
  const redo = useAppStore((s) => s.redo)
  const canUndo = useAppStore((s) => s.past.length > 0)
  const canRedo = useAppStore((s) => s.future.length > 0)
  const user = useAppStore((s) => s.user)

  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSkill, setEditingSkill] = useState<SkillNode | null>(null)
  const [showRecommendModal, setShowRecommendModal] = useState(false)
  const [recommendSource, setRecommendSource] = useState<RecommendSource>('local')
  const [showBranchModal, setShowBranchModal] = useState(false)
  const [showNewTreeModal, setShowNewTreeModal] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showDeleteTreeConfirm, setShowDeleteTreeConfirm] = useState(false)

  // 表单
  const [form, setForm] = useState<SkillForm>(emptyForm)
  const [treeForm, setTreeForm] = useState({ name: '', description: '', category: '' })

  // AI 状态
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiSkills, setAiSkills] = useState<AISkillSuggestion[]>([])
  const [branchLoading, setBranchLoading] = useState(false)
  const [branchError, setBranchError] = useState<string | null>(null)
  const [branchSuggestions, setBranchSuggestions] = useState<AISkillSuggestion[]>([])
  const [branchChecked, setBranchChecked] = useState<Record<number, boolean>>({})
  // 拖拽状态
  const [draggingId, setDraggingId] = useState<string | null>(null)
  // AI 结构检查
  const [showAuditModal, setShowAuditModal] = useState(false)
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditError, setAuditError] = useState<string | null>(null)
  const [auditIssues, setAuditIssues] = useState<AITreeIssue[]>([])
  const [auditApplied, setAuditApplied] = useState<Record<number, boolean>>({})
  // 教学步骤状态
  const [teachLoading, setTeachLoading] = useState(false)
  const [teachError, setTeachError] = useState<string | null>(null)
  const [teachSuggestions, setTeachSuggestions] = useState<AITeachStepSuggestion[]>([])
  const [teachChecked, setTeachChecked] = useState<Record<number, boolean>>({})
  const [showAddStep, setShowAddStep] = useState(false)
  const [stepForm, setStepForm] = useState({
    title: '',
    description: '',
    type: 'practice' as TeachStepType,
    durationMinutes: 30,
  })
  // 测验状态（quiz 步骤答对才完成）
  const [quizStep, setQuizStep] = useState<TeachStep | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<number[]>([])
  const [quizResult, setQuizResult] = useState<{
    pass: boolean
    wrong: { question: string; explanation: string }[]
  } | null>(null)
  // 拖放层级感知：悬停位置 + 待确认的矛盾放置
  const [dragOverPos, setDragOverPos] = useState<{ x: number; y: number } | null>(null)
  const [pendingDrop, setPendingDrop] = useState<{
    id: string
    x: number
    y: number
    targetLayer: number
    conflicts: { name: string; layer: number }[]
  } | null>(null)

  const skills = tree?.skills ?? []
  const selectedSkill = skills.find((s) => s.id === selectedSkillId) ?? null
  const localRecommendations: SkillRecommendation[] = recommendSkills(skills, 4)

  // 画布尺寸：根据节点实际位置自适应（兼容人工布局与拖放）
  const canvasW = Math.max(820, ...skills.map((s) => s.position.x + NODE_W / 2 + 40))
  const canvasH = Math.max(600, ...skills.map((s) => s.position.y + 90))

  const GRID = 20 // 吸附粒度
  const LAYER_H = 140 // 层高（与布局引擎一致）

  /** y 坐标 → 所在层级（0 = 底部基础层） */
  const layerOf = (y: number) =>
    Math.max(0, Math.min(6, Math.floor((canvasH - y) / LAYER_H)))

  const layerName = (n: number) =>
    ['基础层', '进阶层', '应用层', '高级层', '专家层', '大师层', '殿堂层'][n] ?? `第${n}层`

  /** 层带的顶部 y（用于绘制引导线） */
  const layerTopY = (n: number) => canvasH - (n + 1) * LAYER_H

  /** 检查把技能放到目标层是否与前置递进关系矛盾（后继技能不能低于前置） */
  const findLayerConflicts = (
    id: string,
    targetLayer: number
  ): { name: string; layer: number }[] => {
    const depth = computeDepths(skills)
    const byId = new Map(skills.map((s) => [s.id, s]))
    const dependents = new Set<string>()
    const collect = (sid: string) => {
      skills.forEach((s) => {
        if (s.prerequisites.includes(sid) && !dependents.has(s.id)) {
          dependents.add(s.id)
          collect(s.id)
        }
      })
    }
    collect(id)
    const conflicts: { name: string; layer: number }[] = []
    dependents.forEach((did) => {
      const d = depth.get(did) ?? 0
      if (d <= targetLayer) {
        conflicts.push({ name: byId.get(did)?.name ?? did, layer: d })
      }
    })
    return conflicts
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    setDragOverPos({
      x: e.clientX - rect.left + el.scrollLeft,
      y: e.clientY - rect.top + el.scrollTop,
    })
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOverPos(null)
    if (!tree) return
    const id = e.dataTransfer.getData('text/plain')
    if (!id) return
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    // 关键修复：滚动偏移补偿（画布可滚动，否则松手位置错位）
    let x = e.clientX - rect.left + el.scrollLeft
    let y = e.clientY - rect.top + el.scrollTop
    // 网格吸附，松手即固定
    x = Math.round(x / GRID) * GRID
    y = Math.round(y / GRID) * GRID
    x = Math.max(NODE_W / 2, Math.min(canvasW - NODE_W / 2, x))
    y = Math.max(40, Math.min(canvasH - 40, y))

    const targetLayer = layerOf(y)
    const conflicts = findLayerConflicts(id, targetLayer)
    if (conflicts.length > 0) {
      // 层级矛盾：等待人工确认
      setPendingDrop({ id, x, y, targetLayer, conflicts })
      return
    }
    updateSkill(tree.id, id, { position: { x, y } })
    setDraggingId(null)
  }

  const confirmPendingDrop = () => {
    if (!tree || !pendingDrop) return
    updateSkill(tree.id, pendingDrop.id, {
      position: { x: pendingDrop.x, y: pendingDrop.y },
    })
    setPendingDrop(null)
    setDraggingId(null)
  }

  const handleAutoLayout = () => {
    if (!tree || tree.skills.length === 0) return
    const { positions } = computeTreeLayout(tree.skills)
    applyLayout(tree.id, Object.fromEntries(positions))
    recordActivity(`以金字塔结构重新布局了「${tree.name}」`, 'skill')
  }

  /* ============ AI 结构检查 ============ */

  const runAudit = async () => {
    setAuditError(null)
    setAuditIssues([])
    setAuditApplied({})
    if (!tree) return
    if (!hasAIConfig()) {
      setAuditError('尚未配置 AI 服务：请到「我的 → 设置」填写 API Key')
      return
    }
    if (tree.skills.length === 0) {
      setAuditError('技能树为空，先添加技能再检查')
      return
    }
    setAuditLoading(true)
    try {
      const result = await aiAuditTree(tree)
      setAuditIssues(result.issues)
    } catch (e) {
      setAuditError(e instanceof AIError ? e.message : (e as Error).message)
    } finally {
      setAuditLoading(false)
    }
  }

  /** 把技能移动到指定层级（找该层空位，防重叠） */
  const relocateSkill = (skillId: string, targetLayer: number) => {
    if (!tree) return
    const depth = computeDepths(skills)
    const layerNodes = skills.filter((s) => (depth.get(s.id) ?? 0) === targetLayer)
    const occupiedX = layerNodes.map((s) => s.position.x)
    let x = 100 + NODE_W / 2
    for (let i = 0; i < layerNodes.length + 2; i++) {
      const cx = 100 + NODE_W / 2 + i * (NODE_W + 48)
      if (!occupiedX.some((ox) => Math.abs(ox - cx) < NODE_W * 0.6)) {
        x = cx
        break
      }
    }
    const y = canvasH - 60 - (targetLayer + 1) * LAYER_H + LAYER_H / 2
    updateSkill(tree.id, skillId, { position: { x, y } })
  }

  const applyAuditIssue = (index: number) => {
    if (!tree) return
    const issue = auditIssues[index]
    if (!issue) return
    const byName = new Map(skills.map((s) => [s.name, s]))
    const skill = byName.get(issue.fix.skill) ?? byName.get(issue.skill)
    if (!skill) {
      setAuditError(`找不到技能「${issue.fix.skill || issue.skill}」，无法应用`)
      return
    }
    switch (issue.fix.kind) {
      case 'relocate':
        relocateSkill(skill.id, issue.fix.targetLayer ?? 0)
        recordActivity(`应用 AI 建议：将「${skill.name}」移至第 ${issue.fix.targetLayer ?? 0} 层`, 'skill')
        break
      case 'addPrerequisite': {
        const pre = byName.get(issue.fix.prerequisite ?? '')
        if (!pre) {
          setAuditError(`找不到前置技能「${issue.fix.prerequisite}」，无法添加`)
          return
        }
        if (!skill.prerequisites.includes(pre.id)) {
          updateSkill(tree.id, skill.id, { prerequisites: [...skill.prerequisites, pre.id] })
          recordActivity(`应用 AI 建议：为「${skill.name}」添加前置「${pre.name}」`, 'skill')
        }
        break
      }
      case 'removePrerequisite': {
        const pre = byName.get(issue.fix.prerequisite ?? '')
        if (pre) {
          updateSkill(tree.id, skill.id, {
            prerequisites: skill.prerequisites.filter((p) => p !== pre.id),
          })
          recordActivity(`应用 AI 建议：移除「${skill.name}」的前置「${pre.name}」`, 'skill')
        }
        break
      }
    }
    setAuditApplied({ ...auditApplied, [index]: true })
    setAuditIssues(auditIssues.filter((_, i) => i !== index))
  }

  /* ============ 教学步骤（深度学习路径） ============ */

  const STEP_TYPE_META: Record<TeachStepType, { label: string; color: string }> = {
    concept: { label: '概念', color: 'bg-blue-100 text-blue-700' },
    practice: { label: '实践', color: 'bg-green-100 text-green-700' },
    project: { label: '项目', color: 'bg-purple-100 text-purple-700' },
    quiz: { label: '测验', color: 'bg-yellow-100 text-yellow-700' },
  }

  /** 勾选/取消教学步骤：完成 +5 XP，取消回退；quiz 步骤需答题全部正确才可完成 */
  const toggleTeachStep = (stepId: string) => {
    if (!tree || !selectedSkill) return
    const step = selectedSkill.teachSteps?.find((s) => s.id === stepId)
    if (!step) return
    // quiz 步骤且有题目：先答题，全部答对才完成
    if (step.type === 'quiz' && step.quizQuestions && step.quizQuestions.length > 0 && !step.completed) {
      setQuizStep(step)
      setQuizAnswers(step.quizQuestions.map(() => -1))
      setQuizResult(null)
      return
    }
    const steps = (selectedSkill.teachSteps ?? []).map((s) =>
      s.id === stepId
        ? { ...s, completed: !s.completed, completedAt: !s.completed ? new Date() : undefined }
        : s
    )
    const wasCompleted = step.completed
    const xpDelta = wasCompleted ? -5 : 5
    updateSkill(tree.id, selectedSkill.id, {
      teachSteps: steps,
      xp: Math.max(0, Math.min(selectedSkill.maxXp, selectedSkill.xp + xpDelta)),
    })
    if (!wasCompleted) {
      const doneCount = steps.filter((s) => s.completed).length
      if (doneCount === steps.length && steps.length > 0) {
        recordActivity(`完成了「${selectedSkill.name}」的全部教学步骤，可以标记为已掌握！`, 'skill')
      }
    }
  }

  /** 提交测验答案：全部正确 → 标记完成 +5 XP；有错 → 显示解析可重试 */
  const submitQuiz = () => {
    if (!tree || !selectedSkill || !quizStep) return
    const qs = quizStep.quizQuestions ?? []
    const wrong = qs
      .map((q, i) => ({ q, answer: quizAnswers[i] }))
      .filter(({ q, answer }) => answer !== q.answerIndex)
    if (wrong.length === 0) {
      const steps = (selectedSkill.teachSteps ?? []).map((s) =>
        s.id === quizStep.id ? { ...s, completed: true, completedAt: new Date() } : s
      )
      updateSkill(tree.id, selectedSkill.id, {
        teachSteps: steps,
        xp: Math.min(selectedSkill.maxXp, selectedSkill.xp + 5),
      })
      recordActivity(`通过了「${selectedSkill.name}」的测验「${quizStep.title}」`, 'skill')
      setQuizStep(null)
      setQuizResult(null)
    } else {
      setQuizResult({
        pass: false,
        wrong: wrong.map(({ q }) => ({ question: q.question, explanation: q.explanation })),
      })
    }
  }

  const runTeachGenerate = async () => {
    if (!selectedSkill) return
    setTeachError(null)
    setTeachSuggestions([])
    if (!hasAIConfig()) {
      setTeachError('尚未配置 AI 服务：请到「我的 → 设置」填写 API Key')
      return
    }
    setTeachLoading(true)
    try {
      const result = await aiGenerateTeachSteps(
        { name: selectedSkill.name, description: selectedSkill.description, category: selectedSkill.category },
        selectedSkill.teachSteps ?? []
      )
      setTeachSuggestions(result)
      setTeachChecked(Object.fromEntries(result.map((_, i) => [i, true])))
    } catch (e) {
      setTeachError(e instanceof AIError ? e.message : (e as Error).message)
    } finally {
      setTeachLoading(false)
    }
  }

  const adoptTeachSteps = () => {
    if (!tree || !selectedSkill) return
    const existing = new Set((selectedSkill.teachSteps ?? []).map((s) => s.title))
    const picked = teachSuggestions.filter(
      (s, i) => teachChecked[i] && !existing.has(s.title)
    )
    if (picked.length === 0) {
      setTeachError('选中的步骤与已有教学步骤重复')
      return
    }
    const newSteps: TeachStep[] = picked.map((s) => ({
      id: `teach-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: s.title,
      description: s.description,
      type: s.type,
      durationMinutes: s.durationMinutes,
      completed: false,
    }))
    updateSkill(tree.id, selectedSkill.id, {
      teachSteps: [...(selectedSkill.teachSteps ?? []), ...newSteps],
    })
    recordActivity(`为「${selectedSkill.name}」生成了 ${newSteps.length} 个教学步骤`, 'skill')
    setTeachSuggestions([])
  }

  const addTeachStep = () => {
    if (!tree || !selectedSkill || !stepForm.title.trim()) return
    const newStep: TeachStep = {
      id: `teach-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: stepForm.title.trim(),
      description: stepForm.description.trim() || '自定义学习步骤',
      type: stepForm.type,
      durationMinutes: stepForm.durationMinutes,
      completed: false,
    }
    updateSkill(tree.id, selectedSkill.id, {
      teachSteps: [...(selectedSkill.teachSteps ?? []), newStep],
    })
    setStepForm({ title: '', description: '', type: 'practice', durationMinutes: 30 })
    setShowAddStep(false)
  }

  const removeTeachStep = (stepId: string) => {
    if (!tree || !selectedSkill) return
    updateSkill(tree.id, selectedSkill.id, {
      teachSteps: (selectedSkill.teachSteps ?? []).filter((s) => s.id !== stepId),
    })
  }

  const getStatusIcon = (status: SkillStatus) => {
    switch (status) {
      case SkillStatus.COMPLETED:
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case SkillStatus.LEARNING:
        return <PlayCircle className="w-6 h-6 text-blue-500" />
      case SkillStatus.AVAILABLE:
        return <Star className="w-6 h-6 text-yellow-500" />
      case SkillStatus.LOCKED:
        return <Lock className="w-6 h-6 text-gray-400" />
      default:
        return null
    }
  }

  const getStatusColor = (status: SkillStatus) => {
    switch (status) {
      case SkillStatus.COMPLETED:
        return 'bg-green-100 border-green-300 text-green-800'
      case SkillStatus.LEARNING:
        return 'bg-blue-100 border-blue-300 text-blue-800'
      case SkillStatus.AVAILABLE:
        return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case SkillStatus.LOCKED:
        return 'bg-gray-100 border-gray-300 text-gray-500'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-500'
    }
  }

  const progressColor = (status: SkillStatus) => {
    switch (status) {
      case SkillStatus.COMPLETED:
        return 'bg-green-500'
      case SkillStatus.LEARNING:
        return 'bg-blue-500'
      case SkillStatus.AVAILABLE:
        return 'bg-yellow-500'
      default:
        return 'bg-gray-400'
    }
  }

  const handleAddSkill = () => {
    if (!tree || !form.name.trim()) return
    addSkill(tree.id, {
      name: form.name.trim(),
      description: form.description.trim() || '自定义技能节点',
      category: form.category.trim() || tree.category,
      level: SkillLevel.UNKNOWN,
      maxXp: Math.max(50, form.estimatedHours * 3),
      prerequisites: form.prerequisites,
      estimatedHours: form.estimatedHours,
      tags: [tree.category, ...form.prerequisites.map((id) => skills.find((s) => s.id === id)?.name ?? '')],
      position: findSkillPosition(skills, form.prerequisites),
      custom: true,
    })
    setForm(emptyForm)
    setShowAddModal(false)
  }

  const handleSaveEdit = () => {
    if (!tree || !editingSkill || !form.name.trim()) return
    updateSkill(tree.id, editingSkill.id, {
      name: form.name.trim(),
      description: form.description.trim() || '自定义技能节点',
      category: form.category.trim() || tree.category,
      estimatedHours: form.estimatedHours,
      prerequisites: form.prerequisites,
    })
    setEditingSkill(null)
    setForm(emptyForm)
  }

  const openEdit = (skill: SkillNode) => {
    setEditingSkill(skill)
    setForm({
      name: skill.name,
      description: skill.description,
      category: skill.category,
      estimatedHours: skill.estimatedHours,
      prerequisites: skill.prerequisites,
    })
  }

  const handleDeleteSkill = () => {
    if (!tree || !selectedSkill) return
    if (window.confirm(`确定删除技能「${selectedSkill.name}」吗？相关的前置关系也会一并清理。`)) {
      deleteSkill(tree.id, selectedSkill.id)
      setSelectedSkillId(null)
    }
  }

  const handleDeleteTree = () => {
    if (!tree) return
    if (window.confirm(`确定删除整棵技能树「${tree.name}」吗？树内 ${tree.skills.length} 个技能节点将全部删除（可撤销）。`)) {
      deleteTree(tree.id)
      setSelectedSkillId(null)
      setShowDeleteTreeConfirm(false)
    }
  }

  /* ============ AI 功能 ============ */

  const runAIRecommend = async () => {
    setAiError(null)
    setAiSkills([])
    if (!hasAIConfig()) {
      setAiError('尚未配置 AI 服务：请到「我的 → 设置」填写 API Key（支持 DeepSeek/通义/Kimi/OpenAI 等 OpenAI 兼容接口）')
      return
    }
    setAiLoading(true)
    try {
      const result = await aiRecommendSkills(tree, { name: user.name, totalXp: user.totalXp })
      setAiSkills(result)
    } catch (e) {
      setAiError(e instanceof AIError ? e.message : (e as Error).message)
    } finally {
      setAiLoading(false)
    }
  }

  const runAIBranches = async () => {
    if (!selectedSkill) return
    setBranchError(null)
    setBranchSuggestions([])
    setBranchChecked({})
    if (!hasAIConfig()) {
      setBranchError('尚未配置 AI 服务：请到「我的 → 设置」填写 API Key')
      return
    }
    setBranchLoading(true)
    try {
      const result = await aiGenerateSkillBranches(tree, selectedSkill)
      setBranchSuggestions(result)
      setBranchChecked(Object.fromEntries(result.map((_, i) => [i, true])))
    } catch (e) {
      setBranchError(e instanceof AIError ? e.message : (e as Error).message)
    } finally {
      setBranchLoading(false)
    }
  }

  const adoptAIRecommendations = () => {
    if (!tree) return
    const existing = new Set(skills.map((s) => s.name))
    const fresh = aiSkills.filter((s) => !existing.has(s.name))
    fresh.forEach((s) => {
      addSkill(tree.id, {
        name: s.name,
        description: s.description,
        category: s.category || tree.category,
        level: SkillLevel.UNKNOWN,
        maxXp: Math.max(50, s.estimatedHours * 3),
        prerequisites: [],
        estimatedHours: s.estimatedHours,
        tags: s.tags?.length ? s.tags : [tree.category],
        position: findSkillPosition(skills, []),
      })
    })
    recordAIAdoption('skill')
    setShowRecommendModal(false)
    setAiSkills([])
    recordActivity(
      fresh.length > 0
        ? `采纳了 AI 推荐的 ${fresh.length} 个技能${aiSkills.length > fresh.length ? `（跳过 ${aiSkills.length - fresh.length} 个与已有技能重复的）` : ''}`
        : 'AI 推荐全部与已有技能重复，未添加',
      'skill'
    )
  }

  const adoptBranchSuggestions = () => {
    if (!tree || !selectedSkill) return
    const existing = new Set(skills.map((s) => s.name))
    const picked = branchSuggestions.filter((_, i) => branchChecked[i] && !existing.has(_.name))
    picked.forEach((s) => {
      addSkill(tree.id, {
        name: s.name,
        description: s.description,
        category: s.category || selectedSkill.category,
        level: SkillLevel.UNKNOWN,
        maxXp: Math.max(50, s.estimatedHours * 3),
        prerequisites: [selectedSkill.id],
        estimatedHours: s.estimatedHours,
        tags: s.tags?.length ? s.tags : [selectedSkill.category],
        position: findSkillPosition(skills, [selectedSkill.id]),
      })
    })
    recordAIAdoption('skill')
    setShowBranchModal(false)
    setBranchSuggestions([])
    recordActivity(`为「${selectedSkill.name}」衍化了 ${picked.length} 个子技能`, 'skill')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <TreePine className="w-8 h-8 mr-3 text-green-600" />
              我的技能树
            </h1>
            <p className="text-gray-600 mt-2">点击技能节点查看详情；前置技能完成后自动解锁；操作可撤销</p>
          </div>
          <div className="flex items-center space-x-2 flex-wrap">
            <button
              onClick={undo}
              disabled={!canUndo}
              title="撤销 (Ctrl+Z)"
              className="bg-white border text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              title="重做"
              className="bg-white border text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>添加技能</span>
            </button>
            <button
              onClick={() => {
                setRecommendSource('local')
                setShowRecommendModal(true)
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
            >
              <Sparkles className="w-4 h-4" />
              <span>智能推荐</span>
            </button>
            <button
              onClick={() => {
                setAuditError(null)
                setAuditIssues([])
                setShowAuditModal(true)
              }}
              title="AI 检查层级与前置关系"
              className="bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-1"
            >
              <ScanSearch className="w-4 h-4" />
              <span className="hidden sm:inline">AI 结构检查</span>
            </button>
            <button
              onClick={handleAutoLayout}
              disabled={!tree || tree.skills.length === 0}
              title="按金字塔结构自动布局（基础在下，逐层向上）"
              className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-40 flex items-center space-x-1"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">自动布局</span>
            </button>
            <button
              onClick={() => setShowNewTreeModal(true)}
              title="新建技能树"
              className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteTreeConfirm(true)}
              title="删除当前技能树"
              className="bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
            >
              <FolderMinus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              title="重置当前技能树到初始状态"
              className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tree Switcher */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {trees.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTree(t.id)
                setSelectedSkillId(null)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTreeId === t.id
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              {t.name}
              {t.skills.length === 0 && <span className="ml-1 text-xs opacity-70">(空)</span>}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Skill Tree Canvas */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              {skills.length === 0 ? (
                <div className="text-center py-24">
                  <TreePine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">这棵技能树还是空的</h3>
                  <p className="text-gray-600 mb-6">添加第一个技能节点，或用 AI 生成技能分支开始搭建</p>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      添加技能
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSkillId(null)
                        setShowRecommendModal(true)
                      }}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      AI 生成技能
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="relative overflow-auto"
                  style={{ height: `${Math.min(canvasH, 700)}px` }}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverPos(null)
                  }}
                >
                  <div className="relative" style={{ width: `${canvasW}px`, height: `${canvasH}px` }}>
                    {/* 底部基础层 → 顶部高级层的方向提示 */}
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 font-medium tracking-widest select-none pointer-events-none" style={{ writingMode: 'vertical-rl' }}>
                      高级 ▲ 基础
                    </div>

                    {/* 层级引导线：拖动时显示目标层级 */}
                    {dragOverPos && (
                      <>
                        <div
                          className="absolute left-0 right-0 border-t-2 border-dashed border-indigo-400 pointer-events-none z-20"
                          style={{ top: layerTopY(layerOf(dragOverPos.y)) }}
                        />
                        <div
                          className="absolute right-2 pointer-events-none z-20 px-2 py-0.5 rounded bg-indigo-600 text-white text-[11px] font-medium"
                          style={{ top: layerTopY(layerOf(dragOverPos.y)) + 6 }}
                        >
                          第 {layerOf(dragOverPos.y)} 层 · {layerName(layerOf(dragOverPos.y))}
                        </div>
                      </>
                    )}
                    <svg className="absolute inset-0 w-full h-full">
                      {skills.map((skill) =>
                        skill.prerequisites.map((preId) => {
                          const pre = skills.find((s) => s.id === preId)
                          if (!pre) return null
                          const preDone = pre.status === SkillStatus.COMPLETED
                          const curDone = skill.status === SkillStatus.COMPLETED
                          return (
                            <line
                              key={`${preId}-${skill.id}`}
                              x1={pre.position.x}
                              y1={pre.position.y}
                              x2={skill.position.x}
                              y2={skill.position.y}
                              stroke={preDone ? '#34d399' : curDone ? '#60a5fa' : '#e5e7eb'}
                              strokeWidth="2"
                              strokeDasharray={preDone && !curDone ? undefined : '5,5'}
                            />
                          )
                        })
                      )}
                    </svg>

                    {skills.map((skill) => (
                      <div
                        key={skill.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', skill.id)
                          e.dataTransfer.effectAllowed = 'move'
                          setDraggingId(skill.id)
                        }}
                        onDragEnd={() => setDraggingId(null)}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing select-none ${getStatusColor(skill.status)} border-2 rounded-xl p-4 w-48 shadow-sm hover:shadow-md transition-all ${
                          selectedSkillId === skill.id ? 'ring-2 ring-blue-500 scale-105' : ''
                        } ${draggingId === skill.id ? 'opacity-50 shadow-xl scale-105 z-10' : ''}`}
                        style={{ left: skill.position.x, top: skill.position.y }}
                        onClick={() => {
                          if (draggingId === skill.id) return
                          setSelectedSkillId(skill.id)
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-sm">{skill.name}</h3>
                          {getStatusIcon(skill.status)}
                        </div>
                        <p className="text-xs mb-3 line-clamp-2">{skill.description}</p>

                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${progressColor(skill.status)}`}
                            style={{ width: `${(skill.xp / skill.maxXp) * 100}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between text-xs">
                          <span>{getSkillLevelFromXp(skill.xp)}</span>
                          <span>{skill.xp}/{skill.maxXp} XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Skill Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              {selectedSkill ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {getStatusIcon(selectedSkill.status)}
                      <h2 className="text-xl font-semibold ml-2">{selectedSkill.name}</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEdit(selectedSkill)}
                        title="编辑技能"
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleDeleteSkill}
                        title="删除技能"
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{selectedSkill.description}</p>

                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">状态</span>
                      <p className="text-lg font-semibold text-blue-600">
                        {selectedSkill.status === SkillStatus.COMPLETED
                          ? '已掌握'
                          : selectedSkill.status === SkillStatus.LEARNING
                          ? '学习中'
                          : selectedSkill.status === SkillStatus.AVAILABLE
                          ? '可学习'
                          : '未解锁'}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-700">掌握程度</span>
                      <p className="text-lg font-semibold text-blue-600">{getSkillLevelFromXp(selectedSkill.xp)}</p>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-700">学习进度</span>
                      <div className="flex items-center mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (selectedSkill.xp / selectedSkill.maxXp) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round((selectedSkill.xp / selectedSkill.maxXp) * 100)}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-700">预估时长</span>
                      <p className="text-lg">{selectedSkill.estimatedHours} 小时</p>
                    </div>

                    {selectedSkill.prerequisites.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">前置技能</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedSkill.prerequisites.map((id) => {
                            const pre = skills.find((s) => s.id === id)
                            return (
                              <span
                                key={id}
                                className={`px-2 py-1 rounded text-xs ${
                                  pre?.status === SkillStatus.COMPLETED
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {pre?.name ?? id} {pre?.status === SkillStatus.COMPLETED ? '✓' : ''}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {selectedSkill.children.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">解锁后通向</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedSkill.children.map((id) => {
                            const child = skills.find((s) => s.id === id)
                            return child ? (
                              <span key={id} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                                {child.name}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 space-y-2">
                    {selectedSkill.status === SkillStatus.AVAILABLE && (
                      <button
                        onClick={() => startSkill(selectedSkill.id)}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        开始学习
                      </button>
                    )}
                    {selectedSkill.status === SkillStatus.LEARNING && (
                      <>
                        <button
                          onClick={() => completeSkill(selectedSkill.id)}
                          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          标记为已掌握（+100 XP）
                        </button>
                        <button
                          onClick={() => updateSkill(tree!.id, selectedSkill.id, { xp: Math.min(selectedSkill.maxXp, selectedSkill.xp + 25) })}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          记录学习进度（+25 XP）
                        </button>
                      </>
                    )}
                    {selectedSkill.status === SkillStatus.LOCKED && (
                      <p className="text-sm text-gray-500 text-center">完成前置技能后自动解锁</p>
                    )}
                    <button
                      onClick={() => setShowBranchModal(true)}
                      className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-1"
                    >
                      <GitBranch className="w-4 h-4" />
                      <span>AI 衍化子技能</span>
                    </button>
                    <button
                      onClick={() => {
                        updateSkill(tree!.id, selectedSkill.id, { status: SkillStatus.LEARNING })
                      }}
                      className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      设为学习中
                    </button>
                  </div>

                  {/* 教学步骤（teach skills）：深度学习路径 */}
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <GraduationCap className="w-4 h-4 mr-1.5 text-indigo-600" />
                        教学步骤
                        <span className="ml-2 text-xs font-normal text-gray-500">
                          {selectedSkill.teachSteps?.filter((s) => s.completed).length ?? 0}/{selectedSkill.teachSteps?.length ?? 0}
                        </span>
                      </h3>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={runTeachGenerate}
                          title="AI 生成教学步骤"
                          className="p-1.5 rounded text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowAddStep(true)}
                          title="添加教学步骤"
                          className="p-1.5 rounded text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {teachLoading && (
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <div className="animate-spin w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full mr-2"></div>
                        AI 正在设计学习路径...
                      </div>
                    )}
                    {teachError && (
                      <p className="text-xs text-red-600 bg-red-50 rounded p-2 mb-2">{teachError}</p>
                    )}
                    {teachSuggestions.length > 0 && (
                      <div className="border border-indigo-200 rounded-lg p-2 mb-2 bg-indigo-50/50">
                        <p className="text-xs font-medium text-indigo-700 mb-1">AI 建议的教学步骤（勾选加入）：</p>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {teachSuggestions.map((s, i) => (
                            <label key={i} className="flex items-start text-xs cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!teachChecked[i]}
                                onChange={() => setTeachChecked({ ...teachChecked, [i]: !teachChecked[i] })}
                                className="mt-0.5 mr-1.5 rounded"
                              />
                              <span className="flex-1">
                                <span className="font-medium text-gray-800">{s.title}</span>
                                <span className={`ml-1 px-1 rounded text-[10px] ${STEP_TYPE_META[s.type].color}`}>
                                  {STEP_TYPE_META[s.type].label}
                                </span>
                                <span className="text-gray-400"> · {s.durationMinutes}分钟</span>
                              </span>
                            </label>
                          ))}
                        </div>
                        <button
                          onClick={adoptTeachSteps}
                          className="w-full mt-2 bg-indigo-600 text-white py-1 rounded text-xs font-medium hover:bg-indigo-700 transition-colors"
                        >
                          加入教学步骤
                        </button>
                      </div>
                    )}

                    {selectedSkill.teachSteps && selectedSkill.teachSteps.length > 0 ? (
                      <div className="space-y-1.5">
                        {selectedSkill.teachSteps.map((step, idx) => (
                          <div
                            key={step.id}
                            className={`group flex items-start p-2 rounded-lg border transition-colors ${
                              step.completed
                                ? 'bg-green-50 border-green-200'
                                : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={!!step.completed}
                              onChange={() => toggleTeachStep(step.id)}
                              className="mt-0.5 mr-2 rounded cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center">
                                <span className="text-[10px] text-gray-400 mr-1.5">{idx + 1}</span>
                                <span className={`text-[10px] px-1 rounded ${STEP_TYPE_META[step.type].color}`}>
                                  {STEP_TYPE_META[step.type].label}
                                </span>
                                <span className={`text-xs font-medium ml-1.5 ${step.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                  {step.title}
                                </span>
                                <span className="text-[10px] text-gray-400 ml-auto">{step.durationMinutes}分钟</span>
                              </div>
                              <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{step.description}</p>
                              {step.type === 'quiz' && step.quizQuestions && !step.completed && (
                                <p className="text-[10px] text-yellow-600 mt-0.5">🎯 答题全部正确才可完成</p>
                              )}
                            </div>
                            <button
                              onClick={() => removeTeachStep(step.id)}
                              title="删除步骤"
                              className="ml-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 text-center py-3">
                        还没有教学步骤，点 ✨ 让 AI 设计学习路径
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <TreePine className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>点击技能节点查看详情</p>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
              <h3 className="font-semibold mb-4">图例</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>已掌握</span>
                </div>
                <div className="flex items-center">
                  <PlayCircle className="w-4 h-4 text-blue-500 mr-2" />
                  <span>学习中</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-2" />
                  <span>可学习</span>
                </div>
                <div className="flex items-center">
                  <Lock className="w-4 h-4 text-gray-400 mr-2" />
                  <span>未解锁</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Skill Modal */}
      {showAddModal && tree && (
        <SkillFormModal
          title={`添加新技能到「${tree.name}」`}
          form={form}
          setForm={setForm}
          skills={skills}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSkill}
          submitLabel="添加技能"
        />
      )}

      {/* Edit Skill Modal */}
      {editingSkill && tree && (
        <SkillFormModal
          title={`编辑技能「${editingSkill.name}」`}
          form={form}
          setForm={setForm}
          skills={skills}
          onClose={() => {
            setEditingSkill(null)
            setForm(emptyForm)
          }}
          onSubmit={handleSaveEdit}
          submitLabel="保存修改"
        />
      )}

      {/* Recommend Modal */}
      {showRecommendModal && tree && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[32rem] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Sparkles className="w-5 h-5 text-yellow-500 mr-2" />
                技能推荐
              </h3>
              <button onClick={() => setShowRecommendModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Source tabs */}
            <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setRecommendSource('local')}
                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  recommendSource === 'local' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                }`}
              >
                本地规则
              </button>
              <button
                onClick={() => {
                  setRecommendSource('ai')
                  if (aiSkills.length === 0 && !aiLoading) runAIRecommend()
                }}
                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
                  recommendSource === 'ai' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>AI 智能</span>
              </button>
            </div>

            {recommendSource === 'local' ? (
              localRecommendations.length > 0 ? (
                <div className="space-y-3">
                  {localRecommendations.map(({ skill, reason, learningPath }, idx) => (
                    <div key={skill.id} className={`p-4 rounded-lg ${idx === 0 ? 'bg-green-50 border border-green-200' : 'bg-blue-50'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">{idx === 0 && '⭐ '}{skill.name}</h4>
                        <span className="text-xs text-gray-500">约{skill.estimatedHours}小时</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{reason}</p>
                      <p className="text-xs text-gray-500 mb-3">学习路径: {learningPath.join(' → ')}</p>
                      <button
                        onClick={() => {
                          startSkill(skill.id)
                          setShowRecommendModal(false)
                        }}
                        className="w-full bg-green-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        开始学习「{skill.name}」
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">当前没有可推荐的技能，先完成任务解锁前置技能吧。</p>
              )
            ) : aiLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-gray-600 text-sm">AI 正在分析你的技能树...</p>
              </div>
            ) : aiError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                <p className="font-medium mb-1">AI 调用失败</p>
                <p>{aiError}</p>
              </div>
            ) : aiSkills.length > 0 ? (
              <div className="space-y-3">
                {aiSkills.map((s, i) => (
                  <div key={i} className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">🤖 {s.name}</h4>
                      <span className="text-xs text-gray-500">约{s.estimatedHours}小时</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{s.description}</p>
                    <p className="text-xs text-gray-500 mb-1">💡 {s.reason}</p>
                    {s.learningPath?.length > 0 && (
                      <p className="text-xs text-gray-500 mb-2">路径: {s.learningPath.join(' → ')}</p>
                    )}
                    {s.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {s.tags.map((t) => (
                          <span key={t} className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <button
                  onClick={adoptAIRecommendations}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  全部加入技能树（{aiSkills.length} 个）
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* AI Branch Modal */}
      {showBranchModal && selectedSkill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[32rem] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <GitBranch className="w-5 h-5 text-purple-600 mr-2" />
                AI 衍化「{selectedSkill.name}」的子技能
              </h3>
              <button onClick={() => setShowBranchModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {branchSuggestions.length === 0 && !branchLoading && !branchError && (
              <button
                onClick={runAIBranches}
                className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                生成子技能分支
              </button>
            )}

            {branchLoading && (
              <div className="text-center py-10">
                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-gray-600 text-sm">AI 正在设计子技能分支...</p>
              </div>
            )}

            {branchError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-3">
                <p className="font-medium mb-1">AI 调用失败</p>
                <p>{branchError}</p>
              </div>
            )}

            {branchSuggestions.length > 0 && (
              <>
                <div className="space-y-3 mb-4">
                  {branchSuggestions.map((s, i) => (
                    <label key={i} className={`block p-4 rounded-lg border cursor-pointer transition-colors ${branchChecked[i] ? 'bg-purple-50 border-purple-300' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={!!branchChecked[i]}
                          onChange={() => setBranchChecked({ ...branchChecked, [i]: !branchChecked[i] })}
                          className="mt-1 mr-3 rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{s.name}</h4>
                          <p className="text-sm text-gray-600 mb-1">{s.description}</p>
                          <p className="text-xs text-gray-500 mb-1">💡 {s.reason}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">约{s.estimatedHours}小时</span>
                            {s.tags?.length > 0 && (
                              <span className="text-xs text-purple-600">{s.tags.slice(0, 3).join(' · ')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={adoptBranchSuggestions}
                    disabled={!Object.values(branchChecked).some(Boolean)}
                    className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    加入选中的子技能（{Object.values(branchChecked).filter(Boolean).length} 个）
                  </button>
                  <button
                    onClick={runAIBranches}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    换一批
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* New Tree Modal */}
      {showNewTreeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[26rem]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <FolderPlus className="w-5 h-5 text-purple-600 mr-2" />
                新建技能树
              </h3>
              <button onClick={() => setShowNewTreeModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名称 *</label>
                <input
                  type="text"
                  value={treeForm.name}
                  onChange={(e) => setTreeForm({ ...treeForm, name: e.target.value })}
                  placeholder="例如：数据科学技能树"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  rows={2}
                  value={treeForm.description}
                  onChange={(e) => setTreeForm({ ...treeForm, description: e.target.value })}
                  placeholder="这棵技能树的方向是什么？"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <input
                  type="text"
                  value={treeForm.category}
                  onChange={(e) => setTreeForm({ ...treeForm, category: e.target.value })}
                  placeholder="例如：数据科学"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => {
                  if (!treeForm.name.trim()) return
                  addTree(treeForm)
                  setTreeForm({ name: '', description: '', category: '' })
                  setShowNewTreeModal(false)
                }}
                disabled={!treeForm.name.trim()}
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                创建技能树
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Audit Modal */}
      {showAuditModal && tree && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[34rem] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <ScanSearch className="w-5 h-5 text-teal-600 mr-2" />
                AI 结构检查 · {tree.name}
              </h3>
              <button onClick={() => setShowAuditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              检查层级递进与前置关系（层级矛盾 / 缺失前置 / 冗余依赖），建议逐条人工确认后应用。
            </p>

            {auditIssues.length === 0 && !auditLoading && !auditError && (
              <button
                onClick={runAudit}
                className="w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                开始检查
              </button>
            )}

            {auditLoading && (
              <div className="text-center py-10">
                <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-gray-600 text-sm">AI 正在审查技能树结构...</p>
              </div>
            )}

            {auditError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-3">
                <p className="font-medium mb-1">AI 调用失败</p>
                <p>{auditError}</p>
              </div>
            )}

            {auditIssues.length > 0 && (
              <>
                <div className="space-y-3 mb-4">
                  {auditIssues.map((issue, i) => (
                    <div key={i} className="p-4 rounded-lg border border-amber-200 bg-amber-50">
                      <div className="flex items-center mb-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 mr-2">
                          {issue.type === 'layer' ? '层级' : '前置关系'}
                        </span>
                        <h4 className="font-semibold text-gray-900">{issue.skill}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">⚠️ {issue.issue}</p>
                      <p className="text-xs text-teal-700 mb-3">💡 建议：{issue.suggestion}</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => applyAuditIssue(i)}
                          className="flex-1 bg-teal-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                        >
                          应用修复
                        </button>
                        <button
                          onClick={() => {
                            setAuditIssues(auditIssues.filter((_, idx) => idx !== i))
                          }}
                          className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                        >
                          忽略
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={runAudit}
                  className="w-full bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  重新检查
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Quiz Modal：答题全部正确才完成 */}
      {quizStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[32rem] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold flex items-center">
                <GraduationCap className="w-5 h-5 text-yellow-600 mr-2" />
                测验：{quizStep.title}
              </h3>
              <button
                onClick={() => setQuizStep(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">全部答对才算完成（+5 XP），答错可查看解析后重试</p>

            <div className="space-y-5">
              {(quizStep.quizQuestions ?? []).map((q, qi) => (
                <div key={qi}>
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {qi + 1}. {q.question}
                  </p>
                  <div className="space-y-1.5">
                    {q.options.map((opt, oi) => {
                      const selected = quizAnswers[qi] === oi
                      const isCorrect = quizResult && !quizResult.pass && oi === q.answerIndex
                      const isWrongPick = quizResult && !quizResult.pass && selected && oi !== q.answerIndex
                      return (
                        <button
                          key={oi}
                          onClick={() => {
                            const next = [...quizAnswers]
                            next[qi] = oi
                            setQuizAnswers(next)
                            setQuizResult(null)
                          }}
                          className={`w-full text-left text-sm px-3 py-2 rounded-lg border transition-colors ${
                            isCorrect
                              ? 'bg-green-50 border-green-400 text-green-800'
                              : isWrongPick
                              ? 'bg-red-50 border-red-400 text-red-700'
                              : selected
                              ? 'bg-indigo-50 border-indigo-400 text-indigo-800'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
                          }`}
                        >
                          {String.fromCharCode(65 + oi)}. {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {quizResult && !quizResult.pass && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm font-medium text-red-700 mb-2">
                  有 {quizResult.wrong.length} 道答错了，看看解析：
                </p>
                {quizResult.wrong.map((w, i) => (
                  <p key={i} className="text-xs text-red-600 mb-1">
                    ❌ {w.question} — {w.explanation}
                  </p>
                ))}
                <p className="text-xs text-gray-500 mt-2">修改答案后重新提交</p>
              </div>
            )}

            <div className="flex space-x-3 mt-5">
              <button
                onClick={submitQuiz}
                disabled={quizAnswers.some((a) => a === -1)}
                className="flex-1 bg-yellow-600 text-white py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                提交答案
              </button>
              <button
                onClick={() => setQuizStep(null)}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                稍后再说
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Teach Step Modal */}
      {showAddStep && selectedSkill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[26rem]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">添加教学步骤 · {selectedSkill.name}</h3>
              <button onClick={() => setShowAddStep(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">步骤标题 *</label>
                <input
                  type="text"
                  value={stepForm.title}
                  onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })}
                  placeholder="例如：掌握 Flexbox 主轴对齐"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">学什么 / 怎么学</label>
                <textarea
                  rows={2}
                  value={stepForm.description}
                  onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })}
                  placeholder="具体要掌握什么、做什么练习"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                  <select
                    value={stepForm.type}
                    onChange={(e) => setStepForm({ ...stepForm, type: e.target.value as TeachStepType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="concept">概念（讲解）</option>
                    <option value="practice">实践（练习）</option>
                    <option value="project">项目（综合）</option>
                    <option value="quiz">测验（答题）</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">时长（分钟）</label>
                  <input
                    type="number"
                    min={5}
                    step={5}
                    value={stepForm.durationMinutes}
                    onChange={(e) => setStepForm({ ...stepForm, durationMinutes: Number(e.target.value) || 30 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={addTeachStep}
                disabled={!stepForm.title.trim()}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                添加步骤
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drop Conflict Confirm */}
      {pendingDrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[26rem]">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
              层级递进关系提示
            </h3>
            <p className="text-gray-600 mb-3">
              把「{skills.find((s) => s.id === pendingDrop.id)?.name}」放到
              <span className="font-medium text-indigo-600"> 第 {pendingDrop.targetLayer} 层 · {layerName(pendingDrop.targetLayer)}</span>
              会破坏以下前置递进关系（后继技能不能低于前置技能）：
            </p>
            <div className="space-y-1 mb-4 max-h-32 overflow-y-auto">
              {pendingDrop.conflicts.map((c) => (
                <div key={c.name} className="flex items-center text-sm bg-yellow-50 rounded px-2 py-1">
                  <span className="text-yellow-600 mr-1">⚠️</span>
                  「{c.name}」目前在第 {c.layer} 层 · {layerName(c.layer)}，它依赖此技能
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mb-4">
              仍然放置将导致视觉层级与依赖关系不一致（推荐取消，用「自动布局」恢复金字塔结构）
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmPendingDrop}
                className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                仍然放置
              </button>
              <button
                onClick={() => {
                  setPendingDrop(null)
                  setDraggingId(null)
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirm */}
      {showResetConfirm && tree && (
        <ConfirmModal
          title="重置技能树"
          message={`确定将「${tree.name}」恢复到初始状态吗？你添加的节点会被移除。`}
          confirmLabel="确认重置"
          onConfirm={() => {
            resetTree(tree.id)
            setSelectedSkillId(null)
            setShowResetConfirm(false)
          }}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}

      {/* Delete Tree Confirm */}
      {showDeleteTreeConfirm && tree && (
        <ConfirmModal
          title="删除技能树"
          message={`确定删除「${tree.name}」吗？树内 ${tree.skills.length} 个技能节点将全部删除（可通过撤销恢复）。`}
          confirmLabel="确认删除"
          danger
          onConfirm={handleDeleteTree}
          onCancel={() => setShowDeleteTreeConfirm(false)}
        />
      )}
    </div>
  )
}

/* ==================== 子组件 ==================== */

function SkillFormModal({
  title,
  form,
  setForm,
  skills,
  onClose,
  onSubmit,
  submitLabel,
}: {
  title: string
  form: SkillForm
  setForm: (f: SkillForm) => void
  skills: SkillNode[]
  onClose: () => void
  onSubmit: () => void
  submitLabel: string
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[28rem] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">技能名称 *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="例如：WebAssembly"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="这个技能学什么？"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="例如：前端"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">预估学习时长（小时）</label>
            <input
              type="number"
              min={1}
              value={form.estimatedHours}
              onChange={(e) => setForm({ ...form, estimatedHours: Number(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">前置技能（可多选）</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {skills.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      prerequisites: form.prerequisites.includes(s.id)
                        ? form.prerequisites.filter((id) => id !== s.id)
                        : [...form.prerequisites, s.id],
                    })
                  }
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    form.prerequisites.includes(s.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={onSubmit}
            disabled={!form.name.trim()}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function ConfirmModal({
  title,
  message,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
}: {
  title: string
  message: string
  confirmLabel: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="flex space-x-3">
          <button
            onClick={onConfirm}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              danger ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}
