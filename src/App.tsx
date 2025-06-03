import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AnalyzeCV from './pages/AnalyzeCV';
import CoverLetter from './pages/CoverLetter';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import Resources from './pages/Resources';
import Contact from './pages/Contact';
import HelpCentre from './pages/HelpCentre';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import SecurityHeaders from './components/SecurityHeaders';
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClient } from '@tanstack/react-query';
import FloatingFeedback from '@/components/common/FloatingFeedback';
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <QueryClient>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
              <SecurityHeaders />
              <Navigation />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<AnalyzeCV />} />
                  <Route path="/analyze" element={<AnalyzeCV />} />
                  <Route path="/cover-letter" element={<CoverLetter />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/help-centre" element={<HelpCentre />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                </Routes>
              </main>
              <Footer />
              <FloatingFeedback />
              <Toaster />
            </ThemeProvider>
          </div>
        </Router>
      </AuthProvider>
    </QueryClient>
  );
}

export default App;
