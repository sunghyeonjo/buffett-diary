import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi } from '@/api/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

type Tab = 'login' | 'register'

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authApi.login({ email, password })
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.location.href = '/'
    } catch (err: any) {
      setError(err.response?.data?.message || '로그인에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authApi.register({ email, password, nickname })
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.location.href = '/'
    } catch (err: any) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">dayed</CardTitle>
          <CardDescription>
            {tab === 'login' ? '로그인하세요' : '회원가입하세요'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tab buttons */}
          <div className="flex rounded-md border">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tab === 'login'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent'
              } rounded-l-md`}
              onClick={() => { setTab('login'); setError('') }}
            >
              로그인
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tab === 'register'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent'
              } rounded-r-md`}
              onClick={() => { setTab('register'); setError('') }}
            >
              회원가입
            </button>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {tab === 'login' ? (
            <>
              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="login-email">이메일</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="login-password">비밀번호</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? '로그인 중...' : '로그인'}
                </Button>
              </form>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">또는</span>
                </div>
              </div>

              <Button
                type="button"
                className="w-full"
                variant="outline"
                onClick={() => {
                  window.location.href = `${API_BASE_URL}/api/v1/auth/oauth2/google`
                }}
              >
                Google로 로그인
              </Button>
            </>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="register-email">이메일</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="register-password">비밀번호</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="register-nickname">닉네임</Label>
                <Input
                  id="register-nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={50}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '가입 중...' : '회원가입'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
