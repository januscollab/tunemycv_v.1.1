import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Code, Palette, Type, Square, Circle, Triangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UnifiedInput } from '@/components/ui/unified-input';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import SecureInput from '@/components/security/SecureInput';
import SecureTextarea from '@/components/security/SecureTextarea';
import { FloatingLabelInput } from '@/components/common/FloatingLabelInput';
import { FloatingLabelTextarea } from '@/components/common/FloatingLabelTextarea';

const DesignSystem = () => {
  const colorTokens = [
    { name: 'Primary', class: 'bg-primary', usage: '127 usages' },
    { name: 'Zapier Orange', class: 'bg-zapier-orange', usage: '89 usages' },
    { name: 'Earth', class: 'bg-earth', usage: '156 usages' },
    { name: 'Blueberry', class: 'bg-blueberry', usage: '94 usages' },
    { name: 'Apple Core', class: 'bg-apple-core', usage: '78 usages' },
    { name: 'Citrus', class: 'bg-citrus', usage: '45 usages' },
    { name: 'Apricot', class: 'bg-apricot', usage: '23 usages' },
    { name: 'Cream', class: 'bg-cream', usage: '34 usages' },
    { name: 'Surface', class: 'bg-surface', usage: '67 usages' },
    { name: 'Background', class: 'bg-background', usage: '89 usages' },
  ];

  const inputComponents = [
    { 
      name: 'Standard Input', 
      component: <Input placeholder="Standard input" />, 
      usage: '23 usages',
      description: 'Basic input component with standard styling'
    },
    { 
      name: 'Secure Input', 
      component: <SecureInput placeholder="Secure input with sanitization" />, 
      usage: '18 usages',
      description: 'Input with built-in sanitization and security features'
    },
    { 
      name: 'Textarea', 
      component: <Textarea placeholder="Standard textarea" rows={3} />, 
      usage: '15 usages',
      description: 'Multi-line text input component'
    },
    { 
      name: 'Secure Textarea', 
      component: <SecureTextarea placeholder="Secure textarea" rows={3} />, 
      usage: '12 usages',
      description: 'Secure multi-line text input with sanitization'
    },
    { 
      name: 'Floating Label Input', 
      component: <FloatingLabelInput label="Floating label" />, 
      usage: '8 usages',
      description: 'Input with animated floating label'
    },
    { 
      name: 'Floating Label Textarea', 
      component: <FloatingLabelTextarea label="Floating label" rows={3} />, 
      usage: '5 usages',
      description: 'Textarea with animated floating label'
    },
    { 
      name: 'NEW: Unified Input', 
      component: <UnifiedInput placeholder="Unified input system" variant="standard" />, 
      usage: '0 usages (New)',
      description: 'New unified input system combining all variants'
    },
  ];

  const buttonVariants = [
    { name: 'Default', variant: 'default', usage: '89 usages' },
    { name: 'Primary', variant: 'default', usage: '67 usages' },
    { name: 'Secondary', variant: 'secondary', usage: '45 usages' },
    { name: 'Destructive', variant: 'destructive', usage: '23 usages' },
    { name: 'Outline', variant: 'outline', usage: '34 usages' },
    { name: 'Ghost', variant: 'ghost', usage: '56 usages' },
    { name: 'Link', variant: 'link', usage: '12 usages' },
  ];

  const typographyElements = [
    { name: 'Heading 1', element: <h1 className="text-4xl font-bold text-earth dark:text-white">Heading 1</h1>, usage: '15 usages' },
    { name: 'Heading 2', element: <h2 className="text-3xl font-bold text-earth dark:text-white">Heading 2</h2>, usage: '67 usages' },
    { name: 'Heading 3', element: <h3 className="text-2xl font-bold text-earth dark:text-white">Heading 3</h3>, usage: '89 usages' },
    { name: 'Body Text', element: <p className="text-base text-earth/70 dark:text-white/70">Body text content</p>, usage: '234 usages' },
    { name: 'Small Text', element: <small className="text-sm text-earth/60 dark:text-white/60">Small text</small>, usage: '156 usages' },
    { name: 'Link Text', element: <span className="text-zapier-orange hover:text-zapier-orange/80">Link text</span>, usage: '78 usages' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="flex items-center gap-2 text-zapier-orange hover:text-zapier-orange/80">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-4xl font-bold text-earth dark:text-white">Design System</h1>
            <p className="text-earth/70 dark:text-white/70 mt-2">
              Complete visual reference of design tokens, components, and usage statistics
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-zapier-orange" />
                <div>
                  <p className="text-2xl font-bold text-earth dark:text-white">10</p>
                  <p className="text-sm text-earth/60 dark:text-white/60">Color Tokens</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Square className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-earth dark:text-white">7</p>
                  <p className="text-sm text-earth/60 dark:text-white/60">Input Types</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Circle className="h-5 w-5 text-apricot" />
                <div>
                  <p className="text-2xl font-bold text-earth dark:text-white">7</p>
                  <p className="text-sm text-earth/60 dark:text-white/60">Button Variants</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Type className="h-5 w-5 text-citrus" />
                <div>
                  <p className="text-2xl font-bold text-earth dark:text-white">6</p>
                  <p className="text-sm text-earth/60 dark:text-white/60">Typography Styles</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Color System */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Color System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {colorTokens.map((color) => (
                <div key={color.name} className="space-y-2">
                  <div className={`w-full h-16 rounded-lg ${color.class} border border-border`} />
                  <div>
                    <p className="font-medium text-earth dark:text-white">{color.name}</p>
                    <p className="text-sm text-earth/60 dark:text-white/60">{color.class}</p>
                    <Badge variant="secondary" className="text-xs mt-1">{color.usage}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Input System */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Square className="h-5 w-5" />
              Input System
              <Badge variant="destructive" className="text-xs">FRAGMENTED</Badge>
            </CardTitle>
            <p className="text-sm text-earth/60 dark:text-white/60 mt-2">
              Currently using 6 different input implementations. NEW: Unified Input system consolidates all variants.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {inputComponents.map((input, index) => (
                <div key={input.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-earth dark:text-white">{input.name}</h4>
                      <p className="text-sm text-earth/60 dark:text-white/60">{input.description}</p>
                    </div>
                    <Badge variant={input.name.includes('NEW') ? 'default' : 'secondary'}>
                      {input.usage}
                    </Badge>
                  </div>
                  <div className="max-w-md">
                    {input.component}
                  </div>
                  {index < inputComponents.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Button System */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Circle className="h-5 w-5" />
              Button System
              <Badge variant="default" className="text-xs">STANDARDIZED</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {buttonVariants.map((btn) => (
                <div key={btn.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-earth dark:text-white">{btn.name}</span>
                    <Badge variant="secondary" className="text-xs">{btn.usage}</Badge>
                  </div>
                  <Button variant={btn.variant as any} size="sm">
                    {btn.name} Button
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Typography System */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Typography System
              <Badge variant="destructive" className="text-xs">NEEDS STANDARDIZATION</Badge>
            </CardTitle>
            <p className="text-sm text-earth/60 dark:text-white/60 mt-2">
              Found 694+ hardcoded text sizes. Needs semantic typography classes.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {typographyElements.map((typo, index) => (
                <div key={typo.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-earth dark:text-white">{typo.name}</span>
                    <Badge variant="secondary" className="text-xs">{typo.usage}</Badge>
                  </div>
                  {typo.element}
                  {index < typographyElements.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Design System Action Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-zapier-orange rounded-full mt-2" />
                <div>
                  <p className="font-medium text-earth dark:text-white">Phase 1: Input Unification</p>
                  <p className="text-sm text-earth/60 dark:text-white/60">
                    Consolidate 6 input types into unified system with variants. Status: <Badge variant="default">In Progress</Badge>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-earth/30 rounded-full mt-2" />
                <div>
                  <p className="font-medium text-earth dark:text-white">Phase 2: Typography Standardization</p>
                  <p className="text-sm text-earth/60 dark:text-white/60">
                    Create semantic typography classes to replace 694+ hardcoded sizes. Status: <Badge variant="secondary">Planned</Badge>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-earth/30 rounded-full mt-2" />
                <div>
                  <p className="font-medium text-earth dark:text-white">Phase 3: Legacy Cleanup</p>
                  <p className="text-sm text-earth/60 dark:text-white/60">
                    Remove 260+ legacy color usages and optimize spacing system. Status: <Badge variant="secondary">Planned</Badge>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DesignSystem;