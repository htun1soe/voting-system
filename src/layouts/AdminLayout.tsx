import React, { useState, useEffect } from 'react';
// 1. Updated import from react-router-dom to wouter
import { Link, useLocation } from 'wouter'; 
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, BarChart3, LogOut, Menu, X, Crown } from 'lucide-react';
import { useStore } from '../lib/store';

// 2. Updated paths to include the /admin prefix
const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/organizer', label: 'Organizer', icon: Users },
  { path: '/admin/results', label: 'Results', icon: BarChart3 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const [location, setLocation] = useLocation(); 
  const { admin, logout } = useStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    setLocation('/'); 
  };

  return (
    <div className="min-h-screen flex bg-[hsl(260_30%_97%)]">


      <aside
        className={`hidden md:flex flex-col h-screen sticky top-0 transition-all duration-200 border-r bg-white
        ${collapsed ? 'w-20' : 'w-64'}`}
      >

        <div className="flex items-center justify-between px-4 py-4">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-[hsl(265_30%_20%)]">Admin Dashboard</span>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="px-3 space-y-1 flex-1">
          {navItems.map(item => {
            const active = location === item.path;

            return (

              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all
                ${
                  active
                    ? 'bg-[oklch(95%_0.02_180)] text-[oklch(45%_0.07_180)]'
                    : 'text-[oklch(45%_0.07_180)] hover:bg-[oklch(92%_0.03_180)] hover:text-[oklch(37.383%_0.06658_180.015)]'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[hsl(265_10%_92%)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full green-bg flex items-center justify-center text-white text-xs font-bold">
                {admin?.name?.charAt(0) || 'A'}
              </div>

              {!collapsed && (
                <span className="text-sm font-semibold text-[hsl(265_30%_20%)]">
                  {admin?.name || 'Admin'}
                </span>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[hsl(0_70%_50%)] hover:bg-[hsl(0_80%_96%)]"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
          </div>
        </div>
      </aside>


      <div className="flex-1 flex flex-col">


        <header className={`md:hidden sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 shadow-md backdrop-blur-md' : 'bg-white/60 backdrop-blur-sm'}`}>
          <div className="px-6">
            <div className="flex items-center justify-between h-16">
              <span className="font-bold text-[hsl(265_30%_20%)]">Admin Dashboard</span>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-lg"
              >
                {mobileOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white border-t"
              >
                <nav className="px-6 py-4 space-y-1">
                  {navItems.map(item => {
                    const active = location === item.path;

                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                        ${
                          active
                            ? 'bg-[oklch(95%_0.02_180)] text-[oklch(45%_0.07_180)]'
                            : 'text-[oklch(45%_0.07_180)] hover:bg-[oklch(92%_0.03_180)]'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </header>


        <main className="flex-1 px-6 lg:px-8 py-8">
          {children}
        </main>


        <footer className="border-t bg-white">
          <div className="flex items-center justify-center px-6 py-6">
            <p className="text-sm text-[hsl(265_10%_50%)]">
              © 2026 MTU Science & Tech Club. Voting System.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}