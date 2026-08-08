import { useMemo, useState } from 'react'
import { Users, Hash, TrendingUp, MessageCircle, Heart, BookOpen, Calendar } from 'lucide-react'
import { useAppStore } from '../store'
import { recommendCircles, collectUserSkillTags } from '../utils/recommend'
import { useAllSkills } from '../store'
import { SkillStatus } from '../types'

type Tab = 'recommend' | 'joined' | 'hot'

export function CirclesPage() {
  const circles = useAppStore((s) => s.circles)
  const joinedCircleIds = useAppStore((s) => s.joinedCircleIds)
  const joinCircle = useAppStore((s) => s.joinCircle)
  const leaveCircle = useAppStore((s) => s.leaveCircle)
  const notes = useAppStore((s) => s.notes)
  const noteLikes = useAppStore((s) => s.noteLikes)
  const gameStats = useAppStore((s) => s.gameStats)
  const allSkills = useAllSkills()

  const [tab, setTab] = useState<Tab>('recommend')

  const masteredTags = useMemo(
    () =>
      collectUserSkillTags(
        allSkills.filter((s) => s.status !== SkillStatus.LOCKED)
      ),
    [allSkills]
  )

  const circleRecs = useMemo(
    () => recommendCircles(circles, joinedCircleIds, masteredTags, 3),
    [circles, joinedCircleIds, masteredTags]
  )

  const displayedCircles =
    tab === 'joined'
      ? circles.filter((c) => joinedCircleIds.includes(c.id))
      : tab === 'hot'
      ? [...circles].sort((a, b) => b.memberCount - a.memberCount)
      : circleRecs.map((r) => r.circle)

  const totalLikes = Object.values(noteLikes).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-2">
            <Users className="w-8 h-8 mr-3 text-purple-600" />
            学习圈子
          </h1>
          <p className="text-gray-600">找到志同道合的学习伙伴，一起成长进步</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setTab('recommend')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                tab === 'recommend'
                  ? 'bg-white text-blue-600 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              推荐圈子
            </button>
            <button
              onClick={() => setTab('joined')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                tab === 'joined'
                  ? 'bg-white text-blue-600 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              我的圈子（{joinedCircleIds.length}）
            </button>
            <button
              onClick={() => setTab('hot')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                tab === 'hot'
                  ? 'bg-white text-blue-600 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              热门圈子
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">已加入圈子</p>
                <p className="text-2xl font-bold text-gray-900">{joinedCircleIds.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">学习笔记</p>
                <p className="text-2xl font-bold text-gray-900">{notes.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">获得点赞</p>
                <p className="text-2xl font-bold text-gray-900">{totalLikes}</p>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
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
        </div>

        {/* Circle Cards */}
        {displayedCircles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCircles.map((circle) => {
              const isJoined = joinedCircleIds.includes(circle.id)
              const rec = circleRecs.find((r) => r.circle.id === circle.id)
              return (
                <div key={circle.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{circle.name}</h3>
                        <p className="text-gray-600 text-sm mb-3">{circle.description}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2">
                        {circle.category}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center space-x-2 mb-4">
                      <Hash className="w-4 h-4 text-gray-400" />
                      <div className="flex flex-wrap gap-1">
                        {circle.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {circle.tags.length > 3 && (
                          <span className="text-gray-500 text-xs">+{circle.tags.length - 3}</span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{circle.memberCount.toLocaleString()} 成员</span>
                      </div>
                      {rec && rec.matchPercent > 0 && (
                        <span className="text-xs text-green-600 font-medium">
                          与你的技能匹配 {rec.matchPercent}%
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => (isJoined ? leaveCircle(circle.id) : joinCircle(circle.id))}
                      className={`w-full py-2 rounded-lg font-medium transition-colors ${
                        isJoined
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isJoined ? '退出圈子' : '加入圈子'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {tab === 'joined' ? '还没有加入圈子' : '暂无圈子'}
            </h3>
            <p className="text-gray-600 mb-4">去推荐或热门列表看看，找到适合你的学习圈子</p>
            <button
              onClick={() => setTab('recommend')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              查看推荐
            </button>
          </div>
        )}

        {/* AI Recommendations */}
        {circleRecs.length > 0 && (
          <div className="mt-12">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-6">
                <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">为你推荐（基于你的技能标签）</h2>
                <MessageCircle className="w-4 h-4 text-blue-400 ml-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {circleRecs.map(({ circle, matchPercent, matchedTags }) => (
                  <div key={circle.id} className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">{circle.name}</h3>
                    <p className="text-blue-700 text-sm mb-3">
                      你在学 {matchedTags.join('、')}，与这个圈子的方向高度契合
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-600 font-medium">匹配度: {matchPercent}%</span>
                      <button
                        onClick={() => joinCircle(circle.id)}
                        className="text-blue-600 text-sm font-medium hover:text-blue-800"
                      >
                        立即加入
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
