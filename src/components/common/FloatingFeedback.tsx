
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

      {/* Centered Modal */}
      {isOpen && (
        <>
          {/* Enhanced Backdrop with blur */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300 animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Centered Modal Panel */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 animate-scale-in">
              {/* Header */}
              <div className="bg-zapier-orange/10 dark:bg-zapier-orange/5 border-b border-zapier-orange/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-earth dark:text-white flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-zapier-orange" />
                      Share Your Feedback
                    </h2>
                    <p className="text-sm text-earth/70 dark:text-white/70 mt-1">
                      Help us improve TuneMyCV
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-earth/60 hover:text-earth dark:text-white/60 dark:hover:text-white transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Close feedback form"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <FloatingFeedbackForm 
                  onClose={() => setIsOpen(false)} 
                  currentPage={getCurrentPage()}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FloatingFeedback;
