/**
 * Complete Design System Compliance Fix Plan
 * Comprehensive task breakdown for fixing all violations
 */

export interface FixPlanTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  sprintId: string;
  tags: string[];
  estimatedHours: number;
  violationType: string;
  affectedFiles: string[];
  expectedOutcome: string;
}

export const designSystemFixPlan: FixPlanTask[] = [
  // PRIORITY SPRINT - Critical Violations
  {
    id: 'fix-core-colors-1',
    title: 'Fix hardcoded colors in Navigation & Footer',
    description: 'Replace all hardcoded gray, blue, and other color classes with design system tokens in Navigation.tsx and Footer.tsx components.',
    priority: 'high',
    status: 'todo',
    sprintId: 'priority',
    tags: ['hardcoded-colors', 'critical', 'core-components'],
    estimatedHours: 4,
    violationType: 'hardcoded_color',
    affectedFiles: ['src/components/Navigation.tsx', 'src/components/Footer.tsx'],
    expectedOutcome: 'All navigation and footer elements use design system color tokens'
  },
  {
    id: 'fix-admin-colors',
    title: 'Fix hardcoded colors in Admin Dashboard',
    description: 'Replace hardcoded colors in all admin components with proper design system tokens.',
    priority: 'high',
    status: 'todo',
    sprintId: 'priority',
    tags: ['hardcoded-colors', 'admin', 'critical'],
    estimatedHours: 6,
    violationType: 'hardcoded_color',
    affectedFiles: ['src/components/admin/*.tsx'],
    expectedOutcome: 'Admin dashboard fully compliant with design system colors'
  },
  {
    id: 'fix-analysis-colors',
    title: 'Fix hardcoded colors in Analysis Components',
    description: 'Update all analysis-related components to use design system color tokens instead of hardcoded values.',
    priority: 'high',
    status: 'todo',
    sprintId: 'priority',
    tags: ['hardcoded-colors', 'analysis', 'critical'],
    estimatedHours: 8,
    violationType: 'hardcoded_color',
    affectedFiles: ['src/components/analysis/*.tsx'],
    expectedOutcome: 'Analysis components use semantic color tokens'
  },
  {
    id: 'eliminate-inline-styles',
    title: 'Remove all inline styles',
    description: 'Replace 13 instances of inline styles with proper Tailwind CSS classes using design system tokens.',
    priority: 'high',
    status: 'todo',
    sprintId: 'priority',
    tags: ['inline-styles', 'critical'],
    estimatedHours: 3,
    violationType: 'inline_styles',
    affectedFiles: ['src/components/common/*.tsx', 'src/components/dev/*.tsx'],
    expectedOutcome: 'Zero inline styles in codebase'
  },
  {
    id: 'implement-monitor',
    title: 'Implement Design System Monitor',
    description: 'Deploy the real-time design system compliance monitor to catch violations during development.',
    priority: 'high',
    status: 'todo',
    sprintId: 'priority',
    tags: ['monitoring', 'tooling', 'critical'],
    estimatedHours: 2,
    violationType: 'tooling',
    affectedFiles: ['src/utils/designSystemMonitor.tsx'],
    expectedOutcome: 'Live monitoring of design system compliance'
  },
  {
    id: 'fix-auth-colors',
    title: 'Fix hardcoded colors in Auth Components',
    description: 'Replace hardcoded colors in authentication components with design system tokens.',
    priority: 'high',
    status: 'todo',
    sprintId: 'priority',
    tags: ['hardcoded-colors', 'auth', 'critical'],
    estimatedHours: 4,
    violationType: 'hardcoded_color',
    affectedFiles: ['src/components/auth/*.tsx'],
    expectedOutcome: 'Auth components fully compliant with design system'
  },

  // SPRINT 2 - Component Standardization
  {
    id: 'standardize-spacing',
    title: 'Standardize spacing patterns across components',
    description: 'Replace 2000+ non-standard spacing classes with design system spacing scale (p-1, p-2, p-3, etc.).',
    priority: 'medium',
    status: 'todo',
    sprintId: 'sprint2',
    tags: ['spacing', 'standardization'],
    estimatedHours: 12,
    violationType: 'hardcoded_spacing',
    affectedFiles: ['src/components/**/*.tsx', 'src/pages/**/*.tsx'],
    expectedOutcome: 'All spacing follows design system scale'
  },
  {
    id: 'fix-sizing-classes',
    title: 'Fix non-standard sizing classes',
    description: 'Replace irregular width/height classes with standard design system sizing tokens.',
    priority: 'medium',
    status: 'todo',
    sprintId: 'sprint2',
    tags: ['sizing', 'standardization'],
    estimatedHours: 6,
    violationType: 'hardcoded_sizing',
    affectedFiles: ['src/components/**/*.tsx'],
    expectedOutcome: 'Consistent sizing using design system scale'
  },
  {
    id: 'audit-modal-implementations',
    title: 'Audit and fix modal implementations',
    description: 'Replace custom modal implementations with Dialog component from design system.',
    priority: 'medium',
    status: 'todo',
    sprintId: 'sprint2',
    tags: ['modals', 'components', 'standardization'],
    estimatedHours: 8,
    violationType: 'non_standard_component',
    affectedFiles: ['src/components/**/*.tsx'],
    expectedOutcome: 'All modals use Dialog component'
  },
  {
    id: 'standardize-buttons',
    title: 'Replace custom buttons with design system components',
    description: 'Replace manual button styling with Button component from design system.',
    priority: 'medium',
    status: 'todo',
    sprintId: 'sprint2',
    tags: ['buttons', 'components', 'standardization'],
    estimatedHours: 5,
    violationType: 'non_standard_component',
    affectedFiles: ['src/components/**/*.tsx'],
    expectedOutcome: 'All buttons use Button component'
  },
  {
    id: 'fix-profile-colors',
    title: 'Fix hardcoded colors in Profile Components',
    description: 'Update profile-related components to use design system color tokens.',
    priority: 'medium',
    status: 'todo',
    sprintId: 'sprint2',
    tags: ['hardcoded-colors', 'profile'],
    estimatedHours: 5,
    violationType: 'hardcoded_color',
    affectedFiles: ['src/components/profile/*.tsx'],
    expectedOutcome: 'Profile components use semantic color tokens'
  },
  {
    id: 'fix-ui-component-colors',
    title: 'Fix hardcoded colors in UI Components',
    description: 'Ensure all UI components use design system tokens consistently.',
    priority: 'medium',
    status: 'todo',
    sprintId: 'sprint2',
    tags: ['hardcoded-colors', 'ui-components'],
    estimatedHours: 8,
    violationType: 'hardcoded_color',
    affectedFiles: ['src/components/ui/*.tsx'],
    expectedOutcome: 'UI components fully compliant with design system'
  },

  // SPRINT 3 - Automation & Tooling
  {
    id: 'build-compliance-checker',
    title: 'Build automated compliance checker',
    description: 'Create automated tool to scan codebase for design system violations during CI/CD.',
    priority: 'medium',
    status: 'todo',
    sprintId: 'sprint3',
    tags: ['automation', 'ci-cd', 'tooling'],
    estimatedHours: 10,
    violationType: 'tooling',
    affectedFiles: ['scripts/', 'package.json'],
    expectedOutcome: 'Automated violation detection in CI/CD pipeline'
  },
  {
    id: 'pre-commit-hooks',
    title: 'Create pre-commit hooks for violations',
    description: 'Set up Git hooks to prevent commits with design system violations.',
    priority: 'medium',
    status: 'todo',
    sprintId: 'sprint3',
    tags: ['git-hooks', 'automation', 'prevention'],
    estimatedHours: 4,
    violationType: 'tooling',
    affectedFiles: ['.husky/', 'package.json'],
    expectedOutcome: 'Pre-commit validation of design system compliance'
  },
  {
    id: 'build-time-enforcement',
    title: 'Set up build-time enforcement',
    description: 'Configure build process to fail on critical design system violations.',
    priority: 'medium',
    status: 'todo',
    sprintId: 'sprint3',
    tags: ['build-process', 'enforcement'],
    estimatedHours: 6,
    violationType: 'tooling',
    affectedFiles: ['vite.config.ts', 'package.json'],
    expectedOutcome: 'Build fails on critical design system violations'
  },
  {
    id: 'auto-fix-tool',
    title: 'Create auto-fix tool for common violations',
    description: 'Build tool to automatically fix common violations like hardcoded colors.',
    priority: 'medium',
    status: 'todo',
    sprintId: 'sprint3',
    tags: ['automation', 'auto-fix', 'tooling'],
    estimatedHours: 8,
    violationType: 'tooling',
    affectedFiles: ['scripts/auto-fix.ts'],
    expectedOutcome: 'Automated fixing of simple violations'
  },
  {
    id: 'compliance-dashboard',
    title: 'Build compliance monitoring dashboard',
    description: 'Create dashboard to track design system compliance metrics over time.',
    priority: 'low',
    status: 'todo',
    sprintId: 'sprint3',
    tags: ['dashboard', 'metrics', 'monitoring'],
    estimatedHours: 12,
    violationType: 'tooling',
    affectedFiles: ['src/pages/dev/ComplianceDashboard.tsx'],
    expectedOutcome: 'Real-time compliance metrics dashboard'
  },
  {
    id: 'documentation-guidelines',
    title: 'Create design system documentation and guidelines',
    description: 'Document all design system patterns, tokens, and usage guidelines for the team.',
    priority: 'medium',
    status: 'todo',
    sprintId: 'sprint3',
    tags: ['documentation', 'guidelines'],
    estimatedHours: 6,
    violationType: 'documentation',
    affectedFiles: ['docs/', 'README.md'],
    expectedOutcome: 'Comprehensive design system documentation'
  },

  // BACKLOG - Long Term
  {
    id: 'performance-optimization',
    title: 'Optimize design token performance',
    description: 'Analyze and optimize design token loading and application for better performance.',
    priority: 'low',
    status: 'todo',
    sprintId: 'backlog',
    tags: ['performance', 'optimization'],
    estimatedHours: 8,
    violationType: 'performance',
    affectedFiles: ['src/index.css', 'tailwind.config.ts'],
    expectedOutcome: 'Improved design token performance'
  },
  {
    id: 'advanced-component-patterns',
    title: 'Implement advanced component patterns',
    description: 'Create complex component patterns following design system principles.',
    priority: 'low',
    status: 'todo',
    sprintId: 'backlog',
    tags: ['components', 'patterns', 'advanced'],
    estimatedHours: 16,
    violationType: 'enhancement',
    affectedFiles: ['src/components/ui/'],
    expectedOutcome: 'Advanced component library'
  },
  {
    id: 'design-system-expansion',
    title: 'Expand design system coverage',
    description: 'Add missing design tokens and components identified during compliance audit.',
    priority: 'low',
    status: 'todo',
    sprintId: 'backlog',
    tags: ['expansion', 'design-system'],
    estimatedHours: 20,
    violationType: 'enhancement',
    affectedFiles: ['src/index.css', 'tailwind.config.ts', 'src/components/ui/'],
    expectedOutcome: 'Comprehensive design system coverage'
  },
  {
    id: 'team-training',
    title: 'Create team training materials',
    description: 'Develop training materials and workshops for design system adoption.',
    priority: 'low',
    status: 'todo',
    sprintId: 'backlog',
    tags: ['training', 'education'],
    estimatedHours: 12,
    violationType: 'education',
    affectedFiles: ['docs/training/'],
    expectedOutcome: 'Team training program for design system'
  },
  {
    id: 'migration-tools',
    title: 'Build migration tools for future updates',
    description: 'Create tools to help migrate components when design system updates.',
    priority: 'low',
    status: 'todo',
    sprintId: 'backlog',
    tags: ['migration', 'tooling', 'maintenance'],
    estimatedHours: 15,
    violationType: 'tooling',
    affectedFiles: ['scripts/migrate.ts'],
    expectedOutcome: 'Automated migration tools for design system updates'
  }
];

export const getTasksBySprint = (sprintId: string) => {
  return designSystemFixPlan.filter(task => task.sprintId === sprintId);
};

export const getTasksByViolationType = (violationType: string) => {
  return designSystemFixPlan.filter(task => task.violationType === violationType);
};

export const getTotalEstimatedHours = () => {
  return designSystemFixPlan.reduce((total, task) => total + task.estimatedHours, 0);
};

export const getComplianceMetrics = () => {
  const totalTasks = designSystemFixPlan.length;
  const completedTasks = designSystemFixPlan.filter(task => task.status === 'done').length;
  const inProgressTasks = designSystemFixPlan.filter(task => task.status === 'in-progress').length;
  const todoTasks = designSystemFixPlan.filter(task => task.status === 'todo').length;
  
  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    completionPercentage: (completedTasks / totalTasks) * 100,
    totalEstimatedHours: getTotalEstimatedHours()
  };
};