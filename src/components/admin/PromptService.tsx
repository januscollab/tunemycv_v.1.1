import { supabase } from '@/integrations/supabase/client';

export interface PromptVersion {
  id: string;
  version_number: number;
  content: string;
  description: string;
  created_at: string;
}

export interface PromptData {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  latest_version?: PromptVersion;
}

class PromptService {
  private static instance: PromptService;
  private cache: Map<string, PromptData> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): PromptService {
    if (!PromptService.instance) {
      PromptService.instance = new PromptService();
    }
    return PromptService.instance;
  }

  private isCacheValid(promptName: string): boolean {
    const expiry = this.cacheExpiry.get(promptName);
    return expiry ? expiry > Date.now() : false;
  }

  private setCacheEntry(promptName: string, data: PromptData): void {
    this.cache.set(promptName, data);
    this.cacheExpiry.set(promptName, Date.now() + this.CACHE_DURATION);
  }

  /**
   * Get the latest version of a prompt by name
   */
  async getPrompt(promptName: string): Promise<string | null> {
    try {
      // Temporarily return null until database types are regenerated
      // This will be re-enabled once the types include the new tables
      console.log(`Prompt requested: ${promptName} - database integration pending`);
      return null;
      
      /*
      // Check cache first
      if (this.isCacheValid(promptName)) {
        const cached = this.cache.get(promptName);
        return cached?.latest_version?.content || null;
      }

      // Fetch from database
      const { data: prompt, error: promptError } = await supabase
        .from('ai_prompts')
        .select('*')
        .eq('name', promptName)
        .eq('is_active', true)
        .single();

      if (promptError || !prompt) {
        console.warn(`Prompt '${promptName}' not found in database`);
        return null;
      }

      // Get latest version
      const { data: latestVersion, error: versionError } = await supabase
        .from('ai_prompt_versions')
        .select('*')
        .eq('prompt_id', prompt.id)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      if (versionError || !latestVersion) {
        console.warn(`No versions found for prompt '${promptName}'`);
        return null;
      }

      // Cache the result
      const promptData: PromptData = {
        ...prompt,
        latest_version: latestVersion
      };
      this.setCacheEntry(promptName, promptData);

      return latestVersion.content;
      */
    } catch (error) {
      console.error(`Error fetching prompt '${promptName}':`, error);
      return null;
    }
  }

  /**
   * Get multiple prompts at once
   */
  async getPrompts(promptNames: string[]): Promise<Record<string, string | null>> {
    const results: Record<string, string | null> = {};
    
    await Promise.all(
      promptNames.map(async (name) => {
        results[name] = await this.getPrompt(name);
      })
    );

    return results;
  }

  /**
   * Clear cache for a specific prompt or all prompts
   */
  clearCache(promptName?: string): void {
    if (promptName) {
      this.cache.delete(promptName);
      this.cacheExpiry.delete(promptName);
    } else {
      this.cache.clear();
      this.cacheExpiry.clear();
    }
  }

  /**
   * Preload commonly used prompts
   */
  async preloadPrompts(): Promise<void> {
    const commonPrompts = ['cv_analysis', 'cover_letter', 'interview_prep'];
    await this.getPrompts(commonPrompts);
  }
}

export const promptService = PromptService.getInstance();