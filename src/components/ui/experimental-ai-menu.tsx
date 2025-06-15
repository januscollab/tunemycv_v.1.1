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
  Upload
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AIReplacementDialog } from "./ai-replacement-dialog"
import { useToast } from "@/hooks/use-toast"

interface ExperimentalAIMenuProps {
  children: React.ReactNode
  selectedText?: string
  disabled?: boolean
  aiAvatarUrl?: string
}

interface MenuPosition {
  x: number
  y: number
  visible: boolean
}

const ExperimentalAIMenu: React.FC<ExperimentalAIMenuProps> = ({
  children,
  selectedText = "",
  disabled = false,
  aiAvatarUrl
}) => {
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ x: 0, y: 0, visible: false })
  const [isProcessing, setIsProcessing] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)
  const [dialogState, setDialogState] = useState<{
    open: boolean
    originalText: string
    generatedText: string
    actionTitle: string
    isLoading: boolean
  }>({
    open: false,
    originalText: "",
    generatedText: "",
    actionTitle: "",
    isLoading: false
  })
  const { toast } = useToast()
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      setMenuPosition({ x: 0, y: 0, visible: false })
      return
    }

    const selectedText = selection.toString().trim()
    if (!selectedText || selectedText.length < 3) {
      setMenuPosition({ x: 0, y: 0, visible: false })
      return
    }

    // Immediate positioning for stability
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()
    
    if (containerRect) {
      let x = rect.left - containerRect.left + (rect.width / 2)
      let y = rect.bottom - containerRect.top + 15
      
      // Keep menu within bounds
      const menuWidth = 280
      const menuHeight = 160
      
      if (x + menuWidth > containerRect.width) {
        x = containerRect.width - menuWidth - 10
      }
      if (x < 10) {
        x = 10
      }
      if (y + menuHeight > containerRect.height) {
        y = rect.top - containerRect.top - menuHeight - 15
      }
      
      setMenuPosition({ x, y, visible: true })
    }
  }

  const handleAIAction = async (action: string, subAction?: string) => {
    const currentText = window.getSelection()?.toString().trim() || ""
    const actionTitle = `${action}${subAction ? ` - ${subAction}` : ''}`
    
    // Close menu and open dialog with loading state
    setMenuPosition({ x: 0, y: 0, visible: false })
    setDialogState({
      open: true,
      originalText: currentText,
      generatedText: "",
      actionTitle: actionTitle,
      isLoading: true
    })
    
    // Simulate AI processing with realistic delay
    setTimeout(() => {
      // Generate mock improved text based on action
      let improvedText = generateMockImprovement(currentText, action, subAction)
      
      setDialogState(prev => ({
        ...prev,
        generatedText: improvedText,
        isLoading: false
      }))
    }, 2000 + Math.random() * 1000) // 2-3 seconds
  }

  const generateMockImprovement = (text: string, action: string, subAction?: string): string => {
    // Mock AI improvements based on action type
    switch (action) {
      case 'rephrase':
        if (subAction === 'professional') {
          return text.replace(/I think/g, 'I believe').replace(/good/g, 'excellent').replace(/bad/g, 'suboptimal')
        } else if (subAction === 'conversational') {
          return `Hey there! ${text.replace(/Therefore/g, 'So').replace(/However/g, 'But')}`
        } else if (subAction === 'creative') {
          return `✨ ${text} ✨ This sparks new possibilities and opens doors to innovation.`
        }
        return `${text} (rephrased for clarity and impact)`
      
      case 'improve':
        return `${text}\n\nThis enhanced version provides greater clarity, improved structure, and more engaging language that resonates with your audience.`
      
      case 'length':
        if (subAction === 'shorter') {
          return text.split('. ').slice(0, Math.ceil(text.split('. ').length / 2)).join('. ')
        } else if (subAction === 'longer') {
          return `${text}\n\nTo elaborate further, this approach offers several advantages and creates opportunities for deeper engagement. The strategic implementation of these concepts can lead to significant improvements in overall effectiveness.`
        } else if (subAction === 'summarize') {
          return `Summary: ${text.substring(0, Math.min(100, text.length))}...`
        }
        return `${text} (length adjusted)`
      
      case 'role':
        return `${text}\n\n[Optimized for professional context with industry-specific terminology and strategic focus that aligns with organizational objectives.]`
      
      default:
        return `${text} (enhanced by AI)`
    }
  }

  const handleAcceptChanges = () => {
    // In a real implementation, this would replace the selected text
    toast({
      title: "Changes Applied",
      description: "Your text has been successfully updated with AI improvements.",
    })
    
    // Clear selection and close dialog
    window.getSelection()?.removeAllRanges()
    setDialogState(prev => ({ ...prev, open: false }))
  }

  const handleRegenerateText = () => {
    setDialogState(prev => ({
      ...prev,
      isLoading: true,
      generatedText: ""
    }))
    
    // Regenerate with slight variation
    setTimeout(() => {
      const newText = generateMockImprovement(
        dialogState.originalText, 
        dialogState.actionTitle.split(' - ')[0],
        dialogState.actionTitle.split(' - ')[1]
      ) + " (regenerated)"
      
      setDialogState(prev => ({
        ...prev,
        generatedText: newText,
        isLoading: false
      }))
    }, 1500)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      // Store in localStorage for persistence
      localStorage.setItem('ai-avatar-url', url)
      setShowUpload(false)
    }
  }

  const closeMenu = () => {
    setMenuPosition({ x: 0, y: 0, visible: false })
    setShowUpload(false)
    setActiveSubmenu(null)
    setHoveredAction(null)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu()
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

  // Smart context filtering based on selected text
  const getContextualActions = (text: string) => {
    const wordCount = text.split(/\s+/).length
    const charCount = text.length
    
    const actions = []
    
    // Always show rephrase for any text
    actions.push({
      id: 'rephrase',
      icon: WandSparkles,
      label: 'Rephrase',
      subActions: [
        { id: 'professional', label: 'More Professional', icon: Brain },
        { id: 'conversational', label: 'More Casual', icon: MessageCircle },
        { id: 'creative', label: 'More Creative', icon: Sparkles }
      ]
    })
    
    // Show improve for any text
    actions.push({
      id: 'improve',
      icon: Edit3,
      label: 'Improve Writing'
    })
    
    // Length actions based on text size
    if (wordCount >= 10) {
      actions.push({
        id: 'length',
        icon: ArrowUpDown,
        label: 'Adjust Length',
        subActions: [
          ...(wordCount >= 20 ? [{ id: 'shorter', label: 'Make Shorter', icon: ArrowDown }] : []),
          ...(wordCount >= 30 ? [{ id: 'summarize', label: 'Summarize', icon: List }] : []),
          { id: 'longer', label: 'Expand', icon: ArrowUp },
          { id: 'example', label: 'Add Example', icon: BookOpen }
        ]
      })
    }
    
    // Role-specific optimization for longer text
    if (charCount >= 50) {
      actions.push({
        id: 'role',
        icon: Target,
        label: 'Optimize for Role'
      })
    }
    
    return actions
  }

  const currentSelectedText = window.getSelection()?.toString().trim() || ""
  const contextualActions = getContextualActions(currentSelectedText)

  return (
    <>
      <div ref={containerRef} className="relative">
        {children}
        
        {/* Contextual AI Assistant */}
        {menuPosition.visible && (
          <div
            ref={menuRef}
            className={cn(
              "absolute z-[9999] animate-scale-in origin-top transition-all duration-300",
              "bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-xl",
              "border border-border/50 rounded-2xl shadow-2xl",
              "min-w-80 max-w-96 overflow-hidden"
            )}
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
            }}
          >
            {/* Header with AI Avatar and Subtle Branding */}
            <div className="flex items-center gap-3 p-4 border-b border-border/30 bg-gradient-to-r from-orange-50/10 via-primary-50/10 to-background/20">
              <div 
                className="relative w-12 h-12 rounded-full overflow-hidden cursor-pointer group ring-2 ring-orange-200/20 transition-all duration-300 hover:ring-orange-300/40"
                onClick={() => setShowUpload(!showUpload)}
              >
                {aiAvatarUrl || localStorage.getItem('ai-avatar-url') ? (
                  <img 
                    src={aiAvatarUrl || localStorage.getItem('ai-avatar-url') || ''} 
                    alt="AI Assistant" 
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-100/30 via-primary-200/40 to-primary-300/50 flex items-center justify-center text-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                    🤖
                  </div>
                )}
                {/* Upload indicator with subtle branding */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/70 to-primary-500/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                  <Upload className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  AI Assistant
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full animate-pulse"></div>
                </h3>
                <p className="text-xs text-foreground-secondary">
                  {isProcessing ? "Processing..." : `${currentSelectedText.length} characters selected`}
                </p>
              </div>
            </div>

            {/* Upload Panel with smooth sliding */}
            {showUpload && (
              <div className="p-4 bg-gradient-to-r from-orange-50/20 to-accent/30 border-b border-border/50 animate-slide-in-right">
                <p className="text-xs text-foreground-secondary mb-3 font-medium">
                  Upload your AI avatar image:
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs p-2 bg-background/50 border border-border/50 rounded-lg transition-all duration-200 hover:border-orange-300/50 focus:border-orange-400/50 focus:outline-none"
                />
              </div>
            )}

            {/* Contextual Actions with Nested Menus */}
            <div className="p-4 space-y-1">
              {!isProcessing ? (
                <>
                  {contextualActions.map((action, index) => (
                    <div key={action.id} className="relative">
                      {action.subActions ? (
                        // Parent action with submenu
                        <div>
                          <button
                            onClick={() => setActiveSubmenu(activeSubmenu === action.id ? null : action.id)}
                            onMouseEnter={() => setHoveredAction(action.id)}
                            onMouseLeave={() => setHoveredAction(null)}
                            className={cn(
                              "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-300",
                              "text-foreground/90 hover:bg-gradient-to-r hover:from-orange-50/30 hover:to-primary-50/30 hover:text-primary group",
                              "text-sm font-medium border border-transparent hover:border-orange-200/30",
                              activeSubmenu === action.id && "bg-gradient-to-r from-orange-50/40 to-primary-50/40 border-orange-200/40",
                              hoveredAction === action.id && "transform scale-[1.02] shadow-lg"
                            )}
                            style={{
                              animationDelay: `${index * 50}ms`,
                              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <action.icon className={cn(
                                "w-4 h-4 transition-all duration-300",
                                hoveredAction === action.id && "scale-110 text-orange-500"
                              )} />
                              {action.label}
                            </div>
                            <div className={cn(
                              "w-2 h-2 bg-orange-400/60 rounded-full transition-all duration-300",
                              activeSubmenu === action.id ? "rotate-90 scale-110" : "scale-75"
                            )} />
                          </button>
                          
                          {/* Submenu with smooth gliding animation */}
                          {activeSubmenu === action.id && (
                            <div className="mt-1 ml-4 space-y-0.5 animate-slide-in-right overflow-hidden">
                              {action.subActions.map((subAction, subIndex) => (
                                <button
                                  key={subAction.id}
                                  onClick={() => handleAIAction(action.id, subAction.id)}
                                  className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300",
                                    "text-foreground/80 hover:bg-gradient-to-r hover:from-orange-50/40 hover:to-primary-50/40 hover:text-primary",
                                    "text-sm group border border-transparent hover:border-orange-200/30",
                                    "hover:transform hover:translate-x-1 hover:scale-[1.02]"
                                  )}
                                  style={{
                                    animationDelay: `${subIndex * 50}ms`,
                                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                  }}
                                >
                                  <subAction.icon className="w-3.5 h-3.5 group-hover:scale-110 transition-all duration-300 text-orange-400/70 group-hover:text-orange-500" />
                                  {subAction.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        // Single action without submenu
                        <button
                          onClick={() => handleAIAction(action.id)}
                          onMouseEnter={() => setHoveredAction(action.id)}
                          onMouseLeave={() => setHoveredAction(null)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300",
                            "text-foreground/90 hover:bg-gradient-to-r hover:from-orange-50/30 hover:to-primary-50/30 hover:text-primary group",
                            "text-sm font-medium border border-transparent hover:border-orange-200/30",
                            hoveredAction === action.id && "transform scale-[1.02] shadow-lg"
                          )}
                          style={{
                            animationDelay: `${index * 50}ms`,
                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                          }}
                        >
                          <action.icon className={cn(
                            "w-4 h-4 transition-all duration-300",
                            hoveredAction === action.id && "scale-110 text-orange-500"
                          )} />
                          {action.label}
                        </button>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-3">
                    <div className="relative">
                      <div className="w-8 h-8 border-2 border-orange-200/40 border-t-orange-400 rounded-full animate-spin mx-auto" />
                      <div className="absolute inset-0 w-8 h-8 border border-primary/20 rounded-full animate-ping" />
                    </div>
                    <p className="text-sm text-foreground-secondary">
                      Enhancing your text...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Replacement Dialog */}
        <AIReplacementDialog
          open={dialogState.open}
          onOpenChange={(open) => setDialogState(prev => ({ ...prev, open }))}
          originalText={dialogState.originalText}
          generatedText={dialogState.generatedText}
          actionTitle={dialogState.actionTitle}
          isLoading={dialogState.isLoading}
          onAccept={handleAcceptChanges}
          onRegenerate={handleRegenerateText}
        />
      </div>
    </>
  )
}

export { ExperimentalAIMenu }
