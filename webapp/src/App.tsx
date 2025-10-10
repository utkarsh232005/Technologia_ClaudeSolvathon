import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { useGlobalShortcuts } from "@/hooks/useKeyboardShortcuts";
import Index from "./pages/Index";
import DataGenerator from "./pages/DataGenerator";
import EventClassifier from "./pages/EventClassifier";
import ResultsDashboard from "./pages/ResultsDashboard";
import ReportGenerator from "./pages/ReportGenerator";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  
  // Use global keyboard shortcuts
  useGlobalShortcuts();

  // Handle Ctrl+K for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 min-w-0">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/data-generator" element={<DataGenerator />} />
              <Route path="/classifier" element={<EventClassifier />} />
              <Route path="/results" element={<ResultsDashboard />} />
              <Route path="/reports" element={<ReportGenerator />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<Help />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </SidebarProvider>
      
      <CommandPalette 
        open={commandPaletteOpen} 
        onOpenChange={setCommandPaletteOpen} 
      />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
