import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Toast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import EnhancedCoverLetterHistory from "@/components/design-system/EnhancedCoverLetterHistory";
import EnhancedInterviewPrepHistory from "@/components/design-system/EnhancedInterviewPrepHistory";
import DocumentDeleteDialog from "@/components/ui/document-delete-dialog";
import { 
  Calendar as CalendarIcon,
  ChevronDown,
  Download,
  Edit,
  Eye,
  FileText,
  Heart,
  Home,
  Info,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Star,
  Trash2,
  User,
  X
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const DesignSystem = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [switchChecked, setSwitchChecked] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('');
  const [sliderValue, setSliderValue] = useState([50]);
  const [date, setDate] = useState<Date>();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Design System</h1>
          <p className="text-lg text-gray-600">A comprehensive showcase of our UI components and design patterns</p>
        </div>

        {/* Colors */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Primary', bg: 'bg-primary', text: 'text-primary-foreground' },
              { name: 'Secondary', bg: 'bg-secondary', text: 'text-secondary-foreground' },
              { name: 'Accent', bg: 'bg-accent', text: 'text-accent-foreground' },
              { name: 'Destructive', bg: 'bg-destructive', text: 'text-destructive-foreground' },
              { name: 'Muted', bg: 'bg-muted', text: 'text-muted-foreground' },
              { name: 'Card', bg: 'bg-card', text: 'text-card-foreground' },
            ].map((color) => (
              <div key={color.name} className={`${color.bg} ${color.text} p-4 rounded-lg text-center`}>
                <div className="font-medium">{color.name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Typography</h2>
          <div className="space-y-4">
            <div className="text-4xl font-bold">Heading 1</div>
            <div className="text-3xl font-bold">Heading 2</div>
            <div className="text-2xl font-bold">Heading 3</div>
            <div className="text-xl font-semibold">Heading 4</div>
            <div className="text-lg font-medium">Heading 5</div>
            <div className="text-base">Regular text / Body</div>
            <div className="text-sm text-muted-foreground">Small text / Caption</div>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Buttons</h2>
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
        </section>

        {/* Form Elements */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Form Elements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="input-example">Input</Label>
                <Input 
                  id="input-example"
                  placeholder="Enter text..." 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="select-example">Select</Label>
                <Select value={selectValue} onValueChange={setSelectValue}>
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

              <div>
                <Label htmlFor="textarea-example">Textarea</Label>
                <Textarea 
                  id="textarea-example"
                  placeholder="Enter longer text..."
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="switch-example"
                  checked={switchChecked}
                  onCheckedChange={setSwitchChecked}
                />
                <Label htmlFor="switch-example">Switch</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="checkbox-example"
                  checked={checkboxChecked}
                  onCheckedChange={(checked) => setCheckboxChecked(checked as boolean)}
                />
                <Label htmlFor="checkbox-example">Checkbox</Label>
              </div>

              <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option1" id="radio1" />
                  <Label htmlFor="radio1">Radio Option 1</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option2" id="radio2" />
                  <Label htmlFor="radio2">Radio Option 2</Label>
                </div>
              </RadioGroup>

              <div>
                <Label>Slider</Label>
                <Slider
                  value={sliderValue}
                  onValueChange={setSliderValue}
                  max={100}
                  step={1}
                  className="mt-2"
                />
                <div className="text-sm text-muted-foreground mt-1">Value: {sliderValue[0]}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This is the card content area.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Another Card</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-muted-foreground">john@example.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress Card</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Badges</h2>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        {/* Alerts */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Alerts</h2>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This is an informational alert message.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertDescription>
                This is a destructive alert message.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Tabs */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Tabs</h2>
          <Tabs defaultValue="tab1" className="w-full">
            <TabsList>
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
              <TabsTrigger value="tab3">Tab 3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <p>Content for Tab 1</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tab2" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <p>Content for Tab 2</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tab3" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <p>Content for Tab 3</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Calendar */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
          <div className="flex space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </section>

        {/* Dialogs and Modals */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Dialogs & Modals</h2>
          <div className="flex space-x-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button>Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dialog Title</DialogTitle>
                  <DialogDescription>
                    This is a dialog description that explains what this dialog is for.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p>Dialog content goes here.</p>
                </div>
              </DialogContent>
            </Dialog>

            <Button onClick={() => setShowDeleteDialog(true)}>
              Show Delete Dialog
            </Button>
            
            <DocumentDeleteDialog
              isOpen={showDeleteDialog}
              onClose={() => setShowDeleteDialog(false)}
              onConfirm={() => {
                console.log('Delete confirmed');
                setShowDeleteDialog(false);
              }}
              documentTitle="Sample Document"
              documentType="Cover Letter"
            />
          </div>
        </section>

        {/* Dropdown Menus */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Dropdown Menus</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Open Menu
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Messages
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </section>

        {/* Loading States */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Loading States</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </div>
        </section>

        {/* Icons */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Icons</h2>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-4">
            {[
              Home, User, Settings, Mail, Search, Heart,
              Star, Download, Edit, Trash2, Plus, Eye,
              FileText, Calendar, Info, X, ChevronDown, MoreHorizontal
            ].map((Icon, index) => (
              <div key={index} className="flex flex-col items-center space-y-2 p-2">
                <Icon className="h-6 w-6" />
                <span className="text-xs text-muted-foreground">{Icon.displayName || 'Icon'}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Enhanced Components */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Enhanced Components</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Enhanced Cover Letter History</h3>
              <EnhancedCoverLetterHistory />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Enhanced Interview Prep History</h3>
              <EnhancedInterviewPrepHistory />
            </div>
          </div>
        </section>

        <Separator className="my-8" />
        
        <div className="text-center text-muted-foreground">
          <p>This design system showcases all the UI components available in our application.</p>
        </div>
      </div>
    </div>
  );
};

export default DesignSystem;
