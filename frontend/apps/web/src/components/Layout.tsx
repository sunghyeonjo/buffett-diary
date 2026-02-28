import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, BookOpen, LogOut } from 'lucide-react'

const navItems = [
  { to: '/', label: '대시보드', icon: LayoutDashboard },
  { to: '/trades', label: '매매 내역', icon: BookOpen },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="hidden w-60 flex-col border-r bg-card p-4 md:flex">
        <div className="mb-8">
          <img src="/logo.svg" alt="dayed" className="h-8" />
          <p className="text-xs text-muted-foreground">{user?.nickname}</p>
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
        <Button variant="ghost" className="justify-start gap-3" onClick={logout}>
          <LogOut className="h-4 w-4" />
          로그아웃
        </Button>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex items-center justify-between border-b p-4 md:hidden">
          <img src="/logo.svg" alt="dayed" className="h-7" />
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
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
              {label}
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
