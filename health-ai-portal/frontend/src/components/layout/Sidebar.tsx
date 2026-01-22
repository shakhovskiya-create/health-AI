import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Pill,
  TestTube2,
  History,
  Dumbbell,
  User,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Стек', href: '/supplements', icon: Pill },
  { name: 'Анализы', href: '/labs', icon: TestTube2 },
  { name: 'Циклы', href: '/cycles', icon: History },
  { name: 'Тренировки', href: '/workouts', icon: Dumbbell },
  { name: 'Профиль', href: '/profile', icon: User },
]

export default function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
        <Activity className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold">Health AI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Anton</p>
            <p className="text-xs text-muted-foreground">v12.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}
