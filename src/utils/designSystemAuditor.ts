/**
 * Design System Compliance Auditor
 * Ensures 100% alignment with the official design system
 */

export interface DesignSystemViolation {
  type: 'hardcoded_color' | 'hardcoded_spacing' | 'hardcoded_sizing' | 'inline_styles' | 'non_standard_component' | 'missing_token' | 'custom_layout';
  severity: 'critical' | 'warning' | 'minor';
  file: string;
  line?: number;
  element: string;
  description: string;
  currentValue: string;
  expectedToken: string;
  suggestedFix: string;
  autoFixable: boolean;
}

export interface ComplianceReport {
  status: 'pass' | 'fail';
  totalViolations: number;
  criticalViolations: number;
  warningViolations: number;
  minorViolations: number;
  violations: DesignSystemViolation[];
  summary: string;
}

export class DesignSystemAuditor {
  private designTokens = {
    colors: {
      // Primary palette
      primary: 'rgb(255 74 0)',
      'primary-foreground': 'rgb(255 255 255)',
      'primary-50': 'rgb(255 247 237)',
      'primary-100': 'rgb(255 237 213)',
      
      // Status colors
      success: 'rgb(34 197 94)',
      'success-foreground': 'rgb(255 255 255)',
      'success-50': 'rgb(240 253 244)',
      warning: 'rgb(245 158 11)',
      'warning-foreground': 'rgb(255 255 255)',
      'warning-50': 'rgb(255 251 235)',
      destructive: 'rgb(239 68 68)',
      'destructive-foreground': 'rgb(255 255 255)',
      'destructive-50': 'rgb(254 242 242)',
      info: 'rgb(59 130 246)',
      'info-foreground': 'rgb(255 255 255)',
      'info-50': 'rgb(239 246 255)',
      
      // Surface colors
      background: 'rgb(255 255 255)',
      foreground: 'rgb(15 23 42)',
      muted: 'rgb(248 250 252)',
      'muted-foreground': 'rgb(100 116 139)',
      card: 'rgb(255 255 255)',
      'card-foreground': 'rgb(15 23 42)',
      border: 'rgb(226 232 240)',
      
      // Deprecated - should not be used
      'gray-50': 'DEPRECATED - use muted',
      'gray-100': 'DEPRECATED - use muted',
      'gray-200': 'DEPRECATED - use border',
      'gray-300': 'DEPRECATED - use border',
      'gray-500': 'DEPRECATED - use muted-foreground',
      'gray-600': 'DEPRECATED - use foreground',
      'gray-700': 'DEPRECATED - use foreground',
      'gray-800': 'DEPRECATED - use foreground',
      'gray-900': 'DEPRECATED - use foreground',
      'blue-50': 'DEPRECATED - use info-50',
      'blue-100': 'DEPRECATED - use info-50',
      'blue-500': 'DEPRECATED - use info',
      'blue-600': 'DEPRECATED - use info',
      'green-50': 'DEPRECATED - use success-50',
      'green-500': 'DEPRECATED - use success',
      'green-600': 'DEPRECATED - use success',
      'red-50': 'DEPRECATED - use destructive-50',
      'red-500': 'DEPRECATED - use destructive',
      'red-600': 'DEPRECATED - use destructive',
      'yellow-50': 'DEPRECATED - use warning-50',
      'yellow-500': 'DEPRECATED - use warning',
      'yellow-600': 'DEPRECATED - use warning',
      white: 'DEPRECATED - use background',
      black: 'DEPRECATED - use foreground',
    },
    
    spacing: {
      // Standard spacing scale - only these should be used
      '1': '0.25rem',  // 4px
      '2': '0.5rem',   // 8px
      '3': '0.75rem',  // 12px
      '4': '1rem',     // 16px
      '6': '1.5rem',   // 24px
      '8': '2rem',     // 32px
      '12': '3rem',    // 48px
      '16': '4rem',    // 64px
      '20': '5rem',    // 80px
    },
    
    sizing: {
      // Standard sizing scale
      '4': '1rem',
      '5': '1.25rem',
      '6': '1.5rem',
      '8': '2rem',
      '10': '2.5rem',
      '12': '3rem',
      '16': '4rem',
      '20': '5rem',
    }
  };

  private hardcodedColorPatterns = [
    // Background colors
    /bg-(red|blue|green|yellow|purple|pink|indigo|gray|slate|white|black)-\d+/g,
    // Text colors
    /text-(red|blue|green|yellow|purple|pink|indigo|gray|slate|white|black)-\d+/g,
    // Border colors
    /border-(red|blue|green|yellow|purple|pink|indigo|gray|slate|white|black)-\d+/g,
  ];

  private hardcodedSpacingPatterns = [
    // Padding/margin with numbers > 20
    /[pm][xy]?-(?:2[1-9]|\d{3,})/g,
    // Specific spacing violations
    /p-(?:5|7|9|10|11|13|14|15|17|18|19)/g,
    /m-(?:5|7|9|10|11|13|14|15|17|18|19)/g,
  ];

  private hardcodedSizingPatterns = [
    // Width/height with irregular numbers
    /[wh]-(?:1[1-9]|2[1-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])/g,
    // Max width violations
    /max-w-(?!xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|full|screen)/g,
  ];

  /**
   * Audit a single file for design system violations
   */
  public auditFile(content: string, fileName: string): DesignSystemViolation[] {
    const violations: DesignSystemViolation[] = [];

    // Check for hardcoded colors
    violations.push(...this.checkHardcodedColors(content, fileName));
    
    // Check for inline styles
    violations.push(...this.checkInlineStyles(content, fileName));
    
    // Check for hardcoded spacing
    violations.push(...this.checkHardcodedSpacing(content, fileName));
    
    // Check for hardcoded sizing
    violations.push(...this.checkHardcodedSizing(content, fileName));
    
    // Check for non-standard components
    violations.push(...this.checkNonStandardComponents(content, fileName));

    return violations;
  }

  private checkHardcodedColors(content: string, fileName: string): DesignSystemViolation[] {
    const violations: DesignSystemViolation[] = [];
    
    this.hardcodedColorPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const colorClass = match[0];
        const colorName = match[1];
        const colorNumber = match[0].match(/\d+/)?.[0];
        
        let expectedToken = '';
        let suggestedFix = '';
        
        // Map common hardcoded colors to design system tokens
        if (colorClass.includes('bg-')) {
          if (colorName === 'gray') {
            expectedToken = colorNumber === '50' ? 'bg-muted' : 'bg-card';
            suggestedFix = `Replace "${colorClass}" with "${expectedToken}"`;
          } else if (colorName === 'blue') {
            expectedToken = 'bg-info or bg-info-50';
            suggestedFix = `Replace "${colorClass}" with "${expectedToken}"`;
          } else if (colorName === 'green') {
            expectedToken = 'bg-success or bg-success-50';
            suggestedFix = `Replace "${colorClass}" with "${expectedToken}"`;
          } else if (colorName === 'red') {
            expectedToken = 'bg-destructive or bg-destructive-50';
            suggestedFix = `Replace "${colorClass}" with "${expectedToken}"`;
          } else if (colorName === 'yellow') {
            expectedToken = 'bg-warning or bg-warning-50';
            suggestedFix = `Replace "${colorClass}" with "${expectedToken}"`;
          }
        }
        
        if (colorClass.includes('text-')) {
          if (colorName === 'gray') {
            expectedToken = 'text-muted-foreground or text-foreground';
            suggestedFix = `Replace "${colorClass}" with "${expectedToken}"`;
          } else if (colorName === 'blue') {
            expectedToken = 'text-info or text-info-foreground';
            suggestedFix = `Replace "${colorClass}" with "${expectedToken}"`;
          }
        }

        violations.push({
          type: 'hardcoded_color',
          severity: 'critical',
          file: fileName,
          element: colorClass,
          description: `Hardcoded color "${colorClass}" should use design system token`,
          currentValue: colorClass,
          expectedToken,
          suggestedFix,
          autoFixable: true
        });
      }
    });

    return violations;
  }

  private checkInlineStyles(content: string, fileName: string): DesignSystemViolation[] {
    const violations: DesignSystemViolation[] = [];
    const styleMatches = content.matchAll(/style=\{([^}]+)\}/g);
    
    for (const match of styleMatches) {
      const styleContent = match[1];
      
      // Skip allowed animation delays and chart colors
      if (styleContent.includes('animationDelay') || 
          styleContent.includes('backgroundColor: entry.color') ||
          styleContent.includes('width: `${') ||
          styleContent.includes('left: `${')) {
        continue;
      }
      
      violations.push({
        type: 'inline_styles',
        severity: 'warning',
        file: fileName,
        element: match[0],
        description: 'Inline styles should be replaced with design system classes',
        currentValue: match[0],
        expectedToken: 'Tailwind CSS classes from design system',
        suggestedFix: 'Convert inline styles to appropriate Tailwind classes using design system tokens',
        autoFixable: false
      });
    }

    return violations;
  }

  private checkHardcodedSpacing(content: string, fileName: string): DesignSystemViolation[] {
    const violations: DesignSystemViolation[] = [];
    
    this.hardcodedSpacingPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const spacingClass = match[0];
        
        violations.push({
          type: 'hardcoded_spacing',
          severity: 'warning',
          file: fileName,
          element: spacingClass,
          description: `Non-standard spacing "${spacingClass}" should use design system scale`,
          currentValue: spacingClass,
          expectedToken: 'p-1, p-2, p-3, p-4, p-6, p-8, p-12, p-16, p-20',
          suggestedFix: `Use standard spacing scale instead of "${spacingClass}"`,
          autoFixable: false
        });
      }
    });

    return violations;
  }

  private checkHardcodedSizing(content: string, fileName: string): DesignSystemViolation[] {
    const violations: DesignSystemViolation[] = [];
    
    this.hardcodedSizingPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const sizingClass = match[0];
        
        violations.push({
          type: 'hardcoded_sizing',
          severity: 'minor',
          file: fileName,
          element: sizingClass,
          description: `Non-standard sizing "${sizingClass}" should use design system scale`,
          currentValue: sizingClass,
          expectedToken: 'w-4, w-5, w-6, w-8, w-10, w-12, w-16, w-20 or responsive variants',
          suggestedFix: `Use standard sizing scale instead of "${sizingClass}"`,
          autoFixable: false
        });
      }
    });

    return violations;
  }

  private checkNonStandardComponents(content: string, fileName: string): DesignSystemViolation[] {
    const violations: DesignSystemViolation[] = [];
    
    // Check for manual modal implementations
    if (content.includes('fixed inset-0') && content.includes('z-50') && !content.includes('Dialog')) {
      violations.push({
        type: 'non_standard_component',
        severity: 'critical',
        file: fileName,
        element: 'Manual modal implementation',
        description: 'Manual modal should use Dialog component from design system',
        currentValue: 'Custom modal with fixed positioning',
        expectedToken: 'Dialog, DialogContent, DialogHeader from @/components/ui/dialog',
        suggestedFix: 'Replace custom modal with Dialog component',
        autoFixable: false
      });
    }

    // Check for manual button implementations
    if (content.includes('cursor-pointer') && content.includes('hover:') && !content.includes('<Button')) {
      violations.push({
        type: 'non_standard_component',
        severity: 'warning',
        file: fileName,
        element: 'Manual button styling',
        description: 'Custom button styling should use Button component',
        currentValue: 'Custom clickable element',
        expectedToken: 'Button component from @/components/ui/button',
        suggestedFix: 'Replace custom button styling with Button component',
        autoFixable: false
      });
    }

    return violations;
  }

  /**
   * Generate a comprehensive compliance report
   */
  public generateReport(violations: DesignSystemViolation[]): ComplianceReport {
    const criticalViolations = violations.filter(v => v.severity === 'critical');
    const warningViolations = violations.filter(v => v.severity === 'warning');
    const minorViolations = violations.filter(v => v.severity === 'minor');
    
    const status = criticalViolations.length > 0 ? 'fail' : 'pass';
    
    let summary = '';
    if (violations.length === 0) {
      summary = '✅ Perfect compliance! All components follow the design system.';
    } else {
      summary = `Found ${violations.length} violations across your project. `;
      if (criticalViolations.length > 0) {
        summary += `${criticalViolations.length} critical issues require immediate attention. `;
      }
      summary += `Focus on eliminating hardcoded colors and using design system tokens.`;
    }

    return {
      status,
      totalViolations: violations.length,
      criticalViolations: criticalViolations.length,
      warningViolations: warningViolations.length,
      minorViolations: minorViolations.length,
      violations,
      summary
    };
  }

  /**
   * Auto-fix violations where possible
   */
  public autoFix(content: string, violations: DesignSystemViolation[]): string {
    let fixedContent = content;
    
    violations.filter(v => v.autoFixable).forEach(violation => {
      if (violation.type === 'hardcoded_color') {
        // Apply color fixes
        const colorMappings: Record<string, string> = {
          'bg-gray-50': 'bg-muted',
          'bg-gray-100': 'bg-muted',
          'bg-gray-200': 'bg-card',
          'bg-blue-100': 'bg-info-50',
          'bg-blue-500': 'bg-info',
          'bg-blue-600': 'bg-info',
          'bg-green-100': 'bg-success-50',
          'bg-green-500': 'bg-success',
          'bg-green-600': 'bg-success',
          'bg-red-100': 'bg-destructive-50',
          'bg-red-500': 'bg-destructive',
          'bg-red-600': 'bg-destructive',
          'bg-yellow-100': 'bg-warning-50',
          'bg-yellow-500': 'bg-warning',
          'bg-yellow-600': 'bg-warning',
          'text-gray-500': 'text-muted-foreground',
          'text-gray-600': 'text-foreground',
          'text-gray-700': 'text-foreground',
          'text-gray-900': 'text-foreground',
          'text-blue-600': 'text-info',
          'text-green-600': 'text-success',
          'text-red-600': 'text-destructive',
          'text-yellow-600': 'text-warning',
          'border-gray-200': 'border-border',
          'border-gray-300': 'border-border',
          'border-blue-200': 'border-border',
          'border-green-200': 'border-border',
          'border-red-200': 'border-border',
          'border-yellow-200': 'border-border',
        };
        
        if (colorMappings[violation.currentValue]) {
          fixedContent = fixedContent.replace(
            new RegExp(violation.currentValue, 'g'),
            colorMappings[violation.currentValue]
          );
        }
      }
    });
    
    return fixedContent;
  }
}

// Export singleton instance
export const designSystemAuditor = new DesignSystemAuditor();