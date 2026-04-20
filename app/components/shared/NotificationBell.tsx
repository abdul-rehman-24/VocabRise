'use client'

import { useState, useEffect } from 'react'
import { Bell, X, CheckCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function NotificationBell() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (session) {
      fetchNotifications()
      // Optional: Polling could go here
      const interval = setInterval(fetchNotifications, 60000) // Poll every min
      return () => clearInterval(interval)
    }
  }, [session])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      setNotifications(data)
      setUnreadCount(data.filter((n: any) => !n.isRead).length)
    } catch (e) {
      console.error(e)
    }
  }

  const markAsRead = async (id?: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (!id) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
      } else {
        setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (!session) return null

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl bg-gray-900 border border-purple-500/20 shadow-2xl shadow-purple-900/20 z-50">
          <div className="flex justify-between items-center p-4 border-b border-gray-800">
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAsRead()} 
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                <CheckCircle className="w-3 h-3" /> Mark all read
              </button>
            )}
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-2">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No notifications yet</div>
            ) : (
              notifications.map((notif: any) => (
                <div 
                  key={notif.id} 
                  className={`p-3 rounded-lg mb-1 last:mb-0 transition-colors ${notif.isRead ? 'bg-transparent text-gray-400' : 'bg-gray-800/50 text-gray-200'}`}
                  onClick={() => !notif.isRead && markAsRead(notif.id)}
                >
                  <p className="text-sm font-medium">{notif.title}</p>
                  <p className="text-xs mt-1 text-gray-400">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}