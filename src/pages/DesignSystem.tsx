
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Star, 
  Heart, 
  Download, 
  Upload, 
  Settings, 
  User,
  MousePointer as ButtonIcon,
  Trash2
} from 'lucide-react';
import { VubeUITooltip } from '@/components/design-system/VubeUITooltip';
import EnhancedCoverLetterHistory from '@/components/design-system/EnhancedCoverLetterHistory';
import EnhancedInterviewPrepHistory from '@/components/design-system/EnhancedInterviewPrepHistory';
import DocumentDeleteDialog from '@/components/ui/document-delete-dialog';

const DesignSystem = () => {
  const [sliderValue, setSliderValue] = useState([50]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteConfirm = () => {
    console.log('Delete confirmed');
    setIsDeleteDialogOpen(false);
    toast.success('Item deleted successfully');
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Design System Showcase</h1>
        <p className="text-lg text-muted-foreground">
          A comprehensive showcase of all available UI components and design patterns
        </p>
      </div>

      <Tabs defaultValue="buttons" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="data">Data Display</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="enhanced">Enhanced</TabsTrigger>
        </TabsList>

        {/* Buttons Tab */}
        <TabsContent value="buttons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Standard Buttons</CardTitle>
              <CardDescription>Default button variants and sizes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <ButtonIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button disabled>Disabled</Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  With Icon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forms Tab */}
        <TabsContent value="forms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
              <CardDescription>Input fields, selects, and form controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Enter password" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Enter your message" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="select">Select Option</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms">Accept terms and conditions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="notifications" />
                  <Label htmlFor="notifications">Enable notifications</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Radio Group</Label>
                <RadioGroup defaultValue="option1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option1" id="radio1" />
                    <Label htmlFor="radio1">Option 1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option2" id="radio2" />
                    <Label htmlFor="radio2">Option 2</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Slider (Value: {sliderValue[0]})</Label>
                <Slider
                  value={sliderValue}
                  onValueChange={setSliderValue}
                  max={100}
                  min={0}
                  step={1}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Components</CardTitle>
              <CardDescription>Alerts, toasts, and progress indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Heads up!</AlertTitle>
                  <AlertDescription>
                    You can add components to your app using the cli.
                  </AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Your session has expired. Please log in again.
                  </AlertDescription>
                </Alert>
              </div>
              <div className="space-y-2">
                <Label>Progress Example</Label>
                <Progress value={75} />
              </div>
              <div className="space-y-2">
                <Label>Toast Examples</Label>
                <div className="flex gap-2">
                  <Button onClick={() => toast.success('Success message!')}>
                    Success Toast
                  </Button>
                  <Button onClick={() => toast.error('Error message!')}>
                    Error Toast
                  </Button>
                  <Button onClick={() => toast.info('Info message!')}>
                    Info Toast
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Display Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Display</CardTitle>
              <CardDescription>Badges, avatars, and data presentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Badges</Label>
                <div className="flex gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Avatars</Label>
                <div className="flex gap-2">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>AB</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Icons</Label>
                <div className="flex gap-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                  <Heart className="h-6 w-6 text-red-500" />
                  <Download className="h-6 w-6 text-blue-500" />
                  <Upload className="h-6 w-6 text-green-500" />
                  <Settings className="h-6 w-6 text-gray-500" />
                  <User className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Navigation Tab */}
        <TabsContent value="navigation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Navigation & Tooltips</CardTitle>
              <CardDescription>Navigation components and enhanced tooltips</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Enhanced Tooltips</h3>
                <div className="flex gap-4">
                  <VubeUITooltip content="Simple tooltip text">
                    <Button variant="outline">Simple Tooltip</Button>
                  </VubeUITooltip>
                  
                  <VubeUITooltip 
                    content={
                      <div className="space-y-2">
                        <div className="font-semibold">Rich Content Tooltip</div>
                        <div className="text-sm">This tooltip contains rich content with multiple elements.</div>
                        <div className="flex gap-2">
                          <Badge variant="secondary">Tag 1</Badge>
                          <Badge variant="outline">Tag 2</Badge>
                        </div>
                      </div>
                    }
                  >
                    <Button variant="outline">Rich Tooltip</Button>
                  </VubeUITooltip>
                  
                  <VubeUITooltip 
                    content="This is a tooltip with a custom delay"
                    delay={1000}
                  >
                    <Button variant="outline">Delayed Tooltip</Button>
                  </VubeUITooltip>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Tab */}
        <TabsContent value="enhanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Components</CardTitle>
              <CardDescription>Advanced document history and management components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cover Letter History</h3>
                <EnhancedCoverLetterHistory 
                  onSelectCoverLetter={(coverLetter) => {
                    console.log('Selected cover letter:', coverLetter);
                    toast.success(`Selected: ${coverLetter.job_title}`);
                  }}
                  className="max-h-96 overflow-y-auto"
                />
              </div>

              {/* DELETE - Second Enhanced Cover Letter History */}
              <div className="space-y-4" data-delete="true">
                <h3 className="text-lg font-semibold">Cover Letter History (Duplicate - DELETE)</h3>
                <EnhancedCoverLetterHistory 
                  onSelectCoverLetter={(coverLetter) => {
                    console.log('Selected cover letter:', coverLetter);
                    toast.success(`Selected: ${coverLetter.job_title}`);
                  }}
                  className="max-h-96 overflow-y-auto"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Interview Prep History</h3>
                <EnhancedInterviewPrepHistory 
                  onSelectInterviewPrep={(interviewPrep) => {
                    console.log('Selected interview prep:', interviewPrep);
                    toast.success(`Selected: ${interviewPrep.job_title}`);
                  }}
                  className="max-h-96 overflow-y-auto"
                />
              </div>

              {/* DELETE - Second Enhanced Interview Prep History */}
              <div className="space-y-4" data-delete="true">
                <h3 className="text-lg font-semibold">Interview Prep History (Duplicate - DELETE)</h3>
                <EnhancedInterviewPrepHistory 
                  onSelectInterviewPrep={(interviewPrep) => {
                    console.log('Selected interview prep:', interviewPrep);
                    toast.success(`Selected: ${interviewPrep.job_title}`);
                  }}
                  className="max-h-96 overflow-y-auto"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Document Management</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="destructive" 
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Test Delete Dialog
                  </Button>
                </div>
                
                <DocumentDeleteDialog
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                  onConfirm={handleDeleteConfirm}
                  documentType="Cover Letter"
                  documentTitle="Senior Frontend Developer - TechCorp Inc."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DesignSystem;
