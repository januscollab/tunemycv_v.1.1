import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Code, Palette, Type, Square, Circle, Triangle, Zap, AlertTriangle, Search, Star, Heart, Award, Sparkles, Layers, Grid, Layout, MousePointer, Users, TrendingUp, Menu, ChevronDown, Info, Download, Settings, Bell, MessageSquare, Play, Pause, Volume2, RefreshCw, Camera, Clock, MapPin, Shield, Unlock, Lock, Mail, Upload, FileText, Loader, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UnifiedInput } from '@/components/ui/unified-input';
import { FloatingLabelInput } from '@/components/common/FloatingLabelInput';
import { FloatingLabelTextarea } from '@/components/common/FloatingLabelTextarea';
import { QuickActions } from '@/components/common/QuickActions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { LoadingStatesShowcase } from '@/components/ui/loading-states-showcase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressIndicator, Spinner, LoadingDots, BounceLoader, WaveLoader, PulseRing, MorphingDots } from '@/components/ui/progress-indicator';
import { MinimalUploadModal, EngagingUploadModal, AnimatedUploadModal } from '@/components/ui/file-upload-modals';

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
    {
      name: 'Gradient Progress Bar',
      component: (
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full w-3/4 bg-gradient-to-r from-primary via-warning to-success rounded-full" />
        </div>
      )
    },
    {
      name: 'Mood Color Ring',
      component: (
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-warning via-success to-info animate-spin" style={{ animationDuration: '4s' }} />
          <div className="absolute inset-1 rounded-full bg-background" />
        </div>
      )
    },
    {
      name: 'Color Blend Card',
      component: (
        <div className="relative overflow-hidden rounded-lg h-20">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-l from-success/20 to-transparent" />
          <div className="relative p-3 text-caption text-foreground">Blended Colors</div>
        </div>
      )
    },
    {
      name: 'Dynamic Shadow',
      component: (
        <div className="bg-card p-4 rounded-lg border border-border hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 cursor-pointer">
          <div className="text-caption text-foreground">Hover for colored shadow</div>
        </div>
      )
    },
    {
      name: 'Color Pulse Animation',
      component: (
        <div className="w-12 h-12 bg-primary rounded-full animate-pulse opacity-80 relative">
          <div className="absolute inset-2 bg-primary-foreground rounded-full animate-ping" />
        </div>
      )
    },
    {
      name: 'Spectrum Gradient',
      component: (
        <div className="w-full h-8 rounded-lg bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500" />
      )
    },
    {
      name: 'Accent Border Card',
      component: (
        <div className="p-4 border-2 border-transparent bg-gradient-to-r from-primary to-success rounded-lg bg-clip-border">
          <div className="bg-background rounded p-2 text-caption text-foreground">Gradient Border</div>
        </div>
      )
    },
    {
      name: 'Color Feedback Button',
      component: (
        <button className="px-4 py-2 bg-muted text-foreground rounded transition-all duration-300 hover:bg-success hover:text-success-foreground active:bg-warning active:text-warning-foreground">
          Interactive Colors
        </button>
      )
    },
    {
      name: 'Theme Color Display',
      component: (
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-primary rounded" title="Primary" />
          <div className="w-4 h-4 bg-success rounded" title="Success" />
          <div className="w-4 h-4 bg-warning rounded" title="Warning" />
          <div className="w-4 h-4 bg-destructive rounded" title="Error" />
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
    },
    {
      name: 'Rotate on Hover',
      component: (
        <div className="bg-warning text-warning-foreground p-3 rounded-lg transition-transform hover:rotate-12 cursor-pointer">
          <Settings className="h-5 w-5" />
        </div>
      )
    },
    {
      name: 'Floating Animation',
      component: (
        <div className="bg-info text-info-foreground p-2 rounded-full animate-bounce" style={{ animationDuration: '2s' }}>
          <MessageSquare className="h-4 w-4" />
        </div>
      )
    },
    {
      name: 'Morphing Loader',
      component: (
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-primary rounded-full opacity-60 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s`, animationDuration: '1s' }}
            />
          ))}
        </div>
      )
    },
    {
      name: 'Elastic Scale',
      component: (
        <button className="bg-success text-success-foreground p-3 rounded-lg transition-transform hover:scale-125 active:scale-95">
          <Play className="h-4 w-4" />
        </button>
      )
    },
    {
      name: 'Pendulum Swing',
      component: (
        <div className="relative w-16 h-8">
          <div className="absolute top-0 left-1/2 w-0.5 h-6 bg-muted transform -translate-x-0.5" />
          <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-primary rounded-full animate-pulse transform -translate-x-1/2" style={{ animationDuration: '1.5s' }} />
        </div>
      )
    },
    {
      name: 'Wave Effect',
      component: (
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1 bg-primary animate-pulse"
              style={{ 
                height: `${8 + Math.sin(i * 0.5) * 4}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '0.8s'
              }}
            />
          ))}
        </div>
      )
    },
    {
      name: 'Heartbeat Pulse',
      component: (
        <div className="relative">
          <Heart className="h-6 w-6 text-destructive animate-pulse" style={{ animationDuration: '1s' }} />
          <div className="absolute inset-0 animate-ping opacity-30">
            <Heart className="h-6 w-6 text-destructive" />
          </div>
        </div>
      )
    },
    {
      name: 'Rotation Loader',
      component: (
        <div className="relative w-8 h-8">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        </div>
      )
    },
    {
      name: 'Fade In Up',
      component: (
        <div className="bg-card border border-border p-3 rounded-lg animate-slide-up opacity-0" style={{ animation: 'slide-up 0.5s ease-out forwards' }}>
          <span className="text-caption text-foreground">Slides up on load</span>
        </div>
      )
    },
    {
      name: 'Stagger Animation',
      component: (
        <div className="space-y-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-full h-2 bg-primary/60 rounded animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
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
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg relative">
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
    },
    {
      name: 'Card Stack',
      component: (
        <div className="relative">
          <div className="absolute top-0 left-2 w-full h-12 bg-muted/50 rounded border" />
          <div className="absolute top-1 left-1 w-full h-12 bg-muted/70 rounded border" />
          <div className="relative w-full h-12 bg-card rounded border border-border p-2 text-caption">Top Card</div>
        </div>
      )
    },
    {
      name: 'Sidebar Layout',
      component: (
        <div className="flex h-16 rounded border border-border overflow-hidden">
          <div className="w-16 bg-muted border-r border-border p-2 text-micro">Nav</div>
          <div className="flex-1 bg-card p-2 text-caption">Content Area</div>
        </div>
      )
    },
    {
      name: 'Hero Section',
      component: (
        <div className="bg-gradient-to-r from-primary/10 to-warning/10 p-4 rounded-lg text-center">
          <div className="text-heading font-bold text-foreground">Hero Title</div>
          <div className="text-caption text-muted-foreground">Subtitle text here</div>
        </div>
      )
    },
    {
      name: 'Flex Wrap Grid',
      component: (
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded text-micro text-center leading-8">{i}</div>
          ))}
        </div>
      )
    },
    {
      name: 'Responsive Columns',
      component: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-micro">
          <div className="bg-card border border-border p-2 rounded">Col 1</div>
          <div className="bg-card border border-border p-2 rounded">Col 2</div>
          <div className="bg-card border border-border p-2 rounded">Col 3</div>
        </div>
      )
    },
    {
      name: 'Fixed Header Layout',
      component: (
        <div className="relative h-20 border border-border rounded overflow-hidden">
          <div className="sticky top-0 bg-primary text-primary-foreground p-2 text-micro">Fixed Header</div>
          <div className="p-2 text-caption">Scrollable content below header</div>
        </div>
      )
    },
    {
      name: 'Card Grid Auto-fit',
      component: (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(60px,1fr))] gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-success/20 p-2 rounded text-micro text-center">{i}</div>
          ))}
        </div>
      )
    },
    {
      name: 'Overlay Layout',
      component: (
        <div className="relative h-16 bg-gradient-to-r from-info/20 to-warning/20 rounded">
          <div className="absolute inset-0 bg-foreground/10 rounded" />
          <div className="relative p-2 text-caption text-foreground">Overlay Content</div>
        </div>
      )
    },
    {
      name: 'Tab Container',
      component: (
        <div className="border border-border rounded">
          <div className="flex border-b border-border">
            <div className="px-3 py-1 bg-muted text-micro">Tab 1</div>
            <div className="px-3 py-1 text-micro">Tab 2</div>
          </div>
          <div className="p-2 text-caption">Tab content here</div>
        </div>
      )
    },
    {
      name: 'Center Stack',
      component: (
        <div className="flex flex-col items-center justify-center h-16 bg-muted/20 rounded space-y-1">
          <div className="text-caption font-medium text-foreground">Centered</div>
          <div className="text-micro text-muted-foreground">Stack Layout</div>
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
    },
    {
      name: 'Slider Range',
      component: (
        <div className="w-full">
          <div className="relative h-2 bg-muted rounded-full">
            <div className="absolute left-0 h-2 w-3/5 bg-primary rounded-full" />
            <div className="absolute top-1/2 left-3/5 w-3 h-3 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer" />
          </div>
        </div>
      )
    },
    {
      name: 'Checkbox Custom',
      component: (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border border-border rounded bg-primary flex items-center justify-center">
            <div className="w-2 h-2 bg-primary-foreground rounded" />
          </div>
          <span className="text-caption">Custom checkbox</span>
        </div>
      )
    },
    {
      name: 'Radio Group',
      component: (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border border-border rounded-full bg-primary flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
            </div>
            <span className="text-micro">Option 1</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border border-border rounded-full" />
            <span className="text-micro">Option 2</span>
          </div>
        </div>
      )
    },
    {
      name: 'File Upload Zone',
      component: (
        <div className="border-2 border-dashed border-muted p-4 rounded text-center hover:border-primary transition-colors cursor-pointer">
          <Upload className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <div className="text-micro text-muted-foreground">Drop files here</div>
        </div>
      )
    },
    {
      name: 'Modal Trigger',
      component: (
        <button className="px-3 py-1 bg-warning text-warning-foreground rounded text-caption hover:bg-warning/90 transition-colors">
          Open Modal
        </button>
      )
    },
    {
      name: 'Stepper Control',
      component: (
        <div className="flex items-center border border-border rounded">
          <button className="px-2 py-1 hover:bg-muted text-muted-foreground">-</button>
          <span className="px-3 py-1 text-caption">3</span>
          <button className="px-2 py-1 hover:bg-muted text-muted-foreground">+</button>
        </div>
      )
    },
    {
      name: 'Color Picker',
      component: (
        <div className="relative">
          <div className="w-8 h-8 bg-primary rounded border border-border cursor-pointer" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-warning rounded-full border border-background" />
        </div>
      )
    },
    {
      name: 'Keyboard Shortcut',
      component: (
        <div className="flex items-center space-x-1">
          <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-micro">⌘</kbd>
          <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-micro">K</kbd>
        </div>
      )
    },
    {
      name: 'Context Menu',
      component: (
        <div className="bg-card border border-border rounded shadow-lg p-1 min-w-[120px]">
          <div className="px-2 py-1 hover:bg-muted rounded text-micro cursor-pointer">Cut</div>
          <div className="px-2 py-1 hover:bg-muted rounded text-micro cursor-pointer">Copy</div>
          <div className="px-2 py-1 hover:bg-muted rounded text-micro cursor-pointer">Paste</div>
        </div>
      )
    },
    {
      name: 'Pin Button',
      component: (
        <button className="p-1 rounded hover:bg-muted transition-colors">
          <MapPin className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
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
    },
    {
      name: 'Alert Banner',
      component: (
        <div className="bg-warning/10 border border-warning/20 p-3 rounded flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
          <div>
            <div className="text-caption font-medium text-foreground">Warning</div>
            <div className="text-micro text-muted-foreground">This action cannot be undone</div>
          </div>
        </div>
      )
    },
    {
      name: 'Breadcrumb Trail',
      component: (
        <div className="flex items-center space-x-2 text-micro text-muted-foreground">
          <span>Home</span>
          <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
          <span>Products</span>
          <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
          <span className="text-foreground">Details</span>
        </div>
      )
    },
    {
      name: 'Tag Cloud',
      component: (
        <div className="flex flex-wrap gap-1">
          {['React', 'TypeScript', 'Tailwind'].map(tag => (
            <span key={tag} className="px-2 py-1 bg-muted text-micro rounded hover:bg-primary/20 cursor-pointer">
              {tag}
            </span>
          ))}
        </div>
      )
    },
    {
      name: 'Progress Steps',
      component: (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-micro text-primary-foreground">1</div>
          <div className="w-8 h-0.5 bg-primary" />
          <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-micro">2</div>
          <div className="w-8 h-0.5 bg-muted" />
          <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-micro">3</div>
        </div>
      )
    },
    {
      name: 'User Avatar',
      component: (
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-warning rounded-full flex items-center justify-center text-caption font-medium text-primary-foreground">
            JD
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background" />
        </div>
      )
    },
    {
      name: 'Notification Badge',
      component: (
        <div className="relative">
          <Bell className="h-6 w-6 text-muted-foreground" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-micro text-destructive-foreground">
            3
          </div>
        </div>
      )
    },
    {
      name: 'Search Result',
      component: (
        <div className="border border-border rounded p-3 hover:bg-muted/20 cursor-pointer">
          <div className="text-caption font-medium text-foreground">Search Result Title</div>
          <div className="text-micro text-muted-foreground mt-1">Brief description of the search result...</div>
          <div className="text-micro text-primary mt-1">example.com</div>
        </div>
      )
    },
    {
      name: 'Loading Card',
      component: (
        <div className="border border-border rounded p-4 space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
        </div>
      )
    },
    {
      name: 'Empty State',
      component: (
        <div className="text-center p-6 border border-dashed border-muted rounded">
          <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <div className="text-caption text-muted-foreground">No results found</div>
          <div className="text-micro text-muted-foreground">Try adjusting your search</div>
        </div>
      )
    },
    {
      name: 'Metric Card',
      component: (
        <div className="bg-gradient-to-br from-success/10 to-success/5 border border-success/20 p-3 rounded">
          <div className="flex items-center justify-between">
            <div className="text-title font-bold text-success">+12%</div>
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <div className="text-micro text-muted-foreground">vs last month</div>
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
                  <p className="text-title font-bold text-foreground">75</p>
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

        {/* Interaction Examples */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointer className="h-5 w-5" />
              Interaction Examples
              <Badge variant="default" className="text-micro">LIVE COMPONENTS</Badge>
            </CardTitle>
            <p className="text-caption text-muted-foreground mt-2">
              Interactive components including quick actions, dropdowns, tooltips, and menu animations
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {interactionExamples.map((interaction, index) => (
                <div key={interaction.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground text-body">{interaction.name}</h4>
                    <Badge variant="outline" className="text-micro">{interaction.usage}</Badge>
                  </div>
                  <div className="border border-border rounded-lg p-4 bg-card flex items-center justify-center min-h-[100px]">
                    {interaction.component}
                  </div>
                  <p className="text-caption text-muted-foreground">{interaction.description}</p>
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
                 <Badge variant="secondary" className="text-micro">15 NEW ELEMENTS</Badge>
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
                 <Badge variant="secondary" className="text-micro">15 NEW ELEMENTS</Badge>
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
                 <Badge variant="secondary" className="text-micro">15 NEW ELEMENTS</Badge>
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
                 <Badge variant="secondary" className="text-micro">15 NEW ELEMENTS</Badge>
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
                <Badge variant="secondary" className="text-micro">15 NEW ELEMENTS</Badge>
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
          </TabsContent>

          {/* Components Tab - Placeholder for now */}
          <TabsContent value="components" className="space-y-8">
            <div className="text-center py-16">
              <Layout className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-heading font-semibold mb-2">Components Section</h3>
              <p className="text-caption text-muted-foreground">Component documentation coming soon</p>
            </div>
          </TabsContent>

          {/* Interactions Tab - Placeholder for now */}
          <TabsContent value="interactions" className="space-y-8">
            <div className="text-center py-16">
              <MousePointer className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-heading font-semibold mb-2">Interactions Section</h3>
              <p className="text-caption text-muted-foreground">Interaction patterns documentation coming soon</p>
            </div>
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