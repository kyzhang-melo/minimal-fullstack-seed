'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  // 如果用户已登录，跳转到首页
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/')
      }
    })
  }, [router])

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-pink-50 to-purple-100 flex items-center justify-center px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </main>
  )
}
