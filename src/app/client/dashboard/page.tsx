'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Building,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  MapPin,
  Zap,
  RefreshCw
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import FloatingParticles from '@/components/animation/floatingparticles'

 interface User {
  id: string
  email: string
  name: string
  role: string
  clientId?: string
}

// Fixed getCurrentUser function with proper hydration handling
const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    
    const user = JSON.parse(userStr)
    
    // Add clientId for CLIENT role users
    if (user.role === 'CLIENT') {
      user.clientId = user.id
    }
    
    return user
  } catch (error) {
    console.error('Error parsing user from localStorage:', error)
    return null
  }
}

// Types
interface DashboardMetrics {
  thirdPartyRequestStatus: {
    totalRequests: number
    inProgress: number
    completed: number
    rejected: number
  }
  vendorCriticalityOverview: {
    critical: number
    high: number
    medium: number
    low: number
  }
  assessmentStatusByDueDate: {
    overdue: number
    dueSoon: number
    pending: number
  }
  topCriticalVendors: Array<{
    vendorId: string
    vendorName: string
    riskCriticality: string
    contractValue: number | null
    questionnaireStatus: string
    companyName: string
  }>
  additionalMetrics: {
    avgTimeToOnboard: number
    completionRate: number
    engagementHeatmap: Array<{
      date: string
      count: number
      intensity: 'low' | 'medium' | 'high'
    }>
    riskTrend: Array<{
      month: string
      high: number
      medium: number
      low: number
    }>
  }
}

export default function ClientDashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true)
    setCurrentUser(getCurrentUser())
  }, [])

  // Fetch dashboard data - only enabled when we have currentUser and are on client
  const { data: dashboardData, isLoading, error, refetch } = useQuery<DashboardMetrics>({
    queryKey: ['dashboard-metrics', currentUser?.clientId],
    queryFn: async () => {
      if (!currentUser?.clientId) {
        throw new Error('No client ID available')
      }
      
      const response = await fetch(`/api/client/dashboard?clientId=${currentUser.clientId}`)
      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Failed to fetch dashboard data: ${response.status} ${errorData}`)
      }
      return response.json()
    },
    enabled: !!currentUser?.clientId && isClient,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    retry: 3,
    retryDelay: 1000
  })

  // Chart colors
  const colors = {
    primary: ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981'],
    risk: {
      critical: '#EF4444',
      high: '#F97316',
      medium: '#EAB308',
      low: '#22C55E'
    },
    status: {
      completed: '#10B981',
      inProgress: '#3B82F6',
      pending: '#EAB308',
      rejected: '#EF4444',
      overdue: '#DC2626'
    }
  }

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Initializing dashboard...</p>
        </div>
      </div>
    )
  }

  // Check if user is logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-4">Please log in to access the dashboard</p>
            <Button onClick={() => window.location.href = '/login'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Prepare chart data with null checks
  const requestStatusData = dashboardData ? [
    { name: 'Completed', value: dashboardData.thirdPartyRequestStatus.completed, color: colors.status.completed },
    { name: 'In Progress', value: dashboardData.thirdPartyRequestStatus.inProgress, color: colors.status.inProgress },
    { name: 'Rejected', value: dashboardData.thirdPartyRequestStatus.rejected, color: colors.status.rejected }
  ] : []

  const riskCriticalityData = dashboardData ? [
    { name: 'Critical', value: dashboardData.vendorCriticalityOverview.critical, color: colors.risk.critical },
    { name: 'High', value: dashboardData.vendorCriticalityOverview.high, color: colors.risk.high },
    { name: 'Medium', value: dashboardData.vendorCriticalityOverview.medium, color: colors.risk.medium },
    { name: 'Low', value: dashboardData.vendorCriticalityOverview.low, color: colors.risk.low }
  ] : []

  const dueDateData = dashboardData ? [
    { name: 'Overdue', value: dashboardData.assessmentStatusByDueDate.overdue, color: colors.status.overdue },
    { name: 'Due Soon', value: dashboardData.assessmentStatusByDueDate.dueSoon, color: colors.status.pending },
    { name: 'Pending', value: dashboardData.assessmentStatusByDueDate.pending, color: colors.status.inProgress }
  ] : []

  // Heatmap data processing
  const generateHeatmapGrid = () => {
    if (!dashboardData?.additionalMetrics.engagementHeatmap) return []
    
    const today = new Date()
    const grid = []
    
    for (let week = 0; week < 7; week++) {
      const weekData = []
      for (let day = 0; day < 7; day++) {
        const date = new Date(today)
        date.setDate(date.getDate() - (week * 7 + day))
        const dateStr = date.toISOString().split('T')[0]
        
        const dayData = dashboardData.additionalMetrics.engagementHeatmap.find(
          item => item.date === dateStr
        )
        
        weekData.push({
          date: dateStr,
          count: dayData?.count || 0,
          intensity: dayData?.intensity || 'low',
          day: date.getDay(),
          week
        })
      }
      grid.push(weekData)
    }
    
    return grid
  }

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'high': return 'bg-green-600'
      case 'medium': return 'bg-green-400'
      case 'low': return 'bg-green-200'
      default: return 'bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h3>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'Unable to fetch dashboard data'}
            </p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading state if no dashboard data yet
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-gray-600">
                    Welcome back, {currentUser.name} - Vendor risk management overview
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  className="flex items-center gap-2"
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Total Requests</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {dashboardData.thirdPartyRequestStatus.totalRequests}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600 font-medium">+12%</span>
                    <span className="text-gray-600 ml-1">from last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Completion Rate</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {dashboardData.additionalMetrics.completionRate}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600 font-medium">+5%</span>
                    <span className="text-gray-600 ml-1">from last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Avg. Onboard Time</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {dashboardData.additionalMetrics.avgTimeToOnboard}
                        <span className="text-lg text-gray-600 ml-1">days</span>
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4 text-sm">
                    <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600 font-medium">-2 days</span>
                    <span className="text-gray-600 ml-1">from last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Overdue Assessments</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {dashboardData.assessmentStatusByDueDate.overdue}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4 text-sm">
                    <AlertTriangle className="w-4 h-4 text-red-600 mr-1" />
                    <span className="text-red-600 font-medium">Needs attention</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Request Status Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <PieChartIcon className="w-5 h-5 text-white" />
                    </div>
                    Third-Party Request Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={requestStatusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {requestStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Risk Criticality Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    Vendor Risk Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={riskCriticalityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8">
                          {riskCriticalityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Risk Trend and Engagement Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Risk Trend Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    Risk Trend (6 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashboardData.additionalMetrics.riskTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="high" 
                          stackId="1" 
                          stroke={colors.risk.critical} 
                          fill={colors.risk.critical} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="medium" 
                          stackId="1" 
                          stroke={colors.risk.medium} 
                          fill={colors.risk.medium} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="low" 
                          stackId="1" 
                          stroke={colors.risk.low} 
                          fill={colors.risk.low} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Engagement Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    Engagement Heatmap (30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center py-1">{day}</div>
                      ))}
                    </div>
                    {generateHeatmapGrid().map((week, weekIndex) => (
                      <div key={weekIndex} className="grid grid-cols-7 gap-1">
                        {week.map((day, dayIndex) => (
                          <div
                            key={`${weekIndex}-${dayIndex}`}
                            className={`w-6 h-6 rounded-sm ${getIntensityColor(day.intensity)} border border-gray-200`}
                            title={`${day.date}: ${day.count} activities`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                    <span>Less</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded-sm" />
                      <div className="w-3 h-3 bg-green-200 border border-gray-200 rounded-sm" />
                      <div className="w-3 h-3 bg-green-400 border border-gray-200 rounded-sm" />
                      <div className="w-3 h-3 bg-green-600 border border-gray-200 rounded-sm" />
                    </div>
                    <span>More</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Assessment Due Dates and Critical Vendors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Assessment Due Dates */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    Assessment Due Dates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dueDateData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <Badge variant="outline" className="text-lg font-bold">
                          {item.value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Critical Vendors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <Building className="w-5 h-5 text-white" />
                    </div>
                    Critical Vendors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.topCriticalVendors.slice(0, 5).map((vendor, index) => (
                      <div key={vendor.vendorId} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{vendor.vendorName}</p>
                            <p className="text-sm text-gray-600">{vendor.questionnaireStatus}</p>
                          </div>
                        </div>
                        <Badge 
                          className={`${
                            vendor.riskCriticality === 'HIGH' ? 'bg-red-100 text-red-800 border-red-200' :
                            vendor.riskCriticality === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            'bg-green-100 text-green-800 border-green-200'
                          }`}
                        >
                          {vendor.riskCriticality}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}