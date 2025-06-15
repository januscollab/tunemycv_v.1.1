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
        
        {/* Main AI Menu - Redesigned based on image */}
        {menuPosition.visible && (
          <div
            ref={menuRef}
            className={cn(
              "absolute z-modal w-64 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-lg overflow-hidden",
              "animate-scale-in origin-top",
              "transform -translate-x-1/2"
            )}
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
            }}
          >
            {/* Header Section */}
            <div className="p-4 border-b border-primary-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
                  <WandSparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-body font-medium text-primary-foreground">AI-Enhance</h3>
                  <p className="text-tiny text-primary-foreground/80">Menu</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <div className="space-y-1">
                {/* Drodt placeholder item */}
                <div className="px-3 py-2.5 flex items-center gap-3 text-primary-foreground/60">
                  <Edit3 className="w-4 h-4" />
                  <span className="text-caption">Drodt</span>
                </div>

                {/* Active item - Cradis style */}
                <button
                  onMouseEnter={(e) => handleSubmenuHover('rephrase', e)}
                  onMouseLeave={handleSubmenuLeave}
                  disabled={isDisabled}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all",
                    "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md",
                    "hover:from-orange-500 hover:to-orange-600 transform hover:scale-[1.02]",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                      <WandSparkles className="w-4 h-4" />
                    </div>
                    <span className="text-caption font-medium">Rephrase</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Other menu items */}
                <button
                  onMouseEnter={(e) => handleSubmenuHover('length', e)}
                  onMouseLeave={handleSubmenuLeave}
                  disabled={isDisabled}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all",
                    "text-primary-foreground/90 hover:bg-primary-500/30 hover:text-primary-foreground",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 text-primary-foreground/70 flex items-center justify-center">
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                    <span className="text-caption">Adjust Length</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleAIAction('improve', undefined, 'Improve')}
                  disabled={isDisabled}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all",
                    "text-primary-foreground/90 hover:bg-primary-500/30 hover:text-primary-foreground",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 text-primary-foreground/70 flex items-center justify-center">
                      <Brain className="w-4 h-4" />
                    </div>
                    <span className="text-caption">Cloud</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleAIAction('role_specific', undefined, 'Role Specific')}
                  disabled={isDisabled}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all",
                    "text-primary-foreground/90 hover:bg-primary-500/30 hover:text-primary-foreground",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 text-primary-foreground/70 flex items-center justify-center">
                      <Target className="w-4 h-4" />
                    </div>
                    <span className="text-caption">Clade</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  disabled={isDisabled}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all",
                    "text-primary-foreground/90 hover:bg-primary-500/30 hover:text-primary-foreground",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 text-primary-foreground/70 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <span className="text-caption">Clesss</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {isDisabled && (
                <div className="px-3 py-2 mt-2 text-primary-foreground/60 text-micro border-t border-primary-500/30">
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