import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "./lib/store"
import NotFound from "@/pages/user/not-found";
import { Route, Switch, Router as WouterRouter, Link } from "wouter";
import { Crown } from "lucide-react";

import Home from "./pages/user/Home";
import Vote from "./pages/user/Vote";
import Admin from "./pages/admin/Home";

const queryClient = new QueryClient();

function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass-panel border-b-0 border-white/5">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Crown className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-serif font-bold text-lg tracking-wide text-foreground">
            MTU Voting
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            href="/admin"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Admin
          </Link>
          <Link
            href="/vote"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cast Vote
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <div className="pt-16">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/vote" component={Vote} />
        <Route path="/admin" nest component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Navbar />
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
}

export default App;
