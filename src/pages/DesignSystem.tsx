
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Search, 
  Plus, 
  Settings, 
  User, 
  Bell,
  Home,
  FileText,
  BarChart3,
  Calendar
} from 'lucide-react';
import EnhancedCoverLetterHistory from '@/components/design-system/EnhancedCoverLetterHistory';
import EnhancedInterviewPrepHistory from '@/components/design-system/EnhancedInterviewPrepHistory';
import { VubeUITooltip } from '@/components/design-system/VubeUITooltip';
import DocumentDeleteDialog from '@/components/ui/document-delete-dialog';

const DesignSystem = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Design Language System</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive collection of reusable components, patterns, and guidelines
          </p>
        </div>

        <Tabs defaultValue="components" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="tokens">Design Tokens</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-8">
            {/* Basic Components */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Components</CardTitle>
                <CardDescription>Fundamental building blocks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Buttons */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Buttons</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="default">Primary Button</Button>
                    <Button variant="secondary">Secondary Button</Button>
                    <Button variant="destructive">Destructive Button</Button>
                    <Button variant="outline">Outline Button</Button>
                    <Button variant="ghost">Ghost Button</Button>
                    <Button variant="link">Link Button</Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon"><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>

                <Separator />

                {/* Form Elements */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Form Elements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                    <Input placeholder="Enter text..." />
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">Option 1</SelectItem>
                        <SelectItem value="option2">Option 2</SelectItem>
                        <SelectItem value="option3">Option 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Badges */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Badges</h3>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="outline">Outline</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Components */}
            <Card>
              <CardHeader>
                <CardTitle>Advanced Components</CardTitle>
                <CardDescription>Complex interactive components</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tooltips */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Enhanced Tooltips</h3>
                  <div className="flex gap-4">
                    <VubeUITooltip content="This is a basic tooltip">
                      <Button variant="outline">Basic Tooltip</Button>
                    </VubeUITooltip>
                    
                    <VubeUITooltip 
                      content={
                        <div className="space-y-2">
                          <h4 className="font-semibold">Rich Content Tooltip</h4>
                          <p className="text-sm">This tooltip can contain complex content with multiple elements.</p>
                          <div className="flex gap-2">
                            <Badge variant="secondary">Feature</Badge>
                            <Badge variant="outline">Enhanced</Badge>
                          </div>
                        </div>
                      }
                      side="right"
                    >
                      <Button variant="outline">Rich Tooltip</Button>
                    </VubeUITooltip>
                  </div>
                </div>

                <Separator />

                {/* Dialog Components */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Dialog Components</h3>
                  <div className="flex gap-4">
                    <Button 
                      variant="destructive" 
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      Show Delete Dialog
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-8">
            {/* Document History Patterns */}
            <Card>
              <CardHeader>
                <CardTitle>Document History Patterns</CardTitle>
                <CardDescription>Enhanced document management interfaces</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Cover Letters Section */}
                <div className="space-y-4">
                  <h3 className="text-lg">Cover Letters</h3>
                  <div className="border rounded-lg p-4 bg-muted/20">
                    <EnhancedCoverLetterHistory />
                  </div>
                </div>

                <Separator />

                {/* Interview Prep Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Enhanced Interview Prep History</h3>
                  <div className="border rounded-lg p-4 bg-muted/20">
                    <EnhancedInterviewPrepHistory />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Patterns */}
            <Card>
              <CardHeader>
                <CardTitle>Navigation Patterns</CardTitle>
                <CardDescription>Common navigation layouts and structures</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tab Navigation Example */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Tab Navigation</h3>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="analytics">Analytics</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="mt-4">
                      <p className="text-muted-foreground">Overview content goes here...</p>
                    </TabsContent>
                    <TabsContent value="analytics" className="mt-4">
                      <p className="text-muted-foreground">Analytics content goes here...</p>
                    </TabsContent>
                    <TabsContent value="settings" className="mt-4">
                      <p className="text-muted-foreground">Settings content goes here...</p>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Design Tokens Tab */}
          <TabsContent value="tokens" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Design Tokens</CardTitle>
                <CardDescription>Core design values and variables</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Typography */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Typography Scale</h3>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold">Heading 1 - Large</div>
                    <div className="text-3xl font-bold">Heading 2 - Title</div>
                    <div className="text-2xl font-semibold">Heading 3 - Section</div>
                    <div className="text-xl font-medium">Heading 4 - Subsection</div>
                    <div className="text-base">Body Text - Regular</div>
                    <div className="text-sm text-muted-foreground">Caption Text - Small</div>
                  </div>
                </div>

                <Separator />

                {/* Color System */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Color System</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="w-full h-16 bg-primary rounded border"></div>
                      <p className="text-sm font-medium">Primary</p>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-16 bg-secondary rounded border"></div>
                      <p className="text-sm font-medium">Secondary</p>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-16 bg-muted rounded border"></div>
                      <p className="text-sm font-medium">Muted</p>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-16 bg-accent rounded border"></div>
                      <p className="text-sm font-medium">Accent</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Spacing Scale */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Spacing Scale</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 bg-primary"></div>
                      <span className="text-sm">1rem (16px) - Standard</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-6 h-6 bg-primary"></div>
                      <span className="text-sm">1.5rem (24px) - Medium</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary"></div>
                      <span className="text-sm">2rem (32px) - Large</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Usage Examples</CardTitle>
                <CardDescription>Real-world implementation examples</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dashboard Example */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Dashboard Layout</h3>
                  <div className="border rounded-lg p-6 bg-muted/20">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">Dashboard</h2>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          New Item
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <User className="h-8 w-8 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium">Total Users</p>
                              <p className="text-2xl font-bold">1,234</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-green-500" />
                            <div>
                              <p className="text-sm font-medium">Documents</p>
                              <p className="text-2xl font-bold">5,678</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <BarChart3 className="h-8 w-8 text-purple-500" />
                            <div>
                              <p className="text-sm font-medium">Analytics</p>
                              <p className="text-2xl font-bold">98.5%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Form Example */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Form Layout</h3>
                  <div className="border rounded-lg p-6 bg-muted/20 max-w-md">
                    <h3 className="text-lg font-semibold mb-4">User Profile</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input placeholder="Enter your full name" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Role</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" className="flex-1">Cancel</Button>
                        <Button className="flex-1">Save Changes</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Dialog Component */}
        <DocumentDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Sample Document"
          onConfirm={() => {
            console.log('Document deleted');
            setIsDeleteDialogOpen(false);
          }}
        />
      </div>
    </div>
  );
};

export default DesignSystem;
