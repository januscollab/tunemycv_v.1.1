import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from './ui/ModernCard';
import { ModernTextarea } from './ui/ModernTextarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const ModularExportSystem = () => {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [exportData, setExportData] = useState('');

  const generateSQLSchema = () => {
    return `-- DevSuite SQL Schema Export
-- Generated on ${new Date().toISOString()}

-- Sprints table
CREATE TABLE IF NOT EXISTS sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  order_index INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  is_hidden BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'todo',
  sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  archived_at TIMESTAMP WITH TIME ZONE,
  archived_by UUID REFERENCES auth.users(id),
  archive_reason TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Execution logs table
CREATE TABLE IF NOT EXISTS execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
  prompt_sent TEXT NOT NULL,
  ai_response TEXT,
  execution_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  model_used VARCHAR(100),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- User DevSuite settings table
CREATE TABLE IF NOT EXISTS user_devsuite_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  openai_api_key_encrypted TEXT,
  preferred_model VARCHAR(50) DEFAULT 'gpt-4',
  story_generation_enabled BOOLEAN DEFAULT true,
  show_priority_sprint BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sprints_user_id ON sprints(user_id);
CREATE INDEX IF NOT EXISTS idx_sprints_order_index ON sprints(order_index);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_sprint_id ON tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_archived_at ON tasks(archived_at);
CREATE INDEX IF NOT EXISTS idx_execution_logs_user_id ON execution_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_execution_logs_sprint_id ON execution_logs(sprint_id);

-- RLS Policies (if using Supabase)
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devsuite_settings ENABLE ROW LEVEL SECURITY;

-- Sprints policies
CREATE POLICY "Users can view their own sprints" ON sprints
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sprints" ON sprints
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sprints" ON sprints
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sprints" ON sprints
  FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Execution logs policies
CREATE POLICY "Users can view their own execution logs" ON execution_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own execution logs" ON execution_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own execution logs" ON execution_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Settings policies
CREATE POLICY "Users can view their own settings" ON user_devsuite_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert their own settings" ON user_devsuite_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON user_devsuite_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sprints_updated_at BEFORE UPDATE ON sprints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_devsuite_settings_updated_at BEFORE UPDATE ON user_devsuite_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;
  };

  const generateComponentBundle = () => {
    return `// DevSuite React Components Bundle
// Generated on ${new Date().toISOString()}

/*
INSTALLATION INSTRUCTIONS:

1. Install required dependencies:
npm install @hello-pangea/dnd lucide-react @supabase/supabase-js sonner date-fns

2. Copy the SQL schema to your database

3. Copy these components to your project:
   - ModernInput.tsx
   - ModernTextarea.tsx  
   - ModernSelect.tsx
   - ModernCard.tsx
   - TaskModal.tsx
   - SprintManager.tsx
   - DevSuiteSettings.tsx
   - SprintAnalytics.tsx
   - ExecutionLogs.tsx
   - ArchivedStoriesTab.tsx

4. Add these CSS classes to your global CSS:
.hover-scale { @apply transition-transform duration-200 hover:scale-105; }
.animate-fade-in { @apply animate-[fade-in_0.3s_ease-out]; }

5. Add these keyframes to your tailwind.config.js:
keyframes: {
  "fade-in": {
    "0%": { opacity: "0", transform: "translateY(10px)" },
    "100%": { opacity: "1", transform: "translateY(0)" }
  }
}

6. Set up authentication context and Supabase client

7. Create edge function for AI story generation (optional):
   - generate-task-story function (see documentation)

USAGE:
Import and use SprintManager as the main component:
import SprintManager from './components/devsuite/SprintManager';

<SprintManager />

The system is fully modular and can be integrated into any React project.
*/

export { default as SprintManager } from './SprintManager';
export { default as TaskModal } from './TaskModal';
export { default as DevSuiteSettings } from './DevSuiteSettings';
export { default as SprintAnalytics } from './SprintAnalytics';
export { default as ExecutionLogs } from './ExecutionLogs';
export { default as ArchivedStoriesTab } from './ArchivedStoriesTab';
export { ModernInput } from './ui/ModernInput';
export { ModernTextarea } from './ui/ModernTextarea';
export { ModernSelect } from './ui/ModernSelect';
export { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from './ui/ModernCard';
`;
  };

  const handleExportUserData = async () => {
    if (!user) return;
    
    setExporting(true);
    try {
      // Export user's sprints and tasks
      const [sprintsResult, tasksResult, settingsResult] = await Promise.all([
        supabase.from('sprints').select('*').eq('user_id', user.id),
        supabase.from('tasks').select('*').eq('user_id', user.id),
        supabase.from('user_devsuite_settings').select('*').eq('user_id', user.id).single()
      ]);

      const userData = {
        export_date: new Date().toISOString(),
        user_id: user.id,
        sprints: sprintsResult.data || [],
        tasks: tasksResult.data || [],
        settings: settingsResult.data || null
      };

      const dataBlob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devsuite-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('User data exported successfully');
    } catch (error) {
      console.error('Error exporting user data:', error);
      toast.error('Failed to export user data');
    } finally {
      setExporting(false);
    }
  };

  const handleExportSQL = () => {
    const sqlSchema = generateSQLSchema();
    const blob = new Blob([sqlSchema], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'devsuite-schema.sql';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('SQL schema exported successfully');
  };

  const handleExportComponents = () => {
    const componentBundle = generateComponentBundle();
    const blob = new Blob([componentBundle], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'devsuite-components.ts';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Component bundle exported successfully');
  };

  const generateCompletePackage = () => {
    setExportData(`# DevSuite Complete Export Package
Generated on ${new Date().toISOString()}

## Package Contents:
1. SQL Schema (devsuite-schema.sql)
2. React Components Bundle (devsuite-components.ts)
3. User Data Export (devsuite-data-*.json)
4. Setup Instructions

## Setup Instructions:

### 1. Database Setup
Run the SQL schema file in your database to create all required tables and policies.

### 2. Install Dependencies
\`\`\`bash
npm install @hello-pangea/dnd lucide-react @supabase/supabase-js sonner date-fns
\`\`\`

### 3. Copy Components
Copy all component files to your project structure:
- src/components/devsuite/ui/ModernInput.tsx
- src/components/devsuite/ui/ModernTextarea.tsx
- src/components/devsuite/ui/ModernSelect.tsx
- src/components/devsuite/ui/ModernCard.tsx
- src/components/devsuite/TaskModal.tsx
- src/components/devsuite/SprintManager.tsx
- src/components/devsuite/DevSuiteSettings.tsx
- src/components/devsuite/SprintAnalytics.tsx
- src/components/devsuite/ExecutionLogs.tsx
- src/components/devsuite/ArchivedStoriesTab.tsx

### 4. Add CSS Classes
Add to your global CSS:
\`\`\`css
.hover-scale { @apply transition-transform duration-200 hover:scale-105; }
.animate-fade-in { @apply animate-[fade-in_0.3s_ease-out]; }
\`\`\`

### 5. Update Tailwind Config
Add keyframes to tailwind.config.js:
\`\`\`js
keyframes: {
  "fade-in": {
    "0%": { opacity: "0", transform: "translateY(10px)" },
    "100%": { opacity: "1", transform: "translateY(0)" }
  }
}
\`\`\`

### 6. Usage
\`\`\`tsx
import SprintManager from './components/devsuite/SprintManager';

function DevSuitePage() {
  return <SprintManager />;
}
\`\`\`

### 7. Optional: AI Integration
Create a Supabase Edge Function for AI story generation:
- Function name: generate-task-story
- Uses OpenAI API for task story enhancement
- Requires user's OpenAI API key in settings

## Features Included:
- Modern, responsive design with subtle animations
- Drag & drop task management
- Sprint analytics and progress tracking
- AI-powered story generation (with OpenAI integration)
- Execution logging system
- Data export/import capabilities
- Full modularity for easy integration

## Security:
- Row Level Security (RLS) policies included
- User data isolation
- Secure API key storage (encrypted)
- Input validation and sanitization

The DevSuite is completely self-contained and can be integrated into any React project with minimal setup.
`);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <ModernCard className="animate-fade-in">
        <ModernCardHeader>
          <ModernCardTitle>📦 DevSuite Export System</ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleExportSQL}
              className="hover-scale"
              variant="outline"
            >
              📄 Export SQL Schema
            </Button>
            <Button 
              onClick={handleExportComponents}
              className="hover-scale"
              variant="outline"
            >
              ⚛️ Export Components
            </Button>
            <Button 
              onClick={handleExportUserData}
              disabled={exporting}
              className="hover-scale"
              variant="outline"
            >
              {exporting ? '⏳ Exporting...' : '💾 Export User Data'}
            </Button>
          </div>

          <Button 
            onClick={generateCompletePackage}
            className="w-full hover-scale"
          >
            📋 Generate Complete Setup Instructions
          </Button>

          {exportData && (
            <div className="space-y-4">
              <ModernTextarea
                label="Complete Setup Instructions"
                value={exportData}
                readOnly
                rows={20}
                className="font-mono text-sm"
              />
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(exportData);
                  toast.success('Setup instructions copied to clipboard');
                }}
                className="hover-scale"
              >
                📋 Copy to Clipboard
              </Button>
            </div>
          )}

          <div className="bg-muted/30 p-4 rounded-lg border border-dashed border-border">
            <h4 className="font-medium mb-2">🚀 Export Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Complete SQL schema with RLS policies</li>
              <li>• Self-contained React components</li>
              <li>• User data backup and restore</li>
              <li>• Full setup documentation</li>
              <li>• Modular design for easy integration</li>
              <li>• Zero external dependencies (beyond React ecosystem)</li>
            </ul>
          </div>
        </ModernCardContent>
      </ModernCard>
    </div>
  );
};

export default ModularExportSystem;