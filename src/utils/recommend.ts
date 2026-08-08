import { SkillNode, Circle, SkillStatus } from '../types'

export interface SkillRecommendation {
  skill: SkillNode
  score: number
  reason: string
  learningPath: string[]
}

/**
 * 本地规则推荐：为当前技能树生成「接下来学什么」的推荐。
 * 规则（无需后端，纯本地推导）：
 *  1. 只推荐 status = AVAILABLE 的技能（前置已全部完成）
 *  2. 高需求技能（React/TypeScript/Node.js/Python/AI）加权
 *  3. 叶子节点（children 为空）优先 —— 完成后无后续依赖，收益确定
 *  4. 预估时长短的优先 —— 快速获得正反馈
 *  5. 按 1-10 打分排序
 */
export function recommendSkills(skills: SkillNode[], limit = 3): SkillRecommendation[] {
  const highDemand = ['React', 'TypeScript', 'Python', 'Node.js', 'AI', 'Vue', 'Next.js']

  const available = skills.filter((s) => s.status === SkillStatus.AVAILABLE)

  const scored = available.map((skill) => {
    let score = 5
    const reasons: string[] = []

    // 高需求技能
    if (skill.tags.some((t) => highDemand.includes(t))) {
      score += 2
      reasons.push('市场需求高')
    }

    // 叶子节点优先
    if (skill.children.length === 0) {
      score += 1.5
      reasons.push('无后续依赖，可完整掌握')
    } else {
      score += 0.5
    }

    // 预估时长短加分
    if (skill.estimatedHours <= 20) {
      score += 1
      reasons.push('短期可完成')
    } else if (skill.estimatedHours >= 80) {
      score -= 0.5
    }

    // 已有部分进度
    if (skill.xp > 0) {
      score += 1
      reasons.push(`已有 ${Math.round((skill.xp / skill.maxXp) * 100)}% 进度`)
    }

    // 自定义优先级（数据包中人工标注）
    if (skill.aiRecommendation?.priority) {
      score = (score + skill.aiRecommendation.priority) / 2
    }

    const prereqNames = skill.prerequisites
      .map((id) => skills.find((s) => s.id === id)?.name)
      .filter(Boolean)

    const reason =
      reasons.length > 0
        ? `${prereqNames.length ? `前置「${prereqNames.join('、')}」已完成，` : ''}${reasons.join('，')}`
        : '前置技能已完成，可以开始学习'

    const learningPath = buildLearningPath(skill, skills, 4)

    return { skill, score: Math.min(10, score), reason, learningPath }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/** 从当前技能出发，沿 children 构建学习路径 */
export function buildLearningPath(
  skill: SkillNode,
  allSkills: SkillNode[],
  maxDepth = 5
): string[] {
  const path: string[] = [skill.name]
  let current = skill
  for (let i = 0; i < maxDepth - 1; i++) {
    const next = current.children
      .map((id) => allSkills.find((s) => s.id === id))
      .find(Boolean)
    if (!next) break
    path.push(next.name)
    current = next
  }
  return path
}

export interface CircleRecommendation {
  circle: Circle
  matchCount: number
  matchPercent: number
  matchedTags: string[]
}

/**
 * 圈子推荐：根据用户已掌握/在学的技能标签，计算与圈子的匹配度。
 * 已加入的圈子不重复推荐。
 */
export function recommendCircles(
  circles: Circle[],
  joinedIds: string[],
  userSkillTags: string[],
  limit = 2
): CircleRecommendation[] {
  const tagSet = new Set(userSkillTags)
  const candidates = circles.filter((c) => !joinedIds.includes(c.id))

  const scored = candidates.map((circle) => {
    const matchedTags = circle.skillTags.filter((t) => tagSet.has(t))
    const matchCount = matchedTags.length
    const matchPercent =
      circle.skillTags.length > 0
        ? Math.round((matchCount / Math.max(circle.skillTags.length, 1)) * 100)
        : 0
    return { circle, matchCount, matchPercent, matchedTags }
  })

  return scored
    .sort((a, b) => b.matchPercent - a.matchPercent || b.matchCount - a.matchCount)
    .slice(0, limit)
}

/** 从技能数据中提取用户技能标签集合 */
export function collectUserSkillTags(skills: SkillNode[]): string[] {
  const tags = new Set<string>()
  skills
    .filter((s) => s.status !== SkillStatus.LOCKED)
    .forEach((s) => s.tags.forEach((t) => tags.add(t)))
  return Array.from(tags)
}
