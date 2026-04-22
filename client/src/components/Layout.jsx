import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout({ currentAdmin, onLogout }) {
  return (
    <div className="min-h-screen bg-warm-gray-200 flex">
      <Sidebar currentAdmin={currentAdmin} onLogout={onLogout} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar - 56px */}
        <header className="h-14 bg-white/60 backdrop-blur-2xl border-b border-b-0.5 border-black/6 flex items-center px-6 justify-between">
          <div className="text-sm font-medium text-gray-700">
            Période · 20 Avr → 19 Mai 2026
          </div>

          {/* Period progress bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="h-1.5 bg-warm-gray-300 rounded-full overflow-hidden">
              <div className="h-full bg-navy w-[45%] rounded-full"></div>
            </div>
          </div>

          {/* Notification bell */}
          <button className="relative p-2 hover:bg-black/5 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-apple-red rounded-full"></span>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
