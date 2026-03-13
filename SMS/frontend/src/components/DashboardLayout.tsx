import React, { ReactNode } from 'react';

interface DashboardLayoutProps {
  title: string;
  navItems: { key: string; label: string }[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName?: string;
  onLogout: () => void;
  children: ReactNode;
  loading?: boolean;
  headerGradient?: string;
  headerIcon?: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  navItems,
  activeTab,
  onTabChange,
  userName,
  onLogout,
  children,
  loading = false,
  headerGradient = 'from-gray-800 to-gray-900',
  headerIcon,
}) => {
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className={`relative z-20 bg-gradient-to-r ${headerGradient} text-white shadow-xl`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-4 gap-4">
            <div className="flex items-center gap-6 min-w-0">
              <div className="flex items-center gap-3">
                {headerIcon && <div className="w-10 h-10 rounded-xl flex items-center justify-center">{headerIcon}</div>}
                <h1 className="text-xl font-bold">{title}</h1>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto">
                {navItems.map(item => (
                  <button
                    key={item.key}
                    onClick={() => onTabChange(item.key)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === item.key ? 'bg-white/20' : 'hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              {userName && <span className="text-sm hidden sm:block">{userName}</span>}
              <button onClick={onLogout} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
