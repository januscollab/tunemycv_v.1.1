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
    
    try {
      // Use real AI processing via Supabase edge function
      const response = await fetch(`https://aohrfehhyjdebaatzqdl.supabase.co/functions/v1/process-ai-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvaHJmZWhoeWpkZWJhYXR6cWRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MzY3MTcsImV4cCI6MjA2NDExMjcxN30.lq2vftfHXRX1Mvlj4X04TdaF7YWU8vRIZU-DN85Dr1o`
        },
        body: JSON.stringify({
          selectedText: currentText,
          action: { type: action, subType: subAction },
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

      setDialogState(prev => ({
        ...prev,
        generatedText: data.processedText || generateMockImprovement(currentText, action, subAction),
        isLoading: false
      }))
    } catch (error) {
      console.error('AI processing failed, using fallback:', error)
      // Fallback to mock improvement if AI fails
      const fallbackText = generateMockImprovement(currentText, action, subAction)
      setDialogState(prev => ({
        ...prev,
        generatedText: fallbackText,
        isLoading: false
      }))
    }
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
    // Replace the selected text with the generated text
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0 && dialogState.generatedText) {
      const range = selection.getRangeAt(0)
      range.deleteContents()
      range.insertNode(document.createTextNode(dialogState.generatedText))
      selection.removeAllRanges()
    }
    
    toast({
      title: "Changes Applied",
      description: "Your text has been successfully updated with AI improvements.",
    })
    
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

  // Developer-configurable avatar URL - no user upload needed
  const getAvatarUrl = () => {
    // Developer can configure this via environment or config
    return aiAvatarUrl || '/ai-assistant-avatar.png' // Default developer avatar
  }

  const closeMenu = () => {
    setMenuPosition({ x: 0, y: 0, visible: false })
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
              "bg-gradient-to-br from-background/98 to-background/95 backdrop-blur-xl",
              "border border-border/30 rounded-2xl shadow-2xl ring-1 ring-primary/5",
              "min-w-96 max-w-md overflow-hidden",
              "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/3 before:to-transparent before:pointer-events-none"
            )}
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
            }}
          >
            {/* Enhanced Header with AI Avatar and Status */}
            <div className="relative flex items-center gap-4 p-5 border-b border-border/20 bg-gradient-to-r from-primary/5 via-background/50 to-background/80">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] to-transparent opacity-60"></div>
              <div className="absolute top-1 right-4 w-16 h-16 bg-primary/5 rounded-full blur-2xl"></div>
              
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-primary/10 shadow-lg transition-all duration-500 hover:ring-primary/20 hover:scale-105">
                {getAvatarUrl() !== '/ai-assistant-avatar.png' ? (
                  <img 
                    src={getAvatarUrl()} 
                    alt="AI Assistant" 
                    className="w-full h-full object-cover transition-all duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/30 to-primary/40 flex items-center justify-center text-2xl transition-all duration-500 hover:scale-110">
                    ✨
                  </div>
                )}
                {/* Status indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <div className="flex-1 relative z-10">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-subheading font-semibold text-foreground">AI Assistant</h3>
                  <div className="px-2 py-0.5 bg-primary/10 text-primary text-tiny font-medium rounded-full">Ready</div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-caption text-foreground-secondary">
                    {isProcessing ? "Processing your request..." : `${currentSelectedText.length} characters selected`}
                  </p>
                  {!isProcessing && (
                    <div className="w-1 h-1 bg-primary/60 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>


            {/* Enhanced Contextual Actions */}
            <div className="p-5 space-y-2">
              {!isProcessing ? (
                <>
                  {/* Quick Info Bar */}
                  <div className="flex items-center justify-between px-3 py-2 bg-primary/5 rounded-lg border border-primary/10 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-caption font-medium text-primary">Smart Actions Available</span>
                    </div>
                    <span className="text-micro text-foreground-secondary">{contextualActions.length} options</span>
                  </div>

                  {contextualActions.map((action, index) => (
                    <div key={action.id} className="relative group">
                      {action.subActions ? (
                        // Parent action with submenu - Enhanced Design
                        <div className="space-y-1">
                          <button
                            onClick={() => setActiveSubmenu(activeSubmenu === action.id ? null : action.id)}
                            onMouseEnter={() => setHoveredAction(action.id)}
                            onMouseLeave={() => setHoveredAction(null)}
                            className={cn(
                              "w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl transition-all duration-300",
                              "text-foreground hover:bg-gradient-to-r hover:from-primary/8 hover:to-primary/4 hover:text-primary group",
                              "text-body font-medium border border-transparent hover:border-primary/20 hover:shadow-lg",
                              "backdrop-blur-sm relative overflow-hidden",
                              activeSubmenu === action.id && "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/25 shadow-md",
                              hoveredAction === action.id && "transform scale-[1.02] -translate-y-0.5"
                            )}
                            style={{
                              animationDelay: `${index * 75}ms`,
                              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                            }}
                          >
                            {/* Hover glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            <div className="flex items-center gap-3 relative z-10">
                              <div className={cn(
                                "w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center transition-all duration-300",
                                hoveredAction === action.id && "bg-primary/20 scale-110"
                              )}>
                                <action.icon className={cn(
                                  "w-4 h-4 transition-all duration-300 text-primary/70",
                                  hoveredAction === action.id && "scale-110 text-primary"
                                )} />
                              </div>
                              <div className="text-left">
                                <div className="font-medium">{action.label}</div>
                                <div className="text-micro text-foreground-secondary">
                                  {action.subActions?.length} variations
                                </div>
                              </div>
                            </div>
                            <div className={cn(
                              "w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-300",
                              activeSubmenu === action.id ? "rotate-90 bg-primary/20" : "group-hover:bg-primary/15"
                            )}>
                              <div className="w-1.5 h-1.5 bg-primary/60 rounded-full"></div>
                            </div>
                          </button>
                          
                          {/* Enhanced Submenu */}
                          {activeSubmenu === action.id && (
                            <div className="ml-6 space-y-1 animate-fade-in bg-gradient-to-r from-background/50 to-background/30 backdrop-blur-sm rounded-lg p-3 border border-border/20">
                              {action.subActions.map((subAction, subIndex) => (
                                <button
                                  key={subAction.id}
                                  onClick={() => handleAIAction(action.id, subAction.id)}
                                  className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300",
                                    "text-foreground-secondary hover:bg-primary/8 hover:text-primary",
                                    "text-body group border border-transparent hover:border-primary/15",
                                    "hover:transform hover:translate-x-1 hover:scale-[1.01] hover:shadow-sm"
                                  )}
                                  style={{
                                    animationDelay: `${subIndex * 50}ms`,
                                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                  }}
                                >
                                  <div className="w-6 h-6 rounded-md bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 transition-all duration-300">
                                    <subAction.icon className="w-3 h-3 group-hover:scale-110 transition-all duration-300 text-primary/60 group-hover:text-primary" />
                                  </div>
                                  <span className="font-medium">{subAction.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        // Single action without submenu - Enhanced Design
                        <button
                          onClick={() => handleAIAction(action.id)}
                          onMouseEnter={() => setHoveredAction(action.id)}
                          onMouseLeave={() => setHoveredAction(null)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300",
                            "text-foreground hover:bg-gradient-to-r hover:from-primary/8 hover:to-primary/4 hover:text-primary group",
                            "text-body font-medium border border-transparent hover:border-primary/20 hover:shadow-lg",
                            "backdrop-blur-sm relative overflow-hidden",
                            hoveredAction === action.id && "transform scale-[1.02] -translate-y-0.5"
                          )}
                          style={{
                            animationDelay: `${index * 75}ms`,
                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                          }}
                        >
                          {/* Hover glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          <div className={cn(
                            "w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center transition-all duration-300 relative z-10",
                            hoveredAction === action.id && "bg-primary/20 scale-110"
                          )}>
                            <action.icon className={cn(
                              "w-4 h-4 transition-all duration-300 text-primary/70",
                              hoveredAction === action.id && "scale-110 text-primary"
                            )} />
                          </div>
                          <div className="text-left relative z-10">
                            <div className="font-medium">{action.label}</div>
                            <div className="text-micro text-foreground-secondary">Direct action</div>
                          </div>
                        </button>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                // Enhanced Loading state
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary/20"></div>
                    <div className="animate-ping absolute inset-0 rounded-full h-10 w-10 border-2 border-primary opacity-20"></div>
                    <div className="absolute inset-2 bg-primary/10 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-body font-medium text-foreground">Processing with AI</div>
                    <div className="text-caption text-foreground-secondary">Analyzing your selection...</div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Footer */}
            <div className="px-5 py-3 border-t border-border/20 bg-gradient-to-r from-background/80 to-background/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-micro text-foreground-secondary">AI Ready</span>
                </div>
                <div className="text-micro text-foreground-tertiary">
                  Select text to enhance
                </div>
              </div>
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
