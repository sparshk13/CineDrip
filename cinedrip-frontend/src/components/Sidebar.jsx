import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const tabs = [
  { to: '/home', label: 'home', icon: '🏠' },
  { to: '/explore', label: 'explore', icon: '🔍' },
  { to: '/watchlist', label: 'watchlist', icon: '🔖' },
  { to: '/profile', label: 'profile', icon: '👤' },
  { to: '/admin', label: 'admin', icon: '🛡️', adminOnly: true },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className={`fixed left-0 top-0 z-50 flex h-full flex-col bg-[#11101D] py-4 transition-all duration-300 ${
        open ? 'w-56' : 'w-[78px]'
      }`}
    >
      <div className="mb-6 flex items-center gap-2 px-4">
        <span className="text-xl">🎬</span>
        <span
          className={`whitespace-nowrap bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-lg font-extrabold text-transparent transition-opacity ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        >
          CineDrip
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2">
        {tabs
          .filter((t) => !t.adminOnly || user?.role === 'admin')
          .map((tab) => {
          const active = location.pathname.startsWith(tab.to);
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                active ? 'bg-white/10 text-purple-400' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className={`whitespace-nowrap ${open ? 'opacity-100' : 'opacity-0'}`}>
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="mx-2 mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-400 hover:bg-white/5"
      >
        <span className="text-lg">🚪</span>
        <span className={`whitespace-nowrap ${open ? 'opacity-100' : 'opacity-0'}`}>logout</span>
      </button>
    </aside>
  );
}
