import React, { useState } from 'react';
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
  Wallet,
  Users,
  Scroll,
  Menu,
  X
} from 'lucide-react';
import { Role } from '@temple/shared';

const LiveClock: React.FC = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const day = now.getDate().toString().padStart(2, '0');
  const month = now.toLocaleString('en-US', { month: 'short' });
  const year = now.getFullYear();
  const weekday = now.toLocaleString('en-US', { weekday: 'long' });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).toLowerCase();

  return (
    <div className="px-4 pt-[10px] pb-2 border-t border-[#4a332e] text-left font-sans">
      <div className="text-[11px] font-medium text-[#d8c7a1]">
        {day} {month} {year} · {weekday}
      </div>
      <div className="text-[11px] font-mono text-[#8a7362] mt-0.5">
        {timeStr}
      </div>
    </div>
  );
};

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { label: 'Income & Expenditures', path: '/dashboard/expenses', icon: Wallet, show: isAdmin || user?.canAccessExpenses !== false },
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

  const renderNavContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-5 md:p-6 border-b border-turmeric/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-turmeric to-turmeric-dark flex items-center justify-center shadow-md shrink-0">
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
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden p-1 text-ivory/60 hover:text-ivory"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            onClick={() => setMobileMenuOpen(false)}
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

      {/* Language Selector */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-1.5 bg-ivory/10 px-3 py-2 rounded-xl border border-turmeric/20">
          <span className="text-[9px] uppercase font-bold text-ivory/50">Language:</span>
          <select
            value={getSelectedLanguage()}
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-transparent border-none font-bold text-turmeric focus:outline-none cursor-pointer text-[11px] flex-1"
          >
            <option value="en">English</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="te">తెలుగు</option>
          </select>
        </div>
      </div>

      {/* Sidebar Footer Date + Isolated Live Ticking Clock */}
      <LiveClock />

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
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ivory-light">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Mobile Slide-out Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-ink text-ivory transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {renderNavContent()}
      </aside>

      {/* Desktop Static Sidebar */}
      <aside className="hidden md:flex w-64 bg-ink text-ivory flex-col border-r border-turmeric/20 shrink-0 no-print">
        {renderNavContent()}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Global Identity Bar (App Shell Level) */}
        <div className="px-4 pt-4 md:px-8 md:pt-6 no-print">
          <div className="bg-[#fdfaf3] border border-[#e6dcc4] rounded-[10px] px-[20px] py-[10px] flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 rounded-lg bg-white border border-[#e6dcc4] text-[#4a1010] mr-1 hover:bg-[#fbf6ec] transition-colors"
                aria-label="Toggle navigation menu"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="flex flex-wrap items-baseline gap-x-1.5 truncate text-left">
                <span className="text-[13px] font-medium text-[#4a1010] leading-none truncate">
                  Shri Raghavendra Swamy Brindavana Sannidhana
                </span>
                <span className="text-[#a6957a] text-[13px] font-medium leading-none">·</span>
                <span className="text-[12px] text-[#8a7a5c] leading-none truncate">
                  Mulabagala Sri Sripadaraja Matha, Rajajinagar
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-ivory-light/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
