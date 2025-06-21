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
import { VybeButton } from '@/components/design-system/VybeButton';
import { VybeIconButton } from '@/components/design-system/VybeIconButton';
import { VybeSelect } from '@/components/design-system/VybeSelect';
import { VubeUITooltip } from '@/components/design-system/VubeUITooltip';
import EnhancedAnalysisHistory from '@/components/design-system/EnhancedAnalysisHistory';
import EnhancedCoverLetterHistory from '@/components/design-system/EnhancedCoverLetterHistory';
import EnhancedInterviewPrepHistory from '@/components/design-system/EnhancedInterviewPrepHistory';

const DesignSystemPage: React.FC = () => {
  const [sliderValue, setSliderValue] = useState(50);
  const [switchState, setSwitchState] = useState(false);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Design System Components</h1>

      {/* Vybe Components */}
      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Vybe Components</h2>
          <p className="text-sm text-muted-foreground">
            Custom components built for the Vybe application.
          </p>
        </div>

        {/* Vybe Button */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Vybe Button</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <VybeButton>Click Me</VybeButton>
            </CardContent>
          </Card>

          {/* Vybe Icon Button */}
          <Card>
            <CardHeader>
              <CardTitle>Vybe Icon Button</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <VybeIconButton icon={<Heart className="h-4 w-4" />} />
            </CardContent>
          </Card>

          {/* Vybe Select */}
          <Card>
            <CardHeader>
              <CardTitle>Vybe Select</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <VybeSelect />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* UI Components */}
      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">UI Components</h2>
          <p className="text-sm text-muted-foreground">
            Standard UI components from the chosen library.
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

          {/* Badge */}
          <Card>
            <CardHeader>
              <CardTitle>Badge</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <Badge>Default</Badge>
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

          {/* Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Tabs</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="account" className="w-[400px]">
                <TabsList>
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="account">Make changes to your account here.</TabsContent>
                <TabsContent value="billing">Manage your billing details and subscription.</TabsContent>
                <TabsContent value="settings">Configure your application settings.</TabsContent>
              </Tabs>
            </CardContent>
          </Card>

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

          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <Progress value={65} />
            </CardContent>
          </Card>

          {/* Avatar */}
          <Card>
            <CardHeader>
              <CardTitle>Avatar</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
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

          {/* Tooltip */}
          <Card>
            <CardHeader>
              <CardTitle>Tooltip</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <VubeUITooltip />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Enhanced Analysis History */}
      <section className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Enhanced Analysis History</h3>
          <p className="text-sm text-muted-foreground">
            Component for displaying analysis history with enhanced features like search, pagination, and actions.
          </p>
        </div>
        <EnhancedAnalysisHistory />
      </section>

      {/* Enhanced Cover Letter History */}
      <section className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Enhanced Cover Letter History</h3>
          <p className="text-sm text-muted-foreground">
            Component for displaying cover letter history with search, pagination, and document actions.
          </p>
        </div>
        <EnhancedCoverLetterHistory />
      </section>

      {/* Enhanced Interview Prep History */}
      <section className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Enhanced Interview Prep History</h3>
          <p className="text-sm text-muted-foreground">
            Component for displaying interview preparation history with search, pagination, and prep actions.
          </p>
        </div>
        <EnhancedInterviewPrepHistory />
      </section>
    </div>
  );
};

export default DesignSystemPage;
