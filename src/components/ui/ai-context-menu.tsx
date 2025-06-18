
import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { 
  WandSparkles, 
  Edit3, 
  Target, 
  ArrowUpDown,
  Brain,
  MessageCircle,
  Sparkles,
  Square,
  ArrowUp,
  ArrowDown,
  List,
  BookOpen,
  ChevronRight
} from "lucide-react"
import { AIReplacementDialog } from "@/components/ui/ai-replacement-dialog"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useCreativitySlider } from "@/hooks/useCreativitySlider"

interface AIAction {
  type: 'rephrase' | 'improve' | 'adjust_length' | 'role_specific'
  subType?: string
  selectedText: string
  context: string
  temperature: number
}

interface AIContextMenuProps {
  children: React.ReactNode
  selectedText?: string
  onTextReplace?: (originalText: string, newText: string) => void
  disabled?: boolean
}

interface MenuPosition {
  x: number
  y: number
  visible: boolean
}

const AIContextMenu: React.FC<AIContextMenuProps> = ({
  children,
  selectedText = "",
  onTextReplace,
  disabled = false
}) => {
  const { toast } = useToast()
  const { creativityLevel, updateCreativityLevel, getCurrentLevel, getTemperature, levels } = useCreativitySlider()
  const [showReplacementDialog, setShowReplacementDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [generatedText, setGeneratedText] = useState("")
  const [originalText, setOriginalText] = useState("")
  const [actionTitle, setActionTitle] = useState("")
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ x: 0, y: 0, visible: false })
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const [submenuPosition, setSubmenuPosition] = useState<MenuPosition>({ x: 0, y: 0, visible: false })
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const submenuRef = useRef<HTMLDivElement>(null)
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleAIAction = async (type: AIAction['type'], subType?: string, title?: string) => {
    const selection = window.getSelection()
    const currentSelectedText = selection?.toString().trim() || selectedText.trim()
    
    if (disabled || !currentSelectedText || currentSelectedText.length < 10) return
    
    setIsLoading(true)
    setOriginalText(currentSelectedText)
    setActionTitle(title || "AI Processing")
    setShowReplacementDialog(true)
    setMenuPosition({ x: 0, y: 0, visible: false })
    setActiveSubmenu(null)

    try {
      const response = await fetch(`https://aohrfehhyjdebaatzqdl.supabase.co/functions/v1/process-ai-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvaHJmZWhoeWpkZWJhYXR6cWRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MzY3MTcsImV4cCI6MjA2NDExMjcxN30.lq2vftfHXRX1Mvlj4X04TdaF7YWU8vRIZU-DN85Dr1o`
        },
        body: JSON.stringify({
          selectedText: currentSelectedText,
          action: { type, subType },
          context: "editor",
          temperature: getTemperature()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setGeneratedText(data.processedText)
    } catch (error) {
      console.error('AI processing failed:', error)
      toast({
        title: "AI Processing Failed",
        description: error instanceof Error ? error.message : "Unable to process text with AI",
        variant: "destructive"
      })
      setShowReplacementDialog(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptReplacement = () => {
    if (onTextReplace && originalText && generatedText) {
      onTextReplace(originalText, generatedText)
      toast({
        title: "Text Updated",
        description: "AI-generated text has been applied successfully."
      })
    }
  }

  const handleTextSelection = () => {
    // Clear any existing timeout
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current)
    }

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      setMenuPosition({ x: 0, y: 0, visible: false })
      setActiveSubmenu(null)
      return
    }

    const selectedText = selection.toString().trim()
    if (!selectedText || selectedText.length < 10) {
      setMenuPosition({ x: 0, y: 0, visible: false })
      setActiveSubmenu(null)
      return
    }

    // Wait for user to finish selecting (delay for triple-click and normal selection)
    selectionTimeoutRef.current = setTimeout(() => {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      const containerRect = containerRef.current?.getBoundingClientRect()
      
      if (containerRect) {
        // Position menu below the selection with some padding
        const x = rect.left - containerRect.left + (rect.width / 2)
        const y = rect.bottom - containerRect.top + 8
        
        setMenuPosition({ x, y, visible: true })
      }
    }, 300) // Wait 300ms for user to finish selecting
  }

  const handleSubmenuHover = (submenuType: string, event: React.MouseEvent) => {
    const buttonRect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()
    
    if (containerRect) {
      const x = buttonRect.right - containerRect.left + 8
      const y = buttonRect.top - containerRect.top
      
      setActiveSubmenu(submenuType)
      setSubmenuPosition({ x, y, visible: true })
    }
  }

  const handleSubmenuLeave = () => {
    // Small delay to allow moving to submenu
    setTimeout(() => {
      if (!submenuRef.current?.matches(':hover')) {
        setActiveSubmenu(null)
        setSubmenuPosition({ x: 0, y: 0, visible: false })
      }
    }, 100)
  }

  const closeMenus = () => {
    setMenuPosition({ x: 0, y: 0, visible: false })
    setActiveSubmenu(null)
    setSubmenuPosition({ x: 0, y: 0, visible: false })
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          submenuRef.current && !submenuRef.current.contains(event.target as Node)) {
        closeMenus()
      }
    }

    const handleSelectionChange = () => {
      setTimeout(handleTextSelection, 10)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('selectionchange', handleSelectionChange)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [])

  const isDisabled = disabled || !selectedText.trim() || selectedText.length < 10

  return (
    <>
      <div ref={containerRef} className="relative">
        {children}
        
        {/* Main AI Menu - Compact Design */}
        {menuPosition.visible && (
          <div
            ref={menuRef}
            className={cn(
              "absolute z-modal w-52 bg-gradient-to-br from-primary-600/80 to-primary-700/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden",
              "animate-scale-in origin-top",
              "transform -translate-x-1/2"
            )}
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
            }}
          >
            {/* Header Section */}
            <div className="p-3 border-b border-primary-500/20">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
                  <WandSparkles className="w-4 h-4 text-primary-foreground/60" />
                </div>
                <div>
                  <h3 className="text-caption font-semibold text-primary-foreground/90">AI-Enhance</h3>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-1.5">
              <div className="space-y-0.5">
                {/* Rephrase */}
                <button
                  onMouseEnter={(e) => handleSubmenuHover('rephrase', e)}
                  onMouseLeave={handleSubmenuLeave}
                  disabled={isDisabled}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-md transition-all",
                    "text-primary-foreground/90 hover:bg-primary-500/10 hover:text-primary-foreground",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 text-primary-foreground/70 flex items-center justify-center">
                      <WandSparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-micro font-medium">Rephrase</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Improve */}
                <button
                  onClick={() => handleAIAction('improve', undefined, 'Improve Clarity')}
                  disabled={isDisabled}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-md transition-all",
                    "text-primary-foreground/90 hover:bg-primary-500/10 hover:text-primary-foreground",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 text-primary-foreground/70 flex items-center justify-center">
                      <Edit3 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-micro">Improve</span>
                  </div>
                </button>

                {/* Adjust Length */}
                <button
                  onMouseEnter={(e) => handleSubmenuHover('length', e)}
                  onMouseLeave={handleSubmenuLeave}
                  disabled={isDisabled}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-md transition-all",
                    "text-primary-foreground/90 hover:bg-primary-500/10 hover:text-primary-foreground",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 text-primary-foreground/70 flex items-center justify-center">
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-micro">Adjust Length</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Role Specific */}
                <button
                  onClick={() => handleAIAction('role_specific', undefined, 'Role Specific')}
                  disabled={isDisabled}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-md transition-all",
                    "text-primary-foreground/90 hover:bg-primary-500/10 hover:text-primary-foreground",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 text-primary-foreground/70 flex items-center justify-center">
                      <Target className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-micro">Role Specific</span>
                  </div>
                </button>
              </div>

              {isDisabled && (
                <div className="px-2.5 py-2 mt-2 text-primary-foreground/60 text-micro border-t border-primary-500/30">
                  Select 10+ characters to use AI features
                </div>
              )}

              {/* AI Creativity Slider */}
              <div className="px-2.5 py-3 mt-2 border-t border-primary-500/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-micro font-medium text-primary-foreground/90">AI Creativity</span>
                  <Brain className="w-3.5 h-3.5 text-primary-foreground/70" />
                </div>
                
                <div className="space-y-3">
                  {/* Current Level Display */}
                  <div className="text-center">
                    <div className="text-tiny font-semibold text-primary-foreground/90">
                      {getCurrentLevel().label}
                    </div>
                    <div className="text-tiny text-primary-foreground/70">
                      {getCurrentLevel().description}
                    </div>
                  </div>

                  {/* Slider */}
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="1"
                      value={creativityLevel}
                      onChange={(e) => updateCreativityLevel(parseInt(e.target.value))}
                      className="w-full h-2 bg-primary-500/30 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #6366f1 33%, #8b5cf6 66%, #ec4899 100%)`
                      }}
                    />
                  </div>

                  {/* Level Labels */}
                  <div className="flex justify-between text-tiny text-primary-foreground/60">
                    <span>Safe</span>
                    <span>Measured</span>
                    <span>Bold</span>
                    <span>Visionary</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submenu */}
        {submenuPosition.visible && activeSubmenu && (
          <div
            ref={submenuRef}
            className={cn(
              "absolute z-50 w-64 bg-gradient-to-br from-primary-500/95 to-primary-600/95 backdrop-blur-sm border border-primary-400/50 rounded-lg shadow-lg",
              "animate-scale-in origin-top-left"
            )}
            style={{
              left: `${submenuPosition.x}px`,
              top: `${submenuPosition.y}px`,
            }}
          >
            <div className="p-1 space-y-1">
              {activeSubmenu === 'rephrase' && (
                <>
                  <button
                    onClick={() => handleAIAction('rephrase', 'professional', 'More Professional')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-caption rounded-md hover:bg-primary-400/30 transition-colors text-primary-foreground/90 hover:text-primary-foreground"
                  >
                    <Brain className="h-4 w-4" />
                    More Professional
                  </button>
                  <button
                    onClick={() => handleAIAction('rephrase', 'conversational', 'More Conversational')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-caption rounded-md hover:bg-primary-400/30 transition-colors text-primary-foreground/90 hover:text-primary-foreground"
                  >
                    <MessageCircle className="h-4 w-4" />
                    More Conversational
                  </button>
                  <button
                    onClick={() => handleAIAction('rephrase', 'creative', 'More Creative')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-caption rounded-md hover:bg-primary-400/30 transition-colors text-primary-foreground/90 hover:text-primary-foreground"
                  >
                    <Sparkles className="h-4 w-4" />
                    More Creative
                  </button>
                  <button
                    onClick={() => handleAIAction('rephrase', 'structured', 'More Structured')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-caption rounded-md hover:bg-primary-400/30 transition-colors text-primary-foreground/90 hover:text-primary-foreground"
                  >
                    <Square className="h-4 w-4" />
                    More Structured
                  </button>
                </>
              )}

              {activeSubmenu === 'length' && (
                <>
                  <button
                    onClick={() => handleAIAction('adjust_length', 'longer', 'Make Longer')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-caption rounded-md hover:bg-primary-400/30 transition-colors text-primary-foreground/90 hover:text-primary-foreground"
                  >
                    <ArrowUp className="h-4 w-4" />
                    Make Longer
                  </button>
                  <button
                    onClick={() => handleAIAction('adjust_length', 'shorter', 'Make Shorter')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-caption rounded-md hover:bg-primary-400/30 transition-colors text-primary-foreground/90 hover:text-primary-foreground"
                  >
                    <ArrowDown className="h-4 w-4" />
                    Make Shorter
                  </button>
                  <button
                    onClick={() => handleAIAction('adjust_length', 'summarize', 'Summarize')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-caption rounded-md hover:bg-primary-400/30 transition-colors text-primary-foreground/90 hover:text-primary-foreground"
                  >
                    <List className="h-4 w-4" />
                    Summarize
                  </button>
                  <button
                    onClick={() => handleAIAction('adjust_length', 'expand_example', 'Expand with Example')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-caption rounded-md hover:bg-primary-400/30 transition-colors text-primary-foreground/90 hover:text-primary-foreground"
                  >
                    <BookOpen className="h-4 w-4" />
                    Expand with Example
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <AIReplacementDialog
        open={showReplacementDialog}
        onOpenChange={setShowReplacementDialog}
        originalText={originalText}
        generatedText={generatedText}
        actionTitle={actionTitle}
        isLoading={isLoading}
        onAccept={handleAcceptReplacement}
        onRegenerate={() => handleAIAction('improve', undefined, actionTitle)}
      />
    </>
  )
}

export { AIContextMenu, type AIAction }
