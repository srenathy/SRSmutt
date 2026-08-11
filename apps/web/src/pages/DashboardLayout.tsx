import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import {
  LayoutDashboard,
  Layers,
  Receipt,
  FileText,
  BarChart3,
  Database,
  LogOut,
  User,
  ShieldCheck,
  Settings,
  TrendingDown,
  Users,
  Scroll
} from 'lucide-react';
import { Role } from '@temple/shared';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === Role.ADMIN;

  const navItems = [
    { label: 'Overview & Cash Book', path: '/dashboard', icon: LayoutDashboard, exact: true, show: true },
    { label: '+ New Seva Billing', path: '/dashboard/billing', icon: Receipt, show: isAdmin || user?.canAccessBilling !== false },
    { label: 'Receipt History & Reprint', path: '/dashboard/receipts', icon: FileText, show: isAdmin || user?.canAccessBilling !== false },
    { label: 'Daily Sankalpa List', path: '/dashboard/sankalpa', icon: Scroll, show: true },
    { label: 'Temple Expenditures', path: '/dashboard/expenses', icon: TrendingDown, show: isAdmin || user?.canAccessExpenses !== false },
    { label: 'Masters Management', path: '/dashboard/masters', icon: Layers, show: isAdmin || user?.canAccessMasters === true },
    { label: 'Collection Reports', path: '/dashboard/reports', icon: BarChart3, show: isAdmin || user?.canAccessReports !== false },
    { label: 'User & Access Control', path: '/dashboard/users', icon: Users, show: isAdmin },
    { label: 'Temple & Billing Settings', path: '/dashboard/settings', icon: Settings, show: isAdmin },
    { label: 'Database Backup', path: '/dashboard/backup', icon: Database, show: isAdmin }
  ].filter(item => item.show);

  const getSelectedLanguage = () => {
    const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
    return match ? match[1] : 'en';
  };

  const changeLanguage = (lang: string) => {
    document.cookie = `googtrans=/en/${lang}; path=/`;
    document.cookie = `googtrans=/en/${lang}; path=/; domain=${window.location.hostname}`;
    const hostParts = window.location.hostname.split('.');
    if (hostParts.length > 1) {
      document.cookie = `googtrans=/en/${lang}; path=/; domain=.${hostParts.slice(-2).join('.')}`;
    }
    window.location.reload();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ivory-light">
      {/* Sidebar */}
      <aside className="w-64 bg-ink text-ivory flex flex-col border-r border-turmeric/20 shrink-0 no-print">
        {/* Brand Header */}
        <div className="p-6 border-b border-turmeric/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-turmeric to-turmeric-dark flex items-center justify-center shadow-md">
            <ShieldCheck className="w-5 h-5 text-ink" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-xs tracking-wider uppercase text-ivory">
              SRSmutt Billing
            </h1>
            <p className="text-[9px] font-semibold text-turmeric uppercase tracking-widest mt-0.5">
              Secure Core v2.0
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  isActive
                    ? 'bg-kumkum text-ivory font-extrabold'
                    : 'text-ivory/70 hover:bg-ivory/10 hover:text-ivory'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Footer Panel */}
        <div className="p-4 border-t border-turmeric/20 bg-ink-dark/50 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-ivory/10 flex items-center justify-center shrink-0 border border-turmeric/20">
              <User className="w-4 h-4 text-turmeric" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate text-ivory">{user?.fullName || 'Staff Account'}</p>
              <p className="text-[9px] font-semibold text-turmeric uppercase tracking-wider">{user?.role || 'Guest'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-ivory/60 hover:bg-kumkum/30 hover:text-ivory transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-turmeric/20 px-8 flex items-center justify-between shrink-0 shadow-sm no-print">
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-base text-kumkum">
              Shri Raghavendra Swamy Brindavana Sannidhana
            </h1>
            <span className="text-xs text-textInk/50 font-mono hidden md:inline">| Mulabagala Sri Sripadaraja Matha</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-textInk/70">
            {/* Language Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-ivory px-2.5 py-1.5 rounded-lg border border-turmeric/30">
              <span className="text-[10px] uppercase font-bold text-textInk/50">Language:</span>
              <select
                value={getSelectedLanguage()}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent border-none font-bold text-kumkum focus:outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="kn">ಕನ್ನಡ</option>
                <option value="te">తెలుగు</option>
              </select>
            </div>

            <span className="bg-ivory px-3 py-1.5 rounded-lg border border-turmeric/30">
              Counter Status: <span className="font-bold text-green-700">ONLINE</span>
            </span>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-ivory-light/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
