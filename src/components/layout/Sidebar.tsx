import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Target, 
  BookOpen, 
  BarChart3, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Manifest Log', href: '/manifest', icon: Target },
  { name: 'Daily Reflection', href: '/reflection', icon: BookOpen },
  { name: 'Insights', href: '/insights', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div className="fixed inset-0 z-40 bg-black/20 lg:hidden" onClick={() => setCollapsed(true)} />
      )}
      
      {/* Sidebar */}
      <div className={`
        sticky top-0 left-0 z-50 bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out
        ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'w-64 lg:w-16'}
        lg:sticky lg:top-0 lg:left-0 lg:z-50 lg:bg-sidebar lg:border-r lg:border-sidebar-border lg:transition-all lg:duration-300 lg:ease-in-out
      `}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
            <div className={`flex items-center gap-3 transition-opacity duration-200 ${collapsed ? 'lg:opacity-0' : 'opacity-100'}`}>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sidebar-foreground lg:hidden">Manifestor</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                aria-label={item.name}
                className={({ isActive }) => `
                  manifestor-sidebar-item group relative
                  ${isActive ? 'manifestor-sidebar-item active' : ''}
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-sidebar-border">
            <div className={`flex items-center gap-3 px-3 py-2 transition-opacity duration-200 ${collapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : 'opacity-100'}`}>
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-muted-foreground">U</span>
              </div>
              <div className="flex-1 min-w-0 lg:hidden">
                <p className="text-sm font-medium text-sidebar-foreground truncate">User</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">user@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}