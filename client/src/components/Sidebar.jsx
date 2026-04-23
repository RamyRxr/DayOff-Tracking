import { NavLink } from 'react-router-dom'
import { Home, Users, ShieldAlert, Calendar, LogOut } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Accueil', icon: Home },
  { to: '/employees', label: 'Employés', icon: Users },
  { to: '/blocked', label: 'Bloqués', icon: ShieldAlert },
  { to: '/calendar', label: 'Calendrier', icon: Calendar },
]

export default function Sidebar({ currentAdmin, onLogout }) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white/60 backdrop-blur-2xl border-r-0.5 border-black/6 flex flex-col z-40">
      {/* Logo - DayOff wordmark + NAFTAL */}
      <div className="px-6 py-6">
        <div className="font-display text-xl font-bold tracking-tight text-[#111827]">
          DayOff
        </div>
        <div className="text-[10px] text-[#6B7280] mt-0.5 tracking-widest uppercase font-medium">
          NAFTAL
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-[#1E3A5F] shadow-ambient'
                    : 'text-[#6B7280] hover:bg-black/5 hover:text-[#111827]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Admin footer - subtle and small */}
      <div className="px-4 py-4 border-t-0.5 border-black/6">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          {/* Avatar circle - warm gray bg */}
          <div className="w-8 h-8 rounded-full bg-warm-gray-200 flex items-center justify-center text-xs font-semibold text-[#374151]">
            {currentAdmin?.name
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .substring(0, 2) || 'MS'}
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[#111827] truncate">
              {currentAdmin?.name || 'Admin'}
            </div>
            <div className="text-xs text-[#6B7280]">
              {currentAdmin?.role || 'Admin RH'}
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={onLogout}
            className="p-1.5 hover:bg-[#C0392B]/10 rounded-lg transition-colors group"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4 text-[#6B7280] group-hover:text-[#C0392B]" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  )
}
