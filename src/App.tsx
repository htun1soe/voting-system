import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "./lib/store";
import NotFound from "@/pages/user/not-found";
import { Route, Switch, Router as WouterRouter, Link } from "wouter";

import Navbar from "./layouts/Layout";
// User Pages
import Home from "./pages/user/Home";
import Vote from "./pages/user/Vote";
import VoteResult from "./pages/user/VoteResult";

// Admin Pages
import AdminHome from "./pages/admin/Home";
import Dashboard from "./pages/admin/Dashboard";
import Organizer from "./pages/admin/Organizer";
import Results from "./pages/admin/Results";

// Developer Pages
import Developer from "./pages/developer/Developer";

const queryClient = new QueryClient();

function Router() {
  return (
      <Switch>
        {/* User Routes */}
        <Route path="/" component={Home} />
        <Route path="/q/:public_id/:secret" component={Vote} />
        <Route path="/VoteResult" component={VoteResult} />

        {/* Admin Routes */}
        <Route path="/admin" component={AdminHome} />
        <Route path="/admin/dashboard" component={Dashboard} />
        <Route path="/admin/organizer" component={Organizer} />
        <Route path="/admin/results" component={Results} />

        {/* Developer Routes */}
        <Route path="/developer" component={Developer} />

        {/* Fallback Catch-All Route */}
        <Route component={NotFound} />
      </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <TooltipProvider>
          <WouterRouter base="">
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
}

export default App;