'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  Eye, 
  Mail, 
  Building2, 
  Calendar, 
  Users, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  TrendingUp,
  Activity,
  Plus,
  UserCheck,
  ChevronDown,
  CalendarIcon,
  X,
  FileText,
  Briefcase,
  ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'
import VendorProfile from './component/profile'
import VendorResponses from './component/response'
import FloatingParticles from '@/components/animation/floatingparticles'

// ...existing interfaces...
interface VendorData {
  vendor: {
    id: string
    userId: string
    name: string
    email: string
    createdAt: string
  }
  profile: any
  questionnaires: any[]
  summary: {
    totalQuestionnaires: number
    completedQuestionnaires: number
    pendingQuestionnaires: number
    averageProgress: number
  }
}

interface VendorListResponse {
  success: boolean
  vendors: VendorData[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  summary: {
    totalVendors: number
    withProfiles: number
    withActiveQuestionnaires: number
    statusBreakdown: {
      notStarted: number
      inProgress: number
      submitted: number
      approved: number
      rejected: number
    }
  }
}

interface UserData {
  id: string
  email: string
  name: string
  role: string
}

const statusColors = {
  NOT_STARTED: 'bg-gray-100 text-gray-800 border-gray-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
  SUBMITTED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  UNDER_REVIEW: 'bg-purple-100 text-purple-800 border-purple-200',
  APPROVED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
  EXPIRED: 'bg-gray-100 text-gray-600 border-gray-200',
  NO_QUESTIONNAIRE: 'bg-gray-100 text-gray-600 border-gray-200'
}

export default function VendorListPage() {
  const [vendors, setVendors] = useState<VendorData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentTab, setCurrentTab] = useState('all')
  const [userData, setUserData] = useState<UserData | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null)
  const [currentView, setCurrentView] = useState<'list' | 'profile' | 'responses'>('list')
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  })
  const [summary, setSummary] = useState({
    totalVendors: 0,
    withProfiles: 0,
    withActiveQuestionnaires: 0,
    statusBreakdown: {
      notStarted: 0,
      inProgress: 0,
      submitted: 0,
      approved: 0,
      rejected: 0
    }
  })

  // ...existing useEffect and functions remain the same...
  // Initialize user data on component mount
  useEffect(() => {
    const initializeUser = () => {
      try {
        console.log('🔍 Initializing user...')
        
        const storedUser = localStorage.getItem('user')
        if (!storedUser) {
          console.log('❌ No user data in localStorage')
          toast('Error: Please log in again', {
            description: 'User session not found'
          })
          setLoading(false)
          return
        }

        const user: UserData = JSON.parse(storedUser)
        console.log('👤 User data from localStorage:', user)
        setUserData(user)

        if (user.role !== 'CLIENT') {
          console.log('❌ User is not a client, role:', user.role)
          toast('Error: Access denied', {
            description: 'Only clients can access this page'
          })
          setLoading(false)
          return
        }

        console.log('✅ Using user ID as clientId:', user.id)
        fetchVendors(0, {}, user.id)

      } catch (error) {
        console.error('❌ Error initializing user:', error)
        toast('Error: Failed to initialize user', {
          description: 'Please try refreshing the page'
        })
        setLoading(false)
      }
    }

    initializeUser()
  }, [])

  const fetchVendors = async (offset = 0, filters = {}, clientId?: string) => {
    try {
      console.log('🚀 Attempting to fetch vendors with clientId:', clientId)
      setLoading(true)
      
      const currentClientId = clientId || userData?.id
      
      if (!currentClientId) {
        console.log('❌ No clientId available')
        toast('Error: Client ID not found', {
          description: 'Please log in again'
        })
        setLoading(false)
        return
      }

      const params = new URLSearchParams({
        action: 'vendor-list',
        clientId: currentClientId,
        limit: pagination.limit.toString(),
        offset: offset.toString(),
        ...filters
      })

      const apiUrl = `/api/vendor?${params}`
      console.log('🔗 API URL:', apiUrl)

      const response = await fetch(apiUrl)
      console.log('📊 API Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error:', errorText)
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }
      
      const data: VendorListResponse = await response.json()
      console.log('📈 API Response data:', data)

      if (data.success) {
        console.log('✅ Successfully loaded vendors:', data.vendors.length)
        setVendors(data.vendors)
        setPagination(data.pagination)
        setSummary(data.summary)
        
        if (data.vendors.length === 0) {
          toast('Info: No vendors found', {
            description: 'No vendors have been assigned questionnaires yet'
          })
        }
      } else {
        console.log('❌ API returned success: false')
        throw new Error('Failed to fetch vendors')
      }
    } catch (error) {
      console.error('❌ Error fetching vendors:', error)
      toast('Error: Failed to load vendor list', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      console.log('🏁 Setting loading to false')
      setLoading(false)
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const filteredVendors = vendors.filter(vendor => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      vendor.vendor.name.toLowerCase().includes(searchLower) ||
      vendor.vendor.email.toLowerCase().includes(searchLower) ||
      vendor.profile?.companyName?.toLowerCase().includes(searchLower) ||
      vendor.profile?.primaryContactName?.toLowerCase().includes(searchLower)
    )
  }).filter(vendor => {
    // Date range filter
    if (startDate || endDate) {
      const createdDate = new Date(vendor.vendor.createdAt)
      
      if (startDate) {
        const start = new Date(startDate)
        if (createdDate < start) return false
      }
      
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        if (createdDate > end) return false
      }
    }
    
    return true
  })

  const getVendorsByTab = () => {
    switch (currentTab) {
      case 'pending':
        return filteredVendors.filter(v => 
          v.questionnaires.some(q => ['NOT_STARTED', 'IN_PROGRESS'].includes(q.status))
        )
      case 'submitted':
        return filteredVendors.filter(v => 
          v.questionnaires.some(q => ['SUBMITTED', 'UNDER_REVIEW'].includes(q.status))
        )
      case 'completed':
        return filteredVendors.filter(v => 
          v.questionnaires.some(q => q.status === 'APPROVED')
        )
      default:
        return filteredVendors
    }
  }

  const handleRefresh = () => {
    if (userData?.id) {
      const filters: any = {}
      
      if (statusFilter !== 'all') {
        filters.questionnaireStatus = statusFilter
      }
      
      if (riskFilter !== 'all') {
        filters.riskLevel = riskFilter
      }

      fetchVendors(0, filters, userData.id)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getOverallStatus = (questionnaires: any[]) => {
    if (questionnaires.length === 0) return 'NO_QUESTIONNAIRE'
    
    const statuses = questionnaires.map(q => q.status)
    
    if (statuses.includes('APPROVED')) return 'APPROVED'
    if (statuses.includes('SUBMITTED')) return 'SUBMITTED'
    if (statuses.includes('IN_PROGRESS')) return 'IN_PROGRESS'
    if (statuses.includes('REJECTED')) return 'REJECTED'
    
    return 'NOT_STARTED'
  }

  const clearFilters = () => {
    setStatusFilter('all')
    setRiskFilter('all')
    setStartDate('')
    setEndDate('')
  }

  const hasActiveFilters = statusFilter !== 'all' || riskFilter !== 'all' || startDate || endDate

  const handleViewProfile = (vendor: VendorData) => {
    setSelectedVendor(vendor)
    setCurrentView('profile')
  }

  const handleViewResponses = (vendor: VendorData) => {
    setSelectedVendor(vendor)
    setCurrentView('responses')
  }

  const handleBackToList = () => {
    setCurrentView('list')
    setSelectedVendor(null)
  }

  if (loading) {
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
              className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-6"
            />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Vendor Data</h2>
            <p className="text-gray-600">Please wait while we fetch your vendors...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40 relative overflow-hidden">
      <FloatingParticles />
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(15 23 42) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10">
        <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-9">
          <AnimatePresence mode="wait">
            {currentView === 'list' && (
              <motion.div
                key="vendor-list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl">
                  {/* Table Header with Title and Controls */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                          Vendor Management
                        </h1>
                        <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                          {getVendorsByTab().length} vendors
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={handleRefresh}
                            disabled={!userData?.id}
                            className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-xl"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                          </Button>
                        </motion.div>
                      </div>
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
                            {[statusFilter !== 'all', riskFilter !== 'all', startDate, endDate].filter(Boolean).length}
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
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none bg-white"
                            >
                              <option value="all">All Status</option>
                              <option value="NOT_STARTED">Not Started</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="SUBMITTED">Submitted</option>
                              <option value="APPROVED">Approved</option>
                              <option value="REJECTED">Rejected</option>
                            </select>
                            <ChevronDown className="h-4 w-4 absolute right-3 top-9 text-gray-400 pointer-events-none" />
                          </div>

                          {/* Risk Level Filter */}
                          <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Risk Level
                            </label>
                            <select
                              value={riskFilter}
                              onChange={(e) => setRiskFilter(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none bg-white"
                            >
                              <option value="all">All Risk Levels</option>
                              <option value="LOW">Low</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="HIGH">High</option>
                              <option value="CRITICAL">Critical</option>
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

                    {/* Tabs */}
                    <div className="mt-6">
                      <Tabs value={currentTab} onValueChange={setCurrentTab}>
                        <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm shadow-lg h-12">
                          <TabsTrigger 
                            value="all" 
                            className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-blue-500 data-[state=active]:text-white h-8"
                          >
                            All ({filteredVendors.length})
                          </TabsTrigger>
                          <TabsTrigger 
                            value="pending"
                            className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white h-8"
                          >
                            Pending ({filteredVendors.filter(v => 
                              v.questionnaires.some(q => ['NOT_STARTED', 'IN_PROGRESS'].includes(q.status))
                            ).length})
                          </TabsTrigger>
                          <TabsTrigger 
                            value="submitted"
                            className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white h-8"
                          >
                            Submitted ({filteredVendors.filter(v => 
                              v.questionnaires.some(q => ['SUBMITTED', 'UNDER_REVIEW'].includes(q.status))
                            ).length})
                          </TabsTrigger>
                          <TabsTrigger 
                            value="completed"
                            className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white h-8"
                          >
                            Completed ({filteredVendors.filter(v => 
                              v.questionnaires.some(q => q.status === 'APPROVED')
                            ).length})
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>

                  <CardContent className="p-0">
                    {getVendorsByTab().length === 0 ? (
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
                          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        </motion.div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {hasActiveFilters ? "No matching vendors" : "No vendors found"}
                        </h3>
                        <p className="text-gray-500 mb-6">
                          {hasActiveFilters
                            ? "Try adjusting your filters to see more results"
                            : "No vendors have been sent assessments yet"}
                        </p>
                        {!hasActiveFilters && (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={() => window.open('/client/rif/create', '_blank')}
                              className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-xl"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Send Your First Assessment
                            </Button>
                          </motion.div>
                        )}
                      </motion.div>
                    ) : (
                      <div className="overflow-x-auto">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
                          <div className="col-span-3">Company Name</div>
                          <div className="col-span-2">Contact</div>
                          <div className="col-span-1">Status</div>
                          <div className="col-span-2">Questionnaires</div>
                          <div className="col-span-2">Created Date</div>
                          <div className="col-span-2 text-center">Actions</div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-gray-100">
                          {getVendorsByTab().map((vendorData, index) => {
                            const overallStatus = getOverallStatus(vendorData.questionnaires)
                            
                            return (
                              <motion.div
                                key={vendorData.vendor.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-teal-50/30 hover:to-blue-50/30 transition-all duration-200 group items-center"
                              >
                                {/* Company Name */}
                                <div className="col-span-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                                      <Building2 className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex flex-col">
                                      <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors truncate">
                                        {vendorData.profile?.companyName || vendorData.vendor.name}
                                      </h3>
                                      <span className="text-xs text-gray-500">
                                        ID: {vendorData.vendor.id.slice(-6)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Contact */}
                                <div className="col-span-2">
                                  <div className="flex flex-col">
                                    <span className="font-medium text-gray-900 truncate">
                                      {vendorData.profile?.primaryContactName || vendorData.vendor.name}
                                    </span>
                                    <span className="text-xs text-gray-500 truncate">
                                      {vendorData.vendor.email}
                                    </span>
                                  </div>
                                </div>

                                {/* Status */}
                                <div className="col-span-1">
                                  <Badge
                                    className={`px-2 py-1 text-xs font-medium border ${statusColors[overallStatus as keyof typeof statusColors]}`}
                                  >
                                    {overallStatus.replace('_', ' ')}
                                  </Badge>
                                </div>

                                {/* Questionnaires */}
                                <div className="col-span-2">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <FileText className="h-3 w-3 mr-2 text-blue-500" />
                                    <span>{vendorData.summary.completedQuestionnaires}/{vendorData.summary.totalQuestionnaires} completed</span>
                                  </div>
                                </div>

                                {/* Created Date */}
                                <div className="col-span-2">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="h-3 w-3 mr-2 text-gray-400" />
                                    {formatDate(vendorData.vendor.createdAt)}
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="col-span-2 flex justify-center gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleViewProfile(vendorData)}
                                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                                    title="View Profile"
                                  >
                                    <Briefcase className="h-4 w-4" />
                                  </motion.button>
                                  
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleViewResponses(vendorData)}
                                    className="p-2 text-gray-400 hover:text-teal-600 transition-colors rounded-lg hover:bg-teal-50"
                                    title="View Details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </motion.button>
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Profile View */}
            {currentView === 'profile' && selectedVendor && (
              <motion.div
                key="vendor-profile"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                {/* Header with Back Button */}
                <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleBackToList}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </motion.button>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                              {selectedVendor.profile?.companyName || selectedVendor.vendor.name}
                            </h1>
                            <p className="text-sm text-gray-600">Vendor Profile</p>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={() => handleViewResponses(selectedVendor)}
                        className="border-teal-300 hover:border-teal-500 hover:bg-teal-50"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Assessments
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Profile Content */}
                <VendorProfile
                  profile={selectedVendor.profile}
                  vendor={selectedVendor.vendor}
                  isExpanded={true}
                />
              </motion.div>
            )}

            {/* Responses View */}
            {currentView === 'responses' && selectedVendor && (
              <motion.div
                key="vendor-responses"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                {/* Header with Back Button */}
                <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleBackToList}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </motion.button>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-teal-800 to-cyan-800 bg-clip-text text-transparent">
                              {selectedVendor.profile?.companyName || selectedVendor.vendor.name}
                            </h1>
                            <p className="text-sm text-gray-600">Assessment Details</p>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={() => handleViewProfile(selectedVendor)}
                        className="border-blue-300 hover:border-blue-500 hover:bg-blue-50"
                      >
                        <Briefcase className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Responses Content */}
                <VendorResponses
                  questionnaires={selectedVendor.questionnaires}
                  onViewQuestionnaire={(id) => window.open(`/client/questionnaires/${id}`, '_blank')}
                  isExpanded={true}
                  showProgress={true}
                  summary={selectedVendor.summary}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}