'use client'

import { useState } from 'react'

interface ThoughtInputProps {
  onSubmit: (content: string) => void
  isLoading: boolean
}

export default function ThoughtInput({ onSubmit, isLoading }: ThoughtInputProps) {
  const [content, setContent] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isLoading) return
    onSubmit(content)
    setContent('')
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        {/* 输入框背景光晕 */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
        
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今天在想什么？写下你的想法..."
            className="w-full h-32 p-5 bg-white/80 backdrop-blur-sm rounded-2xl border-0 
                       text-gray-700 placeholder-gray-400 
                       focus:outline-none focus:ring-2 focus:ring-purple-300/50
                       resize-none text-base leading-relaxed
                       shadow-sm"
            maxLength={500}
          />
          
          {/* 字数统计 */}
          <div className="absolute bottom-3 right-4 text-xs text-gray-400">
            {content.length}/500
          </div>
        </div>
      </div>

      {/* Encourage Me 按钮 */}
      <div className="mt-6 flex justify-center">
        <button
          type="submit"
          disabled={!content.trim() || isLoading}
          className="relative group px-8 py-4 bg-gradient-to-r from-amber-300 via-pink-400 to-purple-400 
                     text-white font-medium rounded-full
                     shadow-lg shadow-pink-300/30
                     hover:shadow-xl hover:shadow-pink-300/40 
                     hover:scale-105 active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                     transition-all duration-300 ease-out"
        >
          <span className="relative flex items-center gap-2">
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span>生成中...</span>
              </>
            ) : (
              <>
                <span className="text-lg">✨</span>
                <span className="text-lg">Encourage Me</span>
                <span className="text-lg">✨</span>
              </>
            )}
          </span>
        </button>
      </div>
    </form>
  )
}
