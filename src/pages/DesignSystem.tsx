
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Settings, Edit, Trash2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

import { 
  VybeButton, 
  VybeSelect, 
  VybeIconButton, 
  VubeUITooltip,
  EnhancedCoverLetterHistory,
  type VybeSelectOption 
} from '@/components/design-system';

const data = [
  {
    name: "John Doe",
    email: "john.doe@example.com",
    age: 30,
    city: "New York",
    country: "USA",
  },
  {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    age: 25,
    city: "Los Angeles",
    country: "USA",
  },
  {
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    age: 35,
    city: "London",
    country: "UK",
  },
  {
    name: "Bob Williams",
    email: "bob.williams@example.com",
    age: 40,
    city: "Paris",
    country: "France",
  },
]

const options: VybeSelectOption[] = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

const DesignSystem = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();

  return (
    <div className="container mx-auto p-8 space-y-12">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold">Design System</h1>
        <p className="text-muted-foreground">
          A showcase of reusable components and styles for building consistent and beautiful UIs.
        </p>
      </header>

      {/* Button Components Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Button Components</h2>
          <p className="text-muted-foreground mb-6">
            Buttons are interactive elements that trigger actions. Use them to guide users through your application.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <VybeButton>Primary Button</VybeButton>
          <VybeButton vybeVariant="secondary">Secondary Button</VybeButton>
          <VybeButton vybeVariant="outline">Outline Button</VybeButton>
          <VybeButton vybeVariant="destructive">Destructive Button</VybeButton>
          <VybeButton vybeVariant="ghost">Ghost Button</VybeButton>
          <VybeButton vybeVariant="white">White Button</VybeButton>
          <VybeButton disabled>Disabled Button</VybeButton>
        </div>
      </section>

      {/* Select Components Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Select Components</h2>
          <p className="text-muted-foreground mb-6">
            Select components allow users to choose from a list of options. They are useful for forms and settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <VybeSelect options={options} placeholder="Select an option" />
        </div>
      </section>

      {/* Icon Button Components Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Icon Button Components</h2>
          <p className="text-muted-foreground mb-6">
            Icon buttons are buttons that only contain an icon. They are useful for toolbars and other compact UIs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <VybeIconButton icon={Settings} tooltip="Settings" />
          <VybeIconButton icon={Edit} tooltip="Edit" />
          <VybeIconButton icon={Trash2} tooltip="Delete" />
        </div>
      </section>

      {/* Tooltip Components Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Tooltip Components</h2>
          <p className="text-muted-foreground mb-6">
            Tooltips provide additional information when users hover over an element.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <VubeUITooltip content="This is a tooltip">Hover me</VubeUITooltip>
        </div>
      </section>

      {/* Card Components Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Card Components</h2>
          <p className="text-muted-foreground mb-6">
            Cards are versatile containers for grouping related information.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card Content</p>
            </CardContent>
            <CardFooter>
              <Button>Action</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Input Components Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Input Components</h2>
          <p className="text-muted-foreground mb-6">
            Input fields allow users to enter text.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input type="text" id="name" placeholder="Enter your name" />
          </div>
        </div>
      </section>

      {/* Textarea Components Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Textarea Components</h2>
          <p className="text-muted-foreground mb-6">
            Textareas allow users to enter multi-line text.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" placeholder="Enter your message" />
          </div>
        </div>
      </section>

      {/* Table Components Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Table Components</h2>
          <p className="text-muted-foreground mb-6">
            Tables display data in rows and columns.
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Country</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.age}</TableCell>
                  <TableCell>{row.city}</TableCell>
                  <TableCell>{row.country}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Badge Components Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Badge Components</h2>
          <p className="text-muted-foreground mb-6">
            Badges are used to highlight an item's status or state.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>

      {/* Calendar Components Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Calendar Components</h2>
          <p className="text-muted-foreground mb-6">
            A calendar component for date selection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !selectedDate ? "text-muted-foreground" : ""
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center" side="bottom">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </section>

      {/* History Components Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">History Components</h2>
          <p className="text-muted-foreground mb-6">
            Advanced history management components with enhanced functionality, search, and filtering capabilities.
          </p>
        </div>

        {/* Enhanced Cover Letter History */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Enhanced Cover Letter History</h3>
            <p className="text-muted-foreground mb-4">
              Advanced cover letter management component with search, pagination, and action menus. 
              Used in Profile pages and Cover Letter generation workflows for managing user's cover letter documents.
            </p>
            <div className="bg-muted/50 p-4 rounded-lg">
              <EnhancedCoverLetterHistory />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DesignSystem;
