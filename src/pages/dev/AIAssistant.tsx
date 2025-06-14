import React, { useState, useRef, useEffect } from 'react';
import DevEnvironmentGuard from '@/components/dev/DevEnvironmentGuard';
import DevNavigation from '@/components/dev/DevNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSprintTasks } from '@/hooks/useSprintTasks';
import { 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  Code, 
  Plus,
  Sparkles,
  Copy,
  Download,
  Trash2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: {
    type: 'create_task' | 'code_suggestion' | 'analysis';
    data?: any;
  }[];
}

interface CodeSuggestion {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  category: 'improvement' | 'bug_fix' | 'refactor' | 'new_feature';
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { addTask } = useSprintTasks();

  useEffect(() => {
    // Load saved conversation
    const savedMessages = localStorage.getItem('dev-ai-conversation');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsed);
      } catch (error) {
        console.error('[AIAssistant] Failed to load conversation:', error);
      }
    }

    // Load initial suggestions
    setSuggestions([
      {
        id: 'sug-1',
        title: 'Optimize SprintPlan Component',
        description: 'Extract task filtering logic into a custom hook',
        code: `const useTaskFilters = (tasks: SprintItem[]) => {
  const [filters, setFilters] = useState({
    priority: 'all',
    status: 'all',
    search: ''
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
      if (filters.status !== 'all' && task.status !== filters.status) return false;
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [tasks, filters]);

  return { filters, setFilters, filteredTasks };
};`,
        language: 'typescript',
        category: 'refactor'
      },
      {
        id: 'sug-2',
        title: 'Add Task Templates',
        description: 'Create predefined task templates for common dev tasks',
        code: `const TASK_TEMPLATES = {
  bugfix: {
    title: 'Fix: [Bug Description]',
    priority: 'high' as const,
    tags: ['bug', 'fix'],
    description: 'Bug fix template with steps to reproduce and expected behavior'
  },
  feature: {
    title: 'Feature: [Feature Name]',
    priority: 'medium' as const,
    tags: ['feature', 'enhancement'],
    description: 'New feature implementation with requirements and acceptance criteria'
  },
  refactor: {
    title: 'Refactor: [Component/Function Name]',
    priority: 'low' as const,
    tags: ['refactor', 'improvement'],
    description: 'Code refactoring for better maintainability and performance'
  }
};`,
        language: 'typescript',
        category: 'new_feature'
      }
    ]);
  }, []);

  useEffect(() => {
    // Save conversation whenever messages change
    localStorage.setItem('dev-ai-conversation', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const mockAIResponse = (userMessage: string): ChatMessage => {
    const responses = [
      {
        content: `I can help you analyze that code pattern. Based on your sprint tasks, I notice you might benefit from extracting reusable components. Would you like me to suggest some improvements?`,
        actions: [{ type: 'code_suggestion' as const }]
      },
      {
        content: `Looking at your current sprint plan, I see several tasks that could be automated. I can create a workflow for code review automation. Should I add this to your backlog?`,
        actions: [{ 
          type: 'create_task' as const, 
          data: { 
            title: 'Implement Code Review Automation',
            description: 'Set up automated code review workflows with quality checks',
            priority: 'medium',
            sprintId: 'priority',
            tags: ['automation', 'workflow']
          }
        }]
      },
      {
        content: `I've analyzed your recent development patterns. Your code quality metrics are strong, but I notice some opportunities for performance optimization in the drag-and-drop components. Would you like specific recommendations?`,
        actions: [{ type: 'analysis' as const }]
      }
    ];

    return {
      id: `msg-${Date.now()}-ai`,
      type: 'assistant',
      content: responses[Math.floor(Math.random() * responses.length)].content,
      timestamp: new Date(),
      actions: responses[Math.floor(Math.random() * responses.length)].actions
    };
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = mockAIResponse(input);
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateTask = (taskData: any) => {
    addTask(taskData);
    toast({
      title: "Task Created",
      description: `"${taskData.title}" has been added to your sprint`,
    });
  };

  const handleCopySuggestion = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied to clipboard",
      description: "Code suggestion copied successfully",
    });
  };

  const handleClearConversation = () => {
    setMessages([]);
    localStorage.removeItem('dev-ai-conversation');
    toast({
      title: "Conversation cleared",
      description: "Chat history has been reset",
    });
  };

  const handleExportConversation = () => {
    const dataStr = JSON.stringify(messages, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-conversation-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'improvement': return 'bg-blue-100 text-blue-800';
      case 'bug_fix': return 'bg-red-100 text-red-800';
      case 'refactor': return 'bg-yellow-100 text-yellow-800';
      case 'new_feature': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DevEnvironmentGuard>
      <DevNavigation />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Development Assistant</h1>
            <p className="text-muted-foreground mt-1">Get AI-powered help with code, tasks, and development workflow</p>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleExportConversation}>
              <Download className="h-4 w-4 mr-2" />
              Export Chat
            </Button>
            <Button variant="outline" onClick={handleClearConversation}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Chat
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
                  AI Chat
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col space-y-4">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Start a conversation with your AI assistant</p>
                        <p className="text-sm mt-1">Ask about code improvements, task suggestions, or development help</p>
                      </div>
                    )}
                    
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex space-x-3 ${
                          message.type === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div className={`flex space-x-3 max-w-[80%] ${
                          message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}>
                          <div className={`p-2 rounded-full ${
                            message.type === 'user' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                            {message.type === 'user' ? (
                              <User className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Bot className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          
                          <div className={`p-3 rounded-lg ${
                            message.type === 'user' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                            
                            {message.actions && (
                              <div className="mt-3 space-y-2">
                                {message.actions.map((action, i) => (
                                  <div key={i}>
                                    {action.type === 'create_task' && (
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => handleCreateTask(action.data)}
                                        className="text-xs"
                                      >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add to Sprint
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex space-x-3">
                        <div className="p-2 rounded-full bg-green-100">
                          <Bot className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="p-3 rounded-lg bg-muted">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <div className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask for code suggestions, task ideas, or development help..."
                    disabled={isLoading}
                  />
                  <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Suggestions Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setInput("Analyze my current sprint tasks and suggest improvements")}
                >
                  <Code className="h-4 w-4 mr-2" />
                  Analyze Sprint Tasks
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setInput("Suggest code improvements for my React components")}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Code Improvements
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setInput("Create a task for implementing automated testing")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Task Ideas
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Code Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {suggestions.map((suggestion) => (
                      <div key={suggestion.id} className="p-3 border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{suggestion.title}</h4>
                          <Badge className={`text-xs ${getCategoryColor(suggestion.category)}`}>
                            {suggestion.category.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-3">
                          {suggestion.description}
                        </p>
                        
                        <div className="relative">
                          <pre className="text-xs bg-muted p-2 rounded border overflow-x-auto">
                            <code>{suggestion.code.slice(0, 150)}...</code>
                          </pre>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => handleCopySuggestion(suggestion.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DevEnvironmentGuard>
  );
};

export default AIAssistant;