// 渲染冒烟测试：SSR 渲染 6 个页面 + Navigation，捕获运行时错误
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { Navigation } from '../src/components/Navigation'
import { HomePage } from '../src/pages/HomePage'
import { SkillTreePage } from '../src/pages/SkillTreePage'
import { TasksPage } from '../src/pages/TasksPage'
import { CirclesPage } from '../src/pages/CirclesPage'
import { NotesPage } from '../src/pages/NotesPage'
import { ProfilePage } from '../src/pages/ProfilePage'

globalThis.localStorage = {
  _d: {},
  getItem(k: string) { return this._d[k] ?? null },
  setItem(k: string, v: string) { this._d[k] = v },
  removeItem(k: string) { delete this._d[k] },
} as unknown as Storage
globalThis.window = globalThis as unknown as Window & typeof globalThis

const pages: [string, () => JSX.Element][] = [
  ['/', () => <HomePage />],
  ['/skill-tree', () => <SkillTreePage />],
  ['/tasks', () => <TasksPage />],
  ['/circles', () => <CirclesPage />],
  ['/notes', () => <NotesPage />],
  ['/profile', () => <ProfilePage />],
]

let pass = 0
let fail = 0
for (const [path, render] of pages) {
  try {
    const html = renderToString(
      <MemoryRouter initialEntries={[path]}>
        <Navigation />
        {render()}
      </MemoryRouter>
    )
    if (html.length > 100) {
      console.log(`✅ ${path} 渲染成功 (${html.length} chars)`)
      pass++
    } else {
      console.log(`⚠️  ${path} 输出过短 (${html.length} chars)`)
      fail++
    }
  } catch (e) {
    console.log(`❌ ${path} 渲染失败: ${(e as Error).message}`)
    fail++
  }
}
console.log(`\n结果: ${pass} 通过, ${fail} 失败`)
process.exit(fail > 0 ? 1 : 0)
