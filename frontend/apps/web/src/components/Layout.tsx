import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Home, BookOpen, FileText, Search, LogOut, User } from 'lucide-react'

const navItems = [
  { to: '/', label: '홈', icon: Home },
  { to: '/trades', label: '매매 내역', icon: BookOpen },
  { to: '/journals', label: '투자일지', icon: FileText },
  { to: '/search', label: '탐색', icon: Search },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const initial = user?.nickname?.charAt(0).toUpperCase() ?? '?'
  const isMyPage = location.pathname === '/mypage'

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden w-56 flex-col border-r bg-card md:flex">
        <div className="px-5 py-6">
          <img src="/logo.svg" alt="dayed" className="h-7" />
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive(to)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom: Profile + Logout */}
        <div className="border-t p-3">
          <button
            onClick={() => navigate('/mypage')}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isMyPage
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
            )}
          >
            <div className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
              isMyPage
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}>
              {initial}
            </div>
            <span className="truncate">{user?.nickname}</span>
          </button>
          <button
            onClick={logout}
            className="mt-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b px-4 py-3 md:hidden">
          <img src="/logo.svg" alt="dayed" className="h-6" />
          <button
            onClick={() => navigate('/mypage')}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors',
              isMyPage
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent',
            )}
          >
            {initial}
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4 pb-20 md:p-6 md:pb-6">
          <Outlet />
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t bg-background md:hidden">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]',
                isActive(to)
                  ? 'text-primary'
                  : 'text-muted-foreground',
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
          <Link
            to="/mypage"
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]',
              isMyPage ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <User className="h-5 w-5" />
            MY
          </Link>
        </nav>
      </div>
    </div>
  )
}
