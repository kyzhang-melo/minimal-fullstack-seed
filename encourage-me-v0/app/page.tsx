'use client'

import { useEffect, useState } from 'react'
import ThoughtInput from '@/components/ThoughtInput'
import ThoughtCard from '@/components/ThoughtCard'
import EncouragementModal from '@/components/EncouragementModal'

interface Thought {
  id: string
  content: string
  encouragement: string
  created_at: string
}

export default function Home() {
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newThoughtId, setNewThoughtId] = useState<string | null>(null)
  
  // 弹窗状态
  const [modalOpen, setModalOpen] = useState(false)
  const [currentThought, setCurrentThought] = useState('')
  const [currentEncouragement, setCurrentEncouragement] = useState('')

  // 初始加载想法列表
  useEffect(() => {
    fetchThoughts()
  }, [])

  async function fetchThoughts() {
    try {
      const res = await fetch('/api/thoughts')
      const data = await res.json()
      if (Array.isArray(data)) {
        setThoughts(data)
      }
    } catch (error) {
      console.error('获取想法失败:', error)
    }
  }

  async function handleSubmit(content: string) {
    setIsLoading(true)
    try {
      const res = await fetch('/api/thoughts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      
      const data = await res.json()
      
      if (data.error) {
        alert(data.error)
        return
      }
      
      // 添加到列表顶部
      setThoughts(prev => [data, ...prev])
      setNewThoughtId(data.id)
      
      // 显示弹窗
      setCurrentThought(data.content)
      setCurrentEncouragement(data.encouragement)
      setModalOpen(true)
      
      // 清除新标记
      setTimeout(() => setNewThoughtId(null), 1000)
    } catch (error) {
      console.error('提交失败:', error)
      alert('提交失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-pink-50 to-purple-100">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-4">
            EncourageMe
          </h1>
          <p className="text-gray-500 text-lg">
            分享你的想法，收获温暖鼓励
          </p>
        </div>

        {/* 输入区域 */}
        <div className="mb-12">
          <ThoughtInput onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {/* 想法列表 */}
        <div>
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-pink-300/50"></div>
            <span className="text-gray-400 text-sm">你的想法</span>
            <span className="text-amber-400">✨</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-pink-300/50"></div>
          </div>

          {thoughts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">
                还没有想法，写下第一个吧 💭
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {thoughts.map((thought) => (
                <ThoughtCard 
                  key={thought.id} 
                  thought={thought}
                  isNew={thought.id === newThoughtId}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 鼓励语弹窗 */}
      <EncouragementModal
        isOpen={modalOpen}
        thought={currentThought}
        encouragement={currentEncouragement}
        onClose={() => setModalOpen(false)}
      />
    </main>
  )
}
