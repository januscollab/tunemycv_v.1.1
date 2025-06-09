import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Code, Palette, Type, Square, Circle, Triangle, Zap, AlertTriangle, Search, Star, Heart, Award, Sparkles, Layers, Grid, Layout, MousePointer, Users, TrendingUp, Menu, ChevronDown, Info, Download, Settings, Bell, MessageSquare, Play, Pause, Volume2, RefreshCw, Camera, Clock, MapPin, Shield, Unlock, Lock, Mail, Upload, FileText, Loader, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FloatingLabelInput } from '@/components/common/FloatingLabelInput';
import { FloatingLabelTextarea } from '@/components/common/FloatingLabelTextarea';
import { CaptureInput } from '@/components/ui/capture-input';
import { CaptureTextarea } from '@/components/ui/capture-textarea';
import { SavedDataInput } from '@/components/ui/saved-data-input';
import { SavedDataTextarea } from '@/components/ui/saved-data-textarea';
import { FormTwoColumn, FormSingleColumn, FormSection } from '@/components/ui/form-layouts';
import { QuickActions } from '@/components/common/QuickActions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { LoadingStatesShowcase } from '@/components/ui/loading-states-showcase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DesignSystem = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
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
      component: <FloatingLabelInput placeholder="Unified input system" label="Unified label" />, 
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

  // Interaction Examples
  const interactionExamples = [
    {
      name: 'Quick Actions Menu',
      component: (
        <div className="relative">
          <QuickActions position="bottom-right" className="relative" showBackForward={false} />
        </div>
      ),
      usage: '1 usage',
      description: 'Floating action menu with multiple quick actions'
    },
    {
      name: 'Dropdown Menu',
      component: (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ChevronDown className="h-4 w-4 ml-1" />
              Options
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      usage: '67 usages',
      description: 'Contextual dropdown menus with proper background and high z-index'
    },
    {
      name: 'Tooltip System',
      component: (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">
                <Info className="h-4 w-4 mr-1" />
                Hover for tooltip
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>This is a helpful tooltip message</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
      usage: '89 usages',
      description: 'Accessible tooltips with proper z-index and positioning'
    },
    {
      name: 'Menu Text Animation',
      component: (
        <div className="space-y-2">
          <div className="group cursor-pointer">
            <span className="relative inline-block text-body text-foreground after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 group-hover:after:scale-x-100 group-hover:after:origin-bottom-left">
              Animated Menu Item
            </span>
          </div>
          <div className="group cursor-pointer">
            <span className="text-body text-muted-foreground transition-colors duration-200 group-hover:text-primary">
              Color Transition Menu
            </span>
          </div>
        </div>
      ),
      usage: '23 usages',
      description: 'Animated menu items with underline and color transitions'
    }
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
    },
    {
      name: 'Color Picker Palette',
      component: (
        <div className="grid grid-cols-5 gap-1">
          {['bg-primary', 'bg-success', 'bg-warning', 'bg-destructive', 'bg-info'].map((color, i) => (
            <div key={i} className={`w-6 h-6 rounded-full ${color} cursor-pointer hover:scale-110 transition-transform`} />
          ))}
        </div>
      )
    },
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
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to App
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-title font-bold text-foreground">Design System</h1>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-caption font-medium text-destructive">DEV ONLY - Never Publish</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Overview Section */}
        <div className="mb-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-display font-bold text-foreground mb-4">
              TuneMyCV Design System
            </h2>
            <p className="text-subheading text-muted-foreground mb-8">
              A comprehensive design system built for consistency, accessibility, and scalability.
              All components use semantic tokens that automatically adapt to light and dark themes.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="text-center p-6">
                <Palette className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="text-heading font-semibold mb-2">Color System</h3>
                <p className="text-caption text-muted-foreground">Semantic color tokens with automatic theme switching</p>
              </Card>
              <Card className="text-center p-6">
                <Type className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="text-heading font-semibold mb-2">Typography</h3>
                <p className="text-caption text-muted-foreground">Hierarchical text system with responsive scaling</p>
              </Card>
              <Card className="text-center p-6">
                <Grid className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="text-heading font-semibold mb-2">Components</h3>
                <p className="text-caption text-muted-foreground">Reusable components following design principles</p>
              </Card>
            </div>
          </div>
        </div>

        {/* Tabbed Navigation */}
        <Tabs defaultValue="foundations" className="mt-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="foundations">Foundations</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="forms">Form Fields</TabsTrigger>
            <TabsTrigger value="interactions">Interactions</TabsTrigger>
            <TabsTrigger value="loading">Loading States</TabsTrigger>
          </TabsList>

          {/* Foundations Tab */}
          <TabsContent value="foundations" className="space-y-8">
            {/* Color System */}
            <section>
              <h2 className="text-title font-bold text-foreground mb-8 flex items-center gap-3">
                <Palette className="h-6 w-6 text-primary" />
                Color System
              </h2>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {colorTokens.map((token) => (
                  <Card key={token.name} className="group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-0">
                      <div className={`${token.class} h-24 rounded-t-lg relative overflow-hidden`}>
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="text-micro">
                            {token.usage}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-subheading font-semibold text-foreground mb-2">{token.name}</h3>
                        <p className="text-caption text-muted-foreground mb-3">{token.description}</p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-micro">
                            <span className="text-muted-foreground">Light:</span>
                            <code className="text-foreground font-mono">{token.lightHex}</code>
                          </div>
                          <div className="flex justify-between text-micro">
                            <span className="text-muted-foreground">Dark:</span>
                            <code className="text-foreground font-mono">{token.darkHex}</code>
                          </div>
                          <div className="flex justify-between text-micro">
                            <span className="text-muted-foreground">CSS:</span>
                            <code className="text-foreground font-mono">{token.class}</code>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Typography System */}
            <section>
              <h2 className="text-title font-bold text-foreground mb-8 flex items-center gap-3">
                <Type className="h-6 w-6 text-primary" />
                Typography System
              </h2>
              
              {/* Font Families */}
              <div className="mb-8">
                <h3 className="text-heading font-semibold mb-4">Font Families</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {fontFamilies.map((font) => (
                    <Card key={font.name} className="p-6">
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-subheading font-medium">{font.name}</h4>
                          <Badge variant="outline">{font.cssClass}</Badge>
                        </div>
                        <p className="text-caption text-muted-foreground">{font.usage}</p>
                      </div>
                      {font.element}
                      <div className="mt-3 text-micro text-muted-foreground">
                        Fallbacks: {font.fallbacks}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Typography Scale */}
              <div className="mb-8">
                <h3 className="text-heading font-semibold mb-4">Typography Scale</h3>
                <div className="space-y-6">
                  {typographyElements.map((element) => (
                    <Card key={element.name} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-subheading font-medium mb-1">{element.name}</h4>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline">{element.semantic}</Badge>
                            <span className="text-caption text-muted-foreground">{element.usage}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-lg">
                        {element.element}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Experimental Color Elements */}
            <section>
              <h2 className="text-title font-bold text-foreground mb-8 flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-warning" />
                Experimental Color Elements
              </h2>
              <p className="text-body text-muted-foreground mb-6">
                These are experimental color components that may be used for inspiration or future implementation.
              </p>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {experimentalColorElements.map((element, index) => (
                  <Card key={index} className="p-4 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-caption font-medium">{element.name}</h3>
                      <Badge variant="outline" className="text-tiny">Experimental</Badge>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg flex items-center justify-center min-h-[60px]">
                      {element.component}
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-8">
            {/* Input Components */}
            <section>
              <h2 className="text-title font-bold text-foreground mb-8 flex items-center gap-3">
                <Square className="h-6 w-6 text-primary" />
                Input Components
              </h2>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {inputComponents.map((input, index) => (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-subheading">{input.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={input.status === 'current' ? 'default' : input.status === 'legacy' ? 'secondary' : 'outline'}>
                            {input.status}
                          </Badge>
                          <Badge variant="outline" className="text-micro">
                            {input.usage}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-caption text-muted-foreground">
                        {input.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/30 p-4 rounded-lg mb-4">
                        {input.component}
                      </div>
                      <div className="text-micro text-muted-foreground bg-muted/50 p-2 rounded border-l-2 border-primary/50">
                        <strong>Migration:</strong> {input.migration}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Button System */}
            <section>
              <h2 className="text-title font-bold text-foreground mb-8 flex items-center gap-3">
                <MousePointer className="h-6 w-6 text-primary" />
                Button System
              </h2>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {buttonVariants.map((button, index) => (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-subheading">{button.name}</CardTitle>
                        <Badge variant="outline" className="text-micro">
                          {button.usage}
                        </Badge>
                      </div>
                      <p className="text-caption text-muted-foreground">
                        {button.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-center">
                        <Button variant={button.variant as any} size="default">
                          {button.name} Button
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>

          {/* Form Fields Tab */}
          <TabsContent value="forms" className="space-y-8">
            {/* Form Field Types Overview */}
            <section>
              <h2 className="text-title font-bold text-foreground mb-8 flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                Form Field Types
              </h2>
              
              <div className="mb-8 grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                  <h3 className="text-heading font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    Type 1: Capture Fields
                  </h3>
                  <p className="text-caption text-muted-foreground mb-4">
                    For capturing new information once. Used for analysis inputs, job descriptions, CV uploads, and one-time data entry.
                  </p>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <Badge variant="outline" className="text-micro mb-2">Usage Example</Badge>
                    <div className="text-tiny text-muted-foreground">
                      • Job description input<br/>
                      • CV analysis forms<br/>
                      • Upload forms
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <h3 className="text-heading font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-success" />
                    Type 2: Saved Data Fields
                  </h3>
                  <p className="text-caption text-muted-foreground mb-4">
                    For displaying and editing saved information. Used for profile data, settings, and persistent user information.
                  </p>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <Badge variant="outline" className="text-micro mb-2">Usage Example</Badge>
                    <div className="text-tiny text-muted-foreground">
                      • Profile information<br/>
                      • User preferences<br/>
                      • Account settings
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            {/* Capture Fields (Type 1) */}
            <section>
              <h2 className="text-heading font-semibold text-foreground mb-6 flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Capture Fields (Type 1)
              </h2>
              
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                  <CardHeader className="pb-3 px-0">
                    <CardTitle className="text-subheading">Capture Input</CardTitle>
                    <p className="text-caption text-muted-foreground">
                      Single-line input for capturing new information with clear title positioning.
                    </p>
                  </CardHeader>
                  <CardContent className="px-0">
                    <div className="bg-muted/30 p-4 rounded-lg mb-4">
                      <CaptureInput 
                        label="Job Title" 
                        placeholder="e.g. Senior Software Engineer"
                        description="Enter the exact job title from the posting"
                      />
                    </div>
                    <div className="text-micro text-muted-foreground bg-muted/50 p-2 rounded border-l-2 border-primary/50">
                      <strong>Key Features:</strong> Fixed label position, placeholder guidance, optional description
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-6">
                  <CardHeader className="pb-3 px-0">
                    <CardTitle className="text-subheading">Capture Textarea</CardTitle>
                    <p className="text-caption text-muted-foreground">
                      Multi-line input for longer content with consistent label behavior.
                    </p>
                  </CardHeader>
                  <CardContent className="px-0">
                    <div className="bg-muted/30 p-4 rounded-lg mb-4">
                      <CaptureTextarea 
                        label="Job Description" 
                        placeholder="Paste the full job description here..."
                        description="Include requirements, responsibilities, and qualifications"
                      />
                    </div>
                    <div className="text-micro text-muted-foreground bg-muted/50 p-2 rounded border-l-2 border-primary/50">
                      <strong>Key Features:</strong> Auto-resize, clear placeholder text, helpful descriptions
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Saved Data Fields (Type 2) */}
            <section>
              <h2 className="text-heading font-semibold text-foreground mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 text-success" />
                Saved Data Fields (Type 2)
              </h2>
              
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                  <CardHeader className="pb-3 px-0">
                    <CardTitle className="text-subheading">Saved Data Input</CardTitle>
                    <p className="text-caption text-muted-foreground">
                      For displaying and editing saved user information with external labels only.
                    </p>
                  </CardHeader>
                  <CardContent className="px-0">
                    <div className="bg-muted/30 p-4 rounded-lg mb-4">
                      <SavedDataInput 
                        label="Full Name" 
                        value="John Doe"
                        description="This appears on your CV and profile"
                      />
                    </div>
                    <div className="text-micro text-muted-foreground bg-muted/50 p-2 rounded border-l-2 border-success/50">
                      <strong>Key Features:</strong> No internal labels, shows saved data clearly, clean editing experience
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-6">
                  <CardHeader className="pb-3 px-0">
                    <CardTitle className="text-subheading">Saved Data Textarea</CardTitle>
                    <p className="text-caption text-muted-foreground">
                      Multi-line field for longer saved content like bio or summary.
                    </p>
                  </CardHeader>
                  <CardContent className="px-0">
                    <div className="bg-muted/30 p-4 rounded-lg mb-4">
                      <SavedDataTextarea 
                        label="Professional Summary" 
                        value="Experienced software engineer with 5+ years in full-stack development..."
                        description="This summary appears on your CV"
                      />
                    </div>
                    <div className="text-micro text-muted-foreground bg-muted/50 p-2 rounded border-l-2 border-success/50">
                      <strong>Key Features:</strong> External label only, optimized for displaying existing data
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Form Layout Examples */}
            <section>
              <h2 className="text-heading font-semibold text-foreground mb-6 flex items-center gap-2">
                <Grid className="h-5 w-5 text-warning" />
                Form Layout Patterns
              </h2>
              
              <div className="space-y-8">
                {/* Two Column Layout Example */}
                <Card className="p-6">
                  <CardHeader className="pb-4 px-0">
                    <CardTitle className="text-subheading">Two-Column Personal Information Form</CardTitle>
                    <p className="text-caption text-muted-foreground">
                      Standard layout pattern for personal details with responsive grid system.
                    </p>
                  </CardHeader>
                  <CardContent className="px-0">
                    <div className="bg-muted/30 p-6 rounded-lg">
                      <FormSection title="Personal Information" description="Enter your basic details">
                        <FormTwoColumn>
                          <SavedDataInput label="First Name" value="John" />
                          <SavedDataInput label="Last Name" value="Doe" />
                          <SavedDataInput label="Email Address" value="john.doe@email.com" />
                          <SavedDataInput label="Phone Number" value="+1 (555) 123-4567" />
                          <SavedDataInput label="City" value="San Francisco" />
                          <SavedDataInput label="Country" value="United States" />
                        </FormTwoColumn>
                      </FormSection>
                    </div>
                  </CardContent>
                </Card>

                {/* Single Column Layout Example */}
                <Card className="p-6">
                  <CardHeader className="pb-4 px-0">
                    <CardTitle className="text-subheading">Single-Column Capture Form</CardTitle>
                    <p className="text-caption text-muted-foreground">
                      Best for capturing longer content or when focus is needed on individual fields.
                    </p>
                  </CardHeader>
                  <CardContent className="px-0">
                    <div className="bg-muted/30 p-6 rounded-lg">
                      <FormSection title="Job Analysis" description="Provide details for analysis">
                        <FormSingleColumn>
                          <CaptureInput 
                            label="Company Name" 
                            placeholder="e.g. TechCorp Inc."
                            description="The company posting this job"
                          />
                          <CaptureInput 
                            label="Job Title" 
                            placeholder="e.g. Senior Software Engineer"
                            description="Exact title from the job posting"
                          />
                          <CaptureTextarea 
                            label="Job Description" 
                            placeholder="Paste the complete job description here..."
                            description="Include all requirements, responsibilities, and qualifications"
                          />
                        </FormSingleColumn>
                      </FormSection>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Implementation Guidelines */}
            <section>
              <h2 className="text-heading font-semibold text-foreground mb-6 flex items-center gap-2">
                <Code className="h-5 w-5 text-info" />
                Implementation Guidelines
              </h2>
              
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6 border-l-4 border-primary">
                  <h3 className="text-subheading font-medium mb-3">When to Use Capture Fields (Type 1)</h3>
                  <ul className="text-caption text-muted-foreground space-y-2">
                    <li>• Job description input forms</li>
                    <li>• CV upload and analysis forms</li>
                    <li>• One-time data entry scenarios</li>
                    <li>• Search and filter inputs</li>
                    <li>• Content creation forms</li>
                  </ul>
                </Card>
                
                <Card className="p-6 border-l-4 border-success">
                  <h3 className="text-subheading font-medium mb-3">When to Use Saved Data Fields (Type 2)</h3>
                  <ul className="text-caption text-muted-foreground space-y-2">
                    <li>• User profile information</li>
                    <li>• Account settings and preferences</li>
                    <li>• Editing existing content</li>
                    <li>• Form fields with pre-populated data</li>
                    <li>• Configuration interfaces</li>
                  </ul>
                </Card>
              </div>
            </section>
          </TabsContent>

          {/* Interactions Tab */}
          <TabsContent value="interactions" className="space-y-8">
            {/* Animation System */}
            <section>
              <h2 className="text-title font-bold text-foreground mb-8 flex items-center gap-3">
                <Zap className="h-6 w-6 text-primary" />
                Animation System
              </h2>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {animationTypes.map((animation, index) => (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-subheading">{animation.name}</CardTitle>
                        <Badge variant="outline" className="text-micro">
                          {animation.usage}
                        </Badge>
                      </div>
                      <p className="text-caption text-muted-foreground">
                        {animation.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-center min-h-[80px]">
                        {animation.example}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Interaction Components */}
            <section>
              <h2 className="text-title font-bold text-foreground mb-8 flex items-center gap-3">
                <Layers className="h-6 w-6 text-primary" />
                Interaction Components
              </h2>
              
              <div className="grid gap-6 md:grid-cols-2">
                {interactionExamples.map((interaction, index) => (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-subheading">{interaction.name}</CardTitle>
                        <Badge variant="outline" className="text-micro">
                          {interaction.usage}
                        </Badge>
                      </div>
                      <p className="text-caption text-muted-foreground">
                        {interaction.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-center min-h-[100px]">
                        {interaction.component}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Experimental Animation Elements */}
            <section>
              <h2 className="text-title font-bold text-foreground mb-8 flex items-center gap-3">
                <Activity className="h-6 w-6 text-warning" />
                Experimental Animation Elements
              </h2>
              <p className="text-body text-muted-foreground mb-6">
                These are experimental animation components for creative interactions and micro-animations.
              </p>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {experimentalAnimationElements.map((element, index) => (
                  <Card key={index} className="p-4 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-caption font-medium">{element.name}</h3>
                      <Badge variant="outline" className="text-tiny">Experimental</Badge>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg flex items-center justify-center min-h-[60px]">
                      {element.component}
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>

          {/* Loading States Tab */}
          <TabsContent value="loading" className="space-y-8">
            <LoadingStatesShowcase 
              activeModal={activeModal} 
              setActiveModal={setActiveModal}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DesignSystem;