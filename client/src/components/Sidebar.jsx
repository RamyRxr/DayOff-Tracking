import { NavLink } from 'react-router-dom'
import { Home, Users, ShieldAlert, Calendar, Settings } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Accueil', icon: Home },
  { to: '/employees', label: 'Employés', icon: Users },
  { to: '/blocked', label: 'Bloqués', icon: ShieldAlert },
  { to: '/calendar', label: 'Calendrier', icon: Calendar },
]

export default function Sidebar() {
  return (
    <aside className="w-60 bg-white/60 backdrop-blur-2xl border-r border-r-0.5 border-black/6 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6">
        <div className="text-lg font-semibold tracking-tight text-navy">
          DayOff
        </div>
        <div className="text-[10px] text-gray-500 mt-0.5 tracking-wide">
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
                    ? 'bg-white text-navy shadow-ambient'
                    : 'text-gray-600 hover:bg-black/5 hover:text-gray-900'
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

      {/* Admin footer */}
      <div className="px-4 py-4 border-t border-t-0.5 border-black/6">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-black/5 transition-colors cursor-pointer">
          {/* Avatar circle */}
          <div className="w-8 h-8 rounded-full bg-warm-gray-400 flex items-center justify-center text-xs font-semibold text-gray-700">
            MS
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              Mohammed S.
            </div>
            <div className="text-xs text-gray-500">
              Admin RH
            </div>
          </div>

          {/* Settings icon */}
          <Settings className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
        </div>
      </div>
    </aside>
  )
}
