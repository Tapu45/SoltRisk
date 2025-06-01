"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Filter,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Users,
  MapPin,
  Phone,
  Globe,
  Calendar,
  TrendingUp,
  Award,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { API_ROUTES } from "@/lib/api";
import { usePageSearch } from "@/hooks/search";
import { useSearch } from "@/context/searchProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Organization {
  id: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  logo: string | null;
  website: string | null;
  managementName: string;
  designation: string;
  managementRepresentative: string;
  consultantEnquiry: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    branches: number;
  };
}

export default function ViewOrganizationsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'branches'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 12; // 12 cards for 4x3 grid

  const { filteredItems, searchTerm, isSearching } = usePageSearch<Organization>(
    organizations,
    ['name', 'email', 'address', 'managementName']
  );

  // Use search context for setting searchTerm
  const { setSearchTerm } = useSearch();

  useEffect(() => {
    fetchOrganizations();
  }, [currentPage]);

  useEffect(() => {
    if (searchTerm && searchTerm.length > 2) {
      // Optional: If you need server-side search for large datasets
      // fetchOrganizations(searchTerm);
    }
  }, [searchTerm]);

  const fetchOrganizations = async (search?: string) => {
    setLoading(true);
    setError(null);

    // Get token from localStorage
    const token = localStorage.getItem("auth_token");

    try {
      let url = `${API_ROUTES.AUTH.ORGANIZATION}?page=${currentPage}&limit=${itemsPerPage}`;
      
      // Add search parameter if provided (for server-side search)
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Your session has expired. Please login again");
          return;
        }

        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch organizations");
      }

      const data = await response.json();
      setOrganizations(data.organizations);
      setTotalPages(data.pagination.pages);
      setTotalItems(data.pagination.total);
    } catch (err) {
      setError("Failed to load organizations. Please try again.");
      toast.error("Error loading organizations");
    } finally {
      setLoading(false);
    }
  };

  // Sort filtered items
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      case 'date':
        return sortOrder === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'branches':
        const aBranches = a._count?.branches || 0;
        const bBranches = b._count?.branches || 0;
        return sortOrder === 'asc' ? aBranches - bBranches : bBranches - aBranches;
      default:
        return 0;
    }
  });

 return (
  <div className="container px-4 mx-auto min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40">
    {/* Integrated Header and Content Section */}
    <motion.div 
      className="relative"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-blue-500/5 to-purple-500/5 rounded-2xl blur-3xl" />
      
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl shadow-black/5">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-2 w-2 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    Organizations
                  </h1>
                  <p className="text-gray-600 mt-1 font-medium">
                    Manage and oversee all registered organizations
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Link href="/admin/organization/create">
                <Button size="lg" className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Organization
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {loading ? (
            <motion.div 
              className="flex justify-center items-center min-h-[400px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-teal-200 rounded-full animate-spin border-t-teal-600 mx-auto"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-teal-600" />
                  </div>
                </div>
                <p className="mt-4 text-gray-600 font-medium">Loading organizations...</p>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div 
              className="flex justify-center items-center min-h-[400px]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-red-200">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-red-700 mb-2">Something went wrong</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <Button
                  variant="outline"
                  onClick={() => fetchOrganizations()}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            </motion.div>
          ) : sortedItems.length === 0 ? (
            <motion.div 
              className="flex justify-center items-center min-h-[400px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-gray-200">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No organizations found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm
                    ? "Try adjusting your search terms or filters"
                    : "Get started by adding your first organization"}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {searchTerm ? (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery("");
                        setSearchTerm("");
                      }}
                      className="border-gray-300"
                    >
                      Clear Search
                    </Button>
                  ) : (
                    <Link href="/admin/organization/create">
                      <Button className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Organization
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <>
             {/* Medium Rectangular Cards Grid - UPDATED VERSION */}
<AnimatePresence mode="wait">
  {viewMode === 'grid' ? (
    <motion.div 
      key="grid"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05
          }
        }
      }}
    >
      {sortedItems.map((org, index) => (
        <motion.div
          key={org.id}
          variants={{
            hidden: { opacity: 0, scale: 0.95, y: 10 },
            visible: { 
              opacity: 1, 
              scale: 1,
              y: 0,
              transition: {
                duration: 0.3,
                ease: [0.23, 1, 0.32, 1]
              }
            }
          }}
          className="group"
        >
          <Link href={`/admin/organization/details/${org.id}`} className="block">
            <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-lg transition-all duration-300 h-44 cursor-pointer group-hover:border-teal-300/50 group-hover:shadow-xl">
              {/* Hover gradient overlay */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-all duration-300"
                initial={false}
              />

              <CardContent className="p-6 h-full flex flex-col relative z-10">
                {/* Top section with logo and basic info */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Logo */}
                  <motion.div 
                    className="relative flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-gray-100 to-white flex items-center justify-center overflow-hidden shadow-md border border-gray-200/30 group-hover:shadow-lg transition-all duration-300">
                      {org.logo ? (
                        <img
                          src={org.logo}
                          alt={`${org.name} logo`}
                          className="h-full w-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:from-teal-600 group-hover:to-blue-700 transition-all duration-300">
                          <Building2 className="h-8 w-8 text-white" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                  
                  {/* Organization Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-teal-700 transition-colors duration-300 mb-2 leading-tight">
                      {org.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300 mb-1">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{org.email}</span>
                    </div>
                    {org.mobile && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{org.mobile}</span>
                      </div>
                    )}
                  </div>

                  {/* Hover indicator */}
                  <motion.div 
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    initial={false}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                      <Eye className="h-4 w-4 text-white" />
                    </div>
                  </motion.div>
                </div>

               
              </CardContent>

              {/* Bottom highlight border */}
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </Card>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  ) : (
    // List View - Enhanced version
    <motion.div 
      key="list"
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {sortedItems.map((org, index) => (
        <motion.div
          key={org.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Link href={`/admin/organization/details/${org.id}`}>
            <Card className="p-6 bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center flex-shrink-0 group-hover:from-teal-600 group-hover:to-blue-700 transition-all duration-300 shadow-md">
                  {org.logo ? (
                    <img src={org.logo} alt={org.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Building2 className="h-6 w-6 text-white" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-teal-700 transition-colors duration-300 mb-1">{org.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{org.email}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {org.mobile && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span className="truncate">{org.mobile}</span>
                      </div>
                    )}
                    
                  </div>
                  
                  <div className="flex items-center justify-end gap-3">
                  
                    <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md">
                      <Eye className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )}
</AnimatePresence>

              {/* Enhanced Pagination */}
              {totalPages > 1 && !isSearching && (
                <motion.div 
                  className="flex items-center justify-center mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage <= 1}
                        className="bg-white/80 border-gray-200 hover:bg-teal-50 hover:border-teal-300 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-200/50">
                        <span className="text-sm text-gray-700 font-medium">Page</span>
                        <div className="px-3 py-1 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-md text-sm font-bold shadow-md">
                          {currentPage}
                        </div>
                        <span className="text-sm text-gray-700 font-medium">of {totalPages}</span>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage >= totalPages}
                        className="bg-white/80 border-gray-200 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  </div>
);
}