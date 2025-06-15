import * as React from "react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"
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
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog"
import { useState } from "react"

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

  const handleAIAction = (type: AIAction['type'], subType?: string, title?: string, description?: string) => {
    if (disabled || !selectedText.trim() || selectedText.length < 10) return
    
    setActionDetails({
      title: title || "AI Feature",
      description: description || "This AI-powered feature is coming soon!"
    })
    setShowComingSoon(true)

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

  const isDisabled = disabled || !selectedText.trim() || selectedText.length < 10

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56 bg-popover border-popover-border shadow-lg">
          {/* Primary Level Menu - Most Common Actions */}
          <ContextMenuSub>
            <ContextMenuSubTrigger 
              disabled={isDisabled}
              className="flex items-center gap-2 text-caption"
            >
              <WandSparkles className="h-4 w-4" />
              ✍️ Rephrase
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-64 bg-popover border-popover-border shadow-lg">
              <ContextMenuItem 
                onClick={() => handleAIAction('rephrase', 'professional', '🧠 More Professional', 'Transform text to use formal, polished business language')}
                className="flex items-center gap-2 text-caption cursor-pointer"
              >
                <Brain className="h-4 w-4" />
                🧠 More Professional
              </ContextMenuItem>
              <ContextMenuItem 
                onClick={() => handleAIAction('rephrase', 'conversational', '💬 More Conversational', 'Simplify and humanize the tone')}
                className="flex items-center gap-2 text-caption cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                💬 More Conversational
              </ContextMenuItem>
              <ContextMenuItem 
                onClick={() => handleAIAction('rephrase', 'creative', '✨ More Creative', 'Add flair, storytelling, or uniqueness')}
                className="flex items-center gap-2 text-caption cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                ✨ More Creative
              </ContextMenuItem>
              <ContextMenuItem 
                onClick={() => handleAIAction('rephrase', 'structured', '🧱 More Structured', 'Improve sentence order, flow, and logic')}
                className="flex items-center gap-2 text-caption cursor-pointer"
              >
                <Square className="h-4 w-4" />
                🧱 More Structured
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuItem 
            onClick={() => handleAIAction('improve', undefined, '🔍 Improve Clarity', 'Refine grammar and remove ambiguity')}
            disabled={isDisabled}
            className="flex items-center gap-2 text-caption cursor-pointer"
          >
            <Edit3 className="h-4 w-4" />
            🔍 Improve Clarity
          </ContextMenuItem>

          <ContextMenuSub>
            <ContextMenuSubTrigger 
              disabled={isDisabled}
              className="flex items-center gap-2 text-caption"
            >
              <ArrowUpDown className="h-4 w-4" />
              📏 Adjust Length
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-64 bg-popover border-popover-border shadow-lg">
              <ContextMenuItem 
                onClick={() => handleAIAction('adjust_length', 'longer', '⬆️ Make Longer', 'Expand content with more detail')}
                className="flex items-center gap-2 text-caption cursor-pointer"
              >
                <ArrowUp className="h-4 w-4" />
                ⬆️ Make Longer
              </ContextMenuItem>
              <ContextMenuItem 
                onClick={() => handleAIAction('adjust_length', 'shorter', '⬇️ Make Shorter', 'Trim content to its core message')}
                className="flex items-center gap-2 text-caption cursor-pointer"
              >
                <ArrowDown className="h-4 w-4" />
                ⬇️ Make Shorter
              </ContextMenuItem>
              <ContextMenuItem 
                onClick={() => handleAIAction('adjust_length', 'summarize', '🧩 Summarize', 'Provide 1-2 sentence summary')}
                className="flex items-center gap-2 text-caption cursor-pointer"
              >
                <List className="h-4 w-4" />
                🧩 Summarize
              </ContextMenuItem>
              <ContextMenuItem 
                onClick={() => handleAIAction('adjust_length', 'expand_example', '📚 Expand with Example', 'Add a real-world example or result')}
                className="flex items-center gap-2 text-caption cursor-pointer"
              >
                <BookOpen className="h-4 w-4" />
                📚 Expand with Example
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuItem 
            onClick={() => handleAIAction('role_specific', undefined, '🎯 Make It Role-Specific', 'Tailor tone and keywords to a job role')}
            disabled={isDisabled}
            className="flex items-center gap-2 text-caption cursor-pointer"
          >
            <Target className="h-4 w-4" />
            🎯 Make It Role-Specific
          </ContextMenuItem>

          {isDisabled && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem disabled className="text-muted-foreground text-micro">
                Select 10+ characters to use AI features
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>

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