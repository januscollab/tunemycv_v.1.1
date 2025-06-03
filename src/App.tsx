
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import AnalyzeCV from './pages/AnalyzeCV';
import CoverLetter from './pages/CoverLetter';
import InterviewPrep from './pages/InterviewPrep';
import Profile from './pages/Profile';
import Resources from './pages/Resources';
import HelpCentre from './pages/HelpCentre';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import SecurityHeaders from './components/SecurityHeaders';
import FloatingFeedback from '@/components/common/FloatingFeedback';
import { Toaster } from "@/components/ui/toaster"

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <SecurityHeaders />
            <Navigation />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<AnalyzeCV />} />
                <Route path="/analyze" element={<AnalyzeCV />} />
                <Route path="/cover-letter" element={<CoverLetter />} />
                <Route path="/interview-prep" element={<InterviewPrep />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/help-centre" element={<HelpCentre />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
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
