import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronUp, ChevronDown, Building2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CultureArchetype {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const CULTURE_ARCHETYPES: CultureArchetype[] = [
  {
    id: 'hierarchical_corporate',
    name: 'Hierarchical / Corporate Culture',
    description: 'Structured, traditional, clear reporting lines',
    icon: '🏢'
  },
  {
    id: 'startup_entrepreneurial',
    name: 'Startup / Entrepreneurial Culture',
    description: 'Fast-paced, innovative, risk-taking environment',
    icon: '🚀'
  },
  {
    id: 'competitive_performance',
    name: 'Competitive / High-Performance Culture',
    description: 'Results-driven, achievement-focused, merit-based',
    icon: '🏆'
  },
  {
    id: 'mission_driven',
    name: 'Mission-Driven / Purpose-Led Culture',
    description: 'Values-based, social impact, meaningful work',
    icon: '🌟'
  },
  {
    id: 'flexible_autonomy',
    name: 'Flexible / Autonomy-Oriented Culture',
    description: 'Work-life balance, self-directed, trust-based',
    icon: '🌈'
  },
  {
    id: 'process_driven',
    name: 'Process-Driven / Operational Excellence',
    description: 'Systematic, quality-focused, continuous improvement',
    icon: '⚙️'
  }
];

const ARCHETYPE_DETAILS = {
  hierarchical_corporate: {
    traits: ["Clear chain of command", "Top-down decision-making", "Formal roles and responsibilities", "Emphasis on process, compliance, stability"],
    commonIn: "Banks, government, multinational corporations",
    pros: "Clarity, consistency, risk mitigation",
    cons: "Can be slow, bureaucratic, less innovative"
  },
  startup_entrepreneurial: {
    traits: ["Fast-paced, dynamic, high autonomy", "Everyone wears multiple hats", "Innovation and experimentation encouraged", "Flat hierarchy, often informal communication"],
    commonIn: "Tech startups, early-stage companies",
    pros: "Creative, empowering, flexible",
    cons: "Can be chaotic, unstable, high burnout risk"
  },
  competitive_performance: {
    traits: ["Results-driven, performance is everything", "High expectations, long hours common", "Recognition and promotions tied tightly to KPIs"],
    commonIn: "Sales orgs, top law firms, investment banks",
    pros: "Drives excellence and rewards achievement",
    cons: "Stressful, less work-life balance, cutthroat"
  },
  mission_driven: {
    traits: ["Employees united by a cause (e.g. sustainability, social impact)", "Values-driven decision-making", "Often non-profit or socially responsible orgs"],
    commonIn: "NGOs, impact startups, B Corps",
    pros: "Meaningful work, motivated teams",
    cons: "May lack commercial aggressiveness or resources"
  },
  flexible_autonomy: {
    traits: ["Emphasis on trust and freedom", "Employees choose hours, tools, remote/hybrid options", "Results matter more than attendance"],
    commonIn: "Remote-first startups, modern tech orgs",
    pros: "Great for work-life balance, attracts self-starters",
    cons: "May lack alignment or cohesion if poorly managed"
  },
  process_driven: {
    traits: ["Focus on efficiency, quality control, consistency", "Well-defined workflows and documentation", "Less tolerance for improvisation"],
    commonIn: "Manufacturing, logistics, regulated industries",
    pros: "Scalable, dependable operations",
    cons: "Can be rigid, discourages innovation"
  }
};

interface SortableItemProps {
  id: string;
  archetype: CultureArchetype;
  index: number;
  isMobile: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

function SortableItem({ id, archetype, index, isMobile, onMoveUp, onMoveDown, canMoveUp, canMoveDown }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-lg p-4 ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Drag handle on the left, aligned with text content */}
        {!isMobile && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 dark:text-apple-core/60 dark:hover:text-apple-core/80 mt-1"
          >
            <GripVertical className="h-5 w-5" />
          </div>
        )}
        
        {/* Icon */}
        <span className="text-2xl">{archetype.icon}</span>
        
        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-citrus">{archetype.name}</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-apple-core/60 dark:hover:text-apple-core/80 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-sm p-4">
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-semibold text-sm mb-2">Traits:</h5>
                      <ul className="text-xs space-y-1">
                        {ARCHETYPE_DETAILS[archetype.id as keyof typeof ARCHETYPE_DETAILS]?.traits.map((trait, i) => (
                          <li key={i} className="flex items-start">
                            <span className="mr-1">•</span>
                            <span>{trait}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-xs">
                      <p><strong>Common in:</strong> {ARCHETYPE_DETAILS[archetype.id as keyof typeof ARCHETYPE_DETAILS]?.commonIn}</p>
                      <p className="mt-1"><strong>Pros:</strong> {ARCHETYPE_DETAILS[archetype.id as keyof typeof ARCHETYPE_DETAILS]?.pros}</p>
                      <p className="mt-1"><strong>Cons:</strong> {ARCHETYPE_DETAILS[archetype.id as keyof typeof ARCHETYPE_DETAILS]?.cons}</p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-gray-500 dark:text-apple-core/60 mt-1">{archetype.description}</p>
        </div>

        {/* Mobile controls on the right */}
        {isMobile && (
          <div className="flex flex-col space-y-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className="h-8 w-8 p-0"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className="h-8 w-8 p-0"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

const CompanyCulturePreferences: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const defaultOrder = [
    'hierarchical_corporate',
    'startup_entrepreneurial', 
    'competitive_performance',
    'mission_driven',
    'flexible_autonomy',
    'process_driven'
  ];
  const [orderedArchetypes, setOrderedArchetypes] = useState<string[]>(defaultOrder);
  const [initialOrder, setInitialOrder] = useState<string[] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (user) {
      loadCulturePreferences();
    }
  }, [user]);

  // Auto-save with debounce - only if order actually changed
  useEffect(() => {
    if (!user || loading || isInitialLoad || !initialOrder) return;
    
    // Only save if order actually changed
    if (JSON.stringify(orderedArchetypes) === JSON.stringify(initialOrder)) return;
    
    const timeoutId = setTimeout(() => {
      saveCulturePreferences();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [orderedArchetypes, user, loading, isInitialLoad, initialOrder]);

  const loadCulturePreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('culture_preferences_order')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.culture_preferences_order) {
        const loadedOrder = data.culture_preferences_order as string[];
        setOrderedArchetypes(loadedOrder);
        setInitialOrder(loadedOrder);
      } else {
        setInitialOrder(defaultOrder);
      }
      setIsInitialLoad(false);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to load culture preferences', 
        variant: 'destructive' 
      });
      setIsInitialLoad(false);
    }
  };

  const saveCulturePreferences = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          culture_preferences_order: orderedArchetypes,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to save culture preferences', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOrderedArchetypes((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < orderedArchetypes.length) {
      setOrderedArchetypes(prev => arrayMove(prev, index, newIndex));
    }
  };

  const getArchetypeById = (id: string) => 
    CULTURE_ARCHETYPES.find(archetype => archetype.id === id);

  return (
    <div className="bg-white dark:bg-surface rounded-lg border border-gray-200 dark:border-border p-6">
      <div className="flex items-center mb-6">
        <Building2 className="h-5 w-5 text-gray-500 dark:text-apple-core/60 mr-2" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-citrus">Company Culture Preferences</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-apple-core/60 dark:hover:text-apple-core/80 cursor-help ml-2" />
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-sm">
              <p className="text-sm">
                <strong>Stop Wasting Time on Wrong-Fit Companies</strong> - Rank these culture types to get matched with companies where you'll be happiest and most successful.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-apple-core/70">
          {isMobile 
            ? "Rank your preferred company cultures from most important (1) to least important (6). Use the arrows to reorder."
            : "Drag and drop to rank your preferred company cultures from most important (top) to least important (bottom)."
          }
        </p>
      </div>

      {isMobile ? (
        <div className="space-y-3">
          {orderedArchetypes.map((archetypeId, index) => {
            const archetype = getArchetypeById(archetypeId);
            if (!archetype) return null;

            return (
              <SortableItem
                key={archetypeId}
                id={archetypeId}
                archetype={archetype}
                index={index}
                isMobile={true}
                onMoveUp={() => moveItem(index, 'up')}
                onMoveDown={() => moveItem(index, 'down')}
                canMoveUp={index > 0}
                canMoveDown={index < orderedArchetypes.length - 1}
              />
            );
          })}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedArchetypes}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {orderedArchetypes.map((archetypeId, index) => {
                const archetype = getArchetypeById(archetypeId);
                if (!archetype) return null;

                return (
                  <SortableItem
                    key={archetypeId}
                    id={archetypeId}
                    archetype={archetype}
                    index={index}
                    isMobile={false}
                    canMoveUp={false}
                    canMoveDown={false}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}

    </div>
  );
};

export default CompanyCulturePreferences;