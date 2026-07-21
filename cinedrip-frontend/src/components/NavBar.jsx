import { NavLink, useLocation } from 'react-router-dom';

const tabs = [
  { to: '/home', label: 'Home', icon: '🏠' },
  { to: '/explore', label: 'Explore', icon: '🔍' },
  { to: '/watchlist', label: 'Watchlist', icon: '🔖' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

export default function NavBar() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/10 bg-base/90 backdrop-blur-sm">
      {tabs.map((tab) => {
        const active = location.pathname.startsWith(tab.to);
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={`flex flex-1 flex-col items-center py-3 text-xs ${
              active ? 'text-purple-400' : 'text-gray-600'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
