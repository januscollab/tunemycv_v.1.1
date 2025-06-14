import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Code, AlertTriangle } from 'lucide-react';
import { useSecureAuth } from '@/hooks/useSecureAuth';

const DevLogin: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdminAuth();
  const navigate = useNavigate();
  const { secureSignIn } = useSecureAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect admin users to sprint plan
  useEffect(() => {
    if (user && isAdmin && !loading) {
      navigate('/dev/sprintplan');
    }
  }, [user, isAdmin, loading, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  // If user is logged in but not admin, show access denied
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              You don't have admin privileges to access the dev suite.
            </p>
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to Main App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAuthLoading(true);

    try {
      const result = await secureSignIn(email, password);
      if (!result.success) {
        setError(result.error || 'Login failed');
      }
      // Success will be handled by useEffect above
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="flex items-center justify-center space-x-2">
            <Code className="h-5 w-5" />
            <span>Dev Suite Access</span>
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Admin credentials required
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tunemycv.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={authLoading}
            >
              {authLoading ? 'Signing in...' : 'Access Dev Suite'}
            </Button>
          </form>
          
          <div className="mt-6 pt-6 border-t text-center">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              ← Back to Main App
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevLogin;