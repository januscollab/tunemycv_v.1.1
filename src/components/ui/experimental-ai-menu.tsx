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
  const [isHovering, setIsHovering] = useState(false)
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

    // Immediate positioning for stability
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
      color: 'from-purple-300/40 via-purple-400/50 to-pink-400/40',
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
      color: 'from-blue-300/40 via-blue-400/50 to-cyan-400/40',
      angle: 90 
    },
    { 
      id: 'length', 
      icon: ArrowUpDown, 
      label: 'Length', 
      color: 'from-green-300/40 via-green-400/50 to-emerald-400/40',
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
      color: 'from-orange-200/30 via-orange-300/40 to-red-300/30',
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
                "relative w-20 h-20 rounded-full cursor-pointer transition-all duration-700 ease-out",
                "bg-gradient-to-br from-primary-300/30 via-primary-400/40 to-primary-600/50 backdrop-blur-xl",
                "shadow-2xl border border-white/10",
                isProcessing ? "scale-110" : "hover:scale-110",
                "transform-gpu"
              )}
              onMouseEnter={() => {
                if (!isProcessing) {
                  setActiveOrbit('main')
                  setIsHovering(true)
                }
              }}
              onMouseLeave={() => {
                if (!isProcessing) {
                  setActiveOrbit(null)
                  setIsHovering(false)
                }
              }}
              style={{
                transition: 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              {/* AI Avatar with Fluid Motion */}
              <div className={cn(
                "absolute inset-0 flex items-center justify-center transition-all duration-500",
                isHovering && "scale-110"
              )}>
                {isProcessing ? (
                  <div className="w-6 h-6 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className={cn(
                    "text-2xl transition-all duration-500 transform",
                    isHovering && "rotate-12 scale-110"
                  )}>
                    {getAiEmoji()}
                  </div>
                )}
              </div>
              
              {/* Fluid Ring Animation */}
              {!isProcessing && (
                <div className={cn(
                  "absolute inset-0 rounded-full transition-all duration-700",
                  "bg-gradient-to-r from-primary-200/20 via-primary-400/30 to-primary-600/20",
                  isHovering ? "scale-110 opacity-60" : "scale-100 opacity-30"
                )} />
              )}
              
              {/* Pulse Ring */}
              {isProcessing && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-300/40 to-primary-500/40 animate-ping" />
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
                   const isActive = activeOrbit === action.id
                   
                   return (
                     <div
                       key={action.id}
                       className={cn(
                         "absolute rounded-full cursor-pointer backdrop-blur-xl border border-white/20",
                         "flex items-center justify-center text-white/80",
                         "animate-scale-in group relative overflow-hidden",
                         "transform-gpu transition-all duration-500 ease-out",
                         isActive ? "w-16 h-16 shadow-2xl" : "w-12 h-12 shadow-lg hover:w-14 hover:h-14"
                       )}
                       style={{
                         left: `${x}px`,
                         top: `${y}px`,
                         animationDelay: `${index * 100}ms`,
                         transform: 'translate(-50%, -50%)',
                         background: `linear-gradient(135deg, ${action.color.replace('from-', '').replace(' via-', ', ').replace(' to-', ', ')})`
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
                       {/* Morphing Background */}
                       <div className={cn(
                         "absolute inset-0 rounded-full transition-all duration-500",
                         "bg-gradient-to-br opacity-0 group-hover:opacity-20",
                         action.color.includes('purple') && "from-purple-200 to-pink-200",
                         action.color.includes('blue') && "from-blue-200 to-cyan-200", 
                         action.color.includes('green') && "from-green-200 to-emerald-200",
                         action.color.includes('orange') && "from-orange-100 to-red-100"
                       )} />
                       
                       <action.icon className={cn(
                         "transition-all duration-300 relative z-10",
                         isActive ? "w-6 h-6" : "w-5 h-5 group-hover:w-5.5 group-hover:h-5.5"
                       )} />
                       
                       {/* Morphing Ripple */}
                       <div className={cn(
                         "absolute inset-0 rounded-full transition-all duration-700",
                         "opacity-0 group-hover:opacity-30",
                         "bg-gradient-to-r from-white/10 via-white/20 to-white/10",
                         "animate-pulse"
                       )} />
                       
                       {/* Tooltip */}
                       <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-background/90 backdrop-blur text-foreground text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 border border-border/50 shadow-lg">
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
