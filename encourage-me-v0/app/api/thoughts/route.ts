import { createServerClient } from '@/lib/supabase-server'
import OpenAI from 'openai'
import { NextResponse } from 'next/server'

// 备用 API Key（当用户未提供时使用）
const FALLBACK_API_KEY = process.env.MOONSHOT_API_KEY

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
    const { content, apiKey: userApiKey } = await request.json()
    
    if (!content?.trim()) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 })
    }
    
    console.log('[POST] 收到请求，内容:', content.substring(0, 50) + '...')
    
    // 优先使用用户提供的 API Key，否则使用环境变量中的备用 Key
    const apiKey = userApiKey?.trim() || FALLBACK_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: '缺少 Kimi API Key。请在页面顶部设置你的 API Key，或联系管理员配置。' 
      }, { status: 401 })
    }
    
    // 调用 Moonshot 生成鼓励语
    let encouragement: string
    try {
      console.log('[Moonshot] 开始调用 Kimi API...')
      
      const moonshot = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.moonshot.cn/v1',
      })
      
      const completion = await moonshot.chat.completions.create({
        model: 'kimi-k2-0905-preview',
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
      
      // 如果是 401 错误，可能是 API Key 无效
      if (aiError.message?.includes('401') || aiError.message?.includes('Invalid')) {
        return NextResponse.json({ 
          error: 'Kimi API Key 无效，请检查并重新设置。' 
        }, { status: 401 })
      }
      
      // 其他错误使用默认鼓励语
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
        return NextResponse.json({ error: '数据库保存失败: ' + error.message }, { status: 500 })
      }
      
      console.log('[Supabase] 保存成功, ID:', data.id)
      return NextResponse.json(data)
    } catch (dbError: any) {
      console.error('[Supabase Error] 数据库错误:', dbError)
      return NextResponse.json({ error: '数据库错误: ' + (dbError.message || '未知错误') }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('[POST Error] 服务器错误:', error)
    return NextResponse.json({ error: '服务器内部错误: ' + (error.message || '未知错误') }, { status: 500 })
  }
}

// 删除想法
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: '缺少 id 参数' }, { status: 400 })
    }
    
    console.log('[DELETE] 删除想法, ID:', id)
    
    const supabase = createServerClient()
    const { error } = await supabase
      .from('thoughts')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('[Supabase Error] 删除失败:', error)
      return NextResponse.json({ error: '删除失败: ' + error.message }, { status: 500 })
    }
    
    console.log('[DELETE] 删除成功, ID:', id)
    return NextResponse.json({ success: true, id })
    
  } catch (error: any) {
    console.error('[DELETE Error] 服务器错误:', error)
    return NextResponse.json({ error: '服务器内部错误: ' + (error.message || '未知错误') }, { status: 500 })
  }
}
