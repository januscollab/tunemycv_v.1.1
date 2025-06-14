import React, { useState } from 'react';
import DevEnvironmentGuard from '@/components/dev/DevEnvironmentGuard';
import DevNavigation from '@/components/dev/DevNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Play, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SprintItem {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  createdAt: Date;
}

interface Sprint {
  id: string;
  name: string;
  items: SprintItem[];
  color: string;
}

const SprintPlan: React.FC = () => {
  const [sprints, setSprints] = useState<Sprint[]>([
    {
      id: 'backlog',
      name: 'Backlog (Long Term)',
      items: [],
      color: 'bg-slate-100'
    },
    {
      id: 'priority',
      name: 'Priority Sprint',
      items: [],
      color: 'bg-red-100'
    },
    {
      id: 'sprint2',
      name: 'Sprint 2',
      items: [],
      color: 'bg-blue-100'
    },
    {
      id: 'sprint3',
      name: 'Sprint 3',
      items: [],
      color: 'bg-green-100'
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DevEnvironmentGuard>
      <DevNavigation />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sprint Planning</h1>
            <p className="text-muted-foreground mt-1">Manage your development backlog and sprints</p>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline">
              <Play className="h-4 w-4 mr-2" />
              Execute Sprint
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {sprints.map((sprint) => (
            <Card key={sprint.id} className="h-fit">
              <CardHeader className={`${sprint.color} rounded-t-lg`}>
                <CardTitle className="flex items-center justify-between text-sm font-semibold">
                  {sprint.name}
                  <Badge variant="secondary">{sprint.items.length}</Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-4 space-y-3">
                {sprint.items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No items yet</p>
                    <Button variant="ghost" size="sm" className="mt-2">
                      <Plus className="h-3 w-3 mr-1" />
                      Add first item
                    </Button>
                  </div>
                ) : (
                  sprint.items.map((item) => (
                    <div key={item.id} className="p-3 border border-border rounded-lg bg-background hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm text-foreground">{item.title}</h4>
                        <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {item.status}
                        </Badge>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Plus className="h-5 w-5 mb-2" />
              Add to Backlog
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Play className="h-5 w-5 mb-2" />
              Execute Priority Sprint
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <ChevronRight className="h-5 w-5 mb-2" />
              Move to Next Sprint
            </Button>
          </CardContent>
        </Card>
      </div>
    </DevEnvironmentGuard>
  );
};

export default SprintPlan;