import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Code, Palette, Type, Square, Circle, Triangle, Zap, AlertTriangle, Search, Star, Heart, Award, Sparkles, Layers, Grid, Layout, MousePointer, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UnifiedInput } from '@/components/ui/unified-input';
import { FloatingLabelInput } from '@/components/common/FloatingLabelInput';
import { FloatingLabelTextarea } from '@/components/common/FloatingLabelTextarea';

const DesignSystem = () => {
  const colorTokens = [
    { 
      name: 'Primary', 
      class: 'bg-primary', 
      usage: '156 usages',
      lightHex: '#FF4A00',
      darkHex: '#FF4A00',
      description: 'Main brand color for CTAs and primary actions'
    },
    { 
      name: 'Background/Surface', 
      class: 'bg-background', 
      usage: '234 usages',
      lightHex: '#FFFFFF',
      darkHex: '#09090B / #18181B',
      description: 'Background and elevated surfaces (unified tokens)'
    },
    { 
      name: 'Foreground', 
      class: 'bg-foreground', 
      usage: '345 usages',
      lightHex: '#0F172A',
      darkHex: '#FAFAFA',
      description: 'Primary text color'
    },
    { 
      name: 'Success', 
      class: 'bg-success', 
      usage: '67 usages',
      lightHex: '#22C55E',
      darkHex: '#22C55E',
      description: 'Success states and positive feedback'
    },
    { 
      name: 'Warning', 
      class: 'bg-warning', 
      usage: '34 usages',
      lightHex: '#F59E0B',
      darkHex: '#F59E0B',
      description: 'Warning states and caution alerts'
    },
    { 
      name: 'Destructive', 
      class: 'bg-destructive', 
      usage: '45 usages',
      lightHex: '#EF4444',
      darkHex: '#F87171',
      description: 'Error states and destructive actions'
    },
    { 
      name: 'Muted', 
      class: 'bg-muted', 
      usage: '178 usages',
      lightHex: '#F8FAFC',
      darkHex: '#272729',
      description: 'Subtle backgrounds and disabled states'
    },
  ];

  const inputComponents = [
    { 
      name: 'Floating Label Input', 
      component: <FloatingLabelInput label="Floating label" />, 
      usage: '45 usages',
      description: 'Input with animated floating label',
      status: 'current',
      migration: 'Current recommended approach for all new components'
    },
    { 
      name: 'Floating Label Textarea', 
      component: <FloatingLabelTextarea label="Floating label" rows={3} />, 
      usage: '23 usages',
      description: 'Textarea with animated floating label',
      status: 'current',
      migration: 'Current recommended approach for all new components'
    },
    { 
      name: 'Unified Input', 
      component: <UnifiedInput placeholder="Unified input system" variant="floating" label="Unified label" />, 
      usage: '12 usages',
      description: 'Next-generation unified input system with all variants',
      status: 'future',
      migration: 'Will replace all input types when fully implemented'
    },
  ];

  const buttonVariants = [
    { name: 'Primary (Default)', variant: 'default', usage: '234 usages', description: 'Main CTA button with primary styling' },
    { name: 'Secondary', variant: 'secondary', usage: '67 usages', description: 'Secondary actions with muted styling' },
    { name: 'Destructive', variant: 'destructive', usage: '34 usages', description: 'Dangerous actions like delete' },
    { name: 'Outline', variant: 'outline', usage: '89 usages', description: 'Subtle emphasis with border' },
    { name: 'Ghost', variant: 'ghost', usage: '123 usages', description: 'Minimal styling for subtle actions' },
    { name: 'Link', variant: 'link', usage: '45 usages', description: 'Text-style buttons for inline actions' },
  ];

  const animationTypes = [
    { 
      name: 'Pricing Tile Hover', 
      example: (
        <div className="group bg-card border border-border rounded-lg p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50 cursor-pointer">
          <div className="transition-colors group-hover:text-primary">Pricing Card</div>
        </div>
      ),
      usage: '3 usages',
      description: 'Pricing card hover animation with scale and border effects'
    },
    { 
      name: 'Gradient Text', 
      example: (
        <div className="bg-gradient-to-r from-primary via-warning to-success bg-clip-text text-transparent font-semibold">
          Motivation Matters (Optional)
        </div>
      ),
      usage: '5 usages',
      description: 'Multi-color gradient text effect for emphasis'
    },
    { 
      name: 'Hover Scale & Shadow', 
      example: <Button className="transition-all hover:scale-105 hover:shadow-lg" size="sm">Hover me</Button>,
      usage: '150+ usages',
      description: 'Combined scale and shadow transitions on interactive elements'
    },
    { 
      name: 'Loading Spinner', 
      example: <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />,
      usage: '23 usages',
      description: 'Spinner animations for loading feedback'
    },
    { 
      name: 'Theme Transitions', 
      example: <div className="w-16 h-8 bg-background border rounded transition-all duration-300">Theme</div>,
      usage: '67+ usages',
      description: 'Smooth color transitions when switching light/dark themes'
    },
  ];

  const fontFamilies = [
    { 
      name: 'Poppins (Sans)', 
      element: <div className="font-sans text-subheading">Aa Bb Cc 123 - The quick brown fox jumps over the lazy dog</div>, 
      usage: 'Primary body text and headings',
      cssClass: 'font-sans',
      fallbacks: 'system-ui, sans-serif'
    },
    { 
      name: 'Playfair Display (Serif)', 
      element: <div className="font-display text-subheading">Aa Bb Cc 123 - The quick brown fox jumps over the lazy dog</div>, 
      usage: 'Display headings and emphasis',
      cssClass: 'font-display',
      fallbacks: 'serif'
    },
  ];

  const typographyElements = [
    { name: 'Display', element: <h1 className="text-display font-bold text-foreground">Display Text</h1>, usage: '23 usages', semantic: 'text-display' },
    { name: 'Title', element: <h2 className="text-title font-bold text-foreground">Title Text</h2>, usage: '89 usages', semantic: 'text-title' },
    { name: 'Heading', element: <h3 className="text-heading font-semibold text-foreground">Heading Text</h3>, usage: '145 usages', semantic: 'text-heading' },
    { name: 'Subheading', element: <h4 className="text-subheading font-medium text-foreground">Subheading Text</h4>, usage: '178 usages', semantic: 'text-subheading' },
    { name: 'Body', element: <p className="text-body text-foreground">Body text content for paragraphs and descriptions</p>, usage: '267 usages', semantic: 'text-body' },
    { name: 'Caption', element: <p className="text-caption text-muted-foreground">Caption text for secondary information</p>, usage: '234 usages', semantic: 'text-caption' },
    { name: 'Micro', element: <small className="text-micro text-muted-foreground">Micro text for timestamps and metadata</small>, usage: '156 usages', semantic: 'text-micro' },
  ];

  // Experimental Components
  const experimentalColorElements = [
    {
      name: 'Gradient Card',
      component: (
        <div className="bg-gradient-to-br from-primary/10 via-warning/10 to-success/10 p-4 rounded-lg border border-primary/20">
          <div className="text-heading font-semibold text-foreground">Gradient Background</div>
          <div className="text-caption text-muted-foreground">Multi-color gradient card background</div>
        </div>
      )
    },
    {
      name: 'Glassmorphism Card',
      component: (
        <div className="backdrop-blur-md bg-background/80 p-4 rounded-lg border border-border/50 shadow-lg">
          <div className="text-heading font-semibold text-foreground">Glass Effect</div>
          <div className="text-caption text-muted-foreground">Semi-transparent with blur effect</div>
        </div>
      )
    },
    {
      name: 'Neumorphism Button',
      component: (
        <button className="bg-background shadow-inner border border-border/50 px-6 py-3 rounded-lg text-body font-medium text-foreground hover:shadow-lg transition-all">
          Neumorphic Style
        </button>
      )
    },
    {
      name: 'Color Temperature',
      component: (
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full" title="Cool" />
          <div className="w-8 h-8 bg-yellow-500 rounded-full" title="Warm" />
          <div className="w-8 h-8 bg-red-500 rounded-full" title="Hot" />
        </div>
      )
    },
    {
      name: 'Status Indicators',
      component: (
        <div className="flex gap-2 items-center">
          <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
          <span className="text-caption">Online</span>
        </div>
      )
    }
  ];

  const experimentalAnimationElements = [
    {
      name: 'Bounce Loading',
      component: (
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      )
    },
    {
      name: 'Shake Animation',
      component: (
        <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:animate-pulse">
          Error State
        </button>
      )
    },
    {
      name: 'Magnetic Hover',
      component: (
        <div className="group relative">
          <div className="bg-primary/10 p-4 rounded-lg transition-transform group-hover:scale-110 group-hover:rotate-1">
            Magnetic Effect
          </div>
        </div>
      )
    },
    {
      name: 'Typing Effect',
      component: (
        <div className="font-mono text-body">
          <span>Loading</span>
          <span className="animate-pulse">...</span>
        </div>
      )
    },
    {
      name: 'Slide Reveal',
      component: (
        <div className="overflow-hidden">
          <div className="bg-primary text-primary-foreground p-2 rounded transform translate-x-0 hover:translate-x-2 transition-transform">
            Slide →
          </div>
        </div>
      )
    }
  ];

  const experimentalLayoutElements = [
    {
      name: 'Masonry Grid',
      component: (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card p-2 rounded h-16 border border-border">1</div>
          <div className="bg-card p-2 rounded h-24 border border-border">2</div>
          <div className="bg-card p-2 rounded h-20 border border-border">3</div>
        </div>
      )
    },
    {
      name: 'Sticky Header',
      component: (
        <div className="bg-primary text-primary-foreground p-2 rounded sticky top-0 z-10 text-caption">
          Sticky Navigation
        </div>
      )
    },
    {
      name: 'Floating Panel',
      component: (
        <div className="fixed bottom-4 right-4 bg-card border border-border p-3 rounded-lg shadow-lg">
          <div className="text-caption">Floating Action</div>
        </div>
      )
    },
    {
      name: 'Split Screen',
      component: (
        <div className="grid grid-cols-2 gap-1 h-16">
          <div className="bg-primary/20 rounded p-2 text-caption">Left</div>
          <div className="bg-secondary/20 rounded p-2 text-caption">Right</div>
        </div>
      )
    },
    {
      name: 'Accordion Card',
      component: (
        <div className="border border-border rounded">
          <div className="p-2 bg-muted text-caption font-medium">Expandable Section</div>
          <div className="p-2 text-micro text-muted-foreground">Hidden content here</div>
        </div>
      )
    }
  ];

  const experimentalInteractionElements = [
    {
      name: 'Progress Ring',
      component: (
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      )
    },
    {
      name: 'Toggle Switch',
      component: (
        <div className="relative inline-block w-12 h-6 bg-muted rounded-full">
          <div className="absolute top-1 left-1 w-4 h-4 bg-background rounded-full shadow transition-transform hover:translate-x-6" />
        </div>
      )
    },
    {
      name: 'Draggable Card',
      component: (
        <div className="bg-card border border-border p-3 rounded cursor-move hover:shadow-lg transition-shadow">
          <div className="text-caption">Drag me</div>
        </div>
      )
    },
    {
      name: 'Tooltip Hover',
      component: (
        <div className="group relative">
          <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-caption">
            Hover me
          </button>
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-foreground text-background px-2 py-1 rounded text-micro opacity-0 group-hover:opacity-100 transition-opacity">
            Tooltip
          </div>
        </div>
      )
    },
    {
      name: 'Rating Stars',
      component: (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-4 h-4 fill-warning text-warning" />
          ))}
        </div>
      )
    }
  ];

  const experimentalContentElements = [
    {
      name: 'Feature Callout',
      component: (
        <div className="bg-gradient-to-r from-primary/10 to-warning/10 border-l-4 border-primary p-3 rounded">
          <div className="text-caption font-semibold text-foreground">Pro Tip</div>
          <div className="text-micro text-muted-foreground">This is a helpful suggestion</div>
        </div>
      )
    },
    {
      name: 'Quote Block',
      component: (
        <blockquote className="border-l-4 border-primary pl-4 py-2 bg-muted/50 rounded-r">
          <div className="text-body italic text-foreground">"Design is not just what it looks like — design is how it works."</div>
          <div className="text-caption text-muted-foreground mt-1">— Steve Jobs</div>
        </blockquote>
      )
    },
    {
      name: 'Code Snippet',
      component: (
        <div className="bg-foreground text-background p-3 rounded font-mono text-caption">
          <div className="text-success">const</div> <span className="text-warning">greeting</span> = <span className="text-info">"Hello World"</span>;
        </div>
      )
    },
    {
      name: 'Timeline Item',
      component: (
        <div className="flex gap-3">
          <div className="w-3 h-3 bg-primary rounded-full mt-2" />
          <div>
            <div className="text-caption font-medium text-foreground">Event Title</div>
            <div className="text-micro text-muted-foreground">Event description here</div>
          </div>
        </div>
      )
    },
    {
      name: 'Stats Display',
      component: (
        <div className="text-center">
          <div className="text-title font-bold text-primary">1,234</div>
          <div className="text-caption text-muted-foreground">Users</div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex-1">
            <h1 className="text-display font-bold text-foreground">Design System</h1>
            <p className="text-muted-foreground mt-2 text-body">
              Complete visual reference with semantic tokens, components, and experimental elements
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-caption font-medium text-destructive">DEV ONLY - Never Publish</span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-title font-bold text-foreground">7</p>
                  <p className="text-caption text-muted-foreground">Color Tokens</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Type className="h-5 w-5 text-success" />
                <div>
                  <p className="text-title font-bold text-foreground">7</p>
                  <p className="text-caption text-muted-foreground">Typography</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Square className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-title font-bold text-foreground">3</p>
                  <p className="text-caption text-muted-foreground">Input Types</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Circle className="h-5 w-5 text-info" />
                <div>
                  <p className="text-title font-bold text-foreground">6</p>
                  <p className="text-caption text-muted-foreground">Button Variants</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-title font-bold text-foreground">5</p>
                  <p className="text-caption text-muted-foreground">Animations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-title font-bold text-foreground">25</p>
                  <p className="text-caption text-muted-foreground">Experimental</p>
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
              <Badge variant="default" className="text-micro">SEMANTIC TOKENS</Badge>
            </CardTitle>
            <p className="text-caption text-muted-foreground mt-2">
              Semantic color tokens with light/dark mode HEX values for design handoff
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {colorTokens.map((color) => (
                <div key={color.name} className="space-y-3">
                  <div className={`w-full h-20 rounded-lg ${color.class} border border-border shadow-sm`} />
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground text-body">{color.name}</p>
                    <p className="text-micro font-mono text-muted-foreground">{color.class}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-micro text-muted-foreground">Light:</span>
                        <code className="text-micro font-mono bg-muted px-2 py-1 rounded">{color.lightHex}</code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-micro text-muted-foreground">Dark:</span>
                        <code className="text-micro font-mono bg-muted px-2 py-1 rounded">{color.darkHex}</code>
                      </div>
                    </div>
                    <p className="text-micro text-muted-foreground">{color.description}</p>
                    <Badge variant="secondary" className="text-micro">{color.usage}</Badge>
                  </div>
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
              <Badge variant="default" className="text-micro">100% SEMANTIC</Badge>
            </CardTitle>
            <p className="text-caption text-muted-foreground mt-2">
              Complete semantic typography scale with proper hierarchy
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {typographyElements.map((typo, index) => (
                <div key={typo.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-body text-foreground">{typo.name}</span>
                      <code className="text-micro font-mono bg-muted px-2 py-1 rounded">{typo.semantic}</code>
                    </div>
                    <Badge variant="outline" className="text-micro">
                      {typo.usage}
                    </Badge>
                  </div>
                  <div className="border border-border rounded-lg p-4 bg-card">
                    {typo.element}
                  </div>
                  {index < typographyElements.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Font Families */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Font Families
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {fontFamilies.map((font, index) => (
                <div key={font.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium text-foreground text-body">{font.name}</h4>
                      <p className="text-caption text-muted-foreground">{font.usage}</p>
                      <code className="text-micro font-mono bg-muted px-2 py-1 rounded">{font.cssClass}</code>
                    </div>
                  </div>
                  <div className="border border-border rounded-lg p-4 bg-card">
                    {font.element}
                  </div>
                  {index < fontFamilies.length - 1 && <Separator />}
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
              <Badge variant="default" className="text-micro">STANDARDIZED</Badge>
            </CardTitle>
            <p className="text-caption text-muted-foreground mt-2">
              Unified input system with consistent behavior and styling
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {inputComponents.map((input, index) => (
                <div key={input.name} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground text-body">{input.name}</h4>
                        <Badge 
                          variant={
                            input.status === 'current' ? 'default' : 
                            input.status === 'future' ? 'secondary' : 
                            'outline'
                          } 
                          className="text-micro"
                        >
                          {input.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-caption text-muted-foreground mb-1">{input.description}</p>
                      <p className="text-micro text-muted-foreground italic">{input.migration}</p>
                    </div>
                    <Badge variant="outline" className="text-micro ml-4">
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
              <Badge variant="default" className="text-micro">STANDARDIZED</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {buttonVariants.map((btn) => (
                <div key={btn.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground text-body">{btn.name}</span>
                    <Badge variant="secondary" className="text-micro">{btn.usage}</Badge>
                  </div>
                  <Button variant={btn.variant as any} size="sm" className="w-full">
                    {btn.name} Button
                  </Button>
                  <p className="text-micro text-muted-foreground">{btn.description}</p>
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
            </CardTitle>
            <p className="text-caption text-muted-foreground mt-2">
              Interactive animations and transitions including signature effects
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {animationTypes.map((animation, index) => (
                <div key={animation.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground text-body">{animation.name}</h4>
                    <Badge variant="outline" className="text-micro">{animation.usage}</Badge>
                  </div>
                  <div className="border border-border rounded-lg p-4 bg-card flex items-center justify-center">
                    {animation.example}
                  </div>
                  <p className="text-caption text-muted-foreground">{animation.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Experimental Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-title font-bold text-foreground mb-2">Experimental Elements</h2>
            <p className="text-body text-muted-foreground">
              Explore new design patterns and interactions for future implementation
            </p>
          </div>

          {/* Color Experiments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Experiments
                <Badge variant="secondary" className="text-micro">5 NEW ELEMENTS</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {experimentalColorElements.map((element, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-medium text-body text-foreground">{element.name}</h4>
                    <div className="border border-border rounded-lg p-4 bg-card">
                      {element.component}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Animation Experiments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Animation Experiments
                <Badge variant="secondary" className="text-micro">5 NEW ELEMENTS</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {experimentalAnimationElements.map((element, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-medium text-body text-foreground">{element.name}</h4>
                    <div className="border border-border rounded-lg p-4 bg-card flex items-center justify-center">
                      {element.component}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Layout Experiments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Layout Experiments
                <Badge variant="secondary" className="text-micro">5 NEW ELEMENTS</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {experimentalLayoutElements.map((element, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-medium text-body text-foreground">{element.name}</h4>
                    <div className="border border-border rounded-lg p-4 bg-card relative">
                      {element.component}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interaction Experiments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="h-5 w-5" />
                Interaction Experiments
                <Badge variant="secondary" className="text-micro">5 NEW ELEMENTS</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {experimentalInteractionElements.map((element, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-medium text-body text-foreground">{element.name}</h4>
                    <div className="border border-border rounded-lg p-4 bg-card flex items-center justify-center">
                      {element.component}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Experiments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid className="h-5 w-5" />
                Content Experiments
                <Badge variant="secondary" className="text-micro">5 NEW ELEMENTS</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {experimentalContentElements.map((element, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-medium text-body text-foreground">{element.name}</h4>
                    <div className="border border-border rounded-lg p-4 bg-card">
                      {element.component}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Migration Status */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Migration Status
              <Badge variant="default" className="text-micro">IN PROGRESS</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-body font-medium text-foreground">Typography Migration</span>
                <span className="text-caption text-muted-foreground">~30% Complete</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '30%' }} />
              </div>
              <p className="text-caption text-muted-foreground">
                Converting remaining ~350+ legacy typography instances to semantic tokens across 80+ files
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DesignSystem;