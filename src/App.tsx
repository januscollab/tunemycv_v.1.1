
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

import Index from './pages/Index';
import Auth from './pages/Auth';
import AnalyzeCV from './pages/AnalyzeCV';
import CoverLetter from './pages/CoverLetter';
import InterviewPrep from './pages/InterviewPrep';
import InterviewToolkit from './pages/InterviewToolkit';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/admin/AdminRoute';
import Resources from './pages/Resources';
import HelpCentre from './pages/HelpCentre';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

import PricingScale from './pages/PricingScale';
import DesignSystem from './pages/DesignSystem';

import DevSuite from './pages/DevSuite';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import EnhancedSecurityHeaders from './components/security/EnhancedSecurityHeaders';
import FeedbackIntegration from '@/components/common/FeedbackIntegration';
import { Toaster } from "@/components/ui/toaster"

// Create a client
const queryClient = new QueryClient();

// Component to handle scroll to top on route changes
function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen w-full transition-colors duration-normal">
      <EnhancedSecurityHeaders />
      <ScrollToTop />
      <Navigation />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/analyze" element={<AnalyzeCV />} />
          <Route path="/cover-letter" element={<CoverLetter />} />
          <Route path="/cover-letter/view/:id" element={<CoverLetter viewMode={true} />} />
          <Route path="/interview-prep" element={<InterviewPrep />} />
          <Route path="/interview-toolkit" element={<InterviewToolkit />} />
          <Route path="/interview-toolkit/view/:id" element={<InterviewToolkit viewMode={true} />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          
          <Route path="/pricing-scale" element={<PricingScale />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/help-centre" element={<HelpCentre />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/design-system" element={<DesignSystem />} />
          
          <Route path="/devsuite" element={<DevSuite />} />
        </Routes>
      </main>
      <Footer />
      <FeedbackIntegration />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <TooltipProvider delayDuration={300} skipDelayDuration={100}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <Router>
                <AppContent />
              </Router>
            </AuthProvider>
          </QueryClientProvider>
        </TooltipProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
