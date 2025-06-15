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
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface AIAction {
  type: 'rephrase' | 'improve' | 'adjust_length' | 'role_specific'
  subType?: string
  selectedText: string
  context: string
}

interface AIContextMenuProps {
  children: React.ReactNode
  selectedText?: string
  onAIAction?: (action: AIAction) => void
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
  onAIAction,
  disabled = false
}) => {
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [actionDetails, setActionDetails] = useState<{ title: string; description: string }>({
    title: "",
    description: ""
  })
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ x: 0, y: 0, visible: false })
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const [submenuPosition, setSubmenuPosition] = useState<MenuPosition>({ x: 0, y: 0, visible: false })
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const submenuRef = useRef<HTMLDivElement>(null)

  const handleAIAction = (type: AIAction['type'], subType?: string, title?: string, description?: string) => {
    if (disabled || !selectedText.trim() || selectedText.length < 10) return
    
    setActionDetails({
      title: title || "AI Feature",
      description: description || "This AI-powered feature is coming soon!"
    })
    setShowComingSoon(true)
    setMenuPosition({ x: 0, y: 0, visible: false })
    setActiveSubmenu(null)

    // Placeholder for future AI integration
    if (onAIAction) {
      onAIAction({
        type,
        subType,
        selectedText,
        context: "editor"
      })
    }
  }

  const handleTextSelection = () => {
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

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()
    
    if (containerRect) {
      const x = rect.left - containerRect.left + (rect.width / 2)
      const y = rect.top - containerRect.top - 8
      
      setMenuPosition({ x, y, visible: true })
    }
  }

  const handleSubmenuToggle = (submenuType: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    if (activeSubmenu === submenuType) {
      setActiveSubmenu(null)
      setSubmenuPosition({ x: 0, y: 0, visible: false })
      return
    }

    const buttonRect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()
    
    if (containerRect) {
      const x = buttonRect.right - containerRect.left + 8
      const y = buttonRect.top - containerRect.top
      
      setActiveSubmenu(submenuType)
      setSubmenuPosition({ x, y, visible: true })
    }
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
                onClick={(e) => handleSubmenuToggle('rephrase', e)}
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
                onClick={() => handleAIAction('improve', undefined, '🔍 Improve Clarity', 'Refine grammar and remove ambiguity')}
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
                onClick={(e) => handleSubmenuToggle('length', e)}
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
                onClick={() => handleAIAction('role_specific', undefined, '🎯 Make It Role-Specific', 'Tailor tone and keywords to a job role')}
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
                    onClick={() => handleAIAction('rephrase', 'professional', '🧠 More Professional', 'Transform text to use formal, polished business language')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-caption rounded-md hover:bg-accent transition-colors"
                  >
                    <Brain className="h-4 w-4" />
                    🧠 More Professional
                  </button>
                  <button
                    onClick={() => handleAIAction('rephrase', 'conversational', '💬 More Conversational', 'Simplify and humanize the tone')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-caption rounded-md hover:bg-accent transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    💬 More Conversational
                  </button>
                  <button
                    onClick={() => handleAIAction('rephrase', 'creative', '✨ More Creative', 'Add flair, storytelling, or uniqueness')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-caption rounded-md hover:bg-accent transition-colors"
                  >
                    <Sparkles className="h-4 w-4" />
                    ✨ More Creative
                  </button>
                  <button
                    onClick={() => handleAIAction('rephrase', 'structured', '🧱 More Structured', 'Improve sentence order, flow, and logic')}
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
                    onClick={() => handleAIAction('adjust_length', 'longer', '⬆️ Make Longer', 'Expand content with more detail')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-caption rounded-md hover:bg-accent transition-colors"
                  >
                    <ArrowUp className="h-4 w-4" />
                    ⬆️ Make Longer
                  </button>
                  <button
                    onClick={() => handleAIAction('adjust_length', 'shorter', '⬇️ Make Shorter', 'Trim content to its core message')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-caption rounded-md hover:bg-accent transition-colors"
                  >
                    <ArrowDown className="h-4 w-4" />
                    ⬇️ Make Shorter
                  </button>
                  <button
                    onClick={() => handleAIAction('adjust_length', 'summarize', '🧩 Summarize', 'Provide 1-2 sentence summary')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-caption rounded-md hover:bg-accent transition-colors"
                  >
                    <List className="h-4 w-4" />
                    🧩 Summarize
                  </button>
                  <button
                    onClick={() => handleAIAction('adjust_length', 'expand_example', '📚 Expand with Example', 'Add a real-world example or result')}
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

      <AlertDialog open={showComingSoon} onOpenChange={setShowComingSoon}>
        <AlertDialogContent className="bg-popover border-popover-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-heading text-foreground">
              {actionDetails.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-body text-foreground-secondary">
              {actionDetails.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowComingSoon(false)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Got it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export { AIContextMenu, type AIAction }