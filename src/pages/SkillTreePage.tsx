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
} from 'lucide-react'
import { SkillStatus, SkillLevel, SkillNode } from '../types'
import { useAppStore, useActiveTree } from '../store'
import { recommendSkills, SkillRecommendation } from '../utils/recommend'
import { getSkillLevelFromXp } from '../utils'
import {
  aiRecommendSkills,
  aiGenerateSkillBranches,
  hasAIConfig,
  AIError,
  AISkillSuggestion,
} from '../utils/ai'

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

  const skills = tree?.skills ?? []
  const selectedSkill = skills.find((s) => s.id === selectedSkillId) ?? null
  const localRecommendations: SkillRecommendation[] = recommendSkills(skills, 4)

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
      position: { x: 400 + Math.random() * 100, y: 300 + Math.random() * 80 },
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
        position: { x: 400 + Math.random() * 200, y: 300 + Math.random() * 120 },
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
        position: { x: 400 + Math.random() * 200, y: 300 + Math.random() * 120 },
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
                <div className="relative overflow-auto" style={{ height: '600px' }}>
                  <div className="relative" style={{ width: '820px', height: '600px' }}>
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
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${getStatusColor(skill.status)} border-2 rounded-xl p-4 w-48 shadow-sm hover:shadow-md transition-all ${
                          selectedSkillId === skill.id ? 'ring-2 ring-blue-500 scale-105' : ''
                        }`}
                        style={{ left: skill.position.x, top: skill.position.y }}
                        onClick={() => setSelectedSkillId(skill.id)}
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
