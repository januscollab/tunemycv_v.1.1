import React, { useState, useEffect, useMemo } from 'react';
import DevEnvironmentGuard from '@/components/dev/DevEnvironmentGuard';
import DevNavigation from '@/components/dev/DevNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSprintTasks } from '@/hooks/useSprintTasks';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  BarChart3,
  PieChart,
  Calendar,
  Users,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

interface SprintMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionRate: number;
  averageTaskAge: number;
  priorityDistribution: { [key: string]: number };
  velocityData: Array<{ sprint: string; completed: number; total: number }>;
  burndownData: Array<{ day: string; remaining: number; ideal: number }>;
}

const SprintAnalytics: React.FC = () => {
  const { tasks } = useSprintTasks();
  const [selectedTimeframe, setSelectedTimeframe] = useState('current');
  const [analyticsData, setAnalyticsData] = useState<SprintMetrics | null>(null);

  const sprints = [
    { id: 'priority', name: 'Priority' },
    { id: 'current', name: 'Current Sprint' },
    { id: 'testing', name: 'Testing' },
    { id: 'backlog', name: 'Backlog' }
  ];

  const calculateMetrics = useMemo(() => {
    if (!tasks.length) return null;

    const filteredTasks = selectedTimeframe === 'all' 
      ? tasks 
      : tasks.filter(task => task.sprintId === selectedTimeframe);

    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(t => t.status === 'done').length;
    const inProgressTasks = filteredTasks.filter(t => t.status === 'in-progress').length;
    const todoTasks = filteredTasks.filter(t => t.status === 'todo').length;
    
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const now = new Date();
    const averageTaskAge = filteredTasks.length > 0 
      ? filteredTasks.reduce((acc, task) => {
          const ageInDays = Math.floor((now.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24));
          return acc + ageInDays;
        }, 0) / filteredTasks.length
      : 0;

    const priorityDistribution = filteredTasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Mock velocity data
    const velocityData = [
      { sprint: 'Sprint 1', completed: 8, total: 12 },
      { sprint: 'Sprint 2', completed: 10, total: 14 },
      { sprint: 'Sprint 3', completed: 12, total: 15 },
      { sprint: 'Current', completed: completedTasks, total: totalTasks },
    ];

    // Mock burndown data
    const burndownData = Array.from({ length: 14 }, (_, i) => ({
      day: `Day ${i + 1}`,
      remaining: Math.max(totalTasks - (i * (totalTasks / 14)), 0),
      ideal: totalTasks - (i * (totalTasks / 14))
    }));

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      completionRate,
      averageTaskAge,
      priorityDistribution,
      velocityData,
      burndownData
    };
  }, [tasks, selectedTimeframe]);

  useEffect(() => {
    setAnalyticsData(calculateMetrics);
  }, [calculateMetrics]);

  const pieChartData = analyticsData ? [
    { name: 'Completed', value: analyticsData.completedTasks, color: '#22c55e' },
    { name: 'In Progress', value: analyticsData.inProgressTasks, color: '#f59e0b' },
    { name: 'Todo', value: analyticsData.todoTasks, color: '#6b7280' }
  ] : [];

  const priorityChartData = analyticsData ? Object.entries(analyticsData.priorityDistribution).map(([priority, count]) => ({
    priority: priority.charAt(0).toUpperCase() + priority.slice(1),
    count,
    color: priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#22c55e'
  })) : [];

  if (!analyticsData) {
    return (
      <DevEnvironmentGuard>
        <DevNavigation />
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
            <p className="text-muted-foreground">Create some tasks to see analytics</p>
          </div>
        </div>
      </DevEnvironmentGuard>
    );
  }

  return (
    <DevEnvironmentGuard>
      <DevNavigation />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sprint Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Track velocity, burndown, and team performance metrics
            </p>
          </div>
          
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              {sprints.map(sprint => (
                <SelectItem key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="velocity">Velocity</TabsTrigger>
            <TabsTrigger value="burndown">Burndown</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.totalTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all statuses
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.completionRate.toFixed(1)}%</div>
                  <Progress value={analyticsData.completionRate} className="h-2 mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Task Age</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.averageTaskAge.toFixed(0)} days</div>
                  <p className="text-xs text-muted-foreground">
                    Time since creation
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.inProgressTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    Active work items
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Task Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPieChart>
                      <RechartsPieChart 
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </RechartsPieChart>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center space-x-4 mt-4">
                    {pieChartData.map((entry) => (
                      <div key={entry.name} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm">{entry.name}: {entry.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Priority Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={priorityChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="priority" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="velocity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sprint Velocity</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Track completion rates across sprints
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analyticsData.velocityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sprint" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" fill="#22c55e" name="Completed" />
                    <Bar dataKey="total" fill="#e5e7eb" name="Total" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="burndown" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sprint Burndown Chart</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Track progress against ideal completion timeline
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analyticsData.burndownData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="remaining" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Actual Remaining"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ideal" 
                      stroke="#6b7280" 
                      strokeDasharray="5 5"
                      name="Ideal Burndown"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-success-50 border border-border rounded-lg">
                    <h4 className="font-medium text-success-foreground mb-2">Strengths</h4>
                    <ul className="text-sm text-success-foreground space-y-1">
                      <li>• High completion rate ({analyticsData.completionRate.toFixed(1)}%)</li>
                      <li>• Consistent velocity across sprints</li>
                      <li>• Good task prioritization</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-warning-50 border border-border rounded-lg">
                    <h4 className="font-medium text-warning-foreground mb-2">Areas for Improvement</h4>
                    <ul className="text-sm text-warning-foreground space-y-1">
                      <li>• Average task age is {analyticsData.averageTaskAge.toFixed(0)} days</li>
                      <li>• Consider breaking down large tasks</li>
                      <li>• Monitor work-in-progress limits</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 border border-border rounded-lg">
                      <h4 className="font-medium mb-1">🎯 Focus on High Priority</h4>
                      <p className="text-sm text-muted-foreground">
                        You have {analyticsData.priorityDistribution.high || 0} high priority tasks pending
                      </p>
                    </div>
                    
                    <div className="p-3 border border-border rounded-lg">
                      <h4 className="font-medium mb-1">⚡ Reduce WIP</h4>
                      <p className="text-sm text-muted-foreground">
                        {analyticsData.inProgressTasks} tasks in progress - consider limiting to 3-5
                      </p>
                    </div>
                    
                    <div className="p-3 border border-border rounded-lg">
                      <h4 className="font-medium mb-1">📊 Regular Reviews</h4>
                      <p className="text-sm text-muted-foreground">
                        Schedule weekly sprint reviews to maintain momentum
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DevEnvironmentGuard>
  );
};

export default SprintAnalytics;