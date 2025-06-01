"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  ArrowLeft, 
  Hammer,
  HardHat,
  Wrench,
  Cog,
  Sparkles,
  Coffee,
  Clock,
  Building,
  Settings,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Fixed Floating particles component
const FloatingParticles = () => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const particles = Array.from({ length: 15 }, (_, i) => i);
  
  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  if (windowSize.width === 0) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle}
          className="absolute w-1 h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full opacity-60"
          initial={{
            x: Math.random() * windowSize.width,
            y: Math.random() * windowSize.height,
          }}
          animate={{
            x: Math.random() * windowSize.width,
            y: Math.random() * windowSize.height,
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

// Animated construction text
const AnimatedConstruction = () => {
  const funnyMessages = [
    "🚧 OOPS! 🚧",
    "👷‍♂️ BUILDING... 👷‍♀️",
    "🔨 HAMMERING AWAY! 🔨"
  ];
  
  const [currentMessage, setCurrentMessage] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % funnyMessages.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <motion.div
        key={currentMessage}
        initial={{ opacity: 0, scale: 0.5, rotateX: -90 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.5, rotateX: 90 }}
        transition={{ duration: 0.8, ease: "backOut" }}
        className="text-6xl md:text-8xl font-black bg-gradient-to-br from-teal-400 via-blue-500 to-purple-600 bg-clip-text text-transparent relative"
      >
        {funnyMessages[currentMessage]}
        
        {/* Glowing effect */}
        <motion.div
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 text-6xl md:text-8xl font-black bg-gradient-to-br from-teal-400 via-blue-500 to-purple-600 bg-clip-text text-transparent blur-sm"
        >
          {funnyMessages[currentMessage]}
        </motion.div>
      </motion.div>
      
      {/* Floating construction tools */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none"
      >
        {[Hammer, HardHat, Wrench, Cog].map((Icon, index) => (
          <motion.div
            key={index}
            className="absolute w-8 h-8 text-teal-400/60"
            style={{
              top: `${50 + 35 * Math.cos((index * Math.PI) / 2)}%`,
              left: `${50 + 35 * Math.sin((index * Math.PI) / 2)}%`,
            }}
            animate={{
              y: [-8, 8, -8],
              rotate: [0, 10, -10, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 2.5 + index * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon className="w-full h-full" />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

// Popular pages suggestions
const popularPages = [
  { name: "Dashboard", href: "/admin/dashboard", icon: Home },
  { name: "Organizations", href: "/admin/organization/view", icon: Building },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

const funnyQuotes = [
  "Our developers are currently caffeinated and coding furiously! ☕",
  "We're building something awesome! (Like really awesome!) ✨",
  "Please hold while we sprinkle some digital magic dust! 🪄",
  "Our hamsters are running extra fast on their wheels! 🐹",
  "Currently debugging the bugs that debug other bugs! 🐛"
];

export default function NotFoundPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % funnyQuotes.length);
    }, 4000);
    
    return () => clearInterval(quoteInterval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40 relative overflow-hidden">
      {/* Animated background */}
      <FloatingParticles />
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(15 23 42) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Construction Animation */}
          <motion.div variants={itemVariants} className="mb-8">
            <AnimatedConstruction />
          </motion.div>

          {/* Main content */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
              Page Under Construction!
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-4">
              Whoops! Looks like our digital construction crew is still working on this page.
            </p>
            
            {/* Funny rotating quotes */}
            <motion.div
              key={currentQuote}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-gray-500 italic min-h-[2rem] flex items-center justify-center"
            >
              {funnyQuotes[currentQuote]}
            </motion.div>
          </motion.div>

          {/* Construction status card */}
          <motion.div variants={itemVariants} className="mb-10">
            <Card className="max-w-lg mx-auto border-0 bg-white/80 backdrop-blur-sm shadow-xl shadow-black/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Cog className="w-6 h-6 text-teal-500" />
                  </motion.div>
                  <h3 className="font-semibold text-gray-800">Construction Progress</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Coffee className="w-4 h-4 text-blue-600" />
                    </motion.div>
                    <span className="text-sm text-gray-600">Developers caffeinated ✓</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Hammer className="w-4 h-4 text-teal-600" />
                    </motion.div>
                    <span className="text-sm text-gray-600">Code hammering in progress... ⏳</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Zap className="w-4 h-4 text-purple-500" />
                    </motion.div>
                    <span className="text-sm text-gray-600">Adding awesome features... ⚡</span>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-teal-500 to-blue-500"
                    animate={{ width: ["0%", "75%", "0%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  ETA: Soon™ (Developer time may vary)
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => router.back()}
                variant="outline"
                size="lg"
                className="group bg-white/80 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                Go Back
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/admin/dashboard">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-lg group"
                >
                  <Home className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                  Back to Home
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Popular pages */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold text-gray-800 mb-6">
              Meanwhile, check out these completed pages:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {popularPages.map((page, index) => (
                <motion.div
                  key={page.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ 
                    scale: 1.05,
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href={page.href}>
                    <Card className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-200 cursor-pointer group shadow-lg hover:shadow-xl">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                          <page.icon className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-medium text-gray-800 group-hover:text-teal-600 transition-colors duration-200">
                          {page.name}
                        </h4>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Fun fact */}
          <motion.div 
            variants={itemVariants}
            className="mt-16 p-6 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/50 max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-teal-500" />
              <span className="text-sm font-semibold text-gray-700">Developer Wisdom</span>
              <Sparkles className="w-5 h-5 text-teal-500" />
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              "There are only 10 types of people in the world: those who understand binary and those who don't. 
              Our developers are definitely the first type... we think! 🤔"
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}