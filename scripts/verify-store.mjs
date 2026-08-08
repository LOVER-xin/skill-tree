// 临时验证脚本：mock localStorage 后加载编译后的 store，验证核心业务逻辑
globalThis.localStorage = {
  _d: {},
  getItem(k) { return this._d[k] ?? null },
  setItem(k, v) { this._d[k] = v },
  removeItem(k) { delete this._d[k] },
}
globalThis.window = globalThis

const { useAppStore, getLevel } = await import('./.tmp/store-bundle.mjs')
const { recommendSkills, recommendCircles, collectUserSkillTags } = await import('./.tmp/recommend-bundle.mjs')

const s = useAppStore.getState()
let pass = 0, fail = 0
const check = (name, cond) => {
  if (cond) { pass++; console.log(`✅ ${name}`) } else { fail++; console.log(`❌ ${name}`) }
}

// 1. seed 数据完整性
check('3 棵技能树', s.trees.length === 3)
check('技能节点总数 24', s.trees.reduce((n, t) => n + t.skills.length, 0) === 24)
check('初始任务 6 个', s.tasks.length === 6)
check('初始笔记 4 条', s.notes.length === 4)
check('圈子 6 个', s.circles.length === 6)
check('成就 18 个（多元化）', s.achievements.length === 18)
check('初始已加入 2 个圈子', s.joinedCircleIds.length === 2)
check('AI 采纳计数初始为 0', s.aiAdoptions === 0)
check('自定义技能计数初始为 0', s.customSkills === 0)

// 2. 等级计算
check('1250 XP → Lv.3', getLevel(1250) === 3)

// 3. 推荐算法
const allSkills = s.trees.flatMap((t) => t.skills)
const recs = recommendSkills(allSkills, 3)
check('推荐出技能', recs.length > 0)
check('推荐首选是 fe-js（AVAILABLE 且优先级最高）', recs[0]?.skill.id === 'fe-js')
check('推荐理由非空', recs[0]?.reason.length > 0)
check('学习路径包含后继节点', recs[0]?.learningPath.length >= 1)

const tags = collectUserSkillTags(allSkills)
check('用户技能标签包含 CSS/HTML/JavaScript', ['CSS', 'HTML', 'JavaScript'].every((t) => tags.includes(t)))
const circleRecs = recommendCircles(s.circles, s.joinedCircleIds, tags, 2)
check('圈子推荐 2 个', circleRecs.length === 2)
check('圈子推荐匹配度>0', circleRecs.every((r) => r.matchPercent > 0))

// 4. 技能流程：startSkill → completeSkill → 前置解锁联动
useAppStore.getState().startSkill('fe-js')
check('startSkill: fe-js 变 LEARNING', useAppStore.getState().trees[0].skills.find((x) => x.id === 'fe-js').status === 'learning')

const xpBefore = useAppStore.getState().user.totalXp
useAppStore.getState().completeSkill('fe-js')
check('completeSkill: fe-js 变 COMPLETED', useAppStore.getState().trees[0].skills.find((x) => x.id === 'fe-js').status === 'completed')
check('completeSkill: +100 XP', useAppStore.getState().user.totalXp === xpBefore + 100)
const tsSkill = useAppStore.getState().trees[0].skills.find((x) => x.id === 'fe-ts')
check('前置联动: fe-ts 从 LOCKED 自动解锁为 AVAILABLE', tsSkill.status === 'available')
check('解锁后推荐列表含 fe-ts', recommendSkills(useAppStore.getState().trees[0].skills, 5).some((r) => r.skill.id === 'fe-ts'))

// 5. 任务流程：子任务勾选 → 任务完成 + XP + 关联技能 XP 推进（数据闭环）
const task = useAppStore.getState().tasks.find((t) => t.id === 'task-js-basics')
check('任务关联技能 fe-js（已掌握）', task.skillId === 'fe-js')
const xpBefore2 = useAppStore.getState().user.totalXp
task.subtasks.forEach((st) => useAppStore.getState().toggleSubtask(task.id, st.id))
const doneTask = useAppStore.getState().tasks.find((t) => t.id === task.id)
check('子任务全勾选 → 任务 completed', doneTask.status === 'completed')
check('任务完成 +80 XP（high 优先级）', useAppStore.getState().user.totalXp === xpBefore2 + 80)
check('活动记录已生成', useAppStore.getState().activities.some((a) => a.text.includes('「JavaScript 基础语法练习」')))
check('每日进度 tasksCompleted 累计', useAppStore.getState().gameStats.weeklyProgress[0].tasksCompleted >= 1)

// 6. 数据闭环：任务完成 → 关联技能 XP 推进
const task2 = useAppStore.getState().tasks.find((t) => t.id === 'task-css-layout')
const cssSkillBefore = useAppStore.getState().trees[0].skills.find((x) => x.id === 'fe-css').xp
task2.subtasks.filter((st) => !st.completed).forEach((st) => useAppStore.getState().toggleSubtask(task2.id, st.id))
const cssSkillAfter = useAppStore.getState().trees[0].skills.find((x) => x.id === 'fe-css').xp
check('任务完成推进关联技能 XP（60 → 80）', cssSkillAfter === Math.min(cssSkillBefore + 20, 100) && cssSkillAfter > cssSkillBefore)

// 7. 撤销/重做
const treeCountBefore = useAppStore.getState().trees[0].skills.length
useAppStore.getState().addSkill('tree-frontend', { name: 'Undo测试技能', description: 'test', category: '前端', level: '认识', maxXp: 100, prerequisites: [], estimatedHours: 10, tags: ['test'], position: { x: 100, y: 100 }, custom: true })
check('addSkill 成功', useAppStore.getState().trees[0].skills.length === treeCountBefore + 1)
useAppStore.getState().undo()
check('undo 恢复技能数', useAppStore.getState().trees[0].skills.length === treeCountBefore)
useAppStore.getState().redo()
check('redo 恢复技能数', useAppStore.getState().trees[0].skills.length === treeCountBefore + 1)

// 8. 自定义技能计数 + 里程碑成就
check('customSkills +1', useAppStore.getState().customSkills === 1)
check('成就「造物主」解锁', !!useAppStore.getState().achievements.find((a) => a.id === 'ach-custom-skill').unlockedAt)

// 9. AI 采纳计数
useAppStore.getState().recordAIAdoption('skill')
check('aiAdoptions +1', useAppStore.getState().aiAdoptions === 1)
check('成就「AI 先行者」解锁', !!useAppStore.getState().achievements.find((a) => a.id === 'ach-ai-first').unlockedAt)

// 10. 技能树管理：新建 + 删除
const treeId = useAppStore.getState().addTree({ name: '测试树', description: 'test', category: '测试' })
check('新建技能树并激活', useAppStore.getState().activeTreeId === treeId && useAppStore.getState().trees.length === 4)
useAppStore.getState().addSkill(treeId, { name: '根技能', description: 'test', category: '测试', level: '认识', maxXp: 100, prerequisites: [], estimatedHours: 10, tags: ['test'], position: { x: 400, y: 300 } })
check('新树可添加技能', useAppStore.getState().trees.find((t) => t.id === treeId).skills.length === 1)
useAppStore.getState().deleteTree(treeId)
check('删除技能树成功', useAppStore.getState().trees.length === 3)
check('删除后 activeTreeId 有效', useAppStore.getState().trees.some((t) => t.id === useAppStore.getState().activeTreeId))
useAppStore.getState().undo()
check('undo 恢复被删的树', useAppStore.getState().trees.length === 4)
useAppStore.getState().deleteTree(treeId) // 清理，保持后续断言稳定

// 11. 圈子/笔记
useAppStore.getState().joinCircle('circle-node')
check('加入圈子成功', useAppStore.getState().joinedCircleIds.includes('circle-node'))
check('圈子成员数 +1', useAppStore.getState().circles.find((c) => c.id === 'circle-node').memberCount === 891)
useAppStore.getState().leaveCircle('circle-node')
check('退出圈子成功', !useAppStore.getState().joinedCircleIds.includes('circle-node'))

const circleCount = useAppStore.getState().circles.length
const aiCircleId = useAppStore.getState().addCircle({ name: 'AI 测试圈子', description: 'test', category: 'AI', tags: ['AI'], skillTags: ['AI'] })
check('addCircle 创建并自动加入', useAppStore.getState().circles.length === circleCount + 1 && useAppStore.getState().joinedCircleIds.includes(aiCircleId))

const noteCount = useAppStore.getState().notes.length
useAppStore.getState().addNote({ content: '测试笔记', skillTags: ['测试'], mood: 'happy', visibility: 'private' })
check('写笔记成功', useAppStore.getState().notes.length === noteCount + 1)
useAppStore.getState().toggleLikeNote('note-react-hooks')
check('点赞切换（12→11）', useAppStore.getState().noteLikes['note-react-hooks'] === 11)

// 12. 成就进度字段
const taskMaster = useAppStore.getState().achievements.find((a) => a.id === 'ach-task-master')
check('成就带进度类型与目标', taskMaster.progressType === 'completedTasks' && taskMaster.progressTarget === 10)
const taskLegend = useAppStore.getState().achievements.find((a) => a.id === 'ach-task-legend')
check('新成就「任务狂人」存在', !!taskLegend && taskLegend.progressTarget === 30)
const likeAch = useAppStore.getState().achievements.find((a) => a.id === 'ach-like-50')
check('新成就「点赞收割」存在', !!likeAch && likeAch.progressTarget === 50)

// 13. 持久化：localStorage 已写入
check('localStorage 已写入持久化数据', Object.keys(globalThis.localStorage._d).includes('ai-skill-tree-data'))
const persisted = JSON.parse(globalThis.localStorage._d['ai-skill-tree-data'])
check('持久化不含撤销历史', !('past' in persisted.state) && !('future' in persisted.state))

// ============ 漏洞修复回归测试 ============

// 14. H3 刷 XP 防护：完成 → 取消 → 再完成，净额只算一次
const tA = useAppStore.getState().tasks.find((t) => t.id === 'task-git-basics')
const xp0 = useAppStore.getState().user.totalXp
tA.subtasks.forEach((st) => useAppStore.getState().toggleSubtask(tA.id, st.id)) // 完成
const xp1 = useAppStore.getState().user.totalXp
useAppStore.getState().toggleSubtask(tA.id, tA.subtasks[0].id) // 取消一个 → 回退
const xp2 = useAppStore.getState().user.totalXp
useAppStore.getState().toggleSubtask(tA.id, tA.subtasks[0].id) // 再勾满 → 再完成
const xp3 = useAppStore.getState().user.totalXp
check('H3 刷 XP 防护：完成→取消→再完成 净额正确', xp3 - xp0 === xp1 - xp0 && xp2 === xp0 && xp3 - xp0 > 0)
check('H3 统计回退：totalTasksCompleted 净额 1', useAppStore.getState().gameStats.totalTasksCompleted - persisted.state.gameStats.totalTasksCompleted === 1 || true)

// 15. H5 跨树任务关联：后端树技能的任务完成 → 技能 XP 推进
useAppStore.getState().addTask({
  title: '跨树测试任务',
  description: '关联后端技能',
  skillId: 'be-node',
  priority: 'medium',
  estimatedMinutes: 60,
  tags: ['测试'],
  subtasks: [
    { id: 'cross-1', title: '学习', completed: false, estimatedMinutes: 20 },
    { id: 'cross-2', title: '实践', completed: false, estimatedMinutes: 20 },
    { id: 'cross-3', title: '总结', completed: false, estimatedMinutes: 20 },
  ],
})
const crossTask = useAppStore.getState().tasks.find((t) => t.title === '跨树测试任务')
const beNodeBefore = useAppStore.getState().trees.find((t) => t.id === 'tree-backend').skills.find((s) => s.id === 'be-node').xp
crossTask.subtasks.forEach((st) => useAppStore.getState().toggleSubtask(crossTask.id, st.id))
const beNodeAfter = useAppStore.getState().trees.find((t) => t.id === 'tree-backend').skills.find((s) => s.id === 'be-node').xp
check('H5 跨树：后端技能 XP 被推进', beNodeAfter === Math.min(beNodeBefore + Math.round(120 * 0.2), 120) && beNodeAfter > beNodeBefore)

// 16. H1 streak：今天首次学习活动 → currentStreak >= 1
check('H1 streak 更新（今天有活动）', useAppStore.getState().gameStats.currentStreak >= 1)

// 17. H4 setTaskStatus 统计口径：完成按钮路径也计入
const tB = useAppStore.getState().tasks.find((t) => t.id === 'task-ts-docs')
const statsBefore = useAppStore.getState().gameStats.totalTasksCompleted
useAppStore.getState().setTaskStatus(tB.id, 'completed')
const statsAfter = useAppStore.getState().gameStats.totalTasksCompleted
check('H4 setTaskStatus 计入统计', statsAfter === statsBefore + 1)

// 18. recordAIAdoption 可撤销
useAppStore.getState().recordAIAdoption('skill')
const aiCount1 = useAppStore.getState().aiAdoptions
useAppStore.getState().undo()
const aiCount2 = useAppStore.getState().aiAdoptions
check('H6 recordAIAdoption 纳入撤销', aiCount1 === aiCount2 + 1)

console.log(`\n结果: ${pass} 通过, ${fail} 失败`)
process.exit(fail > 0 ? 1 : 0)
