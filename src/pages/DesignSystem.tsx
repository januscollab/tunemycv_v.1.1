
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  Star, 
  Trash2, 
  Edit, 
  Plus, 
  Settings, 
  User,
  Bell,
  Search,
  Download,
  Upload,
  Mail,
  Phone
} from 'lucide-react';

// Import Design System Components
import { VubeUITooltip } from '@/components/design-system/VubeUITooltip';
import EnhancedAnalysisHistory from '@/components/analysis/EnhancedAnalysisHistory';
import EnhancedCoverLetterHistory from '@/components/design-system/EnhancedCoverLetterHistory';
import EnhancedInterviewPrepHistory from '@/components/design-system/EnhancedInterviewPrepHistory';

const DesignSystemPage: React.FC = () => {
  const [sliderValue, setSliderValue] = useState(50);
  const [switchState, setSwitchState] = useState(false);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Design System Components</h1>

      <Tabs defaultValue="components" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="data-display">Data Display</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Basic Components</h2>
            <p className="text-sm text-muted-foreground">
              Essential UI components for building interfaces.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Button */}
            <Card>
              <CardHeader>
                <CardTitle>Button</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <Button>Click Me</Button>
              </CardContent>
            </Card>

            {/* Input */}
            <Card>
              <CardHeader>
                <CardTitle>Input</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <Input placeholder="Enter text" />
              </CardContent>
            </Card>

            {/* Textarea */}
            <Card>
              <CardHeader>
                <CardTitle>Textarea</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <Textarea placeholder="Enter text" />
              </CardContent>
            </Card>

            {/* Switch */}
            <Card>
              <CardHeader>
                <CardTitle>Switch</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <Switch checked={switchState} onCheckedChange={setSwitchState} />
              </CardContent>
            </Card>

            {/* Slider */}
            <Card>
              <CardHeader>
                <CardTitle>Slider</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <Slider
                  defaultValue={[sliderValue]}
                  max={100}
                  step={1}
                  onValueChange={(value) => setSliderValue(value[0])}
                />
              </CardContent>
            </Card>

            {/* Tooltip */}
            <Card>
              <CardHeader>
                <CardTitle>Tooltip</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <VubeUITooltip 
                  content="This is a helpful tooltip message"
                >
                  <Button variant="outline">Hover me</Button>
                </VubeUITooltip>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Layout Components</h2>
            <p className="text-sm text-muted-foreground">
              Components for structuring and organizing content.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Card */}
            <Card>
              <CardHeader>
                <CardTitle>Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This is an example card component with header and content.
                </p>
              </CardContent>
            </Card>

            {/* Separator */}
            <Card>
              <CardHeader>
                <CardTitle>Separator</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <div className="w-full">
                  <Separator />
                </div>
              </CardContent>
            </Card>

            {/* Tabs Example */}
            <Card>
              <CardHeader>
                <CardTitle>Tabs Example</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="tab1" className="w-full">
                  <TabsList>
                    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab1">Content for Tab 1</TabsContent>
                  <TabsContent value="tab2">Content for Tab 2</TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Display Tab */}
        <TabsContent value="data-display" className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Data Display</h2>
            <p className="text-sm text-muted-foreground">
              Components for displaying data and information.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Badge */}
            <Card>
              <CardHeader>
                <CardTitle>Badge</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center space-x-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <Progress value={65} className="w-full" />
              </CardContent>
            </Card>

            {/* Avatar */}
            <Card>
              <CardHeader>
                <CardTitle>Avatar</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center space-x-2">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Feedback Components</h2>
            <p className="text-sm text-muted-foreground">
              Components for providing user feedback and notifications.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Alert */}
            <Card>
              <CardHeader>
                <CardTitle>Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertDescription>
                    Your subscription is expiring soon. Renew now to continue uninterrupted service.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Alert Variants */}
            <Card>
              <CardHeader>
                <CardTitle>Alert Variants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Alert>
                  <AlertDescription>Default alert message</AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <AlertDescription>Destructive alert message</AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Navigation Tab */}
        <TabsContent value="navigation" className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Navigation Components</h2>
            <p className="text-sm text-muted-foreground">
              Components for navigation and user interaction.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Button Variants */}
            <Card>
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center space-x-2">
                <Button>Default</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
              </CardContent>
            </Card>

            {/* Icon Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Icon Buttons</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center space-x-2">
                <Button size="sm" variant="outline">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Star className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Components Tab */}
        <TabsContent value="history" className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">History Components</h2>
            <p className="text-sm text-muted-foreground">
              Enhanced components for managing document and analysis history.
            </p>
          </div>

          <div className="space-y-6">
            {/* Enhanced Analysis History */}
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Analysis History</CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedAnalysisHistory />
              </CardContent>
            </Card>

            {/* Enhanced Cover Letter History */}
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Cover Letter History</CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedCoverLetterHistory />
              </CardContent>
            </Card>

            {/* Enhanced Interview Prep History */}
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Interview Prep History</CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedInterviewPrepHistory />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DesignSystemPage;
