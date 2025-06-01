"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  ChevronRight,
  Plus,
  Edit,
  Eye,
  Settings,
  BarChart3,
  Users,
  Building2,
  FileText,
  Shield,
  ShoppingBag,
  Calendar,
  Briefcase,
  User,
  Star,
  Folder,
  Grid,
  Database,
  Activity,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import React from "react";

interface AutoBreadcrumbsProps {
  className?: string;
  showIcons?: boolean;
  compact?: boolean;
  maxItems?: number;
}

interface BreadcrumbItemData {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isAction?: boolean;
  depth: number;
  segment: string;
  colorIntensity: number;
}

// Dynamic icon resolver based on segment patterns
const getIconForSegment = (segment: string, context: string[] = []) => {
  const iconPatterns = [
    // Actions
    { patterns: ['create', 'add', 'new'], icon: Plus },
    { patterns: ['edit', 'update', 'modify'], icon: Edit },
    { patterns: ['view', 'show', 'display', 'all', 'list'], icon: Eye },
    { patterns: ['settings', 'config', 'preferences'], icon: Settings },
    
    // Entities
    { patterns: ['dashboard', 'analytics', 'stats', 'reports'], icon: BarChart3 },
    { patterns: ['users', 'people', 'members', 'staff', 'clients'], icon: Users },
    { patterns: ['organization', 'company', 'companies'], icon: Building2 },
    { patterns: ['vendor', 'suppliers', 'partners'], icon: ShoppingBag },
    { patterns: ['documents', 'files', 'papers'], icon: FileText },
    { patterns: ['security', 'risk', 'assessment', 'compliance'], icon: Shield },
    { patterns: ['calendar', 'schedule', 'events'], icon: Calendar },
    { patterns: ['projects', 'tasks', 'work', 'engagements'], icon: Briefcase },
    { patterns: ['profile', 'account', 'personal'], icon: User },
    { patterns: ['admin', 'management', 'control'], icon: Star },
    { patterns: ['data', 'storage', 'records'], icon: Database },
    { patterns: ['activity', 'logs', 'history'], icon: Activity },
    { patterns: ['layers', 'levels', 'tiers'], icon: Layers },
  ];

  // Check patterns
  for (const pattern of iconPatterns) {
    if (pattern.patterns.some(p => segment.toLowerCase().includes(p))) {
      return pattern.icon;
    }
  }

  // Context-based fallback
  if (context.length > 0) {
    const parentSegment = context[context.length - 1];
    for (const pattern of iconPatterns) {
      if (pattern.patterns.some(p => parentSegment.toLowerCase().includes(p))) {
        return pattern.icon;
      }
    }
  }

  // ID or numeric patterns
  if (segment.match(/^[0-9a-fA-F-]{8,}$/) || segment.match(/^\d+$/)) {
    return Eye;
  }
  
  return Folder;
};

// Dynamic color intensity calculator using mathematical approach
const calculateColorIntensity = (segment: string, depth: number, isAction: boolean) => {
  // Generate consistent hash from segment
  const hash = segment.split('').reduce((acc, char, index) => {
    return acc + char.charCodeAt(0) * (index + 1);
  }, 0);
  
  // Create intensity based on hash, depth, and action status
  const baseIntensity = (hash % 3) + 1; // 1-3 range
  const depthModifier = Math.min(depth * 0.5, 2); // 0-2 range
  const actionModifier = isAction ? 1.5 : 0; // Action boost
  
  return Math.min(baseIntensity + depthModifier + actionModifier, 5);
};

// Dynamic styling generator using teal/blue palette
const generateDynamicStyles = (intensity: number, depth: number, isAction: boolean, isLast: boolean) => {
  // Teal-Blue gradient system
  const colorMap = {
    1: { primary: 'teal-400', secondary: 'blue-400', bg: 'teal-50', border: 'teal-200' },
    2: { primary: 'teal-500', secondary: 'blue-500', bg: 'teal-100', border: 'teal-300' },
    3: { primary: 'teal-600', secondary: 'blue-600', bg: 'blue-50', border: 'blue-200' },
    4: { primary: 'blue-600', secondary: 'teal-600', bg: 'blue-100', border: 'blue-300' },
    5: { primary: 'blue-700', secondary: 'teal-700', bg: 'blue-200', border: 'blue-400' },
  };

  const intensityLevel = Math.min(Math.max(Math.round(intensity), 1), 5) as keyof typeof colorMap;
  const colors = colorMap[intensityLevel];

  // Generate opacity based on depth
  const opacityLevel = Math.max(30, 100 - (depth * 15));

  if (isLast) {
    return {
      text: `text-${colors.primary}`,
      bg: `from-${colors.bg} via-white to-${colors.bg}`,
      border: `border-${colors.border}/${opacityLevel}`,
      shadow: isAction ? 'shadow-md' : 'shadow-sm',
      ring: `focus:ring-${colors.primary}/30`,
    };
  }

  return {
    text: `text-slate-600 hover:text-${colors.primary}`,
    bg: `hover:bg-${colors.bg}/${opacityLevel}`,
    border: `hover:border-${colors.border}/${opacityLevel}`,
    shadow: 'hover:shadow-sm',
    decoration: `decoration-${colors.secondary}`,
  };
};

// Smart label generator with context awareness
const generateSmartLabel = (segment: string, index: number, allSegments: string[]) => {
  // ID detection
  if (segment.match(/^[0-9a-fA-F-]{8,}$/) || segment.match(/^\d+$/)) {
    const prevSegment = allSegments[index - 1];
    if (prevSegment) {
      const entityType = prevSegment.endsWith('s') ? prevSegment.slice(0, -1) : prevSegment;
      return `${enhancedTitleCase(entityType)} Details`;
    }
    return 'Item Details';
  }

  const isLastSegment = index === allSegments.length - 1;
  const prevSegment = allSegments[index - 1];

  // Action detection for last segment
  if (isLastSegment && prevSegment) {
    const actionMappings = [
      { triggers: ['create', 'add', 'new'], prefix: 'Create' },
      { triggers: ['edit', 'update', 'modify'], prefix: 'Edit' },
      { triggers: ['view', 'all', 'list'], prefix: 'View All', isPlural: true },
      { triggers: ['delete', 'remove'], prefix: 'Delete' },
      { triggers: ['settings', 'config'], prefix: 'Configure' },
    ];

    for (const mapping of actionMappings) {
      if (mapping.triggers.includes(segment.toLowerCase())) {
        const entityType = prevSegment.endsWith('s') && !mapping.isPlural 
          ? prevSegment.slice(0, -1) 
          : prevSegment;
        
        if (mapping.isPlural) {
          return `${mapping.prefix} ${enhancedTitleCase(prevSegment)}`;
        }
        return `${mapping.prefix} ${enhancedTitleCase(entityType)}`;
      }
    }
  }

  return enhancedTitleCase(segment);
};

export default function AutoBreadcrumbs({ 
  className, 
  showIcons = true, 
  compact = false,
  maxItems = 6
}: AutoBreadcrumbsProps) {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItemData[]>([]);

  // Memoized breadcrumb generation with enhanced logic
  const generatedBreadcrumbs = useMemo(() => {
    const HomeIcon = React.createElement(Home, { className: "h-3 w-3" });
    
    const crumbs: BreadcrumbItemData[] = [{ 
      label: "Home", 
      href: "/", 
      icon: showIcons ? HomeIcon : undefined,
      isAction: false,
      depth: 0,
      segment: 'home',
      colorIntensity: 1
    }];

    if (pathname === "/") return crumbs;

    const pathWithoutInitialSlash = pathname.startsWith('/') ? pathname.substring(1) : pathname;
    const segments = pathWithoutInitialSlash.split('/').filter(Boolean);
    
    let currentPath = '';
    
    segments.forEach((segment, i) => {
      currentPath += `/${segment}`;
      
      const label = generateSmartLabel(segment, i, segments);
      const isAction = ['create', 'add', 'new', 'edit', 'update', 'modify', 'delete', 'remove'].includes(segment.toLowerCase()) ||
                      !!segment.match(/^[0-9a-fA-F-]{8,}$/) || 
                      !!segment.match(/^\d+$/);
      
      const colorIntensity = calculateColorIntensity(segment, i + 1, isAction);
      const IconComponent = showIcons ? getIconForSegment(segment, segments.slice(0, i)) : null;
      
      crumbs.push({
        label,
        href: i === segments.length - 1 ? undefined : currentPath,
        icon: IconComponent ? React.createElement(IconComponent, { className: "h-3 w-3" }) : undefined,
        isAction,
        depth: i + 1,
        segment: segment.toLowerCase(),
        colorIntensity
      });
    });
    
    return crumbs;
  }, [pathname, showIcons]);

  useEffect(() => {
    setBreadcrumbs(generatedBreadcrumbs);
  }, [generatedBreadcrumbs]);

  // Smart truncation logic
  const displayBreadcrumbs = useMemo(() => {
    if (!compact || breadcrumbs.length <= maxItems) {
      return breadcrumbs;
    }

    const first = breadcrumbs[0];
    const last = breadcrumbs[breadcrumbs.length - 1];
    const secondLast = breadcrumbs[breadcrumbs.length - 2];
    
    // Include important middle items based on action status
    const importantMiddleItems = breadcrumbs.slice(1, -2).filter(item => item.isAction);
    const middleItem = importantMiddleItems[0] || breadcrumbs[Math.floor(breadcrumbs.length / 2)];
    
    return [
      first,
      { 
        label: '···', 
        href: undefined, 
        icon: undefined, 
        isAction: false, 
        depth: 0, 
        segment: 'ellipsis',
        colorIntensity: 1
      },
      middleItem,
      secondLast,
      last
    ].filter(Boolean);
  }, [breadcrumbs, compact, maxItems]);

  return (
    <div className={cn("flex items-center", className)}>
      <Breadcrumb>
        <BreadcrumbList className="flex flex-wrap items-center gap-0.5">
          <AnimatePresence mode="popLayout">
            {displayBreadcrumbs.map((crumb, idx) => {
              if (crumb.segment === 'ellipsis') {
                return (
                  <motion.span
                    key="ellipsis"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="text-slate-400 text-xs px-1.5 font-medium select-none"
                  >
                    {crumb.label}
                  </motion.span>
                );
              }

              const isLast = idx === displayBreadcrumbs.length - 1;
              const styles = generateDynamicStyles(crumb.colorIntensity, crumb.depth, crumb.isAction, isLast);
              
              return (
                <motion.div
                  key={`${crumb.href}-${idx}-${crumb.segment}`}
                  initial={{ opacity: 0, x: -15, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 15, scale: 0.9 }}
                  transition={{ 
                    duration: 0.25, 
                    delay: idx * 0.03,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  className="flex items-center"
                >
                  <BreadcrumbItem>
                    {isLast ? (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 + 0.1 }}
                        className="relative"
                      >
                        <BreadcrumbPage className={cn(
                          "font-medium flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r text-xs border transition-all duration-200",
                          styles.text,
                          styles.bg,
                          styles.border,
                          styles.shadow,
                          "hover:scale-105 transform"
                        )}>
                          {crumb.icon && (
                            <motion.span 
                              className="inline-flex items-center"
                              animate={{ 
                                rotate: [0, 5, 0],
                                scale: [1, 1.05, 1]
                              }}
                              transition={{ 
                                duration: 0.4, 
                                delay: idx * 0.03 + 0.15,
                                ease: "easeInOut"
                              }}
                            >
                              {crumb.icon}
                            </motion.span>
                          )}
                          <span className="tracking-wide">{crumb.label}</span>
                          {crumb.isAction && (
                            <motion.div
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: idx * 0.03 + 0.2, type: "spring", stiffness: 300 }}
                            >
                              <Badge 
                                variant="secondary" 
                                className="ml-0.5 text-[10px] bg-white/70 text-slate-600 border-0 shadow-sm font-medium px-1 py-0"
                              >
                                Action
                              </Badge>
                            </motion.div>
                          )}
                        </BreadcrumbPage>
                      </motion.div>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.03, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                      >
                        <BreadcrumbLink 
                          asChild
                          className={cn(
                            "transition-all duration-200 font-medium flex items-center gap-1.5 px-2 py-0.5 rounded-md group text-xs border border-transparent",
                            styles.text,
                            styles.bg,
                            styles.border,
                            styles.shadow
                          )}
                        >
                          <Link href={crumb.href || '/'}>
                            {crumb.icon && (
                              <motion.span 
                                className="inline-flex items-center group-hover:scale-105 transition-transform duration-150"
                                whileHover={{ rotate: 8 }}
                                transition={{ duration: 0.15 }}
                              >
                                {crumb.icon}
                              </motion.span>
                            )}
                            <span className={cn(
                              "group-hover:underline decoration-1 underline-offset-2 transition-all duration-150",
                              styles.decoration
                            )}>
                              {crumb.label}
                            </span>
                          </Link>
                        </BreadcrumbLink>
                      </motion.div>
                    )}
                  </BreadcrumbItem>
                  
                  {!isLast && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0, rotate: -45 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ 
                        delay: idx * 0.03 + 0.05,
                        duration: 0.2,
                        ease: "backOut"
                      }}
                    >
                      <BreadcrumbSeparator className="mx-1">
                        <motion.div
                          whileHover={{ 
                            scale: 1.2, 
                            rotate: 45,
                            color: '#0d9488' // teal-600
                          }}
                          transition={{ duration: 0.15 }}
                        >
                          <ChevronRight className="h-3 w-3 text-slate-400 hover:text-teal-600 transition-colors duration-150" />
                        </motion.div>
                      </BreadcrumbSeparator>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

// Enhanced title case function with special handling
function enhancedTitleCase(str: string) {
  const specialCases = {
    'api': 'API', 'url': 'URL', 'http': 'HTTP', 'https': 'HTTPS',
    'ui': 'UI', 'ux': 'UX', 'id': 'ID', 'uuid': 'UUID',
    'db': 'Database', 'admin': 'Admin', 'config': 'Configuration',
    'oauth': 'OAuth', 'jwt': 'JWT', 'sql': 'SQL', 'nosql': 'NoSQL'
  };
  
  return str
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => {
      const lowerWord = word.toLowerCase();
      return specialCases[lowerWord as keyof typeof specialCases] || 
             word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}