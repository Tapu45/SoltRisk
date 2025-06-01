"use client";

import { useState, useEffect } from "react";
import { Bell, Search, X, Loader2, Menu, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSearch } from "../../context/searchProvider";
import AutoBreadcrumbs from "./Auto-breadcrumb";
import Sidebar from "./sidebar";

interface HeaderProps {
  showMobileSidebar?: boolean;
  showBreadcrumbs?: boolean;
}

export default function Header({ showMobileSidebar = true, showBreadcrumbs = true }: HeaderProps) {
  const [notifications, setNotifications] = useState<number>(21);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { searchTerm, setSearchTerm, handleSearch, clearSearch, isSearching } = useSearch();

  // Handle form submission
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  // Listen for keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <motion.div 
      className="sticky top-0 z-30"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Compact unified header container with enhanced glassmorphism */}
      <div className="relative backdrop-blur-2xl bg-gradient-to-r from-white/95 via-white/98 to-white/95 shadow-xl shadow-black/5">
        {/* Refined background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-50/30 via-blue-50/20 to-cyan-50/30" />
        
        {/* Subtle border gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-200/60 to-transparent" />

        {/* Compact main header section */}
        <motion.header 
          className="relative h-12 flex items-center justify-between px-3 lg:px-4"
          layout
        >
          <div className="flex items-center gap-2 flex-1">
            {/* Compact Mobile sidebar toggle */}
            <div className="lg:hidden">
              {showMobileSidebar && (
                <Sheet>
                  <SheetTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button variant="ghost" size="icon" className="relative overflow-hidden group h-8 w-8 rounded-lg">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-teal-500/15 to-blue-500/15 rounded-lg"
                          initial={{ scale: 0, opacity: 0 }}
                          whileHover={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                        <motion.div
                          whileHover={{ rotate: 45 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="relative z-10"
                        >
                          <Menu className="h-4 w-4 text-gray-600 group-hover:text-teal-600 transition-colors" />
                        </motion.div>
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </motion.div>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-[280px]">
                    <Sidebar />
                  </SheetContent>
                </Sheet>
              )}
            </div>

            {/* Compact Premium Search Bar */}
            <form onSubmit={onSubmit} className="flex-1 max-w-md">
              <motion.div 
                className="relative group"
                animate={{ 
                  scale: isSearchFocused ? 1.005 : 1,
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {/* Subtle search bar glow */}
                <motion.div
                  className="absolute -inset-0.5 bg-gradient-to-r from-teal-400/20 via-blue-400/20 to-cyan-400/20 rounded-lg blur-sm"
                  animate={{
                    opacity: isSearchFocused ? 0.3 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                />
                
                <div className="relative flex items-center border border-gray-200/50 rounded-lg bg-white/80 backdrop-blur-md overflow-hidden transition-all duration-200 hover:border-teal-300/60 hover:shadow-sm hover:bg-white/90 h-8">
                  <div className="pl-2.5">
                    <AnimatePresence mode="wait">
                      {isSearching ? (
                        <motion.div
                          key="loading"
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 90 }}
                          transition={{ duration: 0.3, ease: "backOut" }}
                        >
                          <Loader2 className="h-3.5 w-3.5 text-teal-500 animate-spin" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="search"
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2, ease: "backOut" }}
                        >
                          <Search className="h-3.5 w-3.5 text-gray-500 group-hover:text-teal-600 transition-colors duration-200" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <Input 
                    id="search-input"
                    placeholder="Search..." 
                    className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 pl-2 text-gray-700 placeholder:text-gray-400 bg-transparent h-6 text-sm font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                  />
                  
                  {/* Compact keyboard shortcut */}
                  <AnimatePresence>
                    {!isSearchFocused && !searchTerm && (
                      <motion.div
                        initial={{ opacity: 0, x: 15, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 15, scale: 0.9 }}
                        className="hidden sm:flex items-center pr-2.5"
                      >
                        <motion.kbd 
                          className="px-1 py-0.5 text-xs font-medium text-gray-500 bg-gradient-to-br from-gray-100/90 to-gray-200/90 border border-gray-300/60 rounded-md shadow-sm backdrop-blur-sm"
                          whileHover={{ scale: 1.02, y: -0.5 }}
                          transition={{ duration: 0.1 }}
                        >
                          ⌘K
                        </motion.kbd>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Compact clear button */}
                  <AnimatePresence>
                    {searchTerm && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0, x: 8 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0, x: 8 }}
                        transition={{ duration: 0.15, ease: "backOut" }}
                      >
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 px-0 hover:bg-red-50/80 group/clear mr-1" 
                          onClick={clearSearch}
                        >
                          <motion.div
                            whileHover={{ rotate: 90, scale: 1.05 }}
                            transition={{ duration: 0.15 }}
                          >
                            <X className="h-3 w-3 text-gray-400 group-hover/clear:text-red-500 transition-colors" />
                          </motion.div>
                          <span className="sr-only">Clear search</span>
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </form>
          </div>

          {/* Compact Notification Bell */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 hover:from-slate-700 hover:via-slate-600 hover:to-slate-800 shadow-lg border border-slate-600/30 transition-all duration-200 overflow-hidden group"
            >
              <motion.div
                className="relative z-10"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
              >
                <Bell className="h-3.5 w-3.5 text-white group-hover:text-amber-300 transition-colors duration-200" />
              </motion.div>
              
              <AnimatePresence>
                {notifications > 0 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-0.5 -right-0.5"
                  >
                    <motion.span 
                      className="relative h-4 w-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-md z-10"
                      animate={{ 
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {notifications > 99 ? '9+' : notifications > 9 ? '9+' : notifications}
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </motion.header>

        {/* Compact Unified Breadcrumb Section */}
        <AnimatePresence>
          {showBreadcrumbs && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="relative overflow-hidden"
            >
              {/* Subtle breadcrumb background */}
              <div className="absolute inset-0 bg-gradient-to-r from-teal-50/40 via-white/20 to-blue-50/40" />
              
              {/* Top border gradient */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-200/40 to-transparent" />
              
              <motion.div
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="relative z-10 px-3 lg:px-4 py-1.5"
              >
                <AutoBreadcrumbs compact={true} maxItems={5} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}