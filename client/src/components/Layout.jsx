import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout({ currentAdmin, onLogout }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar currentAdmin={currentAdmin} onLogout={onLogout} />

      {/* Main content area - offset for fixed sidebar */}
      <div className="ml-60 flex flex-col min-h-screen">
        {/* Top bar - 56px, frosted glass */}
        <header className="h-14 bg-white/75 backdrop-blur-xl border-b-0.5 border-black/6 flex items-center px-8 justify-between sticky top-0 z-30">
          <div className="text-sm font-semibold text-[#374151] tracking-tight">
            Période · 20 Avr → 19 Mai 2026
          </div>

          {/* Period progress bar - 6px height per spec */}
          <div className="flex-1 max-w-md mx-8">
            <div className="h-1.5 bg-warm-gray-300 rounded-full overflow-hidden">
              <div className="h-full bg-navy w-[45%] rounded-full transition-all duration-300"></div>
            </div>
          </div>

          {/* Notification bell */}
          <button className="relative p-2 hover:bg-black/5 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C0392B] rounded-full"></span>
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
