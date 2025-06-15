import * as React from "react"
import { useState } from "react"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface AIReplacementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  originalText: string
  generatedText: string
  actionTitle: string
  isLoading?: boolean
  onAccept: () => void
  onRegenerate?: () => void
}

const AIReplacementDialog: React.FC<AIReplacementDialogProps> = ({
  open,
  onOpenChange,
  originalText,
  generatedText,
  actionTitle,
  isLoading = false,
  onAccept,
  onRegenerate
}) => {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedText)
      setCopied(true)
      toast({
        title: "Copied to clipboard",
        description: "The generated text has been copied to your clipboard."
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy text to clipboard.",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-popover-border max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-heading text-foreground flex items-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              actionTitle
            )}
          </DialogTitle>
          <DialogDescription className="text-body text-foreground-secondary">
            {isLoading 
              ? "AI is processing your text. This may take a moment..."
              : "Review the AI-generated changes and choose whether to apply them."
            }
          </DialogDescription>
        </DialogHeader>

        {!isLoading && (
          <div className="space-y-4">
            {/* Original Text */}
            <div className="space-y-2">
              <h4 className="text-caption font-medium text-foreground">Original Text:</h4>
              <div className="p-3 bg-accent/50 rounded-md border border-border">
                <p className="text-body text-foreground-secondary whitespace-pre-wrap">
                  {originalText}
                </p>
              </div>
            </div>

            {/* Generated Text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-caption font-medium text-foreground">AI Generated Text:</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="text-micro"
                >
                  {copied ? (
                    "Copied!"
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="p-3 bg-primary/5 rounded-md border border-primary/20">
                <p className="text-body text-foreground whitespace-pre-wrap">
                  {generatedText}
                </p>
              </div>
            </div>

            {/* Character count comparison */}
            <div className="flex justify-between text-micro text-foreground-secondary">
              <span>Original: {originalText.length} characters</span>
              <span>Generated: {generatedText.length} characters</span>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-body text-foreground-secondary">
                AI is analyzing and improving your text...
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="text-foreground-secondary relative overflow-hidden group"
          >
            <span className="relative z-10">Cancel</span>
            <span className="absolute inset-0 bg-gradient-to-r from-foreground/5 to-foreground/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
          </Button>
          
          {!isLoading && onRegenerate && (
            <Button
              variant="outline"
              onClick={onRegenerate}
              className="gap-2 text-foreground-secondary relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-foreground/5 to-foreground/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
            </Button>
          )}
          
          {!isLoading && (
            <Button
              onClick={() => {
                onAccept()
                onOpenChange(false)
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 relative overflow-hidden group"
            >
              <span className="relative z-10">Apply Changes</span>
              <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { AIReplacementDialog }