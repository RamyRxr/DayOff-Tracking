import { useState, useEffect } from 'react'

const NOTIFICATIONS_KEY = 'naftal_notifications'
const NOTIFICATION_EXPIRY_DAYS = 7 // Keep notifications for 7 days

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([])

  // Load notifications from localStorage on mount
  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = () => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Filter out expired notifications
        const now = new Date().getTime()
        const expiryTime = NOTIFICATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        const valid = parsed.filter(n => now - new Date(n.timestamp).getTime() < expiryTime)
        setNotifications(valid)
        // Save back the filtered list
        if (valid.length !== parsed.length) {
          localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(valid))
        }
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const addNotification = (notification) => {
    const newNotification = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    }

    const updated = [newNotification, ...notifications]
    setNotifications(updated)
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated))
    return newNotification
  }

  const markAsRead = (notificationId) => {
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    )
    setNotifications(updated)
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated))
  }

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotifications(updated)
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated))
  }

  const deleteNotification = (notificationId) => {
    const updated = notifications.filter(n => n.id !== notificationId)
    setNotifications(updated)
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated))
  }

  const clearAll = () => {
    setNotifications([])
    localStorage.removeItem(NOTIFICATIONS_KEY)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    loadNotifications
  }
}

// Helper function to create notification for blocking
export const createBlockNotification = (employee, reason, t) => ({
  type: 'blocked',
  employeeName: employee.name,
  matricule: employee.matricule,
  message: `🚫 ${employee.name} ${t('aEteBloque')} — ${reason}`,
  severity: 'error'
})

// Helper function for at-risk notification
export const createAtRiskNotification = (employee, daysRemaining, t) => ({
  type: 'at-risk',
  employeeName: employee.name,
  matricule: employee.matricule,
  message: `⚠️ ${employee.name} ${t('estARisque')} — ${daysRemaining} ${t('joursRestants')}`,
  severity: 'warning'
})

// Helper function for unblock notification
export const createUnblockNotification = (employee, t) => ({
  type: 'unblocked',
  employeeName: employee.name,
  matricule: employee.matricule,
  message: `✅ ${employee.name} ${t('aEteDebloque')}`,
  severity: 'success'
})
