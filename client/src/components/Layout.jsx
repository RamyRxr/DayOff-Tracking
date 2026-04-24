import { useState, useRef, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import LanguageSelector from './LanguageSelector'
import { useEmployees } from '../hooks/useEmployees'

export default function Layout({ currentAdmin, onLogout }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [readNotifications, setReadNotifications] = useState(new Set())
  const notifRef = useRef(null)
  const { employees } = useEmployees()

  // Generate notifications from employee data
  const notifications = employees
    .filter((emp) => emp.status === 'risque' || emp.status === 'bloqué')
    .map((emp) => ({
      id: emp.id,
      type: emp.status,
      employeeName: emp.name,
      matricule: emp.matricule,
      message:
        emp.status === 'risque'
          ? `⚠ ${emp.name} est à risque — ${emp.daysTotal - emp.daysUsed} jours restants`
          : `🚫 ${emp.name} a été bloqué ce mois`,
      timestamp: 'Aujourd\'hui',
    }))

  const unreadCount = notifications.filter(n => !readNotifications.has(n.id)).length
  const displayCount = unreadCount > 9 ? '9+' : unreadCount

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }

    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [notificationsOpen])

  const handleMarkAllRead = () => {
    const allIds = new Set(notifications.map(n => n.id))
    setReadNotifications(allIds)
    setTimeout(() => setNotificationsOpen(false), 300)
  }

  const handleNotificationHover = (notifId) => {
    if (!readNotifications.has(notifId)) {
      setReadNotifications(prev => new Set([...prev, notifId]))
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0F0F10]">
      <Sidebar currentAdmin={currentAdmin} onLogout={onLogout} />

      {/* Main content area - offset for fixed sidebar */}
      <div className="ml-60 flex flex-col min-h-screen">
        {/* Top bar - 56px, frosted glass */}
        <header className="h-14 bg-white/75 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border-b-0.5 border-black/6 dark:border-white/[0.06] flex items-center px-8 justify-between sticky top-0 z-30">
          <div className="text-sm font-semibold text-[#374151] dark:text-white tracking-tight">
            Période · 20 Avr → 19 Mai 2026
          </div>

          {/* Period progress bar - 6px height per spec */}
          <div className="flex-1 max-w-md mx-8">
            <div className="h-1.5 bg-warm-gray-300 dark:bg-[#2C2C2E] rounded-full overflow-hidden">
              <div className="h-full bg-navy dark:bg-blue-500 w-[45%] rounded-full transition-all duration-300"></div>
            </div>
          </div>

          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 hover:bg-black/5 dark:hover:bg-white/[0.06] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-[#6B7280] dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-status-red rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-pulse px-1">
                  {displayCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {notificationsOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-[#2C2C2E] rounded-2xl shadow-ambient border border-black/6 dark:border-white/[0.08] overflow-hidden animate-in">
                {/* Header */}
                <div className="px-4 py-3 border-b border-black/6 dark:border-white/[0.06] flex items-center justify-between">
                  <h3 className="font-semibold text-[#111827] dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-navy dark:text-blue-400 hover:underline font-medium"
                    >
                      Tout marquer lu
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-[#6B7280] text-sm">Aucune notification</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const isRead = readNotifications.has(notif.id)
                      return (
                        <div
                          key={notif.id}
                          onMouseEnter={() => handleNotificationHover(notif.id)}
                          className={`px-4 py-3 hover:bg-black/[0.02] transition-all duration-200 border-b-0.5 border-black/6 last:border-b-0 ${
                            isRead ? 'opacity-60' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            {/* Icon */}
                            <div className="flex-shrink-0">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  notif.type === 'risque'
                                    ? 'bg-status-amber/10'
                                    : 'bg-status-red/10'
                                }`}
                              >
                                <span className="text-sm">
                                  {notif.type === 'risque' ? '⚠' : '🚫'}
                                </span>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] text-[#111827] leading-snug">
                                {notif.message}
                              </p>
                              <p className="text-[11px] text-[#6B7280] mt-1">
                                {notif.matricule}
                              </p>
                            </div>

                            {/* Timestamp */}
                            <div className="text-[11px] text-[#6B7280] flex-shrink-0">
                              {notif.timestamp}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Language Selector */}
          <LanguageSelector />
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
