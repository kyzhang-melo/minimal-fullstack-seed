import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 检查环境变量
if (!supabaseUrl) {
  throw new Error('缺少环境变量: NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('缺少环境变量: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// 创建服务端 Supabase 客户端
export function createServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}
