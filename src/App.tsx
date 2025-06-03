
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AnalyzeCV from "./pages/AnalyzeCV";
import CoverLetter from "./pages/CoverLetter";
import InterviewPrep from "./pages/InterviewPrep";
import Profile from "./pages/Profile";
import Resources from "./pages/Resources";
import HelpCentre from "./pages/HelpCentre";
import ContactUs from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NextSteps from "./pages/NextSteps";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/admin/AdminRoute";
import OAuthCallback from "./components/auth/OAuthCallback";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <div className="min-h-screen flex flex-col">
                <Navigation />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/auth/callback" element={<OAuthCallback />} />
                    <Route path="/analyze" element={<AnalyzeCV />} />
                    <Route path="/cover-letter" element={<CoverLetter />} />
                    <Route path="/interview-prep" element={<InterviewPrep />} />
                    <Route path="/resources" element={<Resources />} />
                    <Route path="/help" element={<HelpCentre />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/next-steps" element={<NextSteps />} />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
              <Toaster />
              <Sonner />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
