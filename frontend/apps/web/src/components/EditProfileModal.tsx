import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
import { usersApi } from '@/api/users'

interface EditProfileModalProps {
  currentBio: string | null
  onClose: () => void
}

export default function EditProfileModal({ currentBio, onClose }: EditProfileModalProps) {
  const [bio, setBio] = useState(currentBio ?? '')
  const queryClient = useQueryClient()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const mutation = useMutation({
    mutationFn: () => usersApi.updateProfile({ bio: bio.trim() || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
      onClose()
    },
  })

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>프로필 수정</CardTitle>
              <button onClick={onClose} className="rounded-md p-1 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bio">소개</Label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="나를 소개해보세요..."
                  maxLength={200}
                  rows={4}
                  className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">{bio.length}/200</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>취소</Button>
                <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                  {mutation.isPending ? '저장 중...' : '저장'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
