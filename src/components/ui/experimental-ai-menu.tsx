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
    setIsProcessing(true)
    
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false)
      setMenuPosition({ x: 0, y: 0, visible: false })
      console.log(`AI Action: ${action}${subAction ? ` - ${subAction}` : ''}`)
    }, 2000)
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
              "absolute z-[9999] animate-scale-in origin-top",
              "bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-xl",
              "border border-border/50 rounded-2xl shadow-2xl p-4",
              "min-w-72 max-w-80"
            )}
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
            }}
          >
            {/* Header with AI Avatar */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/30">
              <div 
                className="relative w-12 h-12 rounded-full overflow-hidden cursor-pointer group"
                onClick={() => setShowUpload(!showUpload)}
              >
                {aiAvatarUrl || localStorage.getItem('ai-avatar-url') ? (
                  <img 
                    src={aiAvatarUrl || localStorage.getItem('ai-avatar-url') || ''} 
                    alt="AI Assistant" 
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-300/40 via-primary-400/50 to-primary-600/60 flex items-center justify-center text-xl transition-all duration-300 group-hover:scale-110">
                    🤖
                  </div>
                )}
                {/* Upload indicator */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground">AI Assistant</h3>
                <p className="text-xs text-foreground-secondary">
                  {isProcessing ? "Processing..." : `${currentSelectedText.length} characters selected`}
                </p>
              </div>
            </div>

            {/* Upload Panel */}
            {showUpload && (
              <div className="mb-4 p-3 bg-accent/30 rounded-lg border border-border/50">
                <p className="text-xs text-foreground-secondary mb-2">Upload your AI avatar:</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs"
                />
              </div>
            )}

            {/* Contextual Actions */}
            {!isProcessing ? (
              <div className="space-y-2">
                {contextualActions.map((action) => (
                  <div key={action.id}>
                    {action.subActions ? (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-foreground-secondary px-2 py-1">
                          {action.label}
                        </div>
                        {action.subActions.map((subAction) => (
                          <button
                            key={subAction.id}
                            onClick={() => handleAIAction(action.id, subAction.id)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                              "text-foreground/90 hover:bg-primary/10 hover:text-primary",
                              "text-sm font-medium group"
                            )}
                          >
                            <subAction.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            {subAction.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAIAction(action.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                          "text-foreground/90 hover:bg-primary/10 hover:text-primary",
                          "text-sm font-medium group"
                        )}
                      >
                        <action.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        {action.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-3">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-foreground-secondary">
                    Enhancing your text...
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export { ExperimentalAIMenu }
