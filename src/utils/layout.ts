/**
 * 技能树布局引擎：思维导图层层递进 + 金字塔结构
 * - 层级 = 最长前置链深度（基础技能在底层，高级技能逐层向上）
 * - 金字塔：底层节点多、逐层收窄，层内节点均分居中
 * - 新节点按前置层级分配空位，避免重叠
 */
import { SkillNode } from '../types'

export const NODE_W = 192
const NODE_GAP = 48
const LAYER_H = 140
const PAD_X = 100
const PAD_TOP = 60
const PAD_BOTTOM = 60

export interface LayoutResult {
  positions: Map<string, { x: number; y: number }>
  width: number
  height: number
}

/** 计算每个节点的层级（0 = 底层基础；depth = 最长前置链长度，含环防护） */
export function computeDepths(skills: SkillNode[]): Map<string, number> {
  const byId = new Map(skills.map((s) => [s.id, s]))
  const depth = new Map<string, number>()

  const visit = (id: string, stack: Set<string>): number => {
    if (depth.has(id)) return depth.get(id)!
    if (stack.has(id)) return 0
    const node = byId.get(id)
    if (!node) return 0
    stack.add(id)
    const d =
      node.prerequisites.length === 0
        ? 0
        : Math.max(
            0,
            ...node.prerequisites.map((p) => (byId.has(p) ? visit(p, stack) + 1 : 0))
          )
    stack.delete(id)
    depth.set(id, d)
    return d
  }

  skills.forEach((s) => visit(s.id, new Set()))
  return depth
}

/** 金字塔布局：底层在底部（y 大），逐层向上推进，层内均分居中 */
export function computeTreeLayout(skills: SkillNode[]): LayoutResult {
  const depth = computeDepths(skills)
  const layers = new Map<number, SkillNode[]>()
  skills.forEach((s) => {
    const d = depth.get(s.id) ?? 0
    if (!layers.has(d)) layers.set(d, [])
    layers.get(d)!.push(s)
  })

  const maxPerLayer = Math.max(1, ...Array.from(layers.values()).map((l) => l.length))
  const layerWidth = maxPerLayer * (NODE_W + NODE_GAP) - NODE_GAP
  const width = Math.max(820, layerWidth + PAD_X * 2)
  const layerCount = layers.size
  const height = Math.max(600, PAD_TOP + layerCount * LAYER_H + PAD_BOTTOM)

  const positions = new Map<string, { x: number; y: number }>()
  layers.forEach((nodes, d) => {
    const n = nodes.length
    const rowWidth = n * (NODE_W + NODE_GAP) - NODE_GAP
    const startX = (width - rowWidth) / 2 + NODE_W / 2
    // 底层在底部：d=0 时 y 最大；向上逐层递减
    const y = height - PAD_BOTTOM - (d + 1) * LAYER_H + LAYER_H / 2
    nodes.forEach((node, i) => {
      positions.set(node.id, { x: startX + i * (NODE_W + NODE_GAP), y })
    })
  })

  return { positions, width, height }
}

/** 为新节点找空位：按前置层级定位所在层，从左到右扫描未被占用的 x 位置 */
export function findSkillPosition(
  skills: SkillNode[],
  prerequisites: string[]
): { x: number; y: number } {
  const depth = computeDepths(skills)
  const myDepth =
    prerequisites.length === 0
      ? 0
      : Math.max(0, ...prerequisites.map((p) => depth.get(p) ?? 0)) + 1

  const layerNodes = skills.filter((s) => (depth.get(s.id) ?? 0) === myDepth)
  const occupiedX = layerNodes.map((s) => s.position.x)

  // 层内总宽度（预估）
  const maxDepth = Math.max(0, ...Array.from(depth.values()))
  const layerCount = maxDepth + 1
  const height = Math.max(600, PAD_TOP + layerCount * LAYER_H + PAD_BOTTOM)
  const y = height - PAD_BOTTOM - (myDepth + 1) * LAYER_H + LAYER_H / 2
  const maxX = Math.max(820 - NODE_W / 2 - 40, 200)

  for (let i = 0; i < layerNodes.length + 2; i++) {
    const x = 100 + NODE_W / 2 + i * (NODE_W + NODE_GAP)
    if (x > maxX) break
    if (!occupiedX.some((ox) => Math.abs(ox - x) < NODE_W * 0.6)) {
      return { x, y: Math.max(PAD_TOP + 40, y) }
    }
  }
  // 层已满：追加到层尾（自动扩展画布宽度）
  const x = 100 + NODE_W / 2 + (layerNodes.length + 1) * (NODE_W + NODE_GAP)
  return { x, y: Math.max(PAD_TOP + 40, y) }
}
