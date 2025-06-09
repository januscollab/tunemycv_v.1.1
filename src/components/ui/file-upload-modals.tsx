import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle, Zap } from 'lucide-react';
import { Progress } from './progress';
import { Button } from './button';
import { BounceLoader, WaveLoader, PulseRing, MorphingDots } from './progress-indicator';

interface FileUploadModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onCancel?: () => void;
  variant?: 'minimal' | 'engaging' | 'animated';
}

// Variant 1: Minimal Clean Modal
export const MinimalUploadModal: React.FC<FileUploadModalProps> = ({ 
  isOpen, 
  title = "Processing Document", 
  message = "Extracting text from your document...",
  onCancel
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 10;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-background rounded-lg p-8 text-center max-w-md shadow-lg border">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-heading font-semibold text-foreground flex-1">{title}</h3>
          {onCancel && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="h-6 w-6 -mt-1"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          <Progress value={Math.min(progress, 95)} className="w-full mb-2" />
          <div className="text-caption text-muted-foreground">
            {Math.round(Math.min(progress, 95))}% complete
          </div>
        </div>
        
        <p className="text-caption text-muted-foreground mb-4">
          {message}
        </p>

        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            size="sm"
            className="w-full"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

// Variant 2: Engaging Interactive Modal
export const EngagingUploadModal: React.FC<FileUploadModalProps> = ({ 
  isOpen, 
  title = "Processing Your Document", 
  message = "We're extracting and analyzing your content...",
  onCancel
}) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);

  const stages = [
    { icon: Upload, label: "Uploading", color: "text-blue-500" },
    { icon: FileText, label: "Extracting", color: "text-yellow-500" },
    { icon: Zap, label: "Processing", color: "text-purple-500" },
    { icon: CheckCircle, label: "Finalizing", color: "text-green-500" }
  ];

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setStage(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 8;
        
        // Update stage based on progress
        if (newProgress > 75) setStage(3);
        else if (newProgress > 50) setStage(2);
        else if (newProgress > 25) setStage(1);
        else setStage(0);
        
        return Math.min(newProgress, 95);
      });
    }, 600);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const CurrentIcon = stages[stage].icon;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-background rounded-lg p-8 text-center max-w-md shadow-lg border">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-heading font-semibold text-foreground flex-1">{title}</h3>
          {onCancel && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="h-6 w-6 -mt-1"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center relative">
            <CurrentIcon className={`h-10 w-10 ${stages[stage].color} transition-all duration-500`} />
            <div className="absolute -inset-2 border-2 border-primary/20 rounded-full animate-ping" />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-center space-x-2 mb-2">
              {stages.map((stageItem, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index <= stage ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <p className={`text-caption font-medium transition-colors duration-300 ${stages[stage].color}`}>
              {stages[stage].label}...
            </p>
          </div>
          
          <Progress value={Math.min(progress, 95)} className="w-full mb-2" />
          <div className="text-caption text-muted-foreground">
            {Math.round(Math.min(progress, 95))}% complete
          </div>
        </div>
        
        <p className="text-caption text-muted-foreground mb-4">
          {message}
        </p>

        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            size="sm"
            className="w-full"
          >
            Cancel Upload
          </Button>
        )}
      </div>
    </div>
  );
};

// Variant 3: Animated Playful Modal
export const AnimatedUploadModal: React.FC<FileUploadModalProps> = ({ 
  isOpen, 
  title = "Magic in Progress", 
  message = "Transforming your document with AI...",
  onCancel
}) => {
  const [progress, setProgress] = useState(0);
  const [animationType, setAnimationType] = useState(0);

  const animations = [
    { component: BounceLoader, label: "Loading" },
    { component: WaveLoader, label: "Analyzing" },
    { component: PulseRing, label: "Processing" },
    { component: MorphingDots, label: "Finalizing" }
  ];

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setAnimationType(0);
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 12, 95));
    }, 700);

    const animationInterval = setInterval(() => {
      setAnimationType(prev => (prev + 1) % animations.length);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(animationInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const CurrentAnimation = animations[animationType].component;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-background rounded-lg p-8 text-center max-w-md shadow-lg border overflow-hidden relative">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 animate-pulse" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-heading font-semibold text-foreground flex-1">{title}</h3>
            {onCancel && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onCancel}
                className="h-6 w-6 -mt-1"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary/20 via-warning/10 to-success/20 rounded-full flex items-center justify-center relative">
              <CurrentAnimation size="lg" />
              <div className="absolute -inset-4 border border-primary/10 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            
            <div className="mb-4">
              <p className="text-caption font-medium text-primary mb-2 transition-all duration-500">
                {animations[animationType].label}...
              </p>
              <div className="flex justify-center space-x-1 mb-3">
                {animations.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      index === animationType ? 'bg-primary scale-125' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className="relative">
              <Progress value={Math.min(progress, 95)} className="w-full mb-2 h-2" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-[-100%] animate-pulse" style={{ animationDuration: '2s' }} />
            </div>
            <div className="text-caption text-muted-foreground">
              {Math.round(Math.min(progress, 95))}% complete
            </div>
          </div>
          
          <p className="text-caption text-muted-foreground mb-4 italic">
            {message}
          </p>

          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              size="sm"
              className="w-full hover:scale-105 transition-transform"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default {
  MinimalUploadModal,
  EngagingUploadModal,
  AnimatedUploadModal
};