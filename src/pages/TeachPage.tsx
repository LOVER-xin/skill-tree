import { useState } from 'react'
import {
  GraduationCap,
  Target,
  Sparkles,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Lightbulb,
} from 'lucide-react'
import { useAppStore, useAllSkills } from '../store'
import { SkillStatus } from '../types'
import {
  aiCreateLearningPlan,
  aiTeachLesson,
  hasAIConfig,
  AIError,
  AILearningPlan,
  AILesson,
} from '../utils/ai'

interface TeachSession {
  skillId: string
  mission: string
  plan: AILearningPlan
  completedTitles: string[]
}

const SESSION_KEY = 'ai-teach-session'

function loadSession(): TeachSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as TeachSession) : null
  } catch {
    return null
  }
}

export function TeachPage() {
  const allSkills = useAllSkills()
  const progressSkillXp = useAppStore((s) => s.progressSkillXp)
  const recordActivity = useAppStore((s) => s.recordActivity)
  const addXp = useAppStore((s) => s.addXp)

  const [session, setSession] = useState<TeachSession | null>(loadSession())
  const [skillId, setSkillId] = useState('')
  const [mission, setMission] = useState('')
  const [planLoading, setPlanLoading] = useState(false)
  const [planError, setPlanError] = useState<string | null>(null)

  // 当前课程状态
  const [lessonLoading, setLessonLoading] = useState(false)
  const [lesson, setLesson] = useState<AILesson | null>(null)
  const [lessonError, setLessonError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [quizResult, setQuizResult] = useState<{
    pass: boolean
    wrong: { question: string; explanation: string }[]
  } | null>(null)

  const activeSkill = allSkills.find((s) => s.id === (session?.skillId ?? skillId))
  const plan = session?.plan ?? null
  const currentTopic =
    plan && session
      ? (plan.topics.find((t) => !session.completedTitles.includes(t.title)) ?? null)
      : null
  const progress =
    plan && session ? Math.round((session.completedTitles.length / plan.topics.length) * 100) : 0

  const saveSession = (s: TeachSession) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(s))
    setSession(s)
  }

  const handleCreatePlan = async () => {
    const skill = allSkills.find((s) => s.id === skillId)
    if (!skill) return
    setPlanError(null)
    setLesson(null)
    if (!hasAIConfig()) {
      setPlanError('尚未配置 AI 服务：请到「我的 → 设置」填写 API Key')
      return
    }
    setPlanLoading(true)
    try {
      const plan = await aiCreateLearningPlan(
        {
          name: skill.name,
          description: skill.description,
          category: skill.category,
          prerequisites: skill.prerequisites,
          status: skill.status,
        },
        mission.trim()
      )
      saveSession({ skillId: skill.id, mission: mission.trim() || plan.mission, plan, completedTitles: [] })
      recordActivity(`创建了「${skill.name}」的 AI 私教学习计划（${plan.topics.length} 课）`, 'skill')
    } catch (e) {
      setPlanError(e instanceof AIError ? e.message : (e as Error).message)
    } finally {
      setPlanLoading(false)
    }
  }

  const handleStartLesson = async () => {
    if (!session || !currentTopic || !activeSkill) return
    setLessonError(null)
    setLesson(null)
    setQuizResult(null)
    if (!hasAIConfig()) {
      setLessonError('尚未配置 AI 服务：请到「我的 → 设置」填写 API Key')
      return
    }
    setLessonLoading(true)
    try {
      const lesson = await aiTeachLesson(
        { name: activeSkill.name, description: activeSkill.description },
        currentTopic,
        session.mission,
        session.completedTitles
      )
      setLesson(lesson)
      setAnswers(lesson.quiz.map(() => -1))
    } catch (e) {
      setLessonError(e instanceof AIError ? e.message : (e as Error).message)
    } finally {
      setLessonLoading(false)
    }
  }

  const handleSubmitQuiz = () => {
    if (!session || !lesson || !activeSkill) return
    const wrong = lesson.quiz
      .map((q, i) => ({ q, answer: answers[i] }))
      .filter(({ q, answer }) => answer !== q.answerIndex)
    if (wrong.length === 0) {
      // 全对 → 完成本课：技能 XP 推进 + 活动记录
      const nextCompleted = [...session.completedTitles, lesson.title]
      saveSession({ ...session, completedTitles: nextCompleted })
      progressSkillXp(activeSkill.id, 1)
      addXp(10, `完成 AI 私教课程「${lesson.title}」`)
      recordActivity(`完成 AI 私教课程「${lesson.title}」（${activeSkill.name}）`, 'skill')
      setLesson(null)
      setQuizResult(null)
    } else {
      setQuizResult({
        pass: false,
        wrong: wrong.map(({ q }) => ({ question: q.question, explanation: q.explanation })),
      })
    }
  }

  const handleReset = () => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
    setLesson(null)
    setQuizResult(null)
    setMission('')
    setSkillId('')
  }

  const selectableSkills = allSkills.filter((s) => s.status !== SkillStatus.LOCKED)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <GraduationCap className="w-8 h-8 mr-3 text-indigo-600" />
            AI 私教
          </h1>
          <p className="text-gray-600 mt-2">
            基于认知科学的一对一教学：动机驱动（MISSION）、一课一目标、测验提取练习、真实资源引用
          </p>
        </div>

        {/* 配置区：选技能 + 动机 */}
        {!session && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-indigo-600" />
              创建学习计划
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  选择要学习的技能（关联技能树）
                </label>
                <select
                  value={skillId}
                  onChange={(e) => setSkillId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">请选择技能...</option>
                  {selectableSkills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}（{s.status === 'completed' ? '已掌握' : s.status === 'learning' ? '学习中' : '可学习'}）
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  学习动机（MISSION）—— 为什么学它？所有课程都围绕这个展开
                </label>
                <textarea
                  rows={2}
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  placeholder="例如：想两个月后能独立用 TypeScript 写一个中后台项目"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              {planError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{planError}</div>
              )}
              <button
                onClick={handleCreatePlan}
                disabled={!skillId || planLoading}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {planLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>AI 正在制定学习计划...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>AI 创建学习计划</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 学习会话区 */}
        {session && plan && activeSkill && (
          <div className="space-y-6">
            {/* 会话头部 */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-indigo-600" />
                    {activeSkill.name} · AI 私教课程
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    🎯 动机：{session.mission}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {session.completedTitles.length}/{plan.topics.length} 课
                    </p>
                    <div className="w-28 bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    title="重置会话"
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 学习计划（最近发展区：按顺序解锁） */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-indigo-600" />
                学习计划（按最近发展区排序，一课一目标）
              </h3>
              <div className="space-y-2">
                {plan.topics.map((t, i) => {
                  const done = session.completedTitles.includes(t.title)
                  const isCurrent = currentTopic?.title === t.title
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border transition-colors ${
                        done
                          ? 'bg-green-50 border-green-200'
                          : isCurrent
                          ? 'bg-indigo-50 border-indigo-300'
                          : 'bg-gray-50 border-gray-100 opacity-60'
                      }`}
                    >
                      <div className="flex items-start">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mr-3 ${
                          done ? 'bg-green-500 text-white' : isCurrent ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'
                        }`}>
                          {done ? '✓' : i + 1}
                        </span>
                        <div className="flex-1">
                          <p className={`font-medium text-sm ${done ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                            {t.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">🎯 {t.objective}</p>
                          {isCurrent && !done && (
                            <p className="text-[11px] text-indigo-600 mt-0.5">💡 {t.why}</p>
                          )}
                        </div>
                        {isCurrent && !done && (
                          <button
                            onClick={handleStartLesson}
                            disabled={lessonLoading}
                            className="ml-3 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center space-x-1"
                          >
                            {lessonLoading ? (
                              <>
                                <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
                                <span>备课中...</span>
                              </>
                            ) : (
                              <>
                                <span>开始本课</span>
                                <ArrowRight className="w-3 h-3" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              {plan.topics.every((t) => session.completedTitles.includes(t.title)) && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <p className="text-green-700 font-medium">🎉 恭喜！全部课程完成</p>
                  <p className="text-xs text-green-600 mt-1">
                    已推进「{activeSkill.name}」的技能进度。去技能树看看它的变化，或重置会话学习下一个方向
                  </p>
                </div>
              )}
            </div>

            {/* 课程内容 */}
            {lesson && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{lesson.title}</h3>

                {/* 知识讲解 */}
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap mb-4 text-sm">
                  {lesson.concept}
                </div>

                {lesson.tip && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
                    <Lightbulb className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">{lesson.tip}</p>
                  </div>
                )}

                {/* 测验（提取练习） */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-800 mb-2">
                    📝 提取练习：不看上面内容，从记忆回答（全对才算完成）
                  </p>
                  <div className="space-y-4">
                    {lesson.quiz.map((q, qi) => (
                      <div key={qi}>
                        <p className="text-sm font-medium text-gray-900 mb-1.5">{qi + 1}. {q.question}</p>
                        <div className="space-y-1">
                          {q.options.map((opt, oi) => {
                            const selected = answers[qi] === oi
                            const isCorrect = quizResult && !quizResult.pass && oi === q.answerIndex
                            const isWrongPick = quizResult && !quizResult.pass && selected && oi !== q.answerIndex
                            return (
                              <button
                                key={oi}
                                onClick={() => {
                                  setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))
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
                </div>

                {quizResult && !quizResult.pass && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-700 mb-2">
                      有 {quizResult.wrong.length} 道答错了：
                    </p>
                    {quizResult.wrong.map((w, i) => (
                      <p key={i} className="text-xs text-red-600 mb-1">
                        ❌ {w.question} — {w.explanation}
                      </p>
                    ))}
                    <p className="text-xs text-gray-500 mt-2">回顾上面知识后重试（这正是记忆巩固的过程）</p>
                  </div>
                )}

                {/* 资源引用 */}
                <div className="mb-4 p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg">
                  <p className="text-xs font-medium text-indigo-700 mb-1.5">📚 本课推荐的权威资源（深入阅读）</p>
                  <div className="space-y-1">
                    {lesson.resources.map((r, i) => (
                      <a
                        key={i}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs text-gray-700 hover:text-indigo-700 bg-white rounded px-2 py-1 border border-indigo-100"
                      >
                        <span className="mr-1">{r.type === 'course' ? '🎓' : r.type === 'video' ? '🎬' : '📄'}</span>
                        <span className="flex-1 truncate">{r.title}</span>
                        <span className="text-xs text-gray-400 mr-2">{r.source}</span>
                        <span className="text-indigo-500">打开 →</span>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={answers.some((a) => a === -1)}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    提交答案（全对完成本课）
                  </button>
                  <button
                    onClick={() => setLesson(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    稍后再做
                  </button>
                </div>
              </div>
            )}

            {lessonError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{lessonError}</div>
            )}
          </div>
        )}

        {/* 首页引导 */}
        {!session && (
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-6 text-center">
            <GraduationCap className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-indigo-900 mb-2">怎么开始？</h3>
            <p className="text-sm text-indigo-700">
              1. 选一个技能（从你的技能树中）→ 2. 写下你的学习动机 → 3. AI 制定按「最近发展区」排序的学习计划
              <br />
              每课 = 讲解 + 提取练习测验 + 真实资源。完成课程会推进技能树的技能进度
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
