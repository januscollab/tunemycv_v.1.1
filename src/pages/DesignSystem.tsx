
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Check, X, Star } from 'lucide-react';
import { VybeButton, VybeSelect, VybeIconButton } from '@/components/design-system';
import EnhancedAnalysisHistory from '@/components/analysis/EnhancedAnalysisHistory';
import EnhancedCoverLetterHistory from '@/components/analysis/EnhancedCoverLetterHistory';
import InterviewPrepHistory from '@/components/interview-prep/InterviewPrepHistory';
import N8nAnalysisResults from '@/components/analysis/N8nAnalysisResults';

const DesignSystem = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Design System</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore all the components and design elements used throughout our application
          </p>
        </div>

        <Tabs defaultValue="components" className="w-full">
          <TabsList className="grid grid-cols-6 w-full max-w-4xl mx-auto mb-8">
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="data-display">Data Display</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="components" className="space-y-8">
            {/* Vybe Design System Components */}
            <Card>
              <CardHeader>
                <CardTitle>Vybe Design System Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">VybeButton</h3>
                  <div className="flex flex-wrap gap-4">
                    <VybeButton variant="primary">Primary Button</VybeButton>
                    <VybeButton variant="secondary">Secondary Button</VybeButton>
                    <VybeButton variant="ghost">Ghost Button</VybeButton>
                    <VybeButton variant="primary" size="sm">Small</VybeButton>
                    <VybeButton variant="primary" size="lg">Large</VybeButton>
                    <VybeButton variant="primary" disabled>Disabled</VybeButton>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">VybeSelect</h3>
                  <div className="flex flex-wrap gap-4">
                    <VybeSelect
                      options={[
                        { value: 'option1', label: 'Option 1' },
                        { value: 'option2', label: 'Option 2' },
                        { value: 'option3', label: 'Option 3' }
                      ]}
                      placeholder="Select an option"
                      className="w-48"
                    />
                    <VybeSelect
                      options={[
                        { value: 'small', label: 'Small Size' },
                        { value: 'medium', label: 'Medium Size' }
                      ]}
                      size="sm"
                      placeholder="Small select"
                      className="w-40"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">VybeIconButton</h3>
                  <div className="flex flex-wrap gap-4">
                    <VybeIconButton icon="Settings" tooltip="Settings" />
                    <VybeIconButton icon="User" tooltip="User Profile" variant="secondary" />
                    <VybeIconButton icon="Search" tooltip="Search" size="sm" />
                    <VybeIconButton icon="Bell" tooltip="Notifications" size="lg" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Cover Letter History */}
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Cover Letter History</CardTitle>
                <p className="text-sm text-muted-foreground">
                  A comprehensive cover letter management component with search, pagination, and full CRUD operations.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Full Featured Demo */}
                  <div>
                    <h4 className="text-md font-semibold mb-2">Full Featured Version</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Complete functionality with search, pagination, and all action buttons
                    </p>
                    <EnhancedCoverLetterHistory 
                      useMockData={true}
                      maxItems={3}
                      className="border rounded-lg p-4 bg-muted/20"
                    />
                  </div>

                  {/* Compact Demo */}
                  <Separator />
                  <div>
                    <h4 className="text-md font-semibold mb-2">Compact Version</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Reduced spacing and minimal UI for tight layouts
                    </p>
                    <EnhancedCoverLetterHistory 
                      compact={true}
                      useMockData={true}
                      maxItems={2}
                      showTitle={false}
                      className="border rounded-lg p-4 bg-muted/20"
                    />
                  </div>

                  {/* Props Documentation */}
                  <Separator />
                  <div>
                    <h4 className="text-md font-semibold mb-4">Component Props</h4>
                    <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <strong>showTitle:</strong> boolean (default: true)<br/>
                          <strong>compact:</strong> boolean (default: false)<br/>
                          <strong>maxItems:</strong> number (optional)<br/>
                          <strong>defaultItemsPerPage:</strong> number (default: 10)<br/>
                          <strong>showSearch:</strong> boolean (default: true)<br/>
                          <strong>showPagination:</strong> boolean (default: true)
                        </div>
                        <div>
                          <strong>className:</strong> string (optional)<br/>
                          <strong>onSelectCoverLetter:</strong> function (optional)<br/>
                          <strong>useMockData:</strong> boolean (default: false)<br/>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Usage Examples */}
                  <div>
                    <h4 className="text-md font-semibold mb-4">Usage Examples</h4>
                    <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre>{`// Basic usage (full functionality)
<EnhancedCoverLetterHistory />

// Compact demo version
<EnhancedCoverLetterHistory 
  compact={true}
  maxItems={3}
  useMockData={true}
/>

// No title, custom pagination
<EnhancedCoverLetterHistory 
  showTitle={false}
  defaultItemsPerPage={5}
/>

// Minimal version for demos
<EnhancedCoverLetterHistory 
  showSearch={false}
  showPagination={false}
  maxItems={2}
  useMockData={true}
/>`}</pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Traditional Components */}
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button size="sm">Small</Button>
                  <Button size="lg">Large</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Form Elements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Type your message here..." />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="notifications" />
                  <Label htmlFor="notifications">Enable notifications</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="layout" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Cards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Simple Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>This is a simple card with basic content.</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Card with Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>This card has action buttons.</p>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm">Action 1</Button>
                        <Button size="sm" variant="outline">Action 2</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Separators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>Content above separator</div>
                <Separator />
                <div>Content below separator</div>
                <Separator orientation="vertical" className="h-20" />
                <div>Vertical separator example (in flex container)</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data-display" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={33} />
                <Progress value={66} />
                <Progress value={100} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avatars</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This is a default alert with some important information.
                  </AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <X className="h-4 w-4" />
                  <AlertDescription>
                    This is a destructive alert indicating an error.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="navigation" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Tab Example</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="tab1" className="w-full">
                  <TabsList>
                    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                    <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab1" className="mt-4">
                    <p>Content for Tab 1</p>
                  </TabsContent>
                  <TabsContent value="tab2" className="mt-4">
                    <p>Content for Tab 2</p>
                  </TabsContent>
                  <TabsContent value="tab3" className="mt-4">
                    <p>Content for Tab 3</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Analysis History</CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedAnalysisHistory />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interview Prep History</CardTitle>
              </CardHeader>
              <CardContent>
                <InterviewPrepHistory />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>N8n Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <N8nAnalysisResults 
                  result={{
                    analysis_type: 'comprehensive',
                    job_title: 'Senior Frontend Developer',
                    company_name: 'Tech Innovation Corp',
                    compatibility_score: 87,
                    executive_summary: 'This is a sample analysis showing high compatibility...',
                    pdf_file_data: 'sample-pdf-data'
                  }}
                  readOnly={true}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DesignSystem;
