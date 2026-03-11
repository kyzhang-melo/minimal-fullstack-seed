import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 输出静态文件优化
  output: 'standalone',
  
  // 图片优化配置
  images: {
    unoptimized: true,
  },
  
  // 环境变量检查（构建时验证）
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
