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

export default function ThoughtCard({ thought, isNew = false }: ThoughtCardProps) {
  const [show, setShow] = useState(false)
  
  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => setShow(true), 100)
      return () => clearTimeout(timer)
    } else {
      setShow(true)
    }
  }, [isNew])

  return (
    <div 
      className={`relative group transition-all duration-700 ease-out
                  ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      {/* 卡片光晕效果 */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-200 via-pink-200 to-purple-200 rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-500"></div>
      
      <div className="relative bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/50">
        {/* 用户想法 */}
        <div className="mb-4">
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
