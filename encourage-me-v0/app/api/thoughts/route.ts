import { createServerClient } from '@/lib/supabase-server'
import OpenAI from 'openai'
import { NextResponse } from 'next/server'

// 检查环境变量
const MOONSHOT_API_KEY = process.env.MOONSHOT_API_KEY

if (!MOONSHOT_API_KEY) {
  console.error('[Config Error] 缺少 MOONSHOT_API_KEY 环境变量')
}

// 创建 Moonshot 客户端
const moonshot = new OpenAI({
  apiKey: MOONSHOT_API_KEY,
  baseURL: 'https://api.moonshot.cn/v1',
})

// 获取所有想法
export async function GET() {
  try {
    const supabase = createServerClient()
    
    const { data, error } = await supabase
      .from('thoughts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('[Supabase Error] 获取数据失败:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[GET Error] 服务器错误:', error)
    return NextResponse.json({ error: error.message || '服务器错误' }, { status: 500 })
  }
}

// 提交新想法并生成鼓励语
export async function POST(request: Request) {
  try {
    const { content } = await request.json()
    
    if (!content?.trim()) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 })
    }
    
    console.log('[POST] 收到请求，内容:', content.substring(0, 50) + '...')
    
    // 检查 Moonshot API Key
    if (!MOONSHOT_API_KEY) {
      console.error('[Config Error] MOONSHOT_API_KEY 未设置')
      return NextResponse.json({ error: '服务器配置错误：缺少 API Key' }, { status: 500 })
    }
    
    // 调用 Moonshot (Kimi) 生成鼓励语
    let encouragement: string
    try {
      console.log('[Moonshot] 开始调用 Kimi API...')
      const completion = await moonshot.chat.completions.create({
        model: 'moonshot-v1-8k',
        messages: [
          {
            role: 'system',
            content: '你是一位温暖、善解人意的鼓励者。根据用户的想法，用中文给出一句简短、温暖、有力量的鼓励语（50字以内）。风格要温馨治愈。只返回鼓励语本身，不要有多余解释。'
          },
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.7,
      })
      
      encouragement = completion.choices[0].message.content || '你很棒！'
      console.log('[Moonshot] 生成成功:', encouragement)
    } catch (aiError: any) {
      console.error('[Moonshot Error] 调用失败:', aiError.message || aiError)
      // 使用默认鼓励语作为 fallback
      encouragement = '你的努力值得被看见，继续加油！✨'
      console.log('[Moonshot] 使用默认鼓励语:', encouragement)
    }
    
    // 保存到 Supabase
    try {
      console.log('[Supabase] 开始保存数据...')
      const supabase = createServerClient()
      const { data, error } = await supabase
        .from('thoughts')
        .insert({ content: content.trim(), encouragement })
        .select()
        .single()
      
      if (error) {
        console.error('[Supabase Error] 插入失败:', error)
        return NextResponse.json({ 
          error: '数据库保存失败: ' + error.message 
        }, { status: 500 })
      }
      
      console.log('[Supabase] 保存成功, ID:', data.id)
      return NextResponse.json(data)
    } catch (dbError: any) {
      console.error('[Supabase Error] 数据库错误:', dbError)
      return NextResponse.json({ 
        error: '数据库错误: ' + (dbError.message || '未知错误') 
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('[POST Error] 服务器错误:', error)
    return NextResponse.json({ 
      error: '服务器内部错误: ' + (error.message || '未知错误') 
    }, { status: 500 })
  }
}
