import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code, MessageSquare, Trello, Settings, Bug, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const DevNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      title: 'Sprint Planning',
      href: '/dev/sprintplan',
      icon: Trello,
      description: 'Manage sprints and backlog'
    },
    {
      title: 'Debug Logs',
      href: '/dev/debug',
      icon: Bug,
      description: 'View conversation logs'
    },
    {
      title: 'Code Analysis',
      href: '/dev/analysis',
      icon: Code,
      description: 'Code quality & metrics'
    },
    {
      title: 'AI Assistant',
      href: '/dev/ai',
      icon: Zap,
      description: 'Development AI tools'
    }
  ];

  return (
    <div className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-1">
            <div className="flex items-center space-x-2 mr-8">
              <Settings className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Dev Suite</span>
            </div>
            
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
          
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to App
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DevNavigation;