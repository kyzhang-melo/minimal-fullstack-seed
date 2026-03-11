'use client'

import { useState, useEffect } from 'react'

interface ApiKeyInputProps {
  apiKey: string
  onApiKeyChange: (key: string) => void
}

export default function ApiKeyInput({ apiKey, onApiKeyChange }: ApiKeyInputProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [inputValue, setInputValue] = useState(apiKey)

  // 从 localStorage 读取保存的 key
  useEffect(() => {
    const savedKey = localStorage.getItem('kimi_api_key')
    if (savedKey) {
      setInputValue(savedKey)
      onApiKeyChange(savedKey)
    }
  }, [onApiKeyChange])

  const handleSave = () => {
    if (inputValue.trim()) {
      localStorage.setItem('kimi_api_key', inputValue.trim())
      onApiKeyChange(inputValue.trim())
      setIsExpanded(false)
    }
  }

  const handleClear = () => {
    localStorage.removeItem('kimi_api_key')
    setInputValue('')
    onApiKeyChange('')
  }

  const isKeySet = !!apiKey

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      {!isExpanded ? (
        <div 
          onClick={() => setIsExpanded(true)}
          className="flex items-center justify-center gap-2 p-3 bg-white/50 backdrop-blur-sm rounded-xl cursor-pointer hover:bg-white/70 transition-colors"
        >
          <span className={`w-2 h-2 rounded-full ${isKeySet ? 'bg-green-500' : 'bg-amber-400'}`}></span>
          <span className="text-sm text-gray-600">
            {isKeySet ? 'Kimi API Key 已设置 ✓' : '点击设置你的 Kimi API Key'}
          </span>
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      ) : (
        <div className="p-4 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-white/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">设置 Kimi API Key</h3>
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <input
                type="password"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="sk-xxxxxxxxxxxxxxxx"
                className="w-full p-3 bg-white rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300/50"
              />
              <p className="mt-2 text-xs text-gray-500">
                你的 API Key 仅存储在本地浏览器中，不会上传到服务器。
                从 <a href="https://platform.moonshot.cn/" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">Moonshot 平台</a> 获取
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!inputValue.trim()}
                className="flex-1 py-2 bg-gradient-to-r from-amber-400 to-pink-400 text-white text-sm font-medium rounded-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                保存
              </button>
              {isKeySet && (
                <button
                  onClick={handleClear}
                  className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  清除
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
