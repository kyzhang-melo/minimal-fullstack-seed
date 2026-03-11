'use client'

import { useEffect, useState } from 'react'

interface Thought {
  id: string
  content: string
  encouragement: string
  created_at: string
}

interface ThoughtCardProps {
  thought: Thought
  isNew?: boolean
  onDelete?: (id: string) => void
}

// 格式化时间显示
function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

export default function ThoughtCard({ thought, isNew = false, onDelete }: ThoughtCardProps) {
  const [show, setShow] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => setShow(true), 100)
      return () => clearTimeout(timer)
    } else {
      setShow(true)
    }
  }, [isNew])

  const handleDelete = async () => {
    if (!onDelete) return
    if (!confirm('确定要删除这个想法吗？')) return
    
    setIsDeleting(true)
    await onDelete(thought.id)
    setIsDeleting(false)
  }

  return (
    <div 
      className={`relative group transition-all duration-700 ease-out
                  ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
                  ${isDeleting ? 'opacity-50 scale-95' : ''}`}
    >
      {/* 卡片光晕效果 */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-200 via-pink-200 to-purple-200 rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-500"></div>
      
      <div className="relative bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/50">
        {/* 删除按钮 */}
        {onDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-500 
                       hover:bg-red-50 rounded-full transition-colors duration-200
                       opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="删除"
          >
            {isDeleting ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        )}
        
        {/* 用户想法 */}
        <div className="mb-4 pr-8">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💭</span>
            <p className="text-gray-700 text-base leading-relaxed flex-1">
              {thought.content}
            </p>
          </div>
        </div>
        
        {/* 分隔线 */}
        <div className="relative h-px mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-300/50 to-transparent"></div>
        </div>
        
        {/* AI 鼓励语 */}
        <div className="flex items-start gap-3">
          <span className="text-2xl">💛</span>
          <div className="flex-1">
            <p className="text-purple-700 text-base leading-relaxed font-medium italic">
              "{thought.encouragement}"
            </p>
          </div>
        </div>
        
        {/* 时间戳 */}
        <div className="mt-4 text-right">
          <span className="text-xs text-gray-400">
            {formatTime(thought.created_at)}
          </span>
        </div>
      </div>
    </div>
  )
}
