"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { API_ROUTES } from "@/lib/api";
import {
  Plus,
  FileText,
  Users,
  Calendar,
  AlertCircle,
  Eye,
  Filter,
  ChevronDown,
  Mail,
  Clock,
  X,
  CalendarIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import RifCreationForm from "@/components/forms/RifcreationForm";
import FloatingParticles from "@/components/animation/floatingparticles";

// Main Component
export default function ClientVendorPage() {
  const [showRifForm, setShowRifForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const router = useRouter();

  // Handle client-side mounting and user loading
  useEffect(() => {
    setIsClient(true);
    
    // Get current user from localStorage only on client side
    const getUserData = () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          
          return user;
        }

        const sessionUserData = sessionStorage.getItem("user");
        if (sessionUserData) {
          return JSON.parse(sessionUserData);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
      return null;
    };

    const user = getUserData();
    if (user) {
      
      setCurrentUser(user);
    }
  }, []);

  const queryClient = useQueryClient();

  // Fetch my initiations
  const { data: initiations, isLoading: initiationsLoading } = useQuery({
    queryKey: ["my-initiations", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) {
        throw new Error("User not authenticated");
      }
      const response = await fetch(
        API_ROUTES.RIF.GET_MY_INITIATIONS(currentUser.id)
      );
      if (!response.ok) throw new Error("Failed to fetch initiations");
      return response.json();
    },
    enabled: !!currentUser?.id && isClient,
  });

  // Filter initiations
  const filteredInitiations =
    initiations?.initiations?.filter((initiation: any) => {
      // Status filter
      if (filterStatus !== "all" && initiation.status.toLowerCase() !== filterStatus.toLowerCase()) {
        return false;
      }

      // Risk level filter
      if (filterRisk !== "all" && initiation.RifSubmission?.riskLevel?.toLowerCase() !== filterRisk.toLowerCase()) {
        return false;
      }

      // Date range filter
      if (startDate || endDate) {
        const createdDate = new Date(initiation.createdAt);
        
        if (startDate) {
          const start = new Date(startDate);
          if (createdDate < start) return false;
        }
        
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999); // Include the entire end date
          if (createdDate > end) return false;
        }
      }

      return true;
    }) || [];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "assigned":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const clearFilters = () => {
    setFilterStatus("all");
    setFilterRisk("all");
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilters = filterStatus !== "all" || filterRisk !== "all" || startDate || endDate;

  // Show loading until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40 relative overflow-hidden">
        <FloatingParticles />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center min-h-screen"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-3 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-600">Loading...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show user authentication error
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40 relative overflow-hidden">
        <FloatingParticles />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center min-h-screen"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-3 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <div>
              <p className="text-gray-600 mb-2">User not authenticated</p>
              <p className="text-sm text-red-600">
                Please log in to access this page
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show loading for initiations
  if (initiationsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40 relative overflow-hidden">
        <FloatingParticles />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center min-h-screen"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-3 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-600">Loading your RIF assessments...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40 relative overflow-hidden">
      <FloatingParticles />

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(15 23 42) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            {showRifForm ? (
              <motion.div
                key="rif-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <RifCreationForm
                  onSuccess={() => {
                    setShowRifForm(false);
                    queryClient.invalidateQueries({
                      queryKey: ["my-initiations"],
                    });
                  }}
                  currentUser={currentUser}
                />
              </motion.div>
            ) : (
              <motion.div
                key="assessments-list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {/* RIF Assessments Table */}
                <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl">
                  {/* Table Header with Title and Controls */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                          Risk Intake Form (RIF)
                        </h1>
                        <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                          {filteredInitiations.length} assessments
                        </Badge>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={() => setShowRifForm(true)}
                          className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-lg group"
                        >
                          <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                          Start New RIF Assessment
                        </Button>
                      </motion.div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="border-gray-300 hover:border-teal-500 hover:bg-teal-50"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                        {hasActiveFilters && (
                          <Badge className="ml-2 bg-teal-600 text-white text-xs">
                            {[filterStatus !== "all", filterRisk !== "all", startDate, endDate].filter(Boolean).length}
                          </Badge>
                        )}
                      </Button>

                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          onClick={clearFilters}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear Filters
                        </Button>
                      )}
                    </div>

                    {/* Filter Controls */}
                    <AnimatePresence>
                      {showFilters && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4"
                        >
                          {/* Status Filter */}
                          <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Status
                            </label>
                            <select
                              value={filterStatus}
                              onChange={(e) => setFilterStatus(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none bg-white"
                            >
                              <option value="all">All Status</option>
                              <option value="assigned">Assigned</option>
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                            <ChevronDown className="h-4 w-4 absolute right-3 top-9 text-gray-400 pointer-events-none" />
                          </div>

                          {/* Risk Level Filter */}
                          <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Risk Level
                            </label>
                            <select
                              value={filterRisk}
                              onChange={(e) => setFilterRisk(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none bg-white"
                            >
                              <option value="all">All Risk Levels</option>
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                            <ChevronDown className="h-4 w-4 absolute right-3 top-9 text-gray-400 pointer-events-none" />
                          </div>

                          {/* Start Date Filter */}
                          <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              From Date
                            </label>
                            <div className="relative">
                              <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              />
                              <CalendarIcon className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                          </div>

                          {/* End Date Filter */}
                          <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              To Date
                            </label>
                            <div className="relative">
                              <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate || undefined}
                                className="w-full focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              />
                              <CalendarIcon className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <CardContent className="p-0">
                    {filteredInitiations.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-16"
                      >
                        <motion.div
                          animate={{
                            y: [0, -10, 0],
                            rotate: [0, 5, -5, 0],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        </motion.div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {hasActiveFilters ? "No matching assessments" : "No RIF Assessments"}
                        </h3>
                        <p className="text-gray-500 mb-6">
                          {hasActiveFilters
                            ? "Try adjusting your filters to see more results"
                            : "Get started by creating your first Risk Intake Form assessment"}
                        </p>
                        {!hasActiveFilters && (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={() => setShowRifForm(true)}
                              className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-lg group"
                            >
                              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                              Start First RIF Assessment
                            </Button>
                          </motion.div>
                        )}
                      </motion.div>
                    ) : (
                      <div className="overflow-x-auto">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
                          <div className="col-span-3">Company Name</div>
                          <div className="col-span-2">Assigned To</div>
                          <div className="col-span-1">Status</div>
                          <div className="col-span-1">Risk Level</div>
                          <div className="col-span-2">Due Date</div>
                          <div className="col-span-2">Created Date</div>
                          <div className="col-span-1 text-center">Actions</div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-gray-100">
                          {filteredInitiations.map((initiation: any, index: number) => (
                            <motion.div
                              key={initiation.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-teal-50/30 hover:to-blue-50/30 transition-all duration-200 group items-center"
                            >
                              {/* Company Name */}
                              <div className="col-span-3">
                                <div className="flex flex-col">
                                  <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors truncate">
                                    {initiation.section1Data?.find(
                                      (answer: any) =>
                                        answer.questionId.includes("vendor-name") ||
                                        answer.questionId.includes("third-party-name") ||
                                        answer.questionId.includes("legal-name")
                                    )?.value ||
                                      initiation.Vendor?.User?.name ||
                                      "Third Party Assessment"}
                                  </h3>
                                  <span className="text-xs text-gray-500">
                                    ID: {initiation.id.slice(-6)}
                                  </span>
                                </div>
                              </div>

                              {/* Assigned To */}
                              <div className="col-span-2">
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900 truncate">
                                    {initiation.internalUserName}
                                  </span>
                                  <span className="text-xs text-gray-500 truncate">
                                    {initiation.internalUserEmail}
                                  </span>
                                </div>
                              </div>

                              {/* Status */}
                              <div className="col-span-1">
                                <Badge
                                  className={`px-2 py-1 text-xs font-medium border ${getStatusColor(
                                    initiation.status
                                  )}`}
                                >
                                  {initiation.status.replace('_', ' ')}
                                </Badge>
                              </div>

                              {/* Risk Level */}
                              <div className="col-span-1">
                                {initiation.RifSubmission?.riskLevel ? (
                                  <Badge
                                    className={`px-2 py-1 text-xs font-medium border ${getRiskColor(
                                      initiation.RifSubmission.riskLevel
                                    )}`}
                                  >
                                    {initiation.RifSubmission.riskLevel}
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-gray-400">Pending</span>
                                )}
                              </div>

                              {/* Due Date */}
                              <div className="col-span-2">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="h-3 w-3 mr-2 text-blue-500" />
                                  {new Date(initiation.dueDate).toLocaleDateString()}
                                </div>
                              </div>

                              {/* Created Date */}
                              <div className="col-span-2">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Clock className="h-3 w-3 mr-2 text-gray-400" />
                                  {new Date(initiation.createdAt).toLocaleDateString()}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="col-span-1 flex justify-center">
                                {initiation.RifSubmission?.isReviewed ? (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                      router.push(
                                        `/client/result/${initiation.RifSubmission.id}`
                                      );
                                    }}
                                    className="p-2 text-gray-400 hover:text-teal-600 transition-colors rounded-lg hover:bg-teal-50"
                                    title="View Assessment Results"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </motion.button>
                                ) : (
                                  <span className="text-xs text-gray-400">Pending</span>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}