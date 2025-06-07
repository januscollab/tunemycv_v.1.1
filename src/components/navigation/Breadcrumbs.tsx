import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className,
  showHome = true
}) => {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from current path if no items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const searchParams = new URLSearchParams(location.search);
    
    const breadcrumbs: BreadcrumbItem[] = [];
    
    if (showHome) {
      breadcrumbs.push({ label: 'Home', href: '/' });
    }
    
    pathSegments.forEach((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      let label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      // Custom labels for specific routes
      const routeLabels: { [key: string]: string } = {
        'analyze': 'CV Analysis',
        'cover-letter': 'Cover Letter',
        'interview-prep': 'Interview Prep',
        'interview-toolkit': 'Interview Toolkit',
        'profile': 'Profile',
        'admin': 'Admin Dashboard',
        'help-centre': 'Help Centre',
        'pricing-scale': 'Pricing',
        'resources': 'Resources',
        'auth': 'Sign In'
      };
      
      if (routeLabels[segment]) {
        label = routeLabels[segment];
      }
      
      // Add tab information for certain routes
      if (segment === 'analyze' && searchParams.get('tab')) {
        const tab = searchParams.get('tab');
        const tabLabels: { [key: string]: string } = {
          'analysis': 'CV Analysis',
          'interview-prep': 'Interview Prep',
          'history': 'Analysis History',
          'view-analysis': 'View Results'
        };
        if (tab && tabLabels[tab]) {
          label = tabLabels[tab];
        }
      }
      
      if (segment === 'profile' && searchParams.get('tab')) {
        const tab = searchParams.get('tab');
        const tabLabels: { [key: string]: string } = {
          'personal': 'Account Info',
          'working-style': 'Working Style',
          'documents': 'Document History',
          'files': 'CV Management',
          'billing': 'Billing History'
        };
        if (tab && tabLabels[tab]) {
          label += ' - ' + tabLabels[tab];
        }
      }
      
      breadcrumbs.push({
        label,
        href: index === pathSegments.length - 1 ? undefined : href,
        isActive: index === pathSegments.length - 1
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();
  
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb className={cn("mb-4", className)}>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.href && !item.isActive ? (
                <BreadcrumbLink asChild>
                  <Link 
                    to={item.href}
                    className="flex items-center hover:text-primary transition-colors duration-200"
                  >
                    {index === 0 && showHome && <Home className="w-4 h-4 mr-1" />}
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="flex items-center font-medium">
                  {index === 0 && showHome && <Home className="w-4 h-4 mr-1" />}
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;