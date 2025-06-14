/**
 * Real-time Design System Compliance Monitor
 * Provides live monitoring and visual annotations for development
 */

import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { designSystemAuditor, type DesignSystemViolation } from './designSystemAuditor';

interface MonitorProps {
  enabled?: boolean;
  autoFix?: boolean;
}

export const DesignSystemMonitor: React.FC<MonitorProps> = ({ 
  enabled = process.env.NODE_ENV === 'development',
  autoFix = false 
}) => {
  const [violations, setViolations] = React.useState<DesignSystemViolation[]>([]);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) return;

    // Monitor for DOM changes and check compliance
    const observer = new MutationObserver(() => {
      checkCurrentPageCompliance();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    // Initial check
    checkCurrentPageCompliance();

    return () => observer.disconnect();
  }, [enabled]);

  const checkCurrentPageCompliance = () => {
    const violations: DesignSystemViolation[] = [];
    
    // Check all elements for hardcoded colors
    const elements = document.querySelectorAll('*');
    elements.forEach(element => {
      const className = element.className;
      if (typeof className === 'string') {
        // Check for hardcoded color classes
        const hardcodedColors = className.match(/(?:bg|text|border)-(red|blue|green|yellow|gray|slate|white|black)-\d+/g);
        if (hardcodedColors) {
          hardcodedColors.forEach(colorClass => {
            violations.push({
              type: 'hardcoded_color',
              severity: 'critical',
              file: 'Current Page',
              element: element.tagName.toLowerCase(),
              description: `Element uses hardcoded color: ${colorClass}`,
              currentValue: colorClass,
              expectedToken: getExpectedToken(colorClass),
              suggestedFix: `Replace ${colorClass} with design system token`,
              autoFixable: true
            });
            
            // Add visual annotation
            if (element instanceof HTMLElement) {
              annotateElement(element, 'critical');
            }
          });
        }
      }
    });

    setViolations(violations);
  };

  const getExpectedToken = (colorClass: string): string => {
    const mappings: Record<string, string> = {
      'bg-gray-50': 'bg-muted',
      'bg-gray-100': 'bg-muted',
      'bg-blue-100': 'bg-info-50',
      'bg-green-100': 'bg-success-50',
      'bg-red-100': 'bg-destructive-50',
      'bg-yellow-100': 'bg-warning-50',
      'text-gray-600': 'text-muted-foreground',
      'text-blue-600': 'text-info',
      'text-green-600': 'text-success',
      'text-red-600': 'text-destructive',
      'text-yellow-600': 'text-warning',
    };
    
    return mappings[colorClass] || 'design system token';
  };

  const annotateElement = (element: HTMLElement, severity: 'critical' | 'warning' | 'minor') => {
    // Remove existing annotations
    const existingAnnotation = element.querySelector('.design-system-violation');
    if (existingAnnotation) {
      existingAnnotation.remove();
    }

    // Create annotation
    const annotation = document.createElement('div');
    annotation.className = 'design-system-violation';
    annotation.style.cssText = `
      position: absolute;
      top: -8px;
      right: -8px;
      width: 20px;
      height: 20px;
      background: ${severity === 'critical' ? '#ef4444' : severity === 'warning' ? '#f59e0b' : '#6b7280'};
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      z-index: 9999;
      cursor: pointer;
      animation: pulse 2s infinite;
    `;
    annotation.innerHTML = '!';
    annotation.title = `Design System Violation: ${severity}`;
    
    // Make parent position relative if needed
    const position = window.getComputedStyle(element).position;
    if (position === 'static') {
      element.style.position = 'relative';
    }
    
    element.appendChild(annotation);
    
    // Add click handler to show details
    annotation.addEventListener('click', (e) => {
      e.stopPropagation();
      showViolationDetails(element);
    });
  };

  const showViolationDetails = (element: HTMLElement) => {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 12px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    `;
    
    content.innerHTML = `
      <h3 style="margin: 0 0 16px 0; color: #ef4444; font-weight: bold;">Design System Violation</h3>
      <p><strong>Element:</strong> ${element.tagName.toLowerCase()}</p>
      <p><strong>Classes:</strong> ${element.className}</p>
      <p><strong>Issue:</strong> Contains hardcoded color classes</p>
      <p><strong>Solution:</strong> Replace with design system tokens</p>
      <div style="margin-top: 20px; display: flex; gap: 8px;">
        <button id="fix-violation" style="background: #10b981; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;">Auto Fix</button>
        <button id="close-modal" style="background: #6b7280; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;">Close</button>
      </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Event handlers
    content.querySelector('#close-modal')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    content.querySelector('#fix-violation')?.addEventListener('click', () => {
      fixElementViolations(element);
      document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  };

  const fixElementViolations = (element: HTMLElement) => {
    let className = element.className;
    
    // Apply fixes
    const fixes: Record<string, string> = {
      'bg-gray-50': 'bg-muted',
      'bg-gray-100': 'bg-muted',
      'bg-blue-100': 'bg-info-50',
      'bg-green-100': 'bg-success-50',
      'bg-red-100': 'bg-destructive-50',
      'bg-yellow-100': 'bg-warning-50',
      'text-gray-600': 'text-muted-foreground',
      'text-blue-600': 'text-info',
      'text-green-600': 'text-success',
      'text-red-600': 'text-destructive',
      'text-yellow-600': 'text-warning',
    };
    
    Object.entries(fixes).forEach(([old, newClass]) => {
      className = className.replace(new RegExp(`\\b${old}\\b`, 'g'), newClass);
    });
    
    element.className = className;
    
    // Remove annotation
    const annotation = element.querySelector('.design-system-violation');
    if (annotation) {
      annotation.remove();
    }
    
    console.log('🎨 Design System: Auto-fixed violations on element', element);
  };

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`p-3 rounded-full shadow-lg transition-all ${
          violations.length > 0
            ? 'bg-destructive text-destructive-foreground animate-pulse'
            : 'bg-success text-success-foreground'
        }`}
        title={`Design System Monitor: ${violations.length} violations found`}
      >
        {violations.length > 0 ? (
          <AlertTriangle className="h-5 w-5" />
        ) : (
          <CheckCircle className="h-5 w-5" />
        )}
        {violations.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {violations.length}
          </span>
        )}
      </button>

      {isVisible && (
        <div className="absolute bottom-16 right-0 w-80 bg-card border border-border rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Design System Monitor</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
          
          {violations.length === 0 ? (
            <div className="text-center py-4">
              <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">All components compliant!</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-destructive font-medium">
                {violations.length} violations found
              </p>
              {violations.slice(0, 5).map((violation, index) => (
                <div key={index} className="p-2 bg-destructive-50 rounded border-l-2 border-destructive">
                  <p className="text-xs font-medium text-destructive">{violation.element}</p>
                  <p className="text-xs text-muted-foreground">{violation.description}</p>
                </div>
              ))}
              {violations.length > 5 && (
                <p className="text-xs text-muted-foreground">
                  +{violations.length - 5} more violations...
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DesignSystemMonitor;