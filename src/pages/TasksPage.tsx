import { useState } from 'react'
import { CheckSquare, Plus, Calendar, Tag, Clock, Filter, X, Bot } from 'lucide-react'
import { Task, SkillStatus } from '../types'
import { useAppStore } from '../store'
import { useActiveTree } from '../store'
import { formatDuration } from '../utils'
import { aiGenerateTasks, hasAIConfig, AIError, AITaskSuggestion } from '../utils/ai'

export function TasksPage() {
  const tasks = useAppStore((s) => s.tasks)
  const addTask = useAppStore((s) => s.addTask)
  const deleteTask = useAppStore((s) => s.deleteTask)
  const toggleSubtask = useAppStore((s) => s.toggleSubtask)
  const setTaskStatus = useAppStore((s) => s.setTaskStatus)
  const recordAIAdoption = useAppStore((s) => s.recordAIAdoption)
  const recordActivity = useAppStore((s) => s.recordActivity)
  const tree = useActiveTree()

  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all')
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiSkillId, setAiSkillId] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiTasks, setAiTasks] = useState<AITaskSuggestion[]>([])
  const [aiChecked, setAiChecked] = useState<Record<number, boolean>>({})
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    estimatedMinutes: 60,
    skillId: '',
    tags: '',
  })

  const filteredTasks = tasks.filter((task) => filter === 'all' || task.status === filter)
  const skillName = (id?: string) => tree?.skills.find((s) => s.id === id)?.name
  const aiSkills = tree?.skills.filter((s) => s.status !== SkillStatus.LOCKED) ?? []

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50'
      case 'in-progress': return 'text-blue-600 bg-blue-50'
      case 'todo': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const handleAddTask = () => {
    if (!form.title.trim()) return
    const subtasks = ['学习与理解', '动手实践', '总结复盘'].map((name, i) => ({
      id: `sub-${Date.now()}-${i}`,
      title: name,
      completed: false,
      estimatedMinutes: Math.round(form.estimatedMinutes / 3),
    }))
    addTask({
      title: form.title.trim(),
      description: form.description.trim() || '自定义学习任务',
      skillId: form.skillId || undefined,
      priority: form.priority,
      estimatedMinutes: form.estimatedMinutes,
      tags: form.tags
        .split(/[,，\s]+/)
        .filter(Boolean)
        .slice(0, 5),
      subtasks,
      dueDate: new Date(Date.now() + 3 * 86400000),
    })
    setForm({ title: '', description: '', priority: 'medium', estimatedMinutes: 60, skillId: '', tags: '' })
    setShowAddTask(false)
  }

  /* ============ AI 生成任务 ============ */

  const runAITasks = async () => {
    setAiError(null)
    setAiTasks([])
    if (!hasAIConfig()) {
      setAiError('尚未配置 AI 服务：请到「我的 → 设置」填写 API Key（支持 DeepSeek/通义/Kimi/OpenAI 等）')
      return
    }
    const skill = tree?.skills.find((s) => s.id === aiSkillId)
    if (!skill) {
      setAiError('请先选择一个技能')
      return
    }
    setAiLoading(true)
    try {
      const result = await aiGenerateTasks(skill, tasks)
      setAiTasks(result)
      setAiChecked(Object.fromEntries(result.map((_, i) => [i, true])))
    } catch (e) {
      setAiError(e instanceof AIError ? e.message : (e as Error).message)
    } finally {
      setAiLoading(false)
    }
  }

  const adoptAITasks = () => {
    const picked = aiTasks.filter((_, i) => aiChecked[i])
    if (picked.length === 0) return
    picked.forEach((t) => {
      addTask({
        title: t.title,
        description: t.description,
        skillId: aiSkillId || undefined,
        priority: t.priority,
        estimatedMinutes: t.estimatedMinutes,
        tags: t.tags?.length ? t.tags : ['AI推荐'],
        subtasks: (t.subtasks ?? []).map((st, i) => ({
          id: `sub-${Date.now()}-${i}`,
          title: st.title,
          completed: false,
          estimatedMinutes: st.estimatedMinutes ?? Math.round(t.estimatedMinutes / 3),
        })),
        dueDate: new Date(Date.now() + 3 * 86400000),
      })
    })
    recordAIAdoption('task')
    setShowAIModal(false)
    setAiTasks([])
    recordActivity(`采纳了 AI 生成的 ${picked.length} 个学习任务`, 'task')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <CheckSquare className="w-8 h-8 mr-3 text-blue-600" />
              任务管理
            </h1>
            <p className="text-gray-600 mt-2">管理你的学习任务，追踪技能成长进度</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setAiError(null)
                setAiTasks([])
                setAiSkillId('')
                setShowAIModal(true)
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Bot className="w-4 h-4" />
              <span>AI 生成任务</span>
            </button>
            <button
              onClick={() => setShowAddTask(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>新建任务</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <div className="flex space-x-2 flex-wrap">
                {(['all', 'todo', 'in-progress', 'completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filter === status
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {status === 'all' ? '全部' : status === 'todo' ? '待办' : status === 'in-progress' ? '进行中' : '已完成'}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              共 {filteredTasks.length} 个任务 · 已完成 {tasks.filter((t) => t.status === 'completed').length} 个
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const done = task.subtasks.filter((st) => st.completed).length
            const total = task.subtasks.length
            const progress = total > 0 ? Math.round((done / total) * 100) : task.status === 'completed' ? 100 : 0
            return (
              <div key={task.id} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2 flex-wrap">
                      <h3 className={`text-lg font-semibold text-gray-900 ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                        {task.title}
                      </h3>
                      {task.aiGenerated && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                          AI推荐
                        </span>
                      )}
                      {skillName(task.skillId) && (
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          {skillName(task.skillId)}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status === 'todo' ? '待办' : task.status === 'in-progress' ? '进行中' : '已完成'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'high' ? '高优先级' : task.priority === 'medium' ? '中优先级' : '低优先级'}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4">{task.description}</p>

                    {/* Subtasks */}
                    <div className="space-y-2 mb-4">
                      {task.subtasks.map((subtask) => (
                        <div key={subtask.id} className="flex items-center space-x-2 group">
                          <input
                            type="checkbox"
                            checked={subtask.completed}
                            onChange={() => toggleSubtask(task.id, subtask.id)}
                            className="rounded border-gray-300 cursor-pointer"
                          />
                          <span className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                            {subtask.title}
                          </span>
                          <span className="text-xs text-gray-500">({subtask.estimatedMinutes}分钟)</span>
                        </div>
                      ))}
                    </div>

                    {/* Tags */}
                    {task.tags.length > 0 && (
                      <div className="flex items-center space-x-2 mb-4">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <div className="flex space-x-1 flex-wrap">
                          {task.tags.map((tag) => (
                            <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-6 text-right space-y-2 flex-shrink-0">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{formatDuration(task.estimatedMinutes)}</span>
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(task.dueDate).toLocaleDateString('zh-CN')}</span>
                      </div>
                    )}
                    <div className="flex space-x-2 justify-end">
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => setTaskStatus(task.id, 'completed')}
                          className="text-xs text-green-600 hover:text-green-800 font-medium"
                        >
                          标记完成
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm(`删除任务「${task.title}」？`)) deleteTask(task.id)
                        }}
                        className="text-xs text-gray-400 hover:text-red-500 font-medium"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">完成进度</span>
                    <span className="text-gray-900 font-medium">{done} / {total} · {progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无任务</h3>
            <p className="text-gray-600 mb-4">创建你的第一个学习任务开始成长之旅</p>
            <button
              onClick={() => setShowAddTask(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              创建任务
            </button>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[28rem] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">新建学习任务</h3>
              <button onClick={() => setShowAddTask(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">任务标题 *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="例如：完成 React 状态管理练习"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="任务要做什么？"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as Task['priority'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">预估时长（分钟）</label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    value={form.estimatedMinutes}
                    onChange={(e) => setForm({ ...form, estimatedMinutes: Number(e.target.value) || 30 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">关联技能</label>
                <select
                  value={form.skillId}
                  onChange={(e) => setForm({ ...form, skillId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">不关联</option>
                  {tree?.skills.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标签（逗号分隔）</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="例如：React, 练习, 项目"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleAddTask}
                disabled={!form.title.trim()}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                创建任务
              </button>
            </div>
          </div>
        </div>
      )}
      {/* AI Generate Tasks Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[32rem] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Bot className="w-5 h-5 text-purple-600 mr-2" />
                AI 生成学习任务
              </h3>
              <button onClick={() => setShowAIModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">选择技能</label>
              <select
                value={aiSkillId}
                onChange={(e) => setAiSkillId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">请选择技能...</option>
                {aiSkills.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}（{s.status === 'completed' ? '已掌握' : s.status === 'learning' ? '学习中' : '可学习'}）</option>
                ))}
              </select>
            </div>

            {aiTasks.length === 0 && !aiLoading && !aiError && (
              <button
                onClick={runAITasks}
                disabled={!aiSkillId}
                className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                生成任务
              </button>
            )}

            {aiLoading && (
              <div className="text-center py-10">
                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-gray-600 text-sm">AI 正在拆解学习任务...</p>
              </div>
            )}

            {aiError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-3">
                <p className="font-medium mb-1">AI 调用失败</p>
                <p>{aiError}</p>
              </div>
            )}

            {aiTasks.length > 0 && (
              <>
                <div className="space-y-3 mb-4">
                  {aiTasks.map((t, i) => (
                    <label key={i} className={`block p-4 rounded-lg border cursor-pointer transition-colors ${aiChecked[i] ? 'bg-purple-50 border-purple-300' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={!!aiChecked[i]}
                          onChange={() => setAiChecked({ ...aiChecked, [i]: !aiChecked[i] })}
                          className="mt-1 mr-3 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">{t.title}</h4>
                            <span className="text-xs text-gray-500">{formatDuration(t.estimatedMinutes)}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{t.description}</p>
                          <p className="text-xs text-gray-500 mb-1">💡 {t.reason}</p>
                          <div className="flex flex-wrap gap-1">
                            {(t.subtasks ?? []).map((st, j) => (
                              <span key={j} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                                {st.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={adoptAITasks}
                    disabled={!Object.values(aiChecked).some(Boolean)}
                    className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    加入任务列表（{Object.values(aiChecked).filter(Boolean).length} 个）
                  </button>
                  <button
                    onClick={runAITasks}
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
    </div>
  )
}
