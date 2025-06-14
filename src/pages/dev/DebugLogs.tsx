import React, { useState, useEffect } from 'react';
import DevEnvironmentGuard from '@/components/dev/DevEnvironmentGuard';
import DevNavigation from '@/components/dev/DevNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Trash2, MessageSquare, User, Bot } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConversationLog {
  id: string;
  timestamp: Date;
  type: 'user' | 'assistant';
  content: string;
  summary?: string;
  tags: string[];
}

const DebugLogs: React.FC = () => {
  const [logs, setLogs] = useState<ConversationLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLogs, setFilteredLogs] = useState<ConversationLog[]>([]);

  useEffect(() => {
    // Load existing logs from localStorage (in dev mode only)
    const savedLogs = localStorage.getItem('dev-conversation-logs');
    if (savedLogs) {
      const parsedLogs = JSON.parse(savedLogs).map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
      setLogs(parsedLogs);
      setFilteredLogs(parsedLogs);
    }
  }, []);

  useEffect(() => {
    const filtered = logs.filter(log =>
      log.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredLogs(filtered);
  }, [logs, searchTerm]);

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dev-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const clearLogs = () => {
    setLogs([]);
    setFilteredLogs([]);
    localStorage.removeItem('dev-conversation-logs');
  };

  return (
    <DevEnvironmentGuard>
      <DevNavigation />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Debug Logs</h1>
            <p className="text-muted-foreground mt-1">Track and search all conversation history</p>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={exportLogs}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="destructive" onClick={clearLogs}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by content, summary, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Logs:</span>
                  <Badge>{logs.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User Messages:</span>
                  <Badge variant="outline">{logs.filter(l => l.type === 'user').length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AI Responses:</span>
                  <Badge variant="outline">{logs.filter(l => l.type === 'assistant').length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Filtered:</span>
                  <Badge variant="secondary">{filteredLogs.length}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Conversation History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No conversation logs found</p>
                      <p className="text-sm mt-1">Start chatting to see logs appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredLogs.map((log) => (
                        <div
                          key={log.id}
                          className={`p-4 rounded-lg border ${
                            log.type === 'user' 
                              ? 'bg-blue-50 border-blue-200' 
                              : 'bg-green-50 border-green-200'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full ${
                              log.type === 'user' ? 'bg-blue-100' : 'bg-green-100'
                            }`}>
                              {log.type === 'user' ? (
                                <User className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Bot className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <Badge variant={log.type === 'user' ? 'default' : 'secondary'}>
                                    {log.type === 'user' ? 'User' : 'Assistant'}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {log.timestamp.toLocaleString()}
                                  </span>
                                </div>
                                
                                <div className="flex flex-wrap gap-1">
                                  {log.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              {log.summary && (
                                <p className="text-sm font-medium text-foreground mb-2">
                                  {log.summary}
                                </p>
                              )}
                              
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {log.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DevEnvironmentGuard>
  );
};

export default DebugLogs;