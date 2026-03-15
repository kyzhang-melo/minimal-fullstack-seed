'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ThoughtInput from '@/components/ThoughtInput'
import ThoughtCard from '@/components/ThoughtCard'
import EncouragementModal from '@/components/EncouragementModal'
import ApiKeyInput from '@/components/ApiKeyInput'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface Thought {
  id: string
  content: string
  encouragement: string
  created_at: string
}

export default function Home() {
  const router = useRouter()
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newThoughtId, setNewThoughtId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [currentThought, setCurrentThought] = useState('')
  const [currentEncouragement, setCurrentEncouragement] = useState('')
  
  // 用户提供的 Kimi API Key
  const [userApiKey, setUserApiKey] = useState('')
  
  // 当前登录用户
  const [user, setUser] = useState<User | null>(null)

  // 从 localStorage 读取保存的 API Key
  useEffect(() => {
    const savedKey = localStorage.getItem('kimi_api_key')
    if (savedKey) {
      setUserApiKey(savedKey)
    }
  }, [])

  // ========== 用户认证状态监听 ==========
  useEffect(() => {
    // 获取当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 处理登出
  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // ========== Supabase Realtime 实时订阅 ==========
  useEffect(() => {
    // 1. 获取初始数据
    fetchInitialThoughts()
    
    // 2. 建立 WebSocket 实时订阅
    const channel = supabase
      .channel('thoughts-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'thoughts' },
        (payload) => {
          console.log('[Realtime] 收到推送:', payload)
          const newThought = payload.new as Thought
          setThoughts((prev) => {
            if (prev.find(t => t.id === newThought.id)) return prev
            return [newThought, ...prev]
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'thoughts' },
        (payload) => {
          console.log('[Realtime] 收到删除推送:', payload)
          const deletedId = payload.old.id
          setThoughts((prev) => prev.filter(t => t.id !== deletedId))
        }
      )
      .subscribe()

    // 3. 清理订阅
    return () => { channel.unsubscribe() }
  }, [])

  async function fetchInitialThoughts() {
    const { data } = await supabase
      .from('thoughts')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setThoughts(data)
  }

  // 处理 API Key 变更
  const handleApiKeyChange = useCallback((key: string) => {
    setUserApiKey(key)
  }, [])

  async function handleSubmit(content: string) {
    setIsLoading(true)
    try {
      const res = await fetch('/api/thoughts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content,
          apiKey: userApiKey // 传递用户的 API Key
        })
      })
      const data = await res.json()
      
      if (data.error) {
        alert(data.error)
        return
      }
      
      // 乐观更新
      setThoughts(prev => {
        if (prev.find(t => t.id === data.id)) return prev
        return [data, ...prev]
      })
      setNewThoughtId(data.id)
      
      setCurrentThought(data.content)
      setCurrentEncouragement(data.encouragement)
      setModalOpen(true)
      setTimeout(() => setNewThoughtId(null), 1000)
    } catch (error) {
      alert('提交失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 删除想法
  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/thoughts?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      
      if (data.error) {
        alert(data.error)
        return
      }
      
      setThoughts(prev => prev.filter(t => t.id !== id))
      console.log('[Delete] 删除成功:', id)
    } catch (error) {
      console.error('[Delete Error] 删除失败:', error)
      alert('删除失败')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-pink-50 to-purple-100">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-4">
            EncourageMe
          </h1>
          <p className="text-gray-500 text-lg">分享你的想法，收获温暖鼓励</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-green-600">实时同步已开启</span>
          </div>
          
          {/* 用户信息和登出按钮 */}
          <div className="mt-4 flex items-center justify-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-600">
                  👋 {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-400 hover:text-red-500 transition-colors"
                  title="退出登录"
                >
                  退出
                </button>
              </>
            ) : (
              <a
                href="/login"
                className="text-sm text-pink-500 hover:text-pink-600 font-medium"
              >
                登录 / 注册
              </a>
            )}
          </div>
        </div>

        {/* API Key 输入 */}
        <ApiKeyInput apiKey={userApiKey} onApiKeyChange={handleApiKeyChange} />

        {/* 想法输入 */}
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
              <p className="text-gray-400 text-sm">还没有想法，写下第一个吧 💭</p>
            </div>
          ) : (
            <div className="space-y-4">
              {thoughts.map((thought) => (
                <ThoughtCard 
                  key={thought.id} 
                  thought={thought} 
                  isNew={thought.id === newThoughtId}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <EncouragementModal 
        isOpen={modalOpen} 
        thought={currentThought} 
        encouragement={currentEncouragement} 
        onClose={() => setModalOpen(false)} 
      />
    </main>
  )
}
