import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import Learn from "./pages/Learn";
import Editor from "./pages/Editor";
import Cheatsheet from "./pages/Cheatsheet";
import Notes from "./pages/Notes";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const App = () => {
  if (!clerkPubKey) {
    throw new Error("Missing Clerk Publishable Key");
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
            <SignedIn>
              <SidebarProvider>
                <div className="flex min-h-screen w-full bg-background">
                  <AppSidebar />
                  <div className="flex-1 flex flex-col">
                    <header className="h-12 flex items-center border-b border-border px-4">
                      <SidebarTrigger />
                    </header>
                    <main className="flex-1 overflow-auto">
                      <Routes>
                        <Route path="/learn" element={<Learn />} />
                        <Route path="/editor" element={<Editor />} />
                        <Route path="/cheatsheet" element={<Cheatsheet />} />
                        <Route path="/notes" element={<Notes />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/" element={<Navigate to="/learn" replace />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </SidebarProvider>
            </SignedIn>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
};

export default App;
