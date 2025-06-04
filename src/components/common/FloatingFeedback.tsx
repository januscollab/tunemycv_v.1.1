
import React, { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { FloatingFeedbackForm } from './FloatingFeedbackForm';
import { useLocation } from 'react-router-dom';

const FloatingFeedback = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Get current page context
  const getCurrentPage = () => {
    const pathname = location.pathname;
    if (pathname === '/') return 'homepage';
    if (pathname.includes('/analyze')) return 'analyze';
    if (pathname.includes('/resources')) return 'resources';
    if (pathname.includes('/profile')) return 'profile';
    return 'default';
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <>
      {/* Bottom-Right Expandable Feedback Tab */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <button
          onClick={handleOpen}
          className="relative bg-zapier-orange hover:bg-zapier-orange/90 text-white shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/10 rounded-lg overflow-visible transition-all duration-300 ease-out w-12 h-12 group-hover:w-[140px] hover:scale-105"
          aria-label="Open feedback form"
        >
          {/* Icon Container - Always Visible */}
          <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
          </div>
          
          {/* Text Container - Expands on Hover */}
          <div className="absolute left-12 top-0 h-12 flex items-center px-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
            <span className="text-sm font-medium tracking-wide">
              Feedback
            </span>
          </div>
        </button>
      </div>

      {/* Enhanced Slide-out Panel */}
      {isOpen && (
        <>
          {/* Enhanced Backdrop with blur */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300 animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Glassmorphism Panel */}
          <div className="fixed right-0 top-0 h-full w-[420px] bg-white/95 dark:bg-blueberry/95 backdrop-blur-xl shadow-2xl z-50 transform transition-all duration-500 ease-out animate-slide-in-right border-l border-white/20 dark:border-citrus/10">
            <div className="flex flex-col h-full">
              {/* Enhanced Header */}
              <div className="relative p-6 border-b border-apple-core/10 dark:border-citrus/10 bg-gradient-to-r from-zapier-orange/5 to-transparent">
                <div className="absolute inset-0 bg-white/50 dark:bg-blueberry/30 backdrop-blur-sm" />
                <div className="relative flex items-center justify-between">
                  <div className="animate-fade-in">
                    <h2 className="text-2xl font-bold text-blueberry dark:text-white">
                      Share Your Feedback
                    </h2>
                    <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mt-2">
                      🚀 Help us shape the future of TuneMyCV
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-blueberry/60 hover:text-blueberry dark:text-apple-core/60 dark:hover:text-apple-core transition-all duration-200 hover:scale-110 p-2 rounded-full hover:bg-surface/20"
                    aria-label="Close feedback form"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <FloatingFeedbackForm 
                  onClose={() => setIsOpen(false)} 
                  currentPage={getCurrentPage()}
                />
              </div>

              {/* Enhanced Footer */}
              <div className="p-6 border-t border-apple-core/10 dark:border-citrus/10 bg-surface/30 dark:bg-blueberry/20 backdrop-blur-sm">
                <div className="text-center space-y-2">
                  <p className="text-xs text-blueberry/60 dark:text-apple-core/70">
                    Need immediate help?
                  </p>
                  <a 
                    href="mailto:hello@tunemycv.com" 
                    className="inline-flex items-center text-sm text-zapier-orange hover:text-zapier-orange/80 transition-colors hover:underline font-medium"
                  >
                    Email us at hello@tunemycv.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FloatingFeedback;
