import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SprintManager from '@/components/devsuite/SprintManager';
import DevSuiteSettings from '@/components/devsuite/DevSuiteSettings';
import ExecutionLogs from '@/components/devsuite/ExecutionLogs';
import SprintAnalytics from '@/components/devsuite/SprintAnalytics';
import ArchivedStoriesTab from '@/components/devsuite/ArchivedStoriesTab';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const DevSuite = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>DevSuite - Sprint Management</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Please sign in to access DevSuite features
              </p>
              <Link to="/auth">
                <Button>Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">DevSuite</h1>
          <p className="text-muted-foreground">
            Modular sprint management with AI integration
          </p>
        </div>

        <Tabs defaultValue="sprints" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="sprints">Sprint Manager</TabsTrigger>
            <TabsTrigger value="archived">Archived Stories</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="logs">Execution Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="sprints">
            <SprintManager />
          </TabsContent>

          <TabsContent value="archived">
            <ArchivedStoriesTab />
          </TabsContent>

          <TabsContent value="analytics">
            <SprintAnalytics />
          </TabsContent>

          <TabsContent value="settings">
            <DevSuiteSettings />
          </TabsContent>

          <TabsContent value="logs">
            <ExecutionLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DevSuite;