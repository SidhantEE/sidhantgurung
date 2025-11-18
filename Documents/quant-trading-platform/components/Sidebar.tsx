'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Activity
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Equity Signals', href: '/equities/signals', icon: TrendingUp },
  { name: 'Options Scanner', href: '/options/scanner', icon: Search },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Activity', href: '/activity', icon: Activity },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-[hsl(var(--sidebar))] border-r border-[hsl(var(--sidebar-border))] transition-all duration-300 z-40 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-[hsl(var(--sidebar-border))]">
            {!collapsed && (
              <h1 className="text-xl font-bold">IQuant</h1>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 hover:bg-[hsl(var(--accent))] rounded-lg transition-colors"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-colors group relative ${
                    isActive
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                      : 'hover:bg-[hsl(var(--accent))] text-[hsl(var(--sidebar-foreground))]'
                  }`}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon className={`w-5 h-5 ${collapsed ? '' : 'mr-3'} flex-shrink-0`} />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))] text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-[hsl(var(--border))]">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[hsl(var(--sidebar-border))]">
            <Link
              href="/settings"
              className={`flex items-center px-3 py-2.5 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors group relative ${
                pathname === '/settings'
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'text-[hsl(var(--sidebar-foreground))]'
              }`}
              title={collapsed ? 'Settings' : undefined}
            >
              <Settings className={`w-5 h-5 ${collapsed ? '' : 'mr-3'} flex-shrink-0`} />
              {!collapsed && (
                <span className="text-sm font-medium">Settings</span>
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))] text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-[hsl(var(--border))]">
                  Settings
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from going under sidebar */}
      <div className={`${collapsed ? 'w-16' : 'w-64'} flex-shrink-0 transition-all duration-300`} />
    </>
  );
}
