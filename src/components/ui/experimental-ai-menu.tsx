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
  BookOpen
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ExperimentalAIMenuProps {
  children: React.ReactNode
  selectedText?: string
  disabled?: boolean
}

interface MenuPosition {
  x: number
  y: number
  visible: boolean
}

const ExperimentalAIMenu: React.FC<ExperimentalAIMenuProps> = ({
  children,
  selectedText = "",
  disabled = false
}) => {
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ x: 0, y: 0, visible: false })
  const [activeOrbit, setActiveOrbit] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiMood, setAiMood] = useState<'ready' | 'thinking' | 'excited'>('ready')
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleTextSelection = () => {
    // Clear any existing timeout
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current)
    }

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      setMenuPosition({ x: 0, y: 0, visible: false })
      setActiveOrbit(null)
      return
    }

    const selectedText = selection.toString().trim()
    if (!selectedText || selectedText.length < 5) {
      setMenuPosition({ x: 0, y: 0, visible: false })
      setActiveOrbit(null)
      return
    }

    // Determine AI mood based on text complexity
    if (selectedText.length > 100) {
      setAiMood('thinking')
    } else if (selectedText.includes('!') || selectedText.includes('?')) {
      setAiMood('excited')
    } else {
      setAiMood('ready')
    }

    // Wait for user to finish selecting
    selectionTimeoutRef.current = setTimeout(() => {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      const containerRect = containerRef.current?.getBoundingClientRect()
      
      if (containerRect) {
        // Magnetic positioning - snap to optimal positions
        let x = rect.left - containerRect.left + (rect.width / 2)
        let y = rect.bottom - containerRect.top + 20
        
        // Keep menu within bounds
        const menuWidth = 120
        const menuHeight = 120
        
        if (x + menuWidth > containerRect.width) {
          x = containerRect.width - menuWidth - 10
        }
        if (x < 10) {
          x = 10
        }
        if (y + menuHeight > containerRect.height) {
          y = rect.top - containerRect.top - menuHeight - 10
        }
        
        setMenuPosition({ x, y, visible: true })
      }
    }, 200)
  }

  const handleAIAction = async (action: string, subAction?: string) => {
    setIsProcessing(true)
    setAiMood('excited')
    
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false)
      setAiMood('ready')
      setMenuPosition({ x: 0, y: 0, visible: false })
      setActiveOrbit(null)
      // In real implementation, this would call the AI service
      console.log(`AI Action: ${action}${subAction ? ` - ${subAction}` : ''}`)
    }, 2000)
  }

  const closeMenu = () => {
    setMenuPosition({ x: 0, y: 0, visible: false })
    setActiveOrbit(null)
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

  const isDisabled = disabled || !selectedText.trim() || selectedText.length < 5

  const getAiEmoji = () => {
    switch (aiMood) {
      case 'thinking': return '🤔'
      case 'excited': return '🤖'
      default: return '😊'
    }
  }

  const orbitActions = [
    { 
      id: 'rephrase', 
      icon: WandSparkles, 
      label: 'Rephrase', 
      color: 'from-purple-400 to-pink-400',
      angle: 0,
      subActions: [
        { id: 'professional', label: 'Professional', icon: Brain },
        { id: 'conversational', label: 'Conversational', icon: MessageCircle },
        { id: 'creative', label: 'Creative', icon: Sparkles },
        { id: 'structured', label: 'Structured', icon: Square }
      ]
    },
    { 
      id: 'improve', 
      icon: Edit3, 
      label: 'Improve', 
      color: 'from-blue-400 to-cyan-400',
      angle: 90 
    },
    { 
      id: 'length', 
      icon: ArrowUpDown, 
      label: 'Length', 
      color: 'from-green-400 to-emerald-400',
      angle: 180,
      subActions: [
        { id: 'longer', label: 'Longer', icon: ArrowUp },
        { id: 'shorter', label: 'Shorter', icon: ArrowDown },
        { id: 'summarize', label: 'Summarize', icon: List },
        { id: 'expand', label: 'Add Example', icon: BookOpen }
      ]
    },
    { 
      id: 'role', 
      icon: Target, 
      label: 'Role Fit', 
      color: 'from-orange-400 to-red-400',
      angle: 270 
    }
  ]

  return (
    <>
      <div ref={containerRef} className="relative">
        {children}
        
        {/* Floating AI Assistant */}
        {menuPosition.visible && (
          <div
            ref={menuRef}
            className={cn(
              "absolute z-[9999] flex items-center justify-center",
              "animate-scale-in origin-center"
            )}
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
            }}
          >
            {/* Central AI Circle */}
            <div 
              className={cn(
                "relative w-20 h-20 rounded-full cursor-pointer transition-all duration-500",
                "bg-gradient-to-br from-primary-400/90 to-primary-600/90 backdrop-blur-lg",
                "shadow-lg border border-white/20",
                isProcessing ? "animate-pulse scale-110" : "hover:scale-105",
                aiMood === 'thinking' && "animate-bounce",
                aiMood === 'excited' && "animate-pulse"
              )}
              onMouseEnter={() => !isProcessing && setActiveOrbit('main')}
              onMouseLeave={() => !isProcessing && setActiveOrbit(null)}
            >
              {/* AI Avatar */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isProcessing ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="text-2xl">{getAiEmoji()}</div>
                )}
              </div>
              
              {/* Ready Indicator */}
              {!isProcessing && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
              )}
              
              {/* Breathing Effect */}
              {!isProcessing && activeOrbit !== 'main' && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-300/30 to-primary-500/30 animate-ping" />
              )}
            </div>

            {/* Orbital Actions */}
            {activeOrbit === 'main' && !isProcessing && (
              <>
                {orbitActions.map((action, index) => {
                  const angle = (action.angle * Math.PI) / 180
                  const radius = 50
                  const x = Math.cos(angle) * radius
                  const y = Math.sin(angle) * radius
                  
                  return (
                    <div
                      key={action.id}
                      className={cn(
                        "absolute w-12 h-12 rounded-full cursor-pointer transition-all duration-300",
                        `bg-gradient-to-r ${action.color}`,
                        "shadow-md border border-white/30 backdrop-blur-sm",
                        "hover:scale-110 hover:shadow-lg",
                        "flex items-center justify-center text-white",
                        "animate-scale-in"
                      )}
                      style={{
                        left: `${x}px`,
                        top: `${y}px`,
                        animationDelay: `${index * 100}ms`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      onClick={() => {
                        if (action.subActions) {
                          setActiveOrbit(action.id)
                        } else {
                          handleAIAction(action.id)
                        }
                      }}
                      onMouseEnter={() => setActiveOrbit(action.id)}
                    >
                      <action.icon className="w-5 h-5" />
                      
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {action.label}
                      </div>
                    </div>
                  )
                })}
              </>
            )}

            {/* Sub-Action Menu */}
            {activeOrbit && activeOrbit !== 'main' && !isProcessing && (
              <div className="absolute left-24 top-0 min-w-48 bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-lg rounded-xl shadow-xl border border-border/50 p-2 animate-slide-in-right">
                <div className="space-y-1">
                  {orbitActions.find(a => a.id === activeOrbit)?.subActions?.map((subAction, index) => (
                    <button
                      key={subAction.id}
                      onClick={() => handleAIAction(activeOrbit, subAction.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                        "text-foreground/90 hover:bg-primary/10 hover:text-primary",
                        "text-sm font-medium"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <subAction.icon className="w-4 h-4" />
                      {subAction.label}
                    </button>
                  )) || (
                    <button
                      onClick={() => handleAIAction(activeOrbit)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-foreground/90 hover:bg-primary/10 hover:text-primary text-sm font-medium"
                    >
                      Execute {orbitActions.find(a => a.id === activeOrbit)?.label}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Processing Particles */}
            {isProcessing && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${i * 200}ms`,
                      animationDuration: '1s'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export { ExperimentalAIMenu }
