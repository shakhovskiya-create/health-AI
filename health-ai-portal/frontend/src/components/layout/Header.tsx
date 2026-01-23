import { useState, useEffect } from 'react'
import { Bell, Plus, Search, Sun, Moon, X } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useQuery } from '@tanstack/react-query'
import { remindersApi } from '@/api/client'
import type { Reminder } from '@/types'

export default function Header() {
  const [isDark, setIsDark] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const { data: reminders } = useQuery({
    queryKey: ['reminders', 'today'],
    queryFn: remindersApi.getToday,
  })

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    // Default to light theme, only use dark if explicitly saved or user prefers
    const shouldBeDark = savedTheme === 'dark'
    setIsDark(shouldBeDark)
    document.documentElement.classList.toggle('dark', shouldBeDark)
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    document.documentElement.classList.toggle('dark', newIsDark)
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
  }

  const pendingReminders = reminders?.filter((r: Reminder) => r.is_active) || []

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      {/* Date */}
      <div>
        <h2 className="text-lg font-semibold">
          {format(new Date(), 'EEEE, d MMMM yyyy', { locale: ru })}
        </h2>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск..."
            className="h-9 w-64 rounded-md border border-border bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Quick add */}
        <button className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Добавить
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-md p-2 hover:bg-accent transition-colors"
          title={isDark ? 'Светлая тема' : 'Тёмная тема'}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-md p-2 hover:bg-accent transition-colors"
          >
            <Bell className="h-5 w-5" />
            {pendingReminders.length > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-border bg-card shadow-lg z-50">
              <div className="flex items-center justify-between p-3 border-b border-border">
                <h3 className="font-medium">Уведомления</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 hover:bg-accent rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {pendingReminders.length > 0 ? (
                  pendingReminders.map((reminder: Reminder) => (
                    <div
                      key={reminder.id}
                      className="p-3 border-b border-border last:border-0 hover:bg-accent/50"
                    >
                      <p className="text-sm font-medium">{reminder.title}</p>
                      {reminder.time && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {reminder.time}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    Нет уведомлений
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
