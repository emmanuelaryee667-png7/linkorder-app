import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import OrderForm from "./components/OrderForm";

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    // Listen for back/forward browser navigation
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Helper to trigger SPA transitions
  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    // Scroll to top on navigation for better user experience
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Router dispatcher
  if (currentPath === "/" || !currentPath) {
    return <LandingPage onNavigate={navigate} />;
  }

  if (currentPath.startsWith("/dashboard/")) {
    const slug = currentPath.substring("/dashboard/".length);
    return <Dashboard slug={slug} onNavigate={navigate} />;
  }

  // Fallback to customer-facing order form page (/:slug)
  const slug = currentPath.substring(1); // Strip leading slash
  if (slug) {
    return <OrderForm slug={slug} onNavigate={navigate} />;
  }

  // Catch-all back to home
  return <LandingPage onNavigate={navigate} />;
}
