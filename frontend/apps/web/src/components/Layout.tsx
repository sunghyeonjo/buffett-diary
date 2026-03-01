import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, BookOpen, FileText, Rss, Search, LogOut } from 'lucide-react'

const navItems = [
  { to: '/', label: '대시보드', icon: LayoutDashboard },
  { to: '/trades', label: '매매 내역', icon: BookOpen },
  { to: '/journals', label: '투자일지', icon: FileText },
  { to: '/feed', label: '피드', icon: Rss },
  { to: '/search', label: '탐색', icon: Search },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const initial = user?.nickname?.charAt(0).toUpperCase() ?? '?'
  const isMyPage = location.pathname === '/mypage'

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="hidden w-60 flex-col border-r bg-card p-4 md:flex">
        <div className="mb-8">
          <img src="/logo.svg" alt="dayed" className="h-8" />
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                location.pathname === to
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom section: Profile + Logout */}
        <div className="space-y-1 border-t pt-3">
          <button
            onClick={() => navigate('/mypage')}
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              isMyPage
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <div className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
              isMyPage
                ? 'bg-primary-foreground text-primary'
                : 'bg-muted text-muted-foreground',
            )}>
              {initial}
            </div>
            {user?.nickname}
          </button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={logout}>
            <LogOut className="h-4 w-4" />
            로그아웃
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex items-center justify-between border-b p-4 md:hidden">
          <img src="/logo.svg" alt="dayed" className="h-7" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/mypage')}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                isMyPage
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent',
              )}
            >
              {initial}
            </button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        {/* Mobile nav */}
        <nav className="flex border-b md:hidden">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 py-3 text-sm',
                location.pathname === to
                  ? 'border-b-2 border-primary font-medium'
                  : 'text-muted-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
