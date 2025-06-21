import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  VybeButton,
  VybeSelect,
  VybeIconButton,
  VubeUITooltip,
  EnhancedCoverLetterHistory,
  EnhancedInterviewPrepHistory,
  VybeSelectOption,
  DocumentDeleteDialog
} from '@/components/design-system';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Define icons for components
import { Button as ButtonIcon } from 'lucide-react';
import { List as SelectIcon } from 'lucide-react';
import { Square as IconButtonIcon } from 'lucide-react';
import { MessageSquare as TooltipIcon } from 'lucide-react';
import { FileText as CoverLetterHistoryIcon } from 'lucide-react';
import { History as InterviewPrepHistoryIcon } from 'lucide-react';
import { AlertTriangle as DeleteDialogIcon } from 'lucide-react';

interface DesignSystemComponent {
  name: string;
  description: string;
  component: React.ComponentType<any>;
  icon: React.ComponentType<any>;
  color: string;
}

const designSystemComponents: DesignSystemComponent[] = [
  {
    name: 'VybeButton',
    description: 'Primary button component for consistent UI.',
    component: VybeButton,
    icon: ButtonIcon,
    color: '#2563eb',
  },
  {
    name: 'VybeSelect',
    description: 'Customizable select component with enhanced styling.',
    component: () => {
      const options: VybeSelectOption[] = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' },
      ];
      const [selectedValue, setSelectedValue] = useState<string>('');

      const handleSelectChange = (value: string) => {
        setSelectedValue(value);
        console.log('Selected value:', value);
      };

      return (
        <VybeSelect
          options={options}
          onChange={handleSelectChange}
          placeholder="Select an option"
          value={selectedValue}
        />
      );
    },
    icon: SelectIcon,
    color: '#16a34a',
  },
  {
    name: 'VybeIconButton',
    description: 'Icon-only button for quick actions.',
    component: VybeIconButton,
    icon: IconButtonIcon,
    color: '#dc2626',
  },
  {
    name: 'VubeUITooltip',
    description: 'Rich content tooltips for detailed information.',
    component: () => (
      <VubeUITooltip content="This is a rich tooltip with custom styling.">
        <span>Hover me</span>
      </VubeUITooltip>
    ),
    icon: TooltipIcon,
    color: '#ca8a04',
  },
  {
    name: 'EnhancedCoverLetterHistory',
    description: 'Advanced cover letter management interface.',
    component: EnhancedCoverLetterHistory,
    icon: CoverLetterHistoryIcon,
    color: '#ea580c',
  },
  {
    name: 'EnhancedInterviewPrepHistory',
    description: 'Advanced interview prep management interface.',
    component: EnhancedInterviewPrepHistory,
    icon: InterviewPrepHistoryIcon,
    color: '#06b6d4',
  },
  {
    name: 'DocumentDeleteDialog',
    description: 'Confirmation dialog for document deletion.',
    component: () => <DocumentDeleteDialog onConfirm={() => console.log('Delete confirmed')} />,
    icon: DeleteDialogIcon,
    color: '#9333ea',
  },
];

const DesignSystem = () => {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredComponents = designSystemComponents.filter(component =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Design System Components
          </h1>
          <div className="mt-4">
            <Input
              type="text"
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredComponents.map((component) => (
            <Card 
              key={component.name}
              className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4"
              style={{ borderLeftColor: component.color }}
              onClick={() => setSelectedComponent(component.name)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {component.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {component.description}
                    </p>
                  </div>
                  <component.icon 
                    className="h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 ml-2"
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <component.component />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Component Detail Modal */}
      {selectedComponent && (
        <Dialog open={!!selectedComponent} onOpenChange={() => setSelectedComponent(null)}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>{selectedComponent}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-auto p-4">
              {(() => {
                const component = designSystemComponents.find(c => c.name === selectedComponent);
                return component ? <component.component /> : null;
              })()}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DesignSystem;
