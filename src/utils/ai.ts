/**
 * AI 服务层：OpenAI 兼容 API 客户端（支持 DeepSeek / 通义 / Kimi / OpenAI 等）
 * - 配置存 localStorage，纯前端直连
 * - 所有调用返回结构化 JSON，解析失败抛 AIError（明确错误，不静默降级）
 */
import { SkillNode, SkillTreeTemplate, SkillStatus } from '../types'

export interface AIConfig {
  baseUrl: string // 如 https://api.deepseek.com/v1
  apiKey: string
  model: string // 如 deepseek-chat
}

const CONFIG_KEY = 'ai-skill-tree-ai-config'

export const DEFAULT_AI_CONFIG: AIConfig = {
  baseUrl: 'https://api.deepseek.com/v1',
  apiKey: '',
  model: 'deepseek-chat',
}

export function getAIConfig(): AIConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (!raw) return { ...DEFAULT_AI_CONFIG }
    return { ...DEFAULT_AI_CONFIG, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_AI_CONFIG }
  }
}

export function saveAIConfig(cfg: AIConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg))
}

export function hasAIConfig(): boolean {
  const cfg = getAIConfig()
  return cfg.apiKey.trim().length > 0 && cfg.baseUrl.trim().length > 0
}

export class AIError extends Error {
  constructor(message: string, public code: 'not-configured' | 'network' | 'http' | 'parse' | 'empty') {
    super(message)
    this.name = 'AIError'
  }
}

/** 可注入 fetch（测试用） */
export let aiFetcher: typeof fetch = (...args) => fetch(...args)
export function setAIFetcher(f: typeof fetch): void {
  aiFetcher = f
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/** 核心：调用 OpenAI 兼容 chat/completions */
export async function aiChat(
  messages: ChatMessage[],
  opts: { json?: boolean; temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const cfg = getAIConfig()
  if (!cfg.apiKey.trim()) {
    throw new AIError('尚未配置 AI 服务：请到「我的 → 设置」填写 API Key', 'not-configured')
  }
  const url = `${cfg.baseUrl.replace(/\/+$/, '')}/chat/completions`
  let res: Response
  try {
    res = await aiFetcher(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxTokens ?? 4096,
        ...(opts.json ? { response_format: { type: 'json_object' } } : {}),
      }),
    })
  } catch (e) {
    throw new AIError(
      `无法连接 AI 服务（${cfg.baseUrl}）：${(e as Error).message}。请检查 Base URL 与网络`,
      'network'
    )
  }
  if (!res.ok) {
    let detail = ''
    try {
      const body = await res.json()
      detail = (body as { error?: { message?: string } }).error?.message ?? ''
    } catch { /* ignore */ }
    throw new AIError(`AI 服务返回错误 ${res.status}：${detail || res.statusText}`, 'http')
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new AIError('AI 服务返回内容为空', 'empty')
  }
  return content
}

/** 从响应中提取 JSON（兼容 markdown 代码块包裹、裸对象序列、对象包装等常见 AI 输出格式） */
export function extractJson<T>(text: string): T {
  let cleaned = text.trim()
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) cleaned = fence[1].trim()

  // 1. 直接解析
  try {
    return JSON.parse(cleaned) as T
  } catch { /* fallthrough */ }

  // 2. 裸对象序列 → 包成数组（DeepSeek json_object 模式常见：{"a":1},{"b":2}）
  try {
    return JSON.parse(`[${cleaned}]`) as T
  } catch { /* fallthrough */ }

  // 3. 截取首个 { 到最后一个 } 的完整对象
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start !== -1 && end > start) {
    const sub = cleaned.slice(start, end + 1)
    try {
      return JSON.parse(sub) as T
    } catch { /* fallthrough */ }
    try {
      return JSON.parse(`[${sub}]`) as T
    } catch { /* fallthrough */ }
  }

  throw new AIError(
    `AI 返回内容无法解析为 JSON。原文片段：${cleaned.slice(0, 120)}`,
    'parse'
  )
}

/** 兼容对象包装：如果顶层是对象，尝试提取其中的数组字段（如 {data:[...]} / {items:[...]}） */
function unwrapArray(data: unknown): unknown {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    for (const v of Object.values(data)) {
      if (Array.isArray(v)) return v
    }
  }
  return data
}

/** 带重试的 JSON 调用 */
async function aiJson<T>(
  system: string,
  user: string,
  validate: (data: unknown) => data is T,
  retries = 2
): Promise<T> {
  let lastErr: Error | null = null
  for (let i = 0; i <= retries; i++) {
    try {
      const content = await aiChat(
        [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        { json: true, temperature: 0.7 }
      )
      const data = extractJson<unknown>(content)
      // 优先整体校验（对象包装型结果如 {issues:[...]}）；失败再尝试解包数组（数组型结果）
      if (validate(data)) {
        return data
      }
      const unwrapped = unwrapArray(data)
      if (unwrapped !== data && validate(unwrapped)) {
        return unwrapped
      }
      throw new AIError('AI 返回的数据结构不符合预期，请重试', 'parse')
    } catch (e) {
      lastErr = e as Error
      if (e instanceof AIError && e.code === 'parse' && i < retries) continue
      throw e
    }
  }
  throw lastErr ?? new AIError('AI 调用失败', 'network')
}

/* ==================== 技能相关建议 ==================== */

export interface AISkillSuggestion {
  name: string
  description: string
  category: string
  estimatedHours: number
  tags: string[]
  reason: string
  learningPath: string[]
}

function isSkillSuggestionList(data: unknown): data is AISkillSuggestion[] {
  return (
    Array.isArray(data) &&
    data.every(
      (s) =>
        typeof s === 'object' &&
        s !== null &&
        typeof (s as AISkillSuggestion).name === 'string' &&
        typeof (s as AISkillSuggestion).description === 'string'
    )
  )
}

/** AI 推荐技能：基于当前技能树状态与用户进度 */
export async function aiRecommendSkills(
  tree: SkillTreeTemplate | undefined,
  user: { name: string; totalXp: number } | null
): Promise<AISkillSuggestion[]> {
  const treeSummary = tree
    ? tree.skills
        .map((s) => `${s.name}(${s.status}${s.status === SkillStatus.COMPLETED ? '' : `,进度${Math.round((s.xp / s.maxXp) * 100)}%`})`)
        .join('、')
    : '（无）'
  const system =
    '你是技能成长规划师。根据用户的技能树状态，推荐接下来最值得学习的 3 个技能。' +
    '只推荐用户尚未掌握的技能；优先推荐前置已完成的技能；理由要具体（结合前置关系、市场需求、学习路径）。' +
    '重要：不得推荐技能树中已存在的技能（名称完全相同或高度相似的都不行），只推荐全新的技能方向。' +
    '返回 JSON 数组，每项格式：{"name":技能名,"description":简介,"category":分类,"estimatedHours":预估小时数,"tags":[标签],"reason":推荐理由,"learningPath":["学习路径"]}'
  const userPrompt = `用户：${user?.name ?? '学习者'}（总经验 ${user?.totalXp ?? 0}）\n当前技能树「${tree?.name ?? ''}」节点状态：${treeSummary}\n请推荐 3 个技能。`
  return aiJson<AISkillSuggestion[]>(system, userPrompt, isSkillSuggestionList)
}

/** AI 技能衍化：为指定技能生成子技能分支建议 */
export async function aiGenerateSkillBranches(
  tree: SkillTreeTemplate | undefined,
  skill: SkillNode
): Promise<AISkillSuggestion[]> {
  const siblings = tree?.skills.filter((s) => s.id !== skill.id).map((s) => s.name).join('、') ?? '（无）'
  const system =
    '你是技能树架构师。为指定的技能节点设计 3-4 个合理的子技能分支（进阶方向），用于扩展技能树。' +
    '子技能必须与父技能直接相关且是真实的进阶方向；不要重复已有技能（包括技能树中其他节点和父技能本身）。' +
    '返回 JSON 数组，每项格式：{"name":子技能名,"description":简介,"category":分类,"estimatedHours":预估小时数,"tags":[标签],"reason":"为什么这个分支值得学","learningPath":["父技能名","子技能名","更进阶方向"]}'
  const userPrompt = `技能树「${tree?.name ?? ''}」已有技能：${siblings}\n请为技能「${skill.name}」（${skill.description}）设计子技能分支。`
  return aiJson<AISkillSuggestion[]>(system, userPrompt, isSkillSuggestionList)
}

/* ==================== 任务建议 ==================== */

export interface AITaskSuggestion {
  title: string
  description: string
  estimatedMinutes: number
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  subtasks: { title: string; estimatedMinutes: number }[]
  reason: string
}

function isTaskSuggestionList(data: unknown): data is AITaskSuggestion[] {
  return (
    Array.isArray(data) &&
    data.every(
      (t) =>
        typeof t === 'object' &&
        t !== null &&
        typeof (t as AITaskSuggestion).title === 'string' &&
        typeof (t as AITaskSuggestion).description === 'string' &&
        Array.isArray((t as AITaskSuggestion).subtasks)
    )
  )
}

/** AI 生成学习任务：围绕技能拆解可执行任务 */
export async function aiGenerateTasks(
  skill: SkillNode,
  existingTasks: { title: string }[]
): Promise<AITaskSuggestion[]> {
  const system =
    '你是学习任务拆解专家。为指定技能设计 2-3 个可执行的学习任务，每个任务带 2-3 个子任务（学习/实践/总结结构）。' +
    '任务要具体可执行、时长合理（20-120 分钟）。' +
    '返回 JSON 数组，每项格式：{"title":任务标题,"description":任务说明,"estimatedMinutes":总分钟数,"priority":"low|medium|high","tags":[标签],"subtasks":[{"title":子任务,"estimatedMinutes":分钟}],"reason":为什么这样做}'
  const userPrompt = `技能：${skill.name}（${skill.description}）\n已有任务：${existingTasks.map((t) => t.title).join('、') || '（无）'}\n请设计学习任务。`
  return aiJson<AITaskSuggestion[]>(system, userPrompt, isTaskSuggestionList)
}

/* ==================== 圈子建议 ==================== */

export interface AICircleSuggestion {
  name: string
  description: string
  category: string
  tags: string[]
  skillTags: string[]
  reason: string
}

function isCircleSuggestionList(data: unknown): data is AICircleSuggestion[] {
  return (
    Array.isArray(data) &&
    data.every(
      (c) =>
        typeof c === 'object' &&
        c !== null &&
        typeof (c as AICircleSuggestion).name === 'string' &&
        typeof (c as AICircleSuggestion).description === 'string' &&
        Array.isArray((c as AICircleSuggestion).skillTags)
    )
  )
}

/** AI 推荐圈子：基于用户技能标签生成学习圈子建议 */
export async function aiRecommendCircles(
  userSkillTags: string[],
  existingCircles: { name: string }[]
): Promise<AICircleSuggestion[]> {
  const system =
    '你是学习社区运营专家。根据用户正在学习的技能，推荐 3 个值得加入的学习圈子（可以是已有的知名社区风格或全新的主题圈子）。' +
    '圈子要与用户技能高度相关，说明匹配理由。' +
    '返回 JSON 数组，每项格式：{"name":圈子名,"description":圈子简介,"category":分类,"tags":[标签],"skillTags":[相关技能标签],"reason":"匹配理由"}'
  const userPrompt = `用户正在学习/已掌握：${userSkillTags.join('、') || '（暂无）'}\n已有圈子：${existingCircles.map((c) => c.name).join('、') || '（无）'}\n请推荐 3 个学习圈子。`
  return aiJson<AICircleSuggestion[]>(system, userPrompt, isCircleSuggestionList)
}

/* ==================== 教学步骤生成 ==================== */

export interface AITeachStepSuggestion {
  title: string
  description: string
  type: 'concept' | 'practice' | 'project' | 'quiz'
  durationMinutes: number
  quizQuestions?: {
    question: string
    options: string[]
    answerIndex: number
    explanation: string
  }[]
  resources?: {
    type: 'course' | 'article' | 'video'
    title: string
    url: string
    source: string
    durationMinutes: number
    description: string
  }[]
}

function isTeachStepList(data: unknown): data is AITeachStepSuggestion[] {
  return (
    Array.isArray(data) &&
    data.every(
      (s) =>
        typeof s === 'object' &&
        s !== null &&
        typeof (s as AITeachStepSuggestion).title === 'string' &&
        typeof (s as AITeachStepSuggestion).description === 'string' &&
        ['concept', 'practice', 'project', 'quiz'].includes((s as AITeachStepSuggestion).type) &&
        ((s as AITeachStepSuggestion).type !== 'quiz' ||
          (Array.isArray((s as AITeachStepSuggestion).quizQuestions) &&
            (s as AITeachStepSuggestion).quizQuestions!.length >= 2 &&
            (s as AITeachStepSuggestion).quizQuestions!.every(
              (q) =>
                typeof q.question === 'string' &&
                Array.isArray(q.options) &&
                q.options.length >= 2 &&
                typeof q.answerIndex === 'number' &&
                q.answerIndex >= 0 &&
                q.answerIndex < q.options.length
            ))) &&
        ((s as AITeachStepSuggestion).resources === undefined ||
          (Array.isArray((s as AITeachStepSuggestion).resources) &&
            (s as AITeachStepSuggestion).resources!.every(
              (r) =>
                ['course', 'article', 'video'].includes(r.type) &&
                typeof r.title === 'string' &&
                typeof r.url === 'string' &&
                r.url.startsWith('http')
            )))
    )
  )
}

/** AI 生成教学步骤：为技能生成从概念到实践再到项目的深度学习路径（每步附真实学习资源） */
export async function aiGenerateTeachSteps(
  skill: { name: string; description: string; category: string },
  existingSteps: { title: string }[]
): Promise<AITeachStepSuggestion[]> {
  const system =
    '你是课程设计专家。为指定技能设计 4-6 步深度学习路径，遵循「概念理解 → 动手实践 → 综合项目 → 检验巩固」的递进结构，逐步加深难度。' +
    '步骤要具体可执行（说明学什么、怎么学），不要重复已有步骤。' +
    '其中必须包含 1 个 quiz 类型步骤（检验知识），quiz 步骤必须带 quizQuestions（2-3 道单选题）。' +
    '每个步骤（包括 quiz 步骤）都必须带 1-2 个真实学习资源 resources（课程/文章/视频）；quiz 步骤的资源是「复习资料」，应指向能巩固测验所考知识的官方文档或教程页。' +
    '资源必须是真实存在的知名网站：MDN（developer.mozilla.org）、JavaScript.info（zh.javascript.info）、freeCodeCamp（freecodecamp.org）、React 官方（react.dev）、Vue 官方（cn.vuejs.org）、TypeScript 官方（typescriptlang.org）、Node 官方（nodejs.org）、YouTube 官方频道等。禁止编造不存在的 URL。' +
    '返回 JSON 数组，每项格式：{"title":"步骤标题","description":"学什么/怎么学","type":"concept|practice|project|quiz","durationMinutes":分钟数,"quizQuestions":[{"question":"题目","options":["选项A","选项B","选项C","选项D"],"answerIndex":0,"explanation":"解析"}],"resources":[{"type":"course|article|video","title":"资源标题","url":"真实URL","source":"来源网站","durationMinutes":分钟,"description":"为什么学这个"}]}'
  const userPrompt = `技能：${skill.name}（${skill.description}，分类：${skill.category}）\n已有步骤：${existingSteps.map((s) => s.title).join('、') || '（无）'}\n请设计深度学习路径。`
  return aiJson<AITeachStepSuggestion[]>(system, userPrompt, isTeachStepList)
}

/* ==================== 结构检查 ==================== */

export interface AITreeFix {
  kind: 'relocate' | 'addPrerequisite' | 'removePrerequisite'
  skill: string // 技能名
  targetLayer?: number // relocate 目标层级（0=基础层）
  prerequisite?: string // add/remove 前置技能名
}

export interface AITreeIssue {
  type: 'layer' | 'prerequisite'
  skill: string
  issue: string
  suggestion: string
  fix: AITreeFix
}

export interface AITreeAudit {
  issues: AITreeIssue[]
}

function isTreeAudit(data: unknown): data is AITreeAudit {
  return (
    typeof data === 'object' &&
    data !== null &&
    Array.isArray((data as AITreeAudit).issues) &&
    (data as AITreeAudit).issues.every(
      (i) =>
        typeof i === 'object' &&
        i !== null &&
        ['layer', 'prerequisite'].includes(i.type) &&
        typeof i.skill === 'string' &&
        typeof i.issue === 'string' &&
        typeof i.suggestion === 'string' &&
        typeof i.fix === 'object' &&
        i.fix !== null &&
        ['relocate', 'addPrerequisite', 'removePrerequisite'].includes(i.fix.kind)
    )
  )
}

/** AI 结构检查：分析技能树的层级递进与前置关系合理性 */
export async function aiAuditTree(tree: SkillTreeTemplate): Promise<AITreeAudit> {
  const treeData = tree.skills.map((s) => ({
    name: s.name,
    category: s.category,
    prerequisites: s.prerequisites.map((p) => tree.skills.find((x) => x.id === p)?.name ?? p),
    status: s.status,
  }))
  const system =
    '你是技能树架构审查专家。审查技能树的层级递进与前置关系，找出以下问题（最多 5 条，按严重程度排序）：\n' +
    '1. 层级矛盾：基础技能被放在高级层、或高级技能放在基础层（结合前置关系判断应有的层级）\n' +
    '2. 缺失前置：技能缺少必要的先修技能（如 React 缺 JavaScript）\n' +
    '3. 冗余前置：前置关系不合理（如 HTML 依赖 TypeScript）\n' +
    '4. 孤立节点：没有任何前置也没有后继、且不属于该技能树方向\n' +
    '每项必须给出可执行的修复指令。\n' +
    '返回 JSON：{"issues":[{"type":"layer|prerequisite","skill":"技能名","issue":"问题描述","suggestion":"建议","fix":{"kind":"relocate|addPrerequisite|removePrerequisite","skill":"技能名","targetLayer":0,"prerequisite":"前置技能名"}}]}。' +
    'fix.kind 为 relocate 时必须提供 targetLayer（0=基础层，数值越大越高级）；为 addPrerequisite/removePrerequisite 时必须提供 prerequisite。'
  const userPrompt = `技能树「${tree.name}」（分类：${tree.category}）节点：\n${JSON.stringify(treeData, null, 1)}\n请审查并返回修复建议。`
  const result = await aiJson<AITreeAudit>(system, userPrompt, isTreeAudit)
  return result
}

/* ==================== 连接测试 ==================== */

/** 连接测试：直接使用传入的配置发请求，不读写 localStorage（避免污染已保存配置） */
export async function testAIConnection(cfg: AIConfig): Promise<{ ok: boolean; message: string }> {
  const url = `${cfg.baseUrl.replace(/\/+$/, '')}/chat/completions`
  try {
    const res = await aiFetcher(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: [
          { role: 'system', content: '你是连接测试助手。请只回复两个字：正常' },
          { role: 'user', content: '测试连接' },
        ],
        temperature: 0,
        max_tokens: 10,
      }),
    })
    if (!res.ok) {
      let detail = ''
      try {
        const body = await res.json()
        detail = (body as { error?: { message?: string } }).error?.message ?? ''
      } catch { /* ignore */ }
      return { ok: false, message: `AI 服务返回错误 ${res.status}：${detail || res.statusText}` }
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
    const content = data.choices?.[0]?.message?.content
    return { ok: true, message: `连接成功，模型返回：${(content ?? '').trim().slice(0, 50) || '（空）'}` }
  } catch (e) {
    return { ok: false, message: `无法连接 AI 服务（${cfg.baseUrl}）：${(e as Error).message}` }
  }
}
