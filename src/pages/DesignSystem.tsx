import React, { useState } from "react";
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Palette, Type, Square, Zap, AlertTriangle, ChevronDown, Info, Download, Settings, Bell, Sparkles, Layers, Grid, MousePointer, History as HistoryIcon, Activity, Loader, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from '@/components/common/FloatingLabelInput';
import { FloatingLabelTextarea } from '@/components/common/FloatingLabelTextarea';
import { CaptureInput } from '@/components/ui/capture-input';
import { CaptureTextarea } from '@/components/ui/capture-textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import LegacyRichTextEditor from '@/components/ui/legacy-rich-text-editor';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { LoadingStatesShowcase } from '@/components/ui/loading-states-showcase';
import { ContactSalesModal } from '@/components/ui/contact-sales-modal';
import { WelcomeCreditsModal } from '@/components/ui/welcome-credits-modal';
import ToastModal from '@/components/ui/toast-modal';
import { MockPaymentModal } from '@/components/ui/mock-payment-modal';
import { StepIndicator } from '@/components/ui/step-indicator';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
import EnhancedAnalysisHistory from '@/components/analysis/EnhancedAnalysisHistory';
import { CategoryDocumentHistory } from '@/components/ui/category-document-history';
import { DocumentHistory as ProfileDocumentHistory } from '@/components/ui/profile-document-history';
import { VybeButton, VybeSelect, VybeIconButton, VubeUITooltip, EnhancedCoverLetterHistory, EnhancedInterviewPrepHistory } from "@/components/design-system";
import { Separator } from '@/components/ui/separator';

const DesignSystem = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('foundations');
  const [rteContent, setRteContent] = useState("<h2>Sample Heading</h2><p>This is a paragraph with <strong>bold text</strong> and <em>italic text</em>.</p><ul><li>First item</li><li>Second item</li></ul>");
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
      component: <FloatingLabelInput label="Job Description" />, 
      usage: '68 usages',
      description: 'Input with floating labels that prevent text clashing. Label moves to absolute top when focused (text-micro size), positioned lower when inactive.',
      status: 'current',
      migration: 'Improved positioning prevents label/placeholder collision. Current recommended approach for all new components.'
    },
    { 
      name: 'Floating Label Textarea', 
      component: <FloatingLabelTextarea label="Job Description" rows={3} />, 
      usage: '34 usages',
      description: 'Textarea with floating labels and improved text positioning. Label moves to absolute top when focused, positioned lower when inactive.',
      status: 'current',
      migration: 'Same improved positioning as input variant. Text size remains text-micro when floated to top.'
    },
    { 
      name: 'Capture Input', 
      component: <CaptureInput label="Job Title" placeholder="e.g. Senior Software Engineer" description="Enter the exact job title from the posting" />, 
      usage: '45 usages',
      description: 'Single-line input for capturing new information with clear title positioning and helpful descriptions.',
      status: 'current',
      migration: 'Fixed label position, placeholder guidance, optional description. Used for one-time data entry.'
    },
    { 
      name: 'Capture Textarea', 
      component: <CaptureTextarea label="Job Description" placeholder="Paste the full job description here..." description="Include requirements, responsibilities, and qualifications" />, 
      usage: '32 usages',
      description: 'Multi-line input for longer content with consistent label behavior and auto-resize.',
      status: 'current',
      migration: 'Auto-resize, clear placeholder text, helpful descriptions. Used for analysis inputs and uploads.'
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

  // Missing Components in Documentation
  const missingComponents = [
    { 
      name: 'ContactSalesModal', 
      component: (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setActiveModal('contactSales')}
        >
          Open Contact Sales Modal
        </Button>
      ), 
      usage: '3 usages',
      description: 'Modal component for sales inquiries and contact forms',
      status: 'active',
      trigger: () => setActiveModal('contactSales')
    },
    { 
      name: 'WelcomeCreditsModal', 
      component: (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setActiveModal('welcomeCredits')}
        >
          Open Welcome Credits Modal
        </Button>
      ), 
      usage: '5 usages',
      description: 'Modal shown to new users explaining credit system',
      status: 'active',
      trigger: () => setActiveModal('welcomeCredits')
    },
    { 
      name: 'ToastModal', 
      component: (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setActiveModal('toast')}
        >
          Open Toast Modal
        </Button>
      ), 
      usage: '15 usages',
      description: 'Advanced toast notifications for complex feedback',
      status: 'active',
      trigger: () => setActiveModal('toast')
    },
    { 
      name: 'MockPaymentModal', 
      component: (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setActiveModal('mockPayment')}
        >
          Open Payment Modal
        </Button>
      ), 
      usage: '2 usages',
      description: 'Modal for simulating payment flows in demo mode',
      status: 'active',
      trigger: () => setActiveModal('mockPayment')
    },
    { 
      name: 'StepIndicator', 
      component: (
        <div className="space-y-4">
          <StepIndicator
            steps={[
              { id: '1', title: 'Upload', description: 'Upload your CV' },
              { id: '2', title: 'Analyze', description: 'AI processes document' },
              { id: '3', title: 'Results', description: 'View analysis results' }
            ]}
            currentStep="2"
            completedSteps={['1']}
            orientation="horizontal"
          />
          <StepIndicator
            steps={[
              { id: '1', title: 'Upload CV' },
              { id: '2', title: 'Job Description' },
              { id: '3', title: 'Analysis' }
            ]}
            currentStep="2"
            completedSteps={['1']}
            orientation="vertical"
            className="max-w-xs"
          />
        </div>
      ), 
      usage: '7 usages',
      description: 'Visual indicator for multi-step workflows and forms',
      status: 'active',
      trigger: () => {}
    },
    { 
      name: 'ProgressIndicator', 
      component: (
        <div className="space-y-4 w-full">
          <ProgressIndicator value={75} label="Processing CV" />
          <ProgressIndicator value={45} variant="success" size="lg" />
          <ProgressIndicator value={25} variant="warning" showPercentage={false} />
          <ProgressIndicator value={85} variant="destructive" size="sm" />
        </div>
      ), 
      usage: '34 usages',
      description: 'Progress bars with multiple variants, sizes, and animations',
      status: 'active',
      trigger: () => {}
    }
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
      name: 'VubeUITooltip',
      component: (
        <VubeUITooltip
          content={
            <div className="space-y-2">
              <p className="font-medium">Feature Details</p>
              <p className="text-sm text-muted-foreground">
                This advanced feature includes analytics, 
                reporting, and custom configurations.
              </p>
            </div>
          }
        >
          <Button variant="outline" size="sm">
            <Info className="h-4 w-4 mr-1" />
            Rich content tooltip
          </Button>
        </VubeUITooltip>
      ),
      usage: '23 usages',
      description: 'Advanced tooltips with rich content, custom styling, and enhanced positioning controls'
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

  // Rich Text Editor examples
  const richTextEditorExamples = [
    {
      name: 'Default Editor',
      component: (
        <LegacyRichTextEditor
          placeholder="Enter your content here..."
          value={rteContent}
          onChange={(value) => {
            setRteContent(value);
            console.log('Content changed:', value);
          }}
          onSave={(value) => {
            console.log('Auto-saving content:', value);
            setRteContent(value);
          }}
          filename="design-system-sample"
          className="w-full"
          minHeight="200px"
          autoSave={true}
          autoSaveDelay={2000}
        />
      ),
      usage: '45 usages',
      description: 'Full-featured rich text editor with auto-save and download functionality'
    },
    {
      name: 'With AI Features',
      component: (
        <RichTextEditor
          initialContent="<p>Select any text in this editor to see AI enhancement options appear. Try selecting this sentence to see the AI toolbar.</p>"
          onContentChange={(json, text) => console.log('AI editor changed:', json, text)}
          className="w-full"
          placeholder="Select text to see AI options..."
        />
      ),
      usage: '12 usages',
      description: 'Editor with AI-powered text improvement features'
    },
    {
      name: 'Read-only Display',
      component: (
        <RichTextEditor
          readOnly={true}
          initialContent="<h2>Read-only Content</h2><p>This content cannot be edited and is displayed for viewing only.</p><ul><li>Read-only item 1</li><li>Read-only item 2</li></ul>"
          onContentChange={() => {}}
          className="w-full"
        />
      ),
      usage: '18 usages',
      description: 'Display-only mode for showing formatted content'
    },
    {
      name: 'Error State',
      component: (
        <LegacyRichTextEditor
          state="error"
          placeholder="Editor with error state..."
          value="<p>This editor shows an error state with red border styling.</p>"
          onChange={(value) => console.log('Error state changed:', value)}
          className="w-full"
          minHeight="150px"
        />
      ),
      usage: '8 usages',
      description: 'Editor showing validation error state'
    },
    {
      name: 'Success State',
      component: (
        <LegacyRichTextEditor
          state="success"
          placeholder="Editor with success state..."
          value="<p>This editor shows a success state with green border and checkmark.</p>"
          onChange={(value) => console.log('Success state changed:', value)}
          className="w-full"
          minHeight="150px"
        />
      ),
      usage: '5 usages',
      description: 'Editor showing successful validation state'
    },
    {
      name: 'Disabled Editor',
      component: (
        <LegacyRichTextEditor
          disabled={true}
          placeholder="Disabled editor..."
          value="<p>This editor is disabled and cannot be interacted with.</p>"
          className="w-full"
          minHeight="150px"
        />
      ),
      usage: '7 usages',
      description: 'Disabled state for form contexts'
    },
    {
      name: 'AI Context Menu (New Design)',
      component: (
        <div className="space-y-4">
          <p className="text-caption text-muted-foreground">
            AI Context Menu is now only available within Rich Text Editor components for security and UX consistency.
          </p>
          <div className="p-4 border border-border rounded-lg bg-background min-h-[120px] flex items-center justify-center">
            <p className="text-body text-muted-foreground">
              AI Context Menu disabled outside of Rich Text Editor context
            </p>
          </div>
        </div>
      ),
      usage: 'RTE only',
      description: 'AI context menu restricted to Rich Text Editor'
    }
  ];

  const componentExamples = [
    {
      name: "VybeButton",
      component: (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <VybeButton vybeVariant="primary" vybeSize="sm">Primary Small</VybeButton>
            <VybeButton vybeVariant="secondary" vybeSize="sm">Secondary Small</VybeButton>
            <VybeButton vybeVariant="outline" vybeSize="sm">Outline Small</VybeButton>
            <VybeButton vybeVariant="ghost" vybeSize="sm">Ghost Small</VybeButton>
          </div>
          <div className="flex flex-wrap gap-2">
            <VybeButton vybeVariant="primary" vybeSize="default">Primary Medium</VybeButton>
            <VybeButton vybeVariant="secondary" vybeSize="default">Secondary Medium</VybeButton>
            <VybeButton vybeVariant="outline" vybeSize="default">Outline Medium</VybeButton>
            <VybeButton vybeVariant="ghost" vybeSize="default">Ghost Medium</VybeButton>
          </div>
          <div className="flex flex-wrap gap-2">
            <VybeButton vybeVariant="primary" vybeSize="lg">Primary Large</VybeButton>
            <VybeButton vybeVariant="secondary" vybeSize="lg">Secondary Large</VybeButton>
            <VybeButton vybeVariant="outline" vybeSize="lg">Outline Large</VybeButton>
            <VybeButton vybeVariant="ghost" vybeSize="lg">Ghost Large</VybeButton>
          </div>
        </div>
      ),
      usage: 127,
      description: "Primary button component with consistent styling and semantic token integration"
    },
    {
      name: "VybeSelect",
      component: (
        <div className="space-y-4">
          <VybeSelect
            options={[
              { value: "option1", label: "Option 1" },
              { value: "option2", label: "Option 2" },
              { value: "option3", label: "Option 3" }
            ]}
            placeholder="Choose an option"
            onValueChange={(value) => console.log(value)}
          />
          <VybeSelect
            options={[
              { value: "enabled", label: "This is enabled" },
              { value: "another", label: "Another option" }
            ]}
            placeholder="Simple options"
          />
        </div>
      ),
      usage: 89,
      description: "Dropdown select component with consistent styling and semantic token integration"
    },
    {
      name: "VybeIconButton", 
      component: (
        <div className="flex gap-2">
          <VybeIconButton 
            icon={User}
            tooltip="User Profile"
            onClick={() => console.log('User clicked')}
          />
          <VybeIconButton 
            icon={Settings}
            tooltip="Settings"
            variant="secondary"
            onClick={() => console.log('Settings clicked')}
          />
          <VybeIconButton 
            icon={Bell}
            tooltip="Notifications"
            variant="outline"
            onClick={() => console.log('Notifications clicked')}
          />
        </div>
      ),
      usage: 45,
      description: "Icon-only button with built-in tooltip functionality"
    },
    {
      name: "EnhancedCoverLetterHistory",
      component: (
        <div className="max-w-4xl">
          <EnhancedCoverLetterHistory 
            onSelectCoverLetter={(coverLetter) => console.log('Selected:', coverLetter)}
            className="border rounded-lg p-4"
          />
        </div>
      ),
      usage: 3,
      description: "Advanced cover letter history management component with search, pagination, and document actions"
    }
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
            
          </div>
        </div>

        {/* Tabbed Navigation */}
        <Tabs defaultValue="foundations" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="foundations">Foundations</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="rte">Rich Text Editor</TabsTrigger>
            <TabsTrigger value="interactions">Interactions & Loading</TabsTrigger>
            <TabsTrigger value="missing">Missing Docs</TabsTrigger>
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

            {/* Design System Components */}
            <section>
              <h2 className="text-title font-bold text-foreground mb-8 flex items-center gap-3">
                <Grid className="h-6 w-6 text-primary" />
                Design System Components
              </h2>
              
              <div className="grid gap-6">
                {componentExamples.map((component, index) => (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-subheading">{component.name}</CardTitle>
                        <Badge variant="default" className="text-micro">
                          {component.usage} usages
                        </Badge>
                      </div>
                      <p className="text-caption text-muted-foreground">
                        {component.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/30 p-4 rounded-lg">
                        {component.component}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Enhanced History Components */}
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Enhanced Cover Letter History</h3>
                <EnhancedCoverLetterHistory className="max-w-4xl" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Enhanced Interview Prep History</h3>
                <EnhancedInterviewPrepHistory className="max-w-4xl" />
              </div>
            </div>

            {/* History Components Section */}
            <section>
              <h2 className="text-title font-bold text-foreground mb-8 flex items-center gap-3">
                <HistoryIcon className="h-6 w-6 text-primary" />
                History Components
              </h2>
              
              <div className="w-[80%] mx-auto grid gap-6 grid-cols-1">

                {/* EnhancedAnalysisHistory */}
                <Card className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-subheading">EnhancedAnalysisHistory</CardTitle>
                      <Badge variant="default" className="text-micro">Current</Badge>
                    </div>
                    <p className="text-caption text-muted-foreground">
                      Advanced analysis history with view, download, delete actions and CTA buttons for generating cover letters and interview prep.
                    </p>
                    <div className="text-micro text-muted-foreground mt-2">
                      <strong>Used in:</strong> src/pages/AnalyzeCV.tsx
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <EnhancedAnalysisHistory className="w-full" />
                    </div>
                  </CardContent>
                </Card>

                {/* CategoryDocumentHistory */}
                <Card className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-subheading">CategoryDocumentHistory</CardTitle>
                      <Badge variant="secondary" className="text-micro">Restored</Badge>
                    </div>
                    <p className="text-caption text-muted-foreground">
                      Categorized document history with comprehensive filtering, sorting, and management capabilities.
                    </p>
                    <div className="text-micro text-muted-foreground mt-2">
                      <strong>Used in:</strong> src/pages/CoverLetter.tsx, src/pages/InterviewToolkit.tsx
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <CategoryDocumentHistory
                        header={{
                          title: "Sample Document History",
                          totalCount: 5,
                          itemsPerPage: 10,
                          onItemsPerPageChange: () => {}
                        }}
                        documents={[
                          {
                            id: "1",
                            type: "cover_letter",
                            title: "Software Engineer Cover Letter",
                            created_at: new Date().toISOString(),
                            job_title: "Software Engineer"
                          },
                          {
                            id: "2", 
                            type: "analysis",
                            title: "CV Analysis Report",
                            created_at: new Date().toISOString(),
                            compatibility_score: 85
                          }
                        ]}
                        actions={[
                          { label: "View", onClick: () => {}, icon: <Eye className="h-4 w-4 mr-2" /> },
                          { label: "Download", onClick: () => {}, icon: <Download className="h-4 w-4 mr-2" /> }
                        ]}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* ProfileDocumentHistory */}
                <Card className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-subheading">ProfileDocumentHistory</CardTitle>
                      <Badge variant="secondary" className="text-micro">Restored</Badge>
                    </div>
                    <p className="text-caption text-muted-foreground">
                      Profile-specific document history component for user profile management interfaces.
                    </p>
                    <div className="text-micro text-muted-foreground mt-2">
                      <strong>Used in:</strong> src/components/profile/AnalysisHistoryTab.tsx, src/components/profile/DocumentHistoryTab.tsx
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <ProfileDocumentHistory
                        header={{
                          title: "User Documents",
                          totalCount: 2,
                          filterType: "all",
                          onFilterChange: () => {},
                          itemsPerPage: 10,
                          onItemsPerPageChange: () => {}
                        }}
                        documents={[
                          {
                            id: "1",
                            type: "analysis",
                            title: "Senior Developer CV",
                            created_at: new Date().toISOString(),
                            compatibility_score: 92
                          },
                          {
                            id: "2",
                            type: "cover_letter", 
                            title: "Marketing Manager Application",
                            created_at: new Date().toISOString(),
                            job_title: "Marketing Manager"
                          }
                        ]}
                        actions={[
                          { label: "Edit", onClick: () => {}, icon: <Eye className="h-4 w-4 mr-2" /> },
                          { label: "View", onClick: () => {}, icon: <Eye className="h-4 w-4 mr-2" /> },
                          { label: "Download", onClick: () => {}, icon: <Download className="h-4 w-4 mr-2" /> }
                        ]}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>

              </div>
            </section>
          </TabsContent>

          {/* Rich Text Editor Tab */}
          <TabsContent value="rte" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Type className="h-5 w-5 text-primary mr-2" />
                    Rich Text Editor Components
                  </CardTitle>
                  <p className="text-caption text-muted-foreground">
                    Modular rich text editor with multiple variants, states, and AI-powered features for content editing throughout the application.
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  {richTextEditorExamples.map((example, index) => (
                    <div key={index} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-subheading font-semibold">{example.name}</h3>
                          <p className="text-caption text-muted-foreground">{example.description}</p>
                        </div>
                        <Badge variant="outline" className="text-micro">
                          {example.usage}
                        </Badge>
                      </div>
                      <div className="border border-border rounded-lg p-4 bg-background">
                        {example.component}
                      </div>
                      {index < richTextEditorExamples.length - 1 && <Separator />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Implementation Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle>Implementation Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="text-body font-semibold">Usage Patterns</h4>
                      <ul className="text-caption space-y-1 text-muted-foreground">
                        <li>• Use <code>default</code> variant for main content editing</li>
                        <li>• Enable AI features for advanced editing workflows</li>
                        <li>• Use read-only mode for content display</li>
                        <li>• All menu items are left-aligned with adequate spacing</li>
                        <li>• Save and download functionality included by default</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-body font-semibold">Technical Notes</h4>
                      <ul className="text-caption space-y-1 text-muted-foreground">
                        <li>• Built on ReactQuill with custom styling</li>
                        <li>• Supports theming with design tokens</li>
                        <li>• Includes AI context selection features</li>
                        <li>• Responsive and accessibility-compliant</li>
                        <li>• Modular CSS with variant support</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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

            {/* Loading States Section */}
            <section>
              <h2 className="text-title font-bold text-foreground mb-8 flex items-center gap-3">
                <Loader className="h-6 w-6 text-primary" />
                Loading States
              </h2>
              
              <LoadingStatesShowcase 
                activeModal={activeModal} 
                setActiveModal={setActiveModal}
              />
            </section>
          </TabsContent>

          {/* Missing Components Tab */}
          <TabsContent value="missing" className="space-y-8">
            <section>
              <h2 className="text-title font-bold text-foreground mb-8 flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-warning" />
                Missing Components Documentation
              </h2>
              <p className="text-body text-muted-foreground mb-6">
                These components are actively used in the live site but missing from design system documentation.
              </p>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {missingComponents.map((component, index) => (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-warning/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-subheading flex items-center gap-2">
                          {component.name}
                          <Badge variant="outline" className="text-tiny bg-warning/10 text-warning border-warning/30">
                            {component.status}
                          </Badge>
                        </CardTitle>
                        <Badge variant="outline" className="text-micro">
                          {component.usage}
                        </Badge>
                      </div>
                      <p className="text-caption text-muted-foreground">
                        {component.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-warning/5 border border-warning/20 p-4 rounded-lg flex items-center justify-center min-h-[80px]">
                        {component.component}
                      </div>
                      <div className="text-micro text-warning bg-warning/10 p-2 rounded border-l-2 border-warning/50 mt-3">
                        <strong>Action Required:</strong> Add component documentation and examples to design system
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>

          {/* Experiments Tab */}
          <TabsContent value="experiments" className="space-y-8">
            <section>
              <h2 className="text-display font-bold mb-4">🧪 Experimental Components</h2>
              <p className="text-body text-muted-foreground mb-8">
                Creative explorations and experimental UI concepts. These are production-ready components with advanced features.
              </p>

              {/* Enhanced AI Assistant */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Enhanced AI Text Assistant
                  </CardTitle>
                  <p className="text-caption text-muted-foreground">
                    Contextual AI menu with nested actions, custom avatars, and before/after comparison dialog
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Demo Area */}
                  <div className="border-2 border-dashed border-border rounded-lg p-8 bg-muted/30 relative min-h-[400px] flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <h3 className="text-heading font-semibold">AI Context Menu Disabled</h3>
                      <p className="text-body text-muted-foreground max-w-md">
                        For security and consistency, the AI Context Menu is now only available 
                        within Rich Text Editor components. This ensures proper context and 
                        prevents accidental activation outside of editing workflows.
                      </p>
                    </div>
                  </div>

                  {/* Design Concept */}
                  <div className="grid md:grid-cols-2 gap-6 text-caption">
                    <div className="space-y-4">
                      <h4 className="text-heading font-semibold">🎨 Design Concept</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex-shrink-0 mt-0.5"></div>
                          <div>
                            <div className="font-medium">Orbital Interface</div>
                            <div className="text-muted-foreground">Actions orbit around central AI like planets</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex-shrink-0 mt-0.5"></div>
                          <div>
                            <div className="font-medium">Adaptive Personality</div>
                            <div className="text-muted-foreground">AI mood changes based on text complexity</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex-shrink-0 mt-0.5"></div>
                          <div>
                            <div className="font-medium">Magnetic Positioning</div>
                            <div className="text-muted-foreground">Smart positioning that avoids content overlap</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-400 to-red-400 flex-shrink-0 mt-0.5"></div>
                          <div>
                            <div className="font-medium">Particle Effects</div>
                            <div className="text-muted-foreground">Visual feedback during AI processing</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-heading font-semibold">⚡ Interactive Features</h4>
                      <div className="space-y-2 text-caption">
                        <div className="p-3 bg-accent/30 rounded-lg border border-accent">
                          <div className="font-medium mb-1">Breathing Animation</div>
                          <div className="text-muted-foreground">Subtle life-like animation when idle</div>
                        </div>
                        <div className="p-3 bg-accent/30 rounded-lg border border-accent">
                          <div className="font-medium mb-1">Progressive Disclosure</div>
                          <div className="text-muted-foreground">Actions reveal based on interaction depth</div>
                        </div>
                        <div className="p-3 bg-accent/30 rounded-lg border border-accent">
                          <div className="font-medium mb-1">Smooth Transitions</div>
                          <div className="text-muted-foreground">Fluid animations between states</div>
                        </div>
                        <div className="p-3 bg-accent/30 rounded-lg border border-accent">
                          <div className="font-medium mb-1">Contextual Intelligence</div>
                          <div className="text-muted-foreground">Responds to text characteristics</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div className="bg-muted/50 p-4 rounded-lg border border-muted">
                    <h4 className="text-heading font-semibold mb-3">🔧 Technical Implementation</h4>
                    <div className="grid md:grid-cols-3 gap-4 text-caption">
                      <div>
                        <div className="font-medium mb-2">Positioning Logic</div>
                        <div className="text-muted-foreground space-y-1">
                          <div>• Magnetic snap to optimal positions</div>
                          <div>• Boundary detection & adjustment</div>
                          <div>• Content overlap prevention</div>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium mb-2">Animation System</div>
                        <div className="text-muted-foreground space-y-1">
                          <div>• CSS transforms for orbiting</div>
                          <div>• Staggered animation delays</div>
                          <div>• Particle system with random positioning</div>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium mb-2">State Management</div>
                        <div className="text-muted-foreground space-y-1">
                          <div>• AI mood based on text analysis</div>
                          <div>• Progressive menu states</div>
                          <div>• Processing feedback loops</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Component Redesigns */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Grid className="h-5 w-5 text-primary" />
                    Component Redesign Experiments
                  </CardTitle>
                  <p className="text-caption text-muted-foreground">
                    Alternative designs for existing components - exploring different layouts and interaction patterns
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/30 rounded-lg p-6 text-center">
                    <h4 className="text-heading font-semibold mb-2 text-foreground">Experimental Components Removed</h4>
                    <p className="text-caption text-muted-foreground">
                      Component variations have been removed to streamline the codebase. The main production components 
                      can be found in their respective sections above.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Future Experiments Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-warning" />
                    Future Experiments
                  </CardTitle>
                  <p className="text-caption text-muted-foreground">
                    Ideas for future experimental components and interactions
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 border border-dashed border-border rounded-lg text-center opacity-75">
                      <div className="text-2xl mb-2">🎭</div>
                      <div className="font-medium mb-1">Morphing Buttons</div>
                      <div className="text-caption text-muted-foreground">Buttons that transform based on context</div>
                    </div>
                    <div className="p-4 border border-dashed border-border rounded-lg text-center opacity-75">
                      <div className="text-2xl mb-2">🌊</div>
                      <div className="font-medium mb-1">Fluid Navigation</div>
                      <div className="text-caption text-muted-foreground">Liquid-like menu transitions</div>
                    </div>
                    <div className="p-4 border border-dashed border-border rounded-lg text-center opacity-75">
                      <div className="text-2xl mb-2">🎨</div>
                      <div className="font-medium mb-1">Adaptive Themes</div>
                      <div className="text-caption text-muted-foreground">Colors that change with content</div>
                    </div>
                    <div className="p-4 border border-dashed border-border rounded-lg text-center opacity-75">
                      <div className="text-2xl mb-2">🔮</div>
                      <div className="font-medium mb-1">Predictive UI</div>
                      <div className="text-caption text-muted-foreground">Interface that anticipates actions</div>
                    </div>
                    <div className="p-4 border border-dashed border-border rounded-lg text-center opacity-75">
                      <div className="text-2xl mb-2">⚡</div>
                      <div className="font-medium mb-1">Gesture Controls</div>
                      <div className="text-caption text-muted-foreground">Hand gesture-based interactions</div>
                    </div>
                    <div className="p-4 border border-dashed border-border rounded-lg text-center opacity-75">
                      <div className="text-2xl mb-2">🎪</div>
                      <div className="font-medium mb-1">Physics UI</div>
                      <div className="text-caption text-muted-foreground">Elements with realistic physics</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Examples */}
      <ContactSalesModal 
        isOpen={activeModal === 'contactSales'} 
        onClose={() => setActiveModal(null)} 
      />
      
      <WelcomeCreditsModal 
        isOpen={activeModal === 'welcomeCredits'} 
        onClose={() => setActiveModal(null)} 
      />
      
      
      <ToastModal 
        isOpen={activeModal === 'toast'} 
        onClose={() => setActiveModal(null)}
        title="Success!"
        description="Your action was completed successfully."
        variant="default"
      />
      
      <MockPaymentModal 
        isOpen={activeModal === 'mockPayment'} 
        onClose={() => setActiveModal(null)}
        plan={{
          name: "Pro Plan",
          price: 19.99,
          credits: 100
        }}
      />
    </div>
  );
};

export default DesignSystem;
