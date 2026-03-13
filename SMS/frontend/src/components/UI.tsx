import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  color: string;
  icon: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, color, icon }) => (
  <div className="glass-effect p-6 card-hover relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 opacity-10 ${color.replace('text-', 'bg-')}`} />
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className={`text-4xl font-bold ${color}`}>{value}</p>
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      </div>
      <div className={`w-14 h-14 rounded-2xl ${color.replace('text-', 'bg-').replace('600', '100').replace('500', '100')} flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  </div>
);

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  color: string;
}

export const QuickAction: React.FC<QuickActionProps> = ({ icon, title, description, onClick, color }) => (
  <button onClick={onClick} className="glass-effect p-5 card-hover text-left w-full group">
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="font-semibold text-gray-900">{title}</h3>
    <p className="text-xs text-gray-400 mt-1">{description}</p>
  </button>
);

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'bg-gray-100 text-gray-600', className = '' }) => (
  <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${color} ${className}`}>
    {children}
  </span>
);

interface EmptyStateProps {
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message = 'No data' }) => (
  <div className="glass-effect p-16 text-center text-gray-400">{message}</div>
);

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'large' }) => {
  const sizeClasses = {
    small: 'h-6 w-6 border-b-2',
    medium: 'h-8 w-8 border-b-2',
    large: 'h-10 w-10 border-b-2',
  };
  return (
    <div className="flex justify-center items-center py-24">
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-gray-800`} />
    </div>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`glass-effect ${className}`}>{children}</div>
);

interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: number;
}

export const Grid: React.FC<GridProps> = ({ children, cols = 1, gap = 6 }) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };
  return (
    <div className={`grid ${colClasses[cols]} gap-${gap}`}>
      {children}
    </div>
  );
};
