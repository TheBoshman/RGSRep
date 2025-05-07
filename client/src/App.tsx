import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { ThemeProvider } from "next-themes";
import { SearchHistoryProvider } from "./contexts/SearchHistoryContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { CompareProvider } from "./contexts/CompareContext";

// Define routes for our application
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {/* Wrap the app with our context providers */}
          <SearchHistoryProvider>
            <FavoritesProvider>
              <CompareProvider>
                <Toaster />
                <Router />
              </CompareProvider>
            </FavoritesProvider>
          </SearchHistoryProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
