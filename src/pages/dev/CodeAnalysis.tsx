import React, { useState, useEffect } from 'react';
import DevEnvironmentGuard from '@/components/dev/DevEnvironmentGuard';
import DevNavigation from '@/components/dev/DevNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  GitBranch,
  Clock,
  Target,
  Zap,
  RefreshCw
} from 'lucide-react';

interface FileMetrics {
  path: string;
  lines: number;
  size: number;
  complexity: number;
  lastModified: Date;
  issues: string[];
}

interface QualityMetrics {
  maintainability: number;
  testCoverage: number;
  codeSmells: number;
  technicalDebt: number;
  duplicatedLines: number;
  cycomplexity: number;
}

interface DependencyInfo {
  name: string;
  type: 'component' | 'hook' | 'utility' | 'external';
  usedBy: string[];
  dependencies: string[];
  complexity: number;
}

const CodeAnalysis: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);
  const [fileMetrics, setFileMetrics] = useState<FileMetrics[]>([]);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics>({
    maintainability: 85,
    testCoverage: 72,
    codeSmells: 12,
    technicalDebt: 8,
    duplicatedLines: 5,
    cycomplexity: 3.2
  });
  const [dependencies, setDependencies] = useState<DependencyInfo[]>([]);

  useEffect(() => {
    // Simulate loading saved analysis data
    const savedAnalysis = localStorage.getItem('dev-code-analysis');
    if (savedAnalysis) {
      try {
        const data = JSON.parse(savedAnalysis);
        setLastAnalyzed(new Date(data.lastAnalyzed));
        setFileMetrics(data.fileMetrics || []);
        setQualityMetrics(data.qualityMetrics || qualityMetrics);
        setDependencies(data.dependencies || []);
      } catch (error) {
        console.error('[CodeAnalysis] Failed to load saved analysis:', error);
      }
    }
  }, []);

  const mockFileMetrics: FileMetrics[] = [
    {
      path: 'src/pages/dev/SprintPlan.tsx',
      lines: 226,
      size: 7832,
      complexity: 8,
      lastModified: new Date(),
      issues: ['Long file - consider splitting', 'High complexity in handleSaveTask']
    },
    {
      path: 'src/components/dev/TaskEditor.tsx',
      lines: 156,
      size: 5124,
      complexity: 5,
      lastModified: new Date(),
      issues: ['Consider extracting form validation']
    },
    {
      path: 'src/hooks/useSprintTasks.ts',
      lines: 98,
      size: 3245,
      complexity: 4,
      lastModified: new Date(),
      issues: []
    }
  ];

  const mockDependencies: DependencyInfo[] = [
    {
      name: 'TaskEditor',
      type: 'component',
      usedBy: ['SprintPlan', 'AIAssistant'],
      dependencies: ['Dialog', 'Button', 'Input'],
      complexity: 5
    },
    {
      name: 'useSprintTasks',
      type: 'hook',
      usedBy: ['SprintPlan', 'AIAssistant'],
      dependencies: ['useState', 'useEffect'],
      complexity: 4
    },
    {
      name: 'EnhancedSprintBoard',
      type: 'component',
      usedBy: ['SprintPlan'],
      dependencies: ['DndContext', 'SprintColumn'],
      complexity: 6
    }
  ];

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setFileMetrics(mockFileMetrics);
    setDependencies(mockDependencies);
    setLastAnalyzed(new Date());
    
    // Save analysis data
    const analysisData = {
      lastAnalyzed: new Date().toISOString(),
      fileMetrics: mockFileMetrics,
      qualityMetrics,
      dependencies: mockDependencies
    };
    
    localStorage.setItem('dev-code-analysis', JSON.stringify(analysisData));
    setIsAnalyzing(false);
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplexityBadge = (complexity: number) => {
    if (complexity <= 3) return { variant: 'default' as const, text: 'Low' };
    if (complexity <= 6) return { variant: 'secondary' as const, text: 'Medium' };
    return { variant: 'destructive' as const, text: 'High' };
  };

  return (
    <DevEnvironmentGuard>
      <DevNavigation />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Code Analysis</h1>
            <p className="text-muted-foreground mt-1">
              Analyze code quality, dependencies, and technical debt
            </p>
            {lastAnalyzed && (
              <p className="text-xs text-muted-foreground mt-1">
                Last analyzed: {lastAnalyzed.toLocaleString()}
              </p>
            )}
          </div>
          
          <Button onClick={runAnalysis} disabled={isAnalyzing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="files">File Metrics</TabsTrigger>
            <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Maintainability</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    <span className={getQualityColor(qualityMetrics.maintainability)}>
                      {qualityMetrics.maintainability}%
                    </span>
                  </div>
                  <Progress value={qualityMetrics.maintainability} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Test Coverage</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    <span className={getQualityColor(qualityMetrics.testCoverage)}>
                      {qualityMetrics.testCoverage}%
                    </span>
                  </div>
                  <Progress value={qualityMetrics.testCoverage} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Code Smells</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {qualityMetrics.codeSmells}
                  </div>
                  <p className="text-xs text-muted-foreground">Issues detected</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Technical Debt</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {qualityMetrics.technicalDebt}h
                  </div>
                  <p className="text-xs text-muted-foreground">Estimated hours</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Duplicated Lines</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {qualityMetrics.duplicatedLines}%
                  </div>
                  <p className="text-xs text-muted-foreground">Of total codebase</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Complexity</CardTitle>
                  <Code className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {qualityMetrics.cycomplexity}
                  </div>
                  <p className="text-xs text-muted-foreground">Cyclomatic complexity</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>File Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {fileMetrics.map((file, index) => (
                      <div key={index} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{file.path}</span>
                          </div>
                          <Badge {...getComplexityBadge(file.complexity)}>
                            {getComplexityBadge(file.complexity).text}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground mb-2">
                          <div>Lines: {file.lines}</div>
                          <div>Size: {(file.size / 1024).toFixed(1)}KB</div>
                          <div>Complexity: {file.complexity}</div>
                        </div>
                        
                        {file.issues.length > 0 && (
                          <div className="space-y-1">
                            {file.issues.map((issue, i) => (
                              <div key={i} className="flex items-center space-x-2 text-xs text-yellow-600">
                                <AlertTriangle className="h-3 w-3" />
                                <span>{issue}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dependencies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dependency Graph</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {dependencies.map((dep, index) => (
                      <div key={index} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <GitBranch className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{dep.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {dep.type}
                            </Badge>
                          </div>
                          <Badge {...getComplexityBadge(dep.complexity)}>
                            {getComplexityBadge(dep.complexity).text}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Used by: </span>
                            <span>{dep.usedBy.join(', ')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Dependencies: </span>
                            <span>{dep.dependencies.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Code Issues & Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {fileMetrics.filter(f => f.issues.length > 0).map((file, index) => (
                      <div key={index} className="space-y-2">
                        <h4 className="font-medium text-sm">{file.path}</h4>
                        {file.issues.map((issue, i) => (
                          <div key={i} className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm text-yellow-800">{issue}</p>
                              <p className="text-xs text-yellow-600 mt-1">
                                Consider refactoring to improve maintainability
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                    
                    {fileMetrics.filter(f => f.issues.length > 0).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No issues detected</p>
                        <p className="text-sm mt-1">Your code quality looks good!</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DevEnvironmentGuard>
  );
};

export default CodeAnalysis;