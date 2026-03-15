'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('密码至少需要 6 个字符')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // 注册成功
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✉️</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">注册成功！</h2>
        <p className="text-gray-600 mb-4">
          请检查你的邮箱 <span className="font-medium text-gray-800">{email}</span> 并点击验证链接完成注册。
        </p>
        <p className="text-sm text-gray-500 mb-6">
          如果没有收到邮件，请检查垃圾邮件文件夹。
        </p>
        <Link
          href="/login"
          className="inline-block py-2.5 px-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          去登录
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
          创建账号
        </h1>
        <p className="text-gray-500 mt-2">加入 EncourageMe，开始记录你的想法</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            邮箱
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            密码
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
            placeholder="••••••••"
          />
          <p className="mt-1 text-xs text-gray-400">至少 6 个字符</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            确认密码
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? '注册中...' : '注册'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        已有账号？{' '}
        <Link href="/login" className="text-pink-500 hover:text-pink-600 font-medium">
          立即登录
        </Link>
      </div>
    </div>
  )
}
