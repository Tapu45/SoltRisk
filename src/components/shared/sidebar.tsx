"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Home,
  Building2,
  UserCircle,
  Settings,
  ChevronRight,
  ChevronLeft,
  Users,
  ShoppingBag,
  FileText,
  BarChart3,
  Shield,
  HelpCircle,
  Calendar,
  Briefcase,
  LogOut,
  ChevronDown,
  Bell,
  Star
} from "lucide-react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  path: string;
  expanded: boolean;
  active: boolean;
  hasChildren?: boolean;
  badge?: string;
};

type UserRole = "ADMIN" | "CLIENT" | "VENDOR" | "STAFF" | string;

type User = {
  name: string;
  role: UserRole;
  avatar?: string;
};

const SidebarItem = ({ icon, label, path, expanded, active, hasChildren, badge }: SidebarItemProps) => {
  return (
    <Link
      href={path}
      className={`group relative flex items-center py-3 px-4 rounded-xl transition-all duration-200 mb-2 ${
        active 
          ? "text-white bg-white/15 shadow-lg backdrop-blur-sm border border-white/20" 
          : "text-white/80 hover:text-white hover:bg-white/10 hover:shadow-md hover:backdrop-blur-sm"
      }`}
    >
      <div className="flex items-center w-full">
        <div className={`mr-3 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>
          {icon}
        </div>
        {expanded && (
          <>
            <span className="flex-grow font-medium text-sm tracking-wide">{label}</span>
            <div className="flex items-center gap-2">
              {badge && (
                <Badge variant="secondary" className="bg-white/20 text-white text-xs border-0 px-2 py-0.5">
                  {badge}
                </Badge>
              )}
              {hasChildren && (
                <ChevronDown className="h-4 w-4 opacity-60" />
              )}
            </div>
          </>
        )}
      </div>
    </Link>
  );
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Fetch user data from localStorage on component mount
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, []);
  
  // Define navigation items for each role with badges
  const adminNavItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Dashboard",
      path: "/admin/dashboard",
      hasChildren: false,
      badge: undefined,
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "User Management",
      path: "/admin/users",
      hasChildren: false,
      badge: "",
    },
    {
      icon: <Building2 className="h-5 w-5" />,
      label: "Organizations",
      path: "/admin/organization/view",
      hasChildren: true,
      badge: undefined,
    },
    {
      icon: <ShoppingBag className="h-5 w-5" />,
      label: "Third Parties",
      path: "/admin/vendors",
      hasChildren: true,
      badge: "",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Reports",
      path: "/admin/reports",
      hasChildren: false,
      badge: undefined,
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      path: "/admin/settings",
      hasChildren: false,
      badge: undefined,
    },
  ];

  // Other role navigation items with enhanced styling
  const clientNavItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Dashboard",
      path: "/client/dashboard",
      hasChildren: false,
      badge: undefined,
    },
    {
      icon: <Shield className="h-5 w-5" />,
      label: "Risk Assessment",
      path: "/client/risk-assessment",
      hasChildren: false,
      badge: "3",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Reports",
      path: "/client/reports",
      hasChildren: false,
      badge: undefined,
    },
    {
      icon: <ShoppingBag className="h-5 w-5" />,
      label: "Third Parties",
      path: "/client/vendor",
      hasChildren: true,
      badge: undefined,
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      path: "/client/settings",
      hasChildren: false,
      badge: undefined,
    },
  ];

  // Vendor role navigation items
  const vendorNavItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Dashboard",
      path: "/vendor/dashboard",
      hasChildren: false,
      badge: undefined,
    },
    {
      icon: <Briefcase className="h-5 w-5" />,
      label: "My Engagements",
      path: "/vendor/engagements",
      hasChildren: false,
      badge: "5",
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "Calendar",
      path: "/vendor/calendar",
      hasChildren: false,
      badge: undefined,
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      path: "/vendor/settings",
      hasChildren: false,
      badge: undefined,
    },
  ];

  // Staff role navigation items
  const staffNavItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Dashboard",
      path: "/staff/dashboard",
      hasChildren: false,
      badge: undefined,
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Clients",
      path: "/staff/clients",
      hasChildren: false,
      badge: undefined,
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Reports",
      path: "/staff/reports",
      hasChildren: false,
      badge: undefined,
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      path: "/staff/settings",
      hasChildren: false,
      badge: undefined,
    },
  ];

  // Default navigation items
  const defaultNavItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Home",
      path: "/",
      hasChildren: false,
      badge: undefined,
    },
    {
      icon: <HelpCircle className="h-5 w-5" />,
      label: "Help",
      path: "/help",
      hasChildren: false,
      badge: undefined,
    },
  ];

  // Select navigation items based on user role
  const getNavItemsByRole = (role?: UserRole) => {
    switch(role) {
      case "ADMIN":
        return adminNavItems;
      case "CLIENT":
        return clientNavItems;
      case "VENDOR":
        return vendorNavItems;
      case "STAFF":
        return staffNavItems;
      default:
        return defaultNavItems;
    }
  };

  // Get sidebar items based on user role
  const sidebarItems = user ? getNavItemsByRole(user.role) : defaultNavItems;

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("remember_me");
    localStorage.removeItem("token_expiry");
    
    // Redirect to login page
    router.push("/login");
  };

  return (
    <div 
      className={`h-screen flex flex-col bg-gradient-to-br from-[#00c3a9] via-[#0081c9] to-[#3850b7] transition-all duration-300 shadow-2xl relative ${
        expanded ? "w-72" : "w-20"
      }`}
    >
      {/* Background overlay for glass effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo Section */}
         <div className="flex justify-center p-6 mb-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl py-3 px-4 shadow-lg border border-white/20">
            {expanded ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                    <div className="w-4 h-4 bg-white rounded-full opacity-90"></div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-green-400 to-blue-500 rounded-full shadow-md"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight">
                    SoltRisk
                  </span>
                  <span className="text-xs text-gray-500 font-medium tracking-wider -mt-1">
                    RISK MANAGEMENT
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-green-400 to-blue-500 rounded-full shadow-md"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toggle button */}
        <button 
          onClick={toggleSidebar} 
          className="absolute -right-4 top-24 bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-lg border border-white/20 hover:bg-white transition-all duration-200 hover:shadow-xl z-20"
        >
          {expanded ? (
            <ChevronLeft className="h-4 w-4 text-blue-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-blue-600" />
          )}
        </button>

        

        {/* Navigation Items */}
        <nav className="flex-1 px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <div className="space-y-1">
            {sidebarItems.map((item, index) => (
              <SidebarItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                expanded={expanded}
                active={pathname === item.path || pathname.startsWith(`${item.path}/`)}
                hasChildren={item.hasChildren}
                badge={item.badge}
              />
            ))}
          </div>
        </nav>

      

        {/* User Profile */}
        <div className="px-4 py-4 border-t border-white/20 bg-white/5 backdrop-blur-sm">
          <div className={`flex items-center ${expanded ? "" : "justify-center"} mb-3`}>
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-white/30 shadow-lg">
                <AvatarImage src={user?.avatar || "/user.jpg"} alt={user?.name || "User"} />
                <AvatarFallback className="bg-white/20 text-white font-semibold">
                  {user?.name ? user.name.charAt(0) : "U"}
                </AvatarFallback>
              </Avatar>
             
            </div>
            {expanded && (
              <div className="ml-3 text-white flex-1">
                <p className="font-semibold text-sm">{user?.name || "User"}</p>
               
              </div>
            )}
          </div>
          
          {/* Logout Button */}
          {expanded ? (
            <Button 
              variant="ghost" 
              className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200 hover:shadow-lg rounded-xl" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="w-full flex justify-center bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-xl"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}