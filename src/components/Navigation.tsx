import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  TreePine,
  CheckSquare,
  Users,
  BookOpen,
  User,
  Trophy,
  Zap,
} from 'lucide-react'
import { useAppStore, getLevel } from '../store'

export function Navigation() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const user = useAppStore((s) => s.user)

  const isActive = (path: string) => location.pathname === path
  const level = getLevel(user.totalXp)

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/skill-tree', icon: TreePine, label: '技能树' },
    { path: '/tasks', icon: CheckSquare, label: '任务' },
    { path: '/circles', icon: Users, label: '圈子' },
    { path: '/notes', icon: BookOpen, label: '笔记' },
    { path: '/profile', icon: User, label: '我的' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary-500 rounded-lg">
              <TreePine className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AI技能树</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* User Stats */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span>Lv.{level}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Zap className="w-4 h-4 text-blue-500" />
              <span>{user.totalXp.toLocaleString()} XP</span>
            </div>
            <Link to="/profile" className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user.name.charAt(0)}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">打开主菜单</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
