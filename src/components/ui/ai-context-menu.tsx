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

interface AIAction {
  type: 'rephrase' | 'improve' | 'adjust_length' | 'role_specific'
  subType?: string
  selectedText: string
  context: string
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
          context: "editor"
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setGeneratedText(data.generatedText)
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
        
        {/* Main AI Menu */}
        {menuPosition.visible && (
          <div
            ref={menuRef}
            className={cn(
              "absolute z-50 w-56 bg-popover border border-border rounded-lg shadow-lg",
              "animate-scale-in origin-top",
              "transform -translate-x-1/2"
            )}
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
            }}
          >
            <div className="p-1 space-y-1">
              {/* Rephrase Submenu */}
              <button
                onMouseEnter={(e) => handleSubmenuHover('rephrase', e)}
                onMouseLeave={handleSubmenuLeave}
                disabled={isDisabled}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-3 py-2 text-caption rounded-md",
                  "hover:bg-accent transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-2">
                  <WandSparkles className="h-4 w-4" />
                  ✍️ Rephrase
                </div>
                <ChevronRight className="h-3 w-3" />
              </button>

              {/* Improve Clarity */}
              <button
                onClick={() => handleAIAction('improve', undefined, '🔍 Improve Clarity')}
                disabled={isDisabled}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-caption rounded-md",
                  "hover:bg-accent transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <Edit3 className="h-4 w-4" />
                🔍 Improve Clarity
              </button>

              {/* Adjust Length Submenu */}
              <button
                onMouseEnter={(e) => handleSubmenuHover('length', e)}
                onMouseLeave={handleSubmenuLeave}
                disabled={isDisabled}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-3 py-2 text-caption rounded-md",
                  "hover:bg-accent transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  📏 Adjust Length
                </div>
                <ChevronRight className="h-3 w-3" />
              </button>

              {/* Make Role-Specific */}
              <button
                onClick={() => handleAIAction('role_specific', undefined, '🎯 Make It Role-Specific')}
                disabled={isDisabled}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-caption rounded-md",
                  "hover:bg-accent transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <Target className="h-4 w-4" />
                🎯 Make It Role-Specific
              </button>

              {isDisabled && (
                <div className="px-3 py-2 text-muted-foreground text-micro border-t border-border">
                  Select 10+ characters to use AI features
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submenu */}
        {submenuPosition.visible && activeSubmenu && (
          <div
            ref={submenuRef}
            className={cn(
              "absolute z-50 w-64 bg-popover border border-border rounded-lg shadow-lg",
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
                    onClick={() => handleAIAction('rephrase', 'professional', '🧠 More Professional')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-caption rounded-md hover:bg-accent transition-colors"
                  >
                    <Brain className="h-4 w-4" />
                    🧠 More Professional
                  </button>
                  <button
                    onClick={() => handleAIAction('rephrase', 'conversational', '💬 More Conversational')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-caption rounded-md hover:bg-accent transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    💬 More Conversational
                  </button>
                  <button
                    onClick={() => handleAIAction('rephrase', 'creative', '✨ More Creative')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-caption rounded-md hover:bg-accent transition-colors"
                  >
                    <Sparkles className="h-4 w-4" />
                    ✨ More Creative
                  </button>
                  <button
                    onClick={() => handleAIAction('rephrase', 'structured', '🧱 More Structured')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-caption rounded-md hover:bg-accent transition-colors"
                  >
                    <Square className="h-4 w-4" />
                    🧱 More Structured
                  </button>
                </>
              )}

              {activeSubmenu === 'length' && (
                <>
                  <button
                    onClick={() => handleAIAction('adjust_length', 'longer', '⬆️ Make Longer')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-caption rounded-md hover:bg-accent transition-colors"
                  >
                    <ArrowUp className="h-4 w-4" />
                    ⬆️ Make Longer
                  </button>
                  <button
                    onClick={() => handleAIAction('adjust_length', 'shorter', '⬇️ Make Shorter')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-caption rounded-md hover:bg-accent transition-colors"
                  >
                    <ArrowDown className="h-4 w-4" />
                    ⬇️ Make Shorter
                  </button>
                  <button
                    onClick={() => handleAIAction('adjust_length', 'summarize', '🧩 Summarize')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-caption rounded-md hover:bg-accent transition-colors"
                  >
                    <List className="h-4 w-4" />
                    🧩 Summarize
                  </button>
                  <button
                    onClick={() => handleAIAction('adjust_length', 'expand_example', '📚 Expand with Example')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-caption rounded-md hover:bg-accent transition-colors"
                  >
                    <BookOpen className="h-4 w-4" />
                    📚 Expand with Example
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