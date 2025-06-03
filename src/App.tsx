
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Index from './pages/Index';
import Auth from './pages/Auth';
import AnalyzeCV from './pages/AnalyzeCV';
import CoverLetter from './pages/CoverLetter';
import InterviewPrep from './pages/InterviewPrep';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/admin/AdminRoute';
import Resources from './pages/Resources';
import HelpCentre from './pages/HelpCentre';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import SecurityHeaders from './components/SecurityHeaders';
import FloatingFeedback from '@/components/common/FloatingFeedback';
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <SecurityHeaders />
            <ScrollToTop />
            <Navigation />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/analyze" element={<AnalyzeCV />} />
                <Route path="/cover-letter" element={<CoverLetter />} />
                <Route path="/interview-prep" element={<InterviewPrep />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/help-centre" element={<HelpCentre />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
              </Routes>
            </main>
            <Footer />
            <FloatingFeedback />
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
