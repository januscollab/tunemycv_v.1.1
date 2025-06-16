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
import { Loader2, RefreshCw, Copy, WandSparkles, Brain, Sparkles } from "lucide-react"
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
      <DialogContent className="bg-background/95 backdrop-blur-sm border border-border max-w-4xl max-h-[80vh] overflow-y-auto animate-scale-in shadow-2xl">
        {/* Clean Header with Subtle AI Branding */}
        <div className="p-4 border-b border-border bg-muted/30 rounded-t-lg -m-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shadow-sm border border-border/50">
              <WandSparkles className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <DialogTitle className="text-heading text-foreground flex items-center gap-2">
                {isLoading ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Brain className="h-5 w-5 text-muted-foreground animate-pulse" />
                        <div className="w-2 h-2 bg-primary rounded-full absolute -top-0.5 -right-0.5"></div>
                      </div>
                      AI Processing...
                    </div>
                  </>
                ) : (
                  <>
                    <WandSparkles className="h-5 w-5 text-muted-foreground" />
                    {actionTitle}
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-body text-muted-foreground">
                {isLoading 
                  ? "Analyzing your text with advanced AI algorithms..."
                  : "Review the AI-enhanced content and apply changes if satisfied."
                }
              </DialogDescription>
            </div>
          </div>
        </div>

        {!isLoading && (
          <div className="space-y-6 animate-fade-in">
            {/* Text Comparison Container */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Original Text */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full"></div>
                  <h4 className="text-caption font-semibold text-foreground">Original Text</h4>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                  <p className="text-body text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {originalText}
                  </p>
                </div>
                <div className="text-micro text-muted-foreground flex items-center gap-1">
                  <span>{originalText.length} characters</span>
                </div>
              </div>

              {/* Generated Text */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <h4 className="text-caption font-semibold text-foreground">AI Enhanced</h4>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className={cn(
                      "text-micro relative overflow-hidden group hover:scale-105 transition-all duration-200",
                      copied && "bg-muted border-muted-foreground/30"
                    )}
                  >
                    <span className="relative z-10 flex items-center gap-1">
                      {copied ? (
                        <>
                          <Sparkles className="h-3 w-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </span>
                    <span className="absolute inset-0 bg-muted/50 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
                  </Button>
                </div>
                <div className="p-4 bg-background border border-border shadow-sm rounded-lg">
                  <p className="text-body text-foreground whitespace-pre-wrap leading-relaxed">
                    {generatedText}
                  </p>
                </div>
                <div className="text-micro text-muted-foreground flex items-center gap-1">
                  <span>{generatedText.length} characters</span>
                  <span className={cn(
                    "ml-2 px-2 py-0.5 rounded-full text-micro font-medium border",
                    generatedText.length > originalText.length 
                      ? "bg-muted/50 text-muted-foreground border-border" 
                      : generatedText.length < originalText.length
                      ? "bg-muted/50 text-muted-foreground border-border"
                      : "bg-muted/50 text-muted-foreground border-border"
                  )}>
                    {generatedText.length > originalText.length 
                      ? `+${generatedText.length - originalText.length}` 
                      : generatedText.length < originalText.length
                      ? `-${originalText.length - generatedText.length}`
                      : "Same length"
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12 animate-fade-in">
            <div className="text-center space-y-6">
              {/* Clean Loading Animation */}
              <div className="relative mx-auto w-16 h-16">
                {/* Outer rotating ring */}
                <div className="absolute inset-0 rounded-full border-4 border-border"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-muted-foreground animate-spin"></div>
                
                {/* Inner circle */}
                <div className="absolute inset-2 rounded-full bg-muted/50 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-muted-foreground animate-pulse" />
                </div>
                
                {/* Subtle indicator dot */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              </div>

              {/* Clean status messages */}
              <div className="space-y-2">
                <p className="text-heading font-semibold text-foreground">
                  AI Processing in Progress
                </p>
                <p className="text-body text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Our advanced language model is analyzing your text, identifying improvements, and crafting enhanced content...
                </p>
                
                {/* Simple progress indicator */}
                <div className="flex justify-center items-center gap-1 mt-4">
                  <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                </div>
              </div>
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