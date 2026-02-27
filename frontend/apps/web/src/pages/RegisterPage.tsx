import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { authApi } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Step = 'email' | 'code' | 'profile'

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm<{ nickname: string; password: string }>()
  const password = watch('password', '')

  const onSendCode = async () => {
    try {
      setError('')
      setIsSending(true)
      await authApi.sendCode(email)
      setStep('code')
    } catch (err: any) {
      setError(err.response?.data?.message || '코드 발송에 실패했습니다')
    } finally {
      setIsSending(false)
    }
  }

  const onVerifyCode = async () => {
    try {
      setError('')
      setIsVerifying(true)
      await authApi.verifyCode(email, code)
      setStep('profile')
    } catch (err: any) {
      setError(err.response?.data?.message || '인증에 실패했습니다')
    } finally {
      setIsVerifying(false)
    }
  }

  const onRegister = async (data: { nickname: string; password: string }) => {
    try {
      setError('')
      await registerUser({ email, code, password: data.password, nickname: data.nickname })
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        {step === 'email' && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
              <CardDescription>이메일을 입력해주세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && email && onSendCode()}
                  />
                </div>
                <Button
                  className="w-full"
                  disabled={!email || isSending}
                  onClick={onSendCode}
                >
                  {isSending ? '발송 중...' : '인증 코드 보내기'}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  이미 계정이 있으신가요?{' '}
                  <Link to="/login" className="text-primary underline">
                    로그인
                  </Link>
                </p>
              </div>
            </CardContent>
          </>
        )}

        {step === 'code' && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">이메일 인증</CardTitle>
              <CardDescription>
                {email}으로 발송된 6자리 코드를 입력해주세요
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
                    onKeyDown={(e) => e.key === 'Enter' && code.length === 6 && onVerifyCode()}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>
                <Button
                  className="w-full"
                  disabled={code.length !== 6 || isVerifying}
                  onClick={onVerifyCode}
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
                    onClick={onSendCode}
                    disabled={isSending}
                  >
                    {isSending ? '발송 중...' : '재발송'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        )}

        {step === 'profile' && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">프로필 설정</CardTitle>
              <CardDescription>닉네임과 비밀번호를 설정해주세요</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onRegister)} className="space-y-4">
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
                  <Label htmlFor="password">비밀번호</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="영문, 숫자 포함 8자 이상"
                    {...register('password', {
                      required: true,
                      minLength: { value: 8, message: '8자 이상' },
                      validate: {
                        hasLetter: (v) => /[A-Za-z]/.test(v) || '영문자 포함',
                        hasNumber: (v) => /\d/.test(v) || '숫자 포함',
                      },
                    })}
                  />
                  {password && (
                    <div className="flex gap-3 text-xs mt-1">
                      <span className={password.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}>
                        {password.length >= 8 ? '\u2713' : '\u2022'} 8자 이상
                      </span>
                      <span className={/[A-Za-z]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}>
                        {/[A-Za-z]/.test(password) ? '\u2713' : '\u2022'} 영문자
                      </span>
                      <span className={/\d/.test(password) ? 'text-green-600' : 'text-muted-foreground'}>
                        {/\d/.test(password) ? '\u2713' : '\u2022'} 숫자
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)}
                >
                  {isSubmitting ? '가입 중...' : '가입하기'}
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
