import React, { useState, useEffect } from 'react';
import { Bug, CheckCircle, AlertTriangle, Wrench, Download, FileText } from 'lucide-react';
import { designSystemAuditor, type DesignSystemViolation, type ComplianceReport } from '@/utils/designSystemAuditor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

const DesignSystemAudit = () => {
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoFixing, setAutoFixing] = useState(false);
  const { toast } = useToast();

  const runFullAudit = async () => {
    setLoading(true);
    try {
      // Simulate file scanning - in a real implementation, this would scan actual files
      const mockViolations: DesignSystemViolation[] = [
        {
          type: 'hardcoded_color',
          severity: 'critical',
          file: 'src/components/ui/button.tsx',
          element: 'Button',
          description: 'Hardcoded color "bg-blue-500" should use design system token',
          currentValue: 'bg-blue-500',
          expectedToken: 'bg-primary',
          suggestedFix: 'Replace "bg-blue-500" with "bg-primary"',
          autoFixable: true
        },
        {
          type: 'hardcoded_spacing',
          severity: 'warning',
          file: 'src/components/layout/Header.tsx',
          element: 'Header',
          description: 'Non-standard spacing "p-5" should use design system scale',
          currentValue: 'p-5',
          expectedToken: 'p-space-1 or p-space-1.5',
          suggestedFix: 'Use standard spacing scale instead of "p-5"',
          autoFixable: false
        },
        {
          type: 'inline_styles',
          severity: 'warning',
          file: 'src/components/charts/Chart.tsx',
          element: 'div',
          description: 'Inline styles should be replaced with design system classes',
          currentValue: 'style={{ padding: "16px" }}',
          expectedToken: 'Tailwind CSS classes from design system',
          suggestedFix: 'Convert inline styles to appropriate Tailwind classes',
          autoFixable: false
        }
      ];

      const complianceReport = designSystemAuditor.generateReport(mockViolations);
      setReport(complianceReport);

      toast({
        title: 'Audit Complete',
        description: `Found ${complianceReport.totalViolations} violations`,
        variant: complianceReport.criticalViolations > 0 ? 'destructive' : 'default'
      });
    } catch (error) {
      toast({
        title: 'Audit Failed',
        description: 'Failed to run design system audit',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const autoFixViolations = async () => {
    if (!report) return;

    setAutoFixing(true);
    try {
      const fixableViolations = report.violations.filter(v => v.autoFixable);
      
      // Simulate auto-fixing
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Auto-fix Complete',
        description: `Fixed ${fixableViolations.length} violations automatically`,
        variant: 'default'
      });

      // Update report to remove fixed violations
      const remainingViolations = report.violations.filter(v => !v.autoFixable);
      const updatedReport = designSystemAuditor.generateReport(remainingViolations);
      setReport(updatedReport);
    } catch (error) {
      toast({
        title: 'Auto-fix Failed',
        description: 'Failed to auto-fix violations',
        variant: 'destructive'
      });
    } finally {
      setAutoFixing(false);
    }
  };

  const exportReport = () => {
    if (!report) return;

    const reportData = {
      timestamp: new Date().toISOString(),
      summary: report.summary,
      statistics: {
        total: report.totalViolations,
        critical: report.criticalViolations,
        warning: report.warningViolations,
        minor: report.minorViolations
      },
      violations: report.violations
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design-system-audit-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge variant="secondary">Warning</Badge>;
      case 'minor':
        return <Badge variant="outline">Minor</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getViolationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      hardcoded_color: 'Hardcoded Color',
      hardcoded_spacing: 'Hardcoded Spacing',
      hardcoded_sizing: 'Hardcoded Sizing',
      inline_styles: 'Inline Styles',
      non_standard_component: 'Non-Standard Component',
      missing_token: 'Missing Token',
      custom_layout: 'Custom Layout'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-background p-space-1.5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-space-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-title font-bold text-foreground mb-space-0.5">
                Design System Audit
              </h1>
              <p className="text-muted-foreground">
                Comprehensive analysis of design system compliance across your codebase
              </p>
            </div>
            <div className="flex items-center gap-space-0.75">
              <Button
                onClick={runFullAudit}
                disabled={loading}
                className="flex items-center gap-space-0.5"
              >
                <Bug className="h-4 w-4" />
                {loading ? 'Scanning...' : 'Run Audit'}
              </Button>
              {report && (
                <>
                  <Button
                    onClick={autoFixViolations}
                    disabled={autoFixing || !report.violations.some(v => v.autoFixable)}
                    variant="outline"
                    className="flex items-center gap-space-0.5"
                  >
                    <Wrench className="h-4 w-4" />
                    {autoFixing ? 'Fixing...' : 'Auto Fix'}
                  </Button>
                  <Button
                    onClick={exportReport}
                    variant="outline"
                    className="flex items-center gap-space-0.5"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Compliance Summary */}
        {report && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-space-1.5 mb-space-2">
            <Card>
              <CardContent className="p-space-1.5">
                <div className="flex items-center gap-space-0.75">
                  <div className={`p-space-0.75 rounded-lg ${
                    report.status === 'pass' ? 'bg-success-50 text-success' : 'bg-destructive-50 text-destructive'
                  }`}>
                    {report.status === 'pass' ? 
                      <CheckCircle className="h-5 w-5" /> : 
                      <AlertTriangle className="h-5 w-5" />
                    }
                  </div>
                  <div>
                    <p className="text-caption font-medium text-muted-foreground">Status</p>
                    <p className="text-subheading font-semibold text-foreground">
                      {report.status === 'pass' ? 'Compliant' : 'Needs Attention'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-space-1.5">
                <div className="flex items-center gap-space-0.75">
                  <div className="p-space-0.75 rounded-lg bg-destructive-50 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-caption font-medium text-muted-foreground">Critical</p>
                    <p className="text-subheading font-semibold text-foreground">
                      {report.criticalViolations}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-space-1.5">
                <div className="flex items-center gap-space-0.75">
                  <div className="p-space-0.75 rounded-lg bg-warning-50 text-warning">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-caption font-medium text-muted-foreground">Warnings</p>
                    <p className="text-subheading font-semibold text-foreground">
                      {report.warningViolations}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-space-1.5">
                <div className="flex items-center gap-space-0.75">
                  <div className="p-space-0.75 rounded-lg bg-info-50 text-info">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-caption font-medium text-muted-foreground">Total Issues</p>
                    <p className="text-subheading font-semibold text-foreground">
                      {report.totalViolations}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Report Summary */}
        {report && (
          <Card className="mb-space-2">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>
                Analysis results and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{report.summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Violations Details */}
        {report && report.violations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Violations</CardTitle>
              <CardDescription>
                Detailed breakdown of design system violations found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All ({report.totalViolations})</TabsTrigger>
                  <TabsTrigger value="critical">Critical ({report.criticalViolations})</TabsTrigger>
                  <TabsTrigger value="warning">Warning ({report.warningViolations})</TabsTrigger>
                  <TabsTrigger value="minor">Minor ({report.minorViolations})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-space-1.5">
                  <ViolationsTable violations={report.violations} getSeverityBadge={getSeverityBadge} getViolationTypeLabel={getViolationTypeLabel} />
                </TabsContent>
                
                <TabsContent value="critical" className="mt-space-1.5">
                  <ViolationsTable 
                    violations={report.violations.filter(v => v.severity === 'critical')} 
                    getSeverityBadge={getSeverityBadge} 
                    getViolationTypeLabel={getViolationTypeLabel} 
                  />
                </TabsContent>
                
                <TabsContent value="warning" className="mt-space-1.5">
                  <ViolationsTable 
                    violations={report.violations.filter(v => v.severity === 'warning')} 
                    getSeverityBadge={getSeverityBadge} 
                    getViolationTypeLabel={getViolationTypeLabel} 
                  />
                </TabsContent>
                
                <TabsContent value="minor" className="mt-space-1.5">
                  <ViolationsTable 
                    violations={report.violations.filter(v => v.severity === 'minor')} 
                    getSeverityBadge={getSeverityBadge} 
                    getViolationTypeLabel={getViolationTypeLabel} 
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!report && !loading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-space-3">
              <Bug className="h-12 w-12 text-muted-foreground mb-space-1" />
              <h3 className="text-subheading font-semibold text-foreground mb-space-0.5">
                No Audit Data
              </h3>
              <p className="text-muted-foreground text-center mb-space-1.5">
                Run a design system audit to analyze your codebase for compliance violations
              </p>
              <Button onClick={runFullAudit} className="flex items-center gap-space-0.5">
                <Bug className="h-4 w-4" />
                Run Your First Audit
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

interface ViolationsTableProps {
  violations: DesignSystemViolation[];
  getSeverityBadge: (severity: string) => JSX.Element;
  getViolationTypeLabel: (type: string) => string;
}

const ViolationsTable: React.FC<ViolationsTableProps> = ({ violations, getSeverityBadge, getViolationTypeLabel }) => {
  if (violations.length === 0) {
    return (
      <div className="text-center py-space-2 text-muted-foreground">
        No violations found in this category
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Severity</TableHead>
          <TableHead>File</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Fix</TableHead>
          <TableHead>Auto-fixable</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {violations.map((violation, index) => (
          <TableRow key={index}>
            <TableCell>
              <Badge variant="outline">
                {getViolationTypeLabel(violation.type)}
              </Badge>
            </TableCell>
            <TableCell>{getSeverityBadge(violation.severity)}</TableCell>
            <TableCell className="font-mono text-caption">
              {violation.file}
            </TableCell>
            <TableCell className="max-w-md">
              <div>
                <p className="text-foreground">{violation.description}</p>
                <p className="text-caption text-muted-foreground mt-space-0.25">
                  Current: <code>{violation.currentValue}</code>
                </p>
              </div>
            </TableCell>
            <TableCell className="max-w-md">
              <p className="text-caption text-muted-foreground">
                {violation.suggestedFix}
              </p>
            </TableCell>
            <TableCell>
              {violation.autoFixable ? (
                <Badge variant="default" className="bg-success-50 text-success">
                  Yes
                </Badge>
              ) : (
                <Badge variant="outline">No</Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DesignSystemAudit;