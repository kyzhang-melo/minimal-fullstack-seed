'use client'

import { useEffect, useState } from 'react'

interface EncouragementModalProps {
  isOpen: boolean
  thought: string
  encouragement: string
  onClose: () => void
}

export default function EncouragementModal({ 
  isOpen, 
  thought, 
  encouragement, 
  onClose 
}: EncouragementModalProps) {
  const [show, setShow] = useState(false)
  
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShow(true), 50)
      return () => clearTimeout(timer)
    } else {
      setShow(false)
    }
  }, [isOpen])
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300
                    ${show ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      
      {/* 弹窗内容 */}
      <div 
        className={`relative w-full max-w-md transform transition-all duration-500
                    ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        {/* 发光效果 */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 via-pink-400 to-purple-400 rounded-3xl blur opacity-40"></div>
        
        <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
          {/* 装饰图标 */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-200 via-pink-200 to-purple-200 rounded-full flex items-center justify-center text-3xl">
              💌
            </div>
          </div>
          
          {/* 标题 */}
          <h3 className="text-center text-xl font-semibold text-gray-800 mb-6">
            给你的一句话
          </h3>
          
          {/* 用户想法提示 */}
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">你的想法：</p>
            <p className="text-gray-700 text-sm line-clamp-2">{thought}</p>
          </div>
          
          {/* 鼓励语卡片 */}
          <div className="relative mb-6">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-200 via-pink-200 to-purple-200 rounded-xl blur opacity-50"></div>
            <div className="relative bg-gradient-to-br from-amber-50 via-pink-50 to-purple-50 rounded-xl p-5">
              <p className="text-purple-800 text-center text-lg leading-relaxed font-medium">
                "{encouragement}"
              </p>
              <p className="text-center text-xs text-purple-400 mt-3">
                — EncourageMe
              </p>
            </div>
          </div>
          
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-amber-300 via-pink-400 to-purple-400 
                       text-white font-medium rounded-xl
                       hover:shadow-lg hover:shadow-pink-300/30
                       active:scale-[0.98]
                       transition-all duration-200"
          >
            谢谢，我收到了 💛
          </button>
        </div>
      </div>
    </div>
  )
}
