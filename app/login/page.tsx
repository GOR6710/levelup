'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Github, Chrome } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({ email: '', username: '', password: '' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })

      const data = await res.json()

      if (data.success) {
        // Store tokens
        localStorage.setItem('accessToken', data.data.tokens.accessToken)
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken)
        
        toast.success('登录成功！')
        router.push('/dashboard')
      } else {
        toast.error(data.error || '登录失败')
      }
    } catch (error) {
      toast.error('网络错误')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      })

      const data = await res.json()

      if (data.success) {
        localStorage.setItem('accessToken', data.data.tokens.accessToken)
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken)
        
        toast.success('注册成功！')
        router.push('/dashboard')
      } else {
        toast.error(data.error || '注册失败')
      }
    } catch (error) {
      toast.error('网络错误')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuth = (provider: 'github' | 'google') => {
    // OAuth flow will be implemented
    toast.info(`${provider} 登录即将上线`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1628] p-4">
      <Card className="w-full max-w-md bg-[#0f2642] border-[#1e3a5f]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">LevelUp</CardTitle>
          <CardDescription className="text-gray-400">
            登录或注册开始你的升级之旅
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#1e3a5f]">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="email"
                  placeholder="邮箱"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="bg-[#0a1628] border-[#1e3a5f] text-white"
                  required
                />
                <Input
                  type="password"
                  placeholder="密码"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="bg-[#0a1628] border-[#1e3a5f] text-white"
                  required
                />
                <Button
                  type="submit"
                  className="w-full bg-[#00d4ff] hover:bg-[#00d4ff]/80 text-black"
                  disabled={isLoading}
                >
                  {isLoading ? '登录中...' : '登录'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <Input
                  type="email"
                  placeholder="邮箱"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="bg-[#0a1628] border-[#1e3a5f] text-white"
                  required
                />
                <Input
                  type="text"
                  placeholder="用户名"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  className="bg-[#0a1628] border-[#1e3a5f] text-white"
                  required
                />
                <Input
                  type="password"
                  placeholder="密码"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="bg-[#0a1628] border-[#1e3a5f] text-white"
                  required
                />
                <Button
                  type="submit"
                  className="w-full bg-[#00d4ff] hover:bg-[#00d4ff]/80 text-black"
                  disabled={isLoading}
                >
                  {isLoading ? '注册中...' : '注册'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#1e3a5f]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0f2642] px-2 text-gray-400">或使用以下方式</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleOAuth('github')}
                className="border-[#1e3a5f] text-white hover:bg-[#1e3a5f]"
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuth('google')}
                className="border-[#1e3a5f] text-white hover:bg-[#1e3a5f]"
              >
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
