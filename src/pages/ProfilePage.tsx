import { useState } from 'react'
import {
  User,
  Trophy,
  Target,
  BarChart3,
  Clock,
  TrendingUp,
  X,
  Settings,
} from 'lucide-react'
import { useAppStore, getLevel, useAllSkills } from '../store'
import { SkillStatus } from '../types'

export function ProfilePage() {
  const user = useAppStore((s) => s.user)
  const updateUser = useAppStore((s) => s.updateUser)
  const achievements = useAppStore((s) => s.achievements)
  const gameStats = useAppStore((s) => s.gameStats)
  const activities = useAppStore((s) => s.activities)
  const trees = useAppStore((s) => s.trees)
  const allSkills = useAllSkills()
  const joinedCircleIds = useAppStore((s) => s.joinedCircleIds)
  const circles = useAppStore((s) => s.circles)

  const [showEdit, setShowEdit] = useState(false)
  const [form, setForm] = useState({
    name: user.name,
    age: user.age,
    dailyLearningHours: user.dailyLearningHours,
    learningStyle: user.preferences.learningStyle,
    difficultyPreference: user.preferences.difficultyPreference,
  })

  const level = getLevel(user.totalXp)
  const masteredSkills = allSkills.filter((s) => s.status === SkillStatus.COMPLETED)
  const learningSkills = allSkills.filter((s) => s.status === SkillStatus.LEARNING)
  const availableSkills = allSkills.filter((s) => s.status === SkillStatus.AVAILABLE)

  // 学习进展：按技能树聚合
  const progressPerTree = trees.map((tree) => {
    const totalXp = tree.skills.reduce((sum, s) => sum + s.maxXp, 0)
    const currentXp = tree.skills.reduce((sum, s) => sum + s.xp, 0)
    const pct = totalXp > 0 ? Math.round((currentXp / totalXp) * 100) : 0
    const mastered = tree.skills.filter((s) => s.status === SkillStatus.COMPLETED).length
    return { tree, pct, mastered, total: tree.skills.length }
  })

  // 本周统计
  const weekly = [...gameStats.weeklyProgress].reverse() // 最早 → 今天

  const handleSave = () => {
    updateUser({
      name: form.name.trim() || user.name,
      age: form.age,
      dailyLearningHours: form.dailyLearningHours,
      preferences: {
        ...user.preferences,
        learningStyle: form.learningStyle,
        difficultyPreference: form.difficultyPreference,
      },
    })
    setShowEdit(false)
  }

  const activityIcon = (type: string) => {
    switch (type) {
      case 'task': return 'bg-blue-500'
      case 'skill': return 'bg-green-500'
      case 'circle': return 'bg-purple-500'
      case 'note': return 'bg-yellow-500'
      case 'achievement': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold text-white">
              {user.name.charAt(0)}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
              <p className="text-gray-600 mb-4">终身学习者 · {user.preferences.learningStyle === 'visual' ? '视觉型' : user.preferences.learningStyle === 'auditory' ? '听觉型' : user.preferences.learningStyle === 'kinesthetic' ? '动觉型' : '阅读型'}学习者</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">Lv.{level}</div>
                  <div className="text-sm text-gray-600">等级</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{user.totalXp.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">总经验</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{masteredSkills.length}</div>
                  <div className="text-sm text-gray-600">掌握技能</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{gameStats.currentStreak}</div>
                  <div className="text-sm text-gray-600">连续天数</div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                <button
                  onClick={() => {
                    setForm({
                      name: user.name,
                      age: user.age,
                      dailyLearningHours: user.dailyLearningHours,
                      learningStyle: user.preferences.learningStyle,
                      difficultyPreference: user.preferences.difficultyPreference,
                    })
                    setShowEdit(true)
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  编辑资料
                </button>
                <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>设置</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Learning Progress */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                学习进展
              </h2>

              <div className="space-y-5">
                {progressPerTree.map(({ tree, pct, mastered, total }) => (
                  <div key={tree.id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {tree.name} · {mastered}/{total} 已掌握
                      </span>
                      <span className="text-sm text-gray-600">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${pct >= 80 ? 'bg-green-500' : pct >= 40 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-600" />
                最近活动
              </h2>

              <div className="space-y-4">
                {activities.slice(0, 8).map((act) => (
                  <div key={act.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 ${activityIcon(act.type)} rounded-full mt-2`}></div>
                    <div>
                      <p className="text-gray-900">{act.text}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(act.time).toLocaleDateString('zh-CN')} {new Date(act.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Stats */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                本周统计
              </h2>

              <div className="grid grid-cols-7 gap-2">
                {weekly.map((day, index) => {
                  const isToday = index === weekly.length - 1
                  const maxMin = Math.max(...weekly.map((d) => d.learningMinutes), 60)
                  const height = Math.max(10, Math.round((day.learningMinutes / maxMin) * 120))
                  return (
                    <div key={index} className="text-center">
                      <div className="text-xs text-gray-600 mb-2">
                        {isToday ? '今天' : ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][new Date(day.date).getDay() === 0 ? 6 : new Date(day.date).getDay() - 1]}
                      </div>
                      <div
                        className={`rounded mx-auto transition-all ${isToday ? 'bg-purple-500' : 'bg-blue-500'}`}
                        style={{ width: '20px', height: `${height}px` }}
                        title={`学习 ${day.learningMinutes} 分钟 · 完成 ${day.tasksCompleted} 个任务`}
                      ></div>
                      <div className="text-xs text-gray-600 mt-1">
                        {day.learningMinutes >= 60 ? `${Math.round(day.learningMinutes / 60)}h` : `${day.learningMinutes}m`}
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                本周累计学习 {weekly.reduce((s, d) => s + d.learningMinutes, 0)} 分钟 · 完成任务 {weekly.reduce((s, d) => s + d.tasksCompleted, 0)} 个
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* User Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-600" />
                个人信息
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">年龄</label>
                  <p className="text-gray-900">{user.age}岁</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">每日学习时间</label>
                  <p className="text-gray-900">{user.dailyLearningHours}小时</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">学习偏好</label>
                  <p className="text-gray-900">
                    {user.preferences.learningStyle === 'visual' ? '视觉型学习者' : user.preferences.learningStyle === 'auditory' ? '听觉型学习者' : user.preferences.learningStyle === 'kinesthetic' ? '动觉型学习者' : '阅读型学习者'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">已加入圈子</label>
                  <p className="text-gray-900">
                    {joinedCircleIds
                      .map((id) => circles.find((c) => c.id === id)?.name)
                      .filter(Boolean)
                      .join('、') || '暂无'}
                  </p>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
                成就徽章
                <span className="ml-auto text-sm text-gray-500">
                  {achievements.filter((a) => a.unlockedAt).length}/{achievements.length}
                </span>
              </h2>

              <div className="grid grid-cols-3 gap-4">
                {achievements.map((ach) => {
                  const unlocked = !!ach.unlockedAt
                  return (
                    <div key={ach.id} className={`text-center ${unlocked ? '' : 'opacity-50'}`} title={`${ach.name}：${ach.condition}`}>
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-xl ${
                          unlocked ? 'bg-yellow-100' : 'bg-gray-100 grayscale'
                        }`}
                      >
                        {ach.icon}
                      </div>
                      <p className={`text-xs ${unlocked ? 'text-gray-700' : 'text-gray-400'}`}>{ach.name}</p>
                      <p className="text-[10px] text-gray-400">{unlocked ? '已解锁' : ach.condition}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Learning Goals */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Target className="w-5 h-5 mr-2 text-red-600" />
                学习目标
              </h2>

              <div className="space-y-4">
                {learningSkills.slice(0, 2).map((skill) => (
                  <div key={skill.id} className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900">继续学习「{skill.name}」</p>
                    <p className="text-sm text-blue-700">
                      进度 {Math.round((skill.xp / skill.maxXp) * 100)}% · 还差 {Math.max(0, skill.maxXp - skill.xp)} XP
                    </p>
                    <div className="w-full bg-blue-200 rounded-full h-1 mt-2">
                      <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${(skill.xp / skill.maxXp) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
                {availableSkills.slice(0, 2).map((skill) => (
                  <div key={skill.id} className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900">开启「{skill.name}」</p>
                    <p className="text-sm text-green-700">前置已就绪，预计 {skill.estimatedHours} 小时</p>
                    <div className="w-full bg-green-200 rounded-full h-1 mt-2">
                      <div className="bg-green-600 h-1 rounded-full w-0"></div>
                    </div>
                  </div>
                ))}
                {learningSkills.length + availableSkills.length === 0 && (
                  <p className="text-gray-500 text-sm">所有技能都已掌握，去技能树添加新目标吧</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[26rem]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">编辑资料</h3>
              <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">年龄</label>
                  <input
                    type="number"
                    min={10}
                    max={90}
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: Number(e.target.value) || 28 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">每日学习（小时）</label>
                  <input
                    type="number"
                    min={0.5}
                    max={12}
                    step={0.5}
                    value={form.dailyLearningHours}
                    onChange={(e) => setForm({ ...form, dailyLearningHours: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">学习偏好</label>
                <select
                  value={form.learningStyle}
                  onChange={(e) => setForm({ ...form, learningStyle: e.target.value as typeof form.learningStyle })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="visual">视觉型</option>
                  <option value="auditory">听觉型</option>
                  <option value="kinesthetic">动觉型</option>
                  <option value="reading">阅读型</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">难度偏好</label>
                <select
                  value={form.difficultyPreference}
                  onChange={(e) => setForm({ ...form, difficultyPreference: e.target.value as typeof form.difficultyPreference })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="easy">轻松</option>
                  <option value="medium">适中</option>
                  <option value="hard">挑战</option>
                </select>
              </div>
              <button
                onClick={handleSave}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
