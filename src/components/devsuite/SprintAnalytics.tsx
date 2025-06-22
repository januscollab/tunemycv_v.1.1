import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from './ui/ModernCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Sprint {
  id: string;
  name: string;
  status: string;
}

interface Task {
  id: string;
  sprint_id: string;
  status: string;
  priority: string;
}

interface SprintStats {
  sprintId: string;
  sprintName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionPercentage: number;
  highPriorityTasks: number;
}

const SprintAnalytics = () => {
  const { user } = useAuth();
  const [sprintStats, setSprintStats] = useState<SprintStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      // Load sprints and tasks
      const [sprintsResult, tasksResult] = await Promise.all([
        supabase.from('sprints').select('*').order('order_index'),
        supabase.from('tasks').select('*')
      ]);

      if (sprintsResult.error) throw sprintsResult.error;
      if (tasksResult.error) throw tasksResult.error;

      const sprints = sprintsResult.data || [];
      const tasks = tasksResult.data || [];

      // Calculate statistics for each sprint
      const stats: SprintStats[] = sprints.map(sprint => {
        const sprintTasks = tasks.filter(task => task.sprint_id === sprint.id);
        const completedTasks = sprintTasks.filter(task => task.status === 'completed').length;
        const inProgressTasks = sprintTasks.filter(task => task.status === 'in-progress').length;
        const todoTasks = sprintTasks.filter(task => task.status === 'todo').length;
        const highPriorityTasks = sprintTasks.filter(task => task.priority === 'high').length;

        return {
          sprintId: sprint.id,
          sprintName: sprint.name,
          totalTasks: sprintTasks.length,
          completedTasks,
          inProgressTasks,
          todoTasks,
          completionPercentage: sprintTasks.length > 0 ? Math.round((completedTasks / sprintTasks.length) * 100) : 0,
          highPriorityTasks,
        };
      });

      setSprintStats(stats);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  const totalTasks = sprintStats.reduce((sum, stat) => sum + stat.totalTasks, 0);
  const totalCompleted = sprintStats.reduce((sum, stat) => sum + stat.completedTasks, 0);
  const overallCompletion = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Sprint Analytics</h2>
      </div>

      {/* Overall Stats */}
      <ModernCard className="animate-fade-in">
        <ModernCardHeader>
          <ModernCardTitle>📊 Overall Progress</ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalTasks}</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalCompleted}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {sprintStats.reduce((sum, stat) => sum + stat.inProgressTasks, 0)}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {sprintStats.reduce((sum, stat) => sum + stat.todoTasks, 0)}
              </div>
              <div className="text-sm text-muted-foreground">To Do</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Completion</span>
              <span>{overallCompletion}%</span>
            </div>
            <Progress value={overallCompletion} className="h-3" />
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Sprint-specific Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sprintStats.map((stat) => (
          <ModernCard key={stat.sprintId} className="animate-fade-in hover-scale">
            <ModernCardHeader className="pb-3">
              <ModernCardTitle className="text-lg">🎯 {stat.sprintName}</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <Badge variant="outline">{stat.completionPercentage}%</Badge>
                </div>
                <Progress value={stat.completionPercentage} className="h-3" />
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span>{stat.totalTasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">High Priority:</span>
                    <span>{stat.highPriorityTasks}</span>
                  </div>
                </div>

                <div className="flex gap-2 text-xs">
                  <Badge variant="secondary" className="bg-emerald-500 text-white">
                    ✓ {stat.completedTasks}
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-600 text-white">
                    ⟳ {stat.inProgressTasks}
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-400 text-white">
                    ○ {stat.todoTasks}
                  </Badge>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        ))}
      </div>
    </div>
  );
};

export default SprintAnalytics;