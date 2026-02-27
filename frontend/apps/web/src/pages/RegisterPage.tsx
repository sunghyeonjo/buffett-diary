import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import type { RegisterRequest } from '@buffett-diary/shared'
import { useAuth } from '@/contexts/AuthContext'
import { authApi } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const { register: registerUser, verifyEmail } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [step, setStep] = useState<'register' | 'verify'>('register')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<RegisterRequest>()

  const onSubmit = async (data: RegisterRequest) => {
    try {
      setError('')
      const registeredEmail = await registerUser(data)
      setEmail(registeredEmail)
      setStep('verify')
    } catch (err: any) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다')
    }
  }

  const onVerify = async () => {
    try {
      setError('')
      setIsVerifying(true)
      await verifyEmail({ email, code })
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || '인증에 실패했습니다')
    } finally {
      setIsVerifying(false)
    }
  }

  const onResend = async () => {
    try {
      setError('')
      setIsResending(true)
      await authApi.resendCode(email)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || '재발송에 실패했습니다')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        {step === 'register' ? (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
              <CardDescription>오늘부터 매매를 기록하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="nickname">닉네임</Label>
                  <Input
                    id="nickname"
                    placeholder="닉네임 입력"
                    {...register('nickname', { required: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register('email', { required: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register('password', { required: true, minLength: 8 })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? '가입 중...' : '가입하기'}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  이미 계정이 있으신가요?{' '}
                  <Link to="/login" className="text-primary underline">
                    로그인
                  </Link>
                </p>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">이메일 인증</CardTitle>
              <CardDescription>
                {email}으로 발송된 6자리 인증 코드를 입력해주세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="code">인증 코드</Label>
                  <Input
                    id="code"
                    placeholder="000000"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>
                <Button
                  className="w-full"
                  disabled={code.length !== 6 || isVerifying}
                  onClick={onVerify}
                >
                  {isVerifying ? '인증 중...' : '인증하기'}
                </Button>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    코드는 10분간 유효합니다
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onResend}
                    disabled={isResending}
                  >
                    {isResending ? '발송 중...' : '재발송'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
