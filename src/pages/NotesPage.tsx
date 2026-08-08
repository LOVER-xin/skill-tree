import { useState } from 'react'
import { BookOpen, Plus, Tag, Search, Heart, MessageCircle, Share2, Trash2, X, Pencil } from 'lucide-react'
import { Note } from '../types'
import { useAppStore } from '../store'
import { useActiveTree } from '../store'

type Mood = Note['mood']
type Visibility = Note['visibility']

const moodOptions: { value: Mood; label: string; emoji: string }[] = [
  { value: 'excited', label: '兴奋', emoji: '🤩' },
  { value: 'happy', label: '开心', emoji: '😊' },
  { value: 'neutral', label: '平静', emoji: '😐' },
  { value: 'frustrated', label: '受挫', emoji: '😤' },
  { value: 'confused', label: '困惑', emoji: '😕' },
]

export function NotesPage() {
  const notes = useAppStore((s) => s.notes)
  const addNote = useAppStore((s) => s.addNote)
  const updateNote = useAppStore((s) => s.updateNote)
  const deleteNote = useAppStore((s) => s.deleteNote)
  const toggleLikeNote = useAppStore((s) => s.toggleLikeNote)
  const noteLikes = useAppStore((s) => s.noteLikes)
  const tree = useActiveTree()

  const [filter, setFilter] = useState<'all' | 'public' | 'circle' | 'private'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    content: '',
    tags: '',
    mood: 'happy' as Mood,
    visibility: 'public' as Visibility,
    skillId: '',
  })

  const filteredNotes = notes.filter((note) => {
    const matchesFilter = filter === 'all' || note.visibility === filter
    const matchesSearch =
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.skillTags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case 'excited': return '🤩'
      case 'happy': return '😊'
      case 'neutral': return '😐'
      case 'frustrated': return '😤'
      case 'confused': return '😕'
      default: return '📝'
    }
  }

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'text-green-600 bg-green-50'
      case 'circle': return 'text-blue-600 bg-blue-50'
      case 'private': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getVisibilityText = (visibility: string) => {
    switch (visibility) {
      case 'public': return '公开'
      case 'circle': return '圈子可见'
      case 'private': return '私密'
      default: return '未知'
    }
  }

  const openEditor = (note?: Note) => {
    if (note) {
      setEditingId(note.id)
      setForm({
        content: note.content,
        tags: note.skillTags.join(', '),
        mood: note.mood ?? 'neutral',
        visibility: note.visibility,
        skillId: note.taskId ?? '',
      })
    } else {
      setEditingId(null)
      setForm({ content: '', tags: '', mood: 'happy', visibility: 'public', skillId: '' })
    }
    setShowEditor(true)
  }

  const handleSave = () => {
    if (!form.content.trim()) return
    const skillTags = form.tags
      .split(/[,，\s]+/)
      .filter(Boolean)
      .slice(0, 5)
    if (editingId) {
      updateNote(editingId, {
        content: form.content.trim(),
        skillTags,
        mood: form.mood,
        visibility: form.visibility,
      })
    } else {
      addNote({
        content: form.content.trim(),
        skillTags,
        mood: form.mood,
        visibility: form.visibility,
        taskId: form.skillId || undefined,
      })
    }
    setShowEditor(false)
    setEditingId(null)
  }

  const handleShare = async (note: Note) => {
    const url = `${window.location.origin}${window.location.pathname}#note-${note.id}`
    try {
      await navigator.clipboard.writeText(url)
      alert('笔记链接已复制到剪贴板')
    } catch {
      alert(`笔记链接: ${url}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BookOpen className="w-8 h-8 mr-3 text-yellow-600" />
              学习笔记
            </h1>
            <p className="text-gray-600 mt-2">记录学习过程中的思考和感悟</p>
          </div>
          <button
            onClick={() => openEditor()}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>写笔记</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 md:mr-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索笔记内容或标签..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex space-x-2">
              {(['all', 'public', 'circle', 'private'] as const).map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === filterOption
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {filterOption === 'all' ? '全部' :
                   filterOption === 'public' ? '公开' :
                   filterOption === 'circle' ? '圈子' : '私密'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-6">
          {filteredNotes.map((note) => {
            const likes = noteLikes[note.id] ?? 0
            return (
              <div key={note.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                {/* Note Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getMoodEmoji(note.mood)}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisibilityColor(note.visibility)}`}>
                          {getVisibilityText(note.visibility)}
                        </span>
                        {note.taskId && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                            关联任务
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(note.createdAt).toLocaleDateString('zh-CN')}{' '}
                        {new Date(note.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditor(note)}
                      title="编辑"
                      className="text-gray-400 hover:text-yellow-600 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('删除这条笔记？')) deleteNote(note.id)
                      }}
                      title="删除"
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Note Content */}
                <div className="mb-4">
                  <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                </div>

                {/* Tags */}
                {note.skillTags.length > 0 && (
                  <div className="flex items-center space-x-2 mb-4">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {note.skillTags.map((tag) => (
                        <span key={tag} className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleLikeNote(note.id)}
                      className={`flex items-center space-x-1 transition-colors ${
                        likes > 0 ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{likes}</span>
                    </button>
                    <span className="flex items-center space-x-1 text-gray-400">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">讨论</span>
                    </span>
                    <button
                      onClick={() => handleShare(note)}
                      className="flex items-center space-x-1 text-gray-600 hover:text-green-600 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">分享</span>
                    </button>
                  </div>
                  <button
                    onClick={() => openEditor(note)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    编辑
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? '没找到相关笔记' : '还没有笔记'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? '试试其他关键词' : '开始记录你的学习心得吧'}
            </p>
            <button
              onClick={() => openEditor()}
              className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              写第一篇笔记
            </button>
          </div>
        )}

        {/* Writing Tips */}
        <div className="mt-12 bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4">💡 写笔记小贴士</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
            <div>
              <h4 className="font-medium mb-2">记录学习过程</h4>
              <p>记录遇到的问题、解决方案和心得体会</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">使用技能标签</h4>
              <p>为笔记添加相关技能标签，方便后续查找和整理</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">记录情绪状态</h4>
              <p>学习时的心情也是成长轨迹的重要组成部分</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">选择合适的可见性</h4>
              <p>公开分享、圈子讨论或私人记录，灵活选择</p>
            </div>
          </div>
        </div>
      </div>

      {/* Note Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[30rem] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingId ? '编辑笔记' : '写笔记'}</h3>
              <button onClick={() => setShowEditor(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">内容 *</label>
                <textarea
                  rows={5}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="记录你的学习心得..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">技能标签（逗号分隔）</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="例如：React, Hooks"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">心情</label>
                  <div className="flex flex-wrap gap-1">
                    {moodOptions.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setForm({ ...form, mood: m.value })}
                        className={`px-2 py-1 rounded text-sm transition-colors ${
                          form.mood === m.value ? 'bg-yellow-100 ring-1 ring-yellow-400' : 'hover:bg-gray-100'
                        }`}
                        title={m.label}
                      >
                        {m.emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">可见性</label>
                  <select
                    value={form.visibility}
                    onChange={(e) => setForm({ ...form, visibility: e.target.value as Visibility })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="public">公开</option>
                    <option value="circle">圈子可见</option>
                    <option value="private">私密</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">关联技能</label>
                <select
                  value={form.skillId}
                  onChange={(e) => setForm({ ...form, skillId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">不关联</option>
                  {tree?.skills.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSave}
                disabled={!form.content.trim()}
                className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                {editingId ? '保存修改' : '发布笔记'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
