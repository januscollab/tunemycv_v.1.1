
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, User } from 'lucide-react';

interface AuthSidebarProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const AuthSidebar: React.FC<AuthSidebarProps> = ({ title, description, icon }) => {
  return (
    <div className="lg:col-span-1">
      <Card className="sticky top-6 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-xl font-semibold">
            {icon || <User className="h-6 w-6 text-apricot mr-2" />}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-blueberry/80 dark:text-apple-core/80 text-center font-normal">
            {description}
          </p>
          <Link to="/auth">
            <Button className="w-full bg-apricot hover:bg-apricot/90">
              Sign In to Get Started
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthSidebar;
