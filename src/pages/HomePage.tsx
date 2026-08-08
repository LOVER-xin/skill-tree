import { Link, useNavigate } from 'react-router-dom'
import {
  TreePine,
  Target,
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  Trophy,
  Zap,
  Calendar,
  BarChart3,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { useAppStore, getLevel } from '../store'
import { useAllSkills } from '../store'
import { recommendSkills } from '../utils/recommend'
import { SkillStatus } from '../types'
import { formatDuration } from '../utils'

export function HomePage() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const tasks = useAppStore((s) => s.tasks)
  const toggleSubtask = useAppStore((s) => s.toggleSubtask)
  const gameStats = useAppStore((s) => s.gameStats)
  const allSkills = useAllSkills()

  const level = getLevel(user.totalXp)
  const masteredCount = allSkills.filter((s) => s.status === SkillStatus.COMPLETED).length

  // 今日推荐：本地规则算法（前置完成 + 高需求 + 路径）
  const recommendations = recommendSkills(allSkills, 3)
  // 今日任务：未完成的前 3 个
  const todayTasks = tasks
    .filter((t) => t.status !== 'completed')
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              智能驱动的
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                技能成长
              </span>
              平台
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              通过游戏化学习、智能推荐和社交互动，让技能成长变得有趣而高效。
              构建你的专属技能树，加入志同道合的圈子，记录成长的每一步。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/skill-tree"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <TreePine className="w-5 h-5" />
                <span>开始技能树之旅</span>
              </Link>
              <Link
                to="/circles"
                className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Users className="w-5 h-5" />
                <span>发现学习圈子</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">当前等级</p>
                  <p className="text-2xl font-bold text-gray-900">Lv.{level}</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总经验值</p>
                  <p className="text-2xl font-bold text-gray-900">{user.totalXp.toLocaleString()}</p>
                </div>
                <Zap className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">连续学习</p>
                  <p className="text-2xl font-bold text-gray-900">{gameStats.currentStreak}天</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">已掌握技能</p>
                  <p className="text-2xl font-bold text-gray-900">{masteredCount}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">核心功能</h2>
            <p className="text-lg text-gray-600">一站式技能成长解决方案</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TreePine className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">智能技能树</h3>
              <p className="text-gray-600">
                可视化技能依赖关系，按前置进度智能推荐学习路径，让学习更有方向感
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">任务管理</h3>
              <p className="text-gray-600">
                Notion风格的任务管理，将技能学习拆解为可执行的具体任务
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">学习圈子</h3>
              <p className="text-gray-600">
                基于技能标签的智能圈子推荐，找到志同道合的学习伙伴
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">微博式笔记</h3>
              <p className="text-gray-600">
                Flomo风格的轻量级笔记，记录学习过程中的思考和感悟
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">今日推荐</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Recommendations */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">智能推荐技能</h3>
                <Sparkles className="w-4 h-4 text-yellow-500 ml-2" />
              </div>
              {recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map(({ skill, reason, learningPath }) => (
                    <div key={skill.id} className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{skill.name}</p>
                          <p className="text-sm text-gray-600">{reason}</p>
                          <p className="text-xs text-blue-600 mt-1">
                            路径: {learningPath.join(' → ')} · 约{skill.estimatedHours}小时
                          </p>
                        </div>
                        <button
                          onClick={() => navigate('/skill-tree')}
                          className="flex items-center text-blue-600 text-sm font-medium hover:text-blue-800 whitespace-nowrap ml-3"
                        >
                          开始学习 <ArrowRight className="w-3 h-3 ml-1" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  所有技能都已掌握或解锁中，去技能树添加新技能吧
                </p>
              )}
            </div>

            {/* Today's Tasks */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">今日任务</h3>
              </div>
              {todayTasks.length > 0 ? (
                <div className="space-y-3">
                  {todayTasks.map((task) => {
                    const done = task.subtasks.filter((st) => st.completed).length
                    const total = task.subtasks.length
                    return (
                      <div key={task.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          className="mr-3 rounded"
                          checked={task.status === 'completed'}
                          onChange={() => {
                            if (task.status !== 'completed' && total > 0) {
                              // 勾选第一个未完成的子任务作为开始
                              const next = task.subtasks.find((st) => !st.completed)
                              if (next) toggleSubtask(task.id, next.id)
                            }
                          }}
                        />
                        <div className="flex-1">
                          <p className={`font-medium text-gray-900 ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                            {task.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            预计{formatDuration(task.estimatedMinutes)} · {done}/{total} 子任务
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">今天没有待办任务，去任务页创建吧</p>
              )}
              <Link
                to="/tasks"
                className="mt-4 inline-flex items-center text-green-600 text-sm font-medium hover:text-green-800"
              >
                查看全部任务 <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
