import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Code, Palette, Type, Square, Circle, Triangle, Zap, AlertTriangle, Search } from 'lucide-react';
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
    { 
      name: 'Primary', 
      class: 'bg-primary', 
      usage: '127 usages',
      lightHex: '#FF4A00',
      darkHex: '#FF4A00',
      description: 'Main brand color for CTAs and primary actions'
    },
    { 
      name: 'Background/Surface', 
      class: 'bg-background', 
      usage: '156 usages (combined)',
      lightHex: '#FFFFFF',
      darkHex: '#09090B / #18181B',
      description: 'Background and elevated surfaces (unified tokens)',
      note: 'Surface uses slightly different dark mode value but serves same purpose'
    },
    { 
      name: 'Foreground', 
      class: 'bg-foreground', 
      usage: '234 usages',
      lightHex: '#0F172A',
      darkHex: '#FAFAFA',
      description: 'Primary text color'
    },
    { 
      name: 'Success', 
      class: 'bg-success', 
      usage: '45 usages',
      lightHex: '#22C55E',
      darkHex: '#22C55E',
      description: 'Success states and positive feedback'
    },
    { 
      name: 'Warning', 
      class: 'bg-warning', 
      usage: '23 usages',
      lightHex: '#F59E0B',
      darkHex: '#F59E0B',
      description: 'Warning states and caution alerts'
    },
    { 
      name: 'Destructive', 
      class: 'bg-destructive', 
      usage: '34 usages',
      lightHex: '#EF4444',
      darkHex: '#F87171',
      description: 'Error states and destructive actions'
    },
    { 
      name: 'Muted', 
      class: 'bg-muted', 
      usage: '156 usages',
      lightHex: '#F8FAFC',
      darkHex: '#272729',
      description: 'Subtle backgrounds and disabled states'
    },
  ];

  const inputComponents = [
    { 
      name: 'Standard Input', 
      component: <Input placeholder="Standard input" />, 
      usage: '23 usages',
      description: 'Basic input component with standard styling',
      status: 'deprecated',
      migration: 'Use Floating Label Input instead'
    },
    { 
      name: 'Secure Input', 
      component: <SecureInput placeholder="Secure input with sanitization" />, 
      usage: '18 usages',
      description: 'Input with built-in sanitization and security features',
      status: 'deprecated', 
      migration: 'Use Floating Label Input with secure=true'
    },
    { 
      name: 'Textarea', 
      component: <Textarea placeholder="Standard textarea" rows={3} />, 
      usage: '15 usages',
      description: 'Multi-line text input component',
      status: 'deprecated',
      migration: 'Use Floating Label Textarea instead'
    },
    { 
      name: 'Secure Textarea', 
      component: <SecureTextarea placeholder="Secure textarea" rows={3} />, 
      usage: '12 usages',
      description: 'Secure multi-line text input with sanitization',
      status: 'deprecated',
      migration: 'Use Floating Label Textarea with secure=true'
    },
    { 
      name: 'Floating Label Input', 
      component: <FloatingLabelInput label="Floating label" />, 
      usage: '8 usages',
      description: 'Input with animated floating label',
      status: 'recommended',
      migration: 'Current recommended approach for new components'
    },
    { 
      name: 'Floating Label Textarea', 
      component: <FloatingLabelTextarea label="Floating label" rows={3} />, 
      usage: '5 usages',
      description: 'Textarea with animated floating label',
      status: 'recommended',
      migration: 'Current recommended approach for new components'
    },
    { 
      name: 'Unified Input', 
      component: <UnifiedInput placeholder="Unified input system" variant="floating" label="Unified label" />, 
      usage: '0 usages (Future)',
      description: 'Next-generation unified input system with all variants',
      status: 'future',
      migration: 'Will replace all input types when ready'
    },
  ];

  const buttonVariants = [
    { name: 'Primary (Default)', variant: 'default', usage: '156 usages', description: 'Main CTA button with primary styling' },
    { name: 'Secondary', variant: 'secondary', usage: '45 usages', description: 'Secondary actions with muted styling' },
    { name: 'Destructive', variant: 'destructive', usage: '23 usages', description: 'Dangerous actions like delete' },
    { name: 'Outline', variant: 'outline', usage: '34 usages', description: 'Subtle emphasis with border' },
    { name: 'Ghost', variant: 'ghost', usage: '56 usages', description: 'Minimal styling for subtle actions' },
    { name: 'Link', variant: 'link', usage: '12 usages', description: 'Text-style buttons for inline actions' },
  ];

  const animationTypes = [
    { 
      name: 'Mobile Menu Toggle', 
      example: <Button size="sm" className="text-foreground hover:text-primary transition-all duration-normal p-2 rounded-md hover:bg-accent active:scale-95">☰</Button>,
      usage: '5 usages',
      description: 'Mobile navigation menu open/close with fade and scale effects'
    },
    { 
      name: 'Document Action Buttons', 
      example: <Button size="sm" variant="outline" className="font-normal hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-200">Review & Edit</Button>,
      usage: '8 usages',
      description: 'CV/document action buttons with multi-property hover transitions'
    },
    { 
      name: 'Hover Effects', 
      example: <Button className="transition-all hover:scale-105" size="sm">Hover me</Button>,
      usage: '120+ usages',
      description: 'Scale, shadow, and color transitions on interactive elements'
    },
    { 
      name: 'Focus States', 
      example: <Button size="sm" className="focus-visible:ring-2 focus-visible:ring-primary">Focus me</Button>,
      usage: '89 usages',
      description: 'Accessibility-focused ring animations for keyboard navigation'
    },
    { 
      name: 'Theme Transitions', 
      example: <div className="w-16 h-8 bg-background border rounded transition-all duration-300">Theme</div>,
      usage: '45+ usages',
      description: 'Smooth color transitions when switching light/dark themes'
    },
    { 
      name: 'Loading States', 
      example: <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin">Loading</div>,
      usage: '12 usages',
      description: 'Spinner and pulse animations for loading feedback'
    },
    { 
      name: 'Micro-interactions', 
      example: <Button size="sm" className="active:scale-95 transition-transform">Click me</Button>,
      usage: '67 usages',
      description: 'Subtle feedback on user interactions like clicks'
    },
    { 
      name: 'Page Transitions', 
      example: <div className="opacity-100 transform translate-y-0 transition-all">Fade in</div>,
      usage: '23 usages',
      description: 'Entrance and exit animations for page/component changes'
    },
  ];

  const fontFamilies = [
    { 
      name: 'Poppins (Sans)', 
      element: <div className="font-sans text-lg">Aa Bb Cc 123 - The quick brown fox jumps over the lazy dog</div>, 
      usage: 'Primary body text',
      cssClass: 'font-sans',
      fallbacks: 'system-ui, sans-serif'
    },
    { 
      name: 'Playfair Display (Serif)', 
      element: <div className="font-display text-lg">Aa Bb Cc 123 - The quick brown fox jumps over the lazy dog</div>, 
      usage: 'Display headings and emphasis',
      cssClass: 'font-display',
      fallbacks: 'serif'
    },
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
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-earth dark:text-white">Design System</h1>
            <p className="text-earth/70 dark:text-white/70 mt-2">
              Complete visual reference of design tokens, components, and usage statistics
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">DEV ONLY - Never Publish</span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-foreground">7</p>
                  <p className="text-sm text-muted-foreground">Color Tokens</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Square className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-2xl font-bold text-foreground">7</p>
                  <p className="text-sm text-muted-foreground">Input Types</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Circle className="h-5 w-5 text-success" />
                <div>
                  <p className="text-2xl font-bold text-foreground">6</p>
                  <p className="text-sm text-muted-foreground">Button Variants</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Type className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-2xl font-bold text-foreground">2</p>
                  <p className="text-sm text-muted-foreground">Font Families</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-foreground">8</p>
                  <p className="text-sm text-muted-foreground">Animation Types</p>
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
            <p className="text-sm text-muted-foreground mt-2">
              Semantic color tokens with light/dark mode HEX values for design handoff
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {colorTokens.map((color) => (
                <div key={color.name} className="space-y-3">
                  <div className={`w-full h-20 rounded-lg ${color.class} border border-border shadow-sm`} />
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">{color.name}</p>
                    <p className="text-xs font-mono text-muted-foreground">{color.class}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Light:</span>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{color.lightHex}</code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Dark:</span>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{color.darkHex}</code>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{color.description}</p>
                    <Badge variant="secondary" className="text-xs">{color.usage}</Badge>
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
            <p className="text-sm text-muted-foreground mt-2">
              Migration path to unified input system with clear deprecation warnings
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {inputComponents.map((input, index) => (
                <div key={input.name} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground">{input.name}</h4>
                        <Badge 
                          variant={
                            input.status === 'deprecated' ? 'destructive' : 
                            input.status === 'recommended' ? 'default' : 
                            'secondary'
                          } 
                          className="text-xs"
                        >
                          {input.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{input.description}</p>
                      <p className="text-xs text-muted-foreground italic">{input.migration}</p>
                    </div>
                    <Badge variant="outline" className="text-xs ml-4">
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

        {/* Animation System */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Animation System
              <Badge variant="default" className="text-xs">COMPREHENSIVE</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Rich animation library covering hover effects, transitions, and micro-interactions
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {animationTypes.map((animation, index) => (
                <div key={animation.name} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">{animation.name}</h4>
                      <p className="text-sm text-muted-foreground">{animation.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs ml-4">
                      {animation.usage}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-center p-4 border border-border rounded-lg bg-muted/10">
                    {animation.example}
                  </div>
                  {index < animationTypes.length - 1 && <Separator />}
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
            <p className="text-sm text-muted-foreground mt-2">
              Found 873+ hardcoded text sizes across 149 files. Needs semantic typography classes.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Font Families */}
              <div>
                <h4 className="font-medium text-foreground mb-3">Font Families</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fontFamilies.map((font, index) => (
                    <div key={font.name} className="space-y-2 p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{font.name}</span>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{font.cssClass}</code>
                      </div>
                      {font.element}
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Usage: {font.usage}</p>
                        <p>Fallbacks: {font.fallbacks}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Most Common Text Sizes */}
              <div>
                <h4 className="font-medium text-foreground mb-3">Most Common Text Sizes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-foreground mb-2 text-sm">Poppins (Sans)</h5>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-sans">text-lg - Large text example</span>
                        <Badge variant="outline" className="text-xs">67 uses</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-sans">text-base - Base text example</span>
                        <Badge variant="outline" className="text-xs">134 uses</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-sans">text-sm - Small text example</span>
                        <Badge variant="outline" className="text-xs">156 uses</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-sans">text-xs - Extra small text example</span>
                        <Badge variant="outline" className="text-xs">98 uses</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-foreground mb-2 text-sm">Playfair Display (Serif)</h5>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-display">text-lg - Large text example</span>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">1.125rem</code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-display">text-base - Base text example</span>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">1rem</code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-display">text-sm - Small text example</span>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">0.875rem</code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-display">text-xs - Extra small text example</span>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">0.75rem</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Typography Styles */}
              <div>
                <h4 className="font-medium text-foreground mb-3">Typography Styles (Current Implementation)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-foreground mb-2 text-sm">Poppins (Sans)</h5>
                    <div className="space-y-4">
                      {typographyElements.map((typo, index) => (
                        <div key={`sans-${typo.name}`} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground text-sm">{typo.name}</span>
                            <Badge variant="secondary" className="text-xs">{typo.usage}</Badge>
                          </div>
                          <div className="font-sans">
                            {React.cloneElement(typo.element as React.ReactElement, { 
                              className: (typo.element as React.ReactElement).props.className?.replace('font-display', 'font-sans')
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-foreground mb-2 text-sm">Playfair Display (Serif)</h5>
                    <div className="space-y-4">
                      {typographyElements.map((typo, index) => (
                        <div key={`serif-${typo.name}`} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground text-sm">{typo.name}</span>
                            <code className="text-xs font-mono bg-muted px-2 py-1 rounded">font-display</code>
                          </div>
                          <div className="font-display">
                            {React.cloneElement(typo.element as React.ReactElement, { 
                              className: (typo.element as React.ReactElement).props.className?.replace('font-sans', 'font-display')
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Typography Analysis
              <Badge variant="destructive" className="text-xs">ACTION REQUIRED</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Comprehensive analysis of hardcoded text sizes requiring review and consolidation
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <h5 className="font-medium text-foreground mb-2">Most Common Sizes</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>text-sm</span>
                    <Badge variant="outline" className="text-xs">156 uses</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>text-base</span>
                    <Badge variant="outline" className="text-xs">134 uses</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>text-xs</span>
                    <Badge variant="outline" className="text-xs">98 uses</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>text-lg</span>
                    <Badge variant="outline" className="text-xs">67 uses</Badge>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-border rounded-lg">
                <h5 className="font-medium text-foreground mb-2">Critical Issues</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    <span>149 files affected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <span>No semantic hierarchy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    <span>Inconsistent responsive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <span>Mixed font usage</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <h5 className="font-medium text-foreground mb-2">Recommended Action</h5>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Create semantic classes:</p>
                  <code className="block text-xs bg-muted p-2 rounded">
                    .text-display<br/>
                    .text-heading<br/>
                    .text-body<br/>
                    .text-caption
                  </code>
                  <Button size="sm" variant="outline" className="w-full mt-2">
                    Start Standardization
                  </Button>
                </div>
              </div>
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
                    Create semantic typography classes to replace 873+ hardcoded sizes. Status: <Badge variant="secondary">Planned</Badge>
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