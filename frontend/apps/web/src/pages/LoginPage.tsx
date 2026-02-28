import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Buffett Diary</CardTitle>
          <CardDescription>소셜 계정으로 로그인하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
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
          <Button
            type="button"
            className="w-full"
            variant="outline"
            onClick={() => {
              window.location.href = `${API_BASE_URL}/api/v1/auth/oauth2/naver`
            }}
          >
            네이버로 로그인
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
