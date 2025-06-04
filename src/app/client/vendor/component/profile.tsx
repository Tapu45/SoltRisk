'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Users, 
  Globe, 
  Award,
  Mail,
  Phone,
  Briefcase,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Star,
  Shield,
  TrendingUp,
  Eye,
  Clock,
  Zap,
  Target,
  BarChart3,
  Layers,
  Crown,
  Building,
  Factory,
  RefreshCw,
  ChevronRight,
  ArrowRight
} from 'lucide-react'

interface VendorProfileProps {
  profile: {
    id: string
    vendorId: string
    companyName: string
    registeredAddress: string
    country: string
    region: string
    primaryContactName: string
    primaryContactTitle: string
    primaryContactEmail: string
    primaryContactPhone: string
    companyWebsite: string
    yearEstablished: number
    companySize: string
    employeeCount: number
    legalStructure: string
    hasParentCompany: boolean
    parentCompanyName: string | null
    parentCompanyHeadquarters: string | null
    keyExecutives: Array<{
      name: string
      email: string
      title: string
    }>
    businessSectors: string[]
    productsServices: string
    geographicalPresence: string[]
    isPubliclyTraded: boolean
    stockExchange: string | null
    tickerSymbol: string | null
    certifications: Array<{
      name: string
      issuedBy: string
      validUntil: string
    }>
    isCompleted: boolean
    completedAt: string | null
    completionPercentage: number
    createdAt: string
    updatedAt: string
    createdBy: string
  } | null
  vendor: {
    id: string
    userId: string
    name: string
    email: string
    createdAt: string
  }
  isExpanded?: boolean
  onToggle?: () => void
  showProgress?: boolean
  summary?: {
    totalQuestionnaires: number
    completedQuestionnaires: number
    pendingQuestionnaires: number
    averageProgress: number
  }
}

const companySizeLabels = {
  MICRO: 'Micro Enterprise',
  SMALL: 'Small Business',
  MEDIUM: 'Medium Enterprise',
  LARGE: 'Large Corporation',
  ENTERPRISE: 'Enterprise'
}

const legalStructureLabels = {
  SOLE_PROPRIETORSHIP: 'Sole Proprietorship',
  PARTNERSHIP: 'Partnership',
  PRIVATE_LIMITED: 'Private Limited',
  PUBLIC_LIMITED: 'Public Limited',
  LLC: 'LLC',
  CORPORATION: 'Corporation',
  LLP: 'LLP',
  NON_PROFIT: 'Non-Profit',
  OTHER: 'Other'
}

const sectorIcons: { [key: string]: any } = {
  'Technology': Zap,
  'Healthcare': Shield,
  'Finance': TrendingUp,
  'Manufacturing': Factory,
  'Retail': Building,
  'Education': Award,
  'Construction': Building2,
  'Transportation': Globe,
  'Energy': Star,
  'Government': Crown,
  'Consulting': Target,
  'Real Estate': Building,
  'Entertainment': Star,
  'Telecommunications': Globe,
  'Agriculture': Target,
  'Non-Profit': Shield
}

const companySizeIcons = {
  MICRO: Users,
  SMALL: Users,
  MEDIUM: Building2,
  LARGE: Building,
  ENTERPRISE: Factory
}

export default function VendorProfile({ 
  profile, 
  vendor, 
  isExpanded = false, 
  onToggle,
  showProgress = false,
  summary 
}: VendorProfileProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getCompanyAge = () => {
    const currentYear = new Date().getFullYear()
    return currentYear - (profile?.yearEstablished || currentYear)
  }

  const getSectorIcon = (sector: string) => {
    return sectorIcons[sector] || Target
  }

  const getCompanySizeIcon = (size: string) => {
    return companySizeIcons[size as keyof typeof companySizeIcons] || Users
  }

  if (!profile) {
    return (
      <div className="w-full bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-2xl border border-orange-200 overflow-hidden">
        <div className="p-8 text-center">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <XCircle className="h-10 w-10 text-white" />
          </motion.div>
          
          <h3 className="text-2xl font-bold text-orange-900 mb-3">Profile Incomplete</h3>
          <p className="text-orange-700 mb-8 max-w-md mx-auto">
            This vendor hasn't completed their company profile yet. They need to fill out their profile information before proceeding with assessments.
          </p>
          
          {/* Basic Info Strip */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/50">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-left">
                <div className="text-sm text-gray-500">Vendor Name</div>
                <div className="font-medium text-gray-900">{vendor.name}</div>
              </div>
              <div className="text-left">
                <div className="text-sm text-gray-500">Email Address</div>
                <div className="font-medium text-gray-900">{vendor.email}</div>
              </div>
              <div className="text-left">
                <div className="text-sm text-gray-500">Account Created</div>
                <div className="font-medium text-gray-900">{formatDate(vendor.createdAt)}</div>
              </div>
              <div className="text-left">
                <div className="text-sm text-gray-500">Vendor ID</div>
                <div className="font-medium text-gray-900">{vendor.id.slice(-8)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {/* Unified Profile Card */}
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-teal-50/40 backdrop-blur-sm shadow-2xl rounded-2xl border border-white/50 overflow-hidden">
        
        {/* Header Section */}
        <div className="relative p-8 bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600">
          {/* Decorative Elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-6">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border border-white/30"
                >
                  <Building2 className="h-10 w-10 text-white" />
                </motion.div>
                
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h1 className="text-3xl font-bold text-white">
                      {profile.companyName}
                    </h1>
                    <Badge 
                      className={`px-3 py-1 ${
                        profile.isCompleted 
                          ? 'bg-green-500 text-white border-green-400' 
                          : 'bg-yellow-500 text-white border-yellow-400'
                      }`}
                    >
                      {profile.isCompleted ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          {profile.completionPercentage}% Complete
                        </>
                      )}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-6 text-white/90">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Est. {profile.yearEstablished} ({getCompanyAge()} years)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.country}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{profile.employeeCount} employees</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {profile.companyWebsite && (
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={profile.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/30 transition-colors"
                  >
                    <ExternalLink className="h-5 w-5 text-white" />
                  </motion.a>
                )}
                
                {onToggle && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={onToggle}
                      className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Show More
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    {React.createElement(getCompanySizeIcon(profile.companySize), { 
                      className: "w-5 h-5 text-white" 
                    })}
                  </div>
                  <div>
                    <p className="text-xs text-white/70">Company Size</p>
                    <p className="text-sm font-medium text-white">
                      {companySizeLabels[profile.companySize as keyof typeof companySizeLabels] || profile.companySize}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/70">Legal Structure</p>
                    <p className="text-sm font-medium text-white">
                      {legalStructureLabels[profile.legalStructure as keyof typeof legalStructureLabels] || profile.legalStructure}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/70">Global Presence</p>
                    <p className="text-sm font-medium text-white">{profile.geographicalPresence.length} markets</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/70">Certifications</p>
                    <p className="text-sm font-medium text-white">{profile.certifications.length} active</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Progress Indicators */}
            <div className="mt-6 space-y-4">
              {/* Profile Completion */}
              {!profile.isCompleted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white/90">Profile Completion</span>
                    <span className="text-sm text-white/70">{profile.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${profile.completionPercentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full"
                    />
                  </div>
                </motion.div>
              )}

              {/* Assessment Progress */}
              {showProgress && summary && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-white" />
                    <span className="font-medium text-white">Assessment Progress</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-white font-bold">{summary.totalQuestionnaires}</div>
                      <div className="text-white/70 text-xs">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-300 font-bold">{summary.completedQuestionnaires}</div>
                      <div className="text-white/70 text-xs">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-300 font-bold">{summary.pendingQuestionnaires}</div>
                      <div className="text-white/70 text-xs">Pending</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Content Sections - No gaps, unified flow */}
        <div className="bg-white">
          {/* Contact Information Strip */}
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{profile.primaryContactName}</div>
                  <div className="text-sm text-blue-700">{profile.primaryContactTitle}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email Address</div>
                  <a href={`mailto:${profile.primaryContactEmail}`} className="font-medium text-green-700 hover:underline">
                    {profile.primaryContactEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Phone Number</div>
                  <a href={`tel:${profile.primaryContactPhone}`} className="font-medium text-purple-700 hover:underline">
                    {profile.primaryContactPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Company Overview Strip */}
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Company Overview</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-teal-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Registered Address</div>
                    <div className="text-gray-700">{profile.registeredAddress}</div>
                    <div className="text-sm text-gray-500">{profile.region}, {profile.country}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-gray-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Products & Services</div>
                    <div className="text-gray-700 leading-relaxed">{profile.productsServices}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Sectors & Geography - Side by side */}
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Business Sectors */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <Layers className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Business Sectors</h3>
                  <Badge variant="secondary">{profile.businessSectors.length} sectors</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {profile.businessSectors.map((sector, index) => {
                    const SectorIcon = getSectorIcon(sector)
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200"
                      >
                        <SectorIcon className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-900">{sector}</span>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Geographical Presence */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Global Presence</h3>
                  <Badge variant="secondary">{profile.geographicalPresence.length} regions</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {profile.geographicalPresence.map((region, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200"
                    >
                      <MapPin className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">{region}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Expanded Details - Accordion style */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-gray-100"
              >
                {/* Key Executives */}
                {profile.keyExecutives.length > 0 && (
                  <div className="px-8 py-6 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Key Executives</h3>
                      <Badge variant="secondary">{profile.keyExecutives.length} executives</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.keyExecutives.map((executive, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-indigo-600">
                                {executive.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-indigo-900">{executive.name}</div>
                              <div className="text-sm text-indigo-700">{executive.title}</div>
                            </div>
                          </div>
                          <a 
                            href={`mailto:${executive.email}`}
                            className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {profile.certifications.length > 0 && (
                  <div className="px-8 py-6 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Certifications & Compliance</h3>
                      <Badge variant="secondary">{profile.certifications.length} certifications</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.certifications.map((cert, index) => {
                        const isExpired = new Date(cert.validUntil) < new Date()
                        const isExpiringSoon = new Date(cert.validUntil) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-xl border ${
                              isExpired 
                                ? 'bg-red-50 border-red-200' 
                                : isExpiringSoon 
                                  ? 'bg-yellow-50 border-yellow-200'
                                  : 'bg-green-50 border-green-200'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                  isExpired 
                                    ? 'bg-red-100' 
                                    : isExpiringSoon 
                                      ? 'bg-yellow-100'
                                      : 'bg-green-100'
                                }`}>
                                  <Award className={`w-5 h-5 ${
                                    isExpired 
                                      ? 'text-red-600' 
                                      : isExpiringSoon 
                                        ? 'text-yellow-600'
                                        : 'text-green-600'
                                  }`} />
                                </div>
                                <div>
                                  <div className={`font-semibold ${
                                    isExpired 
                                      ? 'text-red-900' 
                                      : isExpiringSoon 
                                        ? 'text-yellow-900'
                                        : 'text-green-900'
                                  }`}>
                                    {cert.name}
                                  </div>
                                  <div className={`text-sm ${
                                    isExpired 
                                      ? 'text-red-700' 
                                      : isExpiringSoon 
                                        ? 'text-yellow-700'
                                        : 'text-green-700'
                                  }`}>
                                    Issued by {cert.issuedBy}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-xs ${
                                  isExpired 
                                    ? 'text-red-600' 
                                    : isExpiringSoon 
                                      ? 'text-yellow-600'
                                      : 'text-green-600'
                                }`}>
                                  {isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Valid until'}
                                </div>
                                <div className={`text-sm font-medium ${
                                  isExpired 
                                    ? 'text-red-800' 
                                    : isExpiringSoon 
                                      ? 'text-yellow-800'
                                      : 'text-green-800'
                                }`}>
                                  {formatDate(cert.validUntil)}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Additional Information Row */}
                <div className="px-8 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Parent Company */}
                    {profile.hasParentCompany && profile.parentCompanyName && (
                      <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Crown className="w-5 h-5 text-cyan-600" />
                          <span className="font-medium text-cyan-900">Parent Company</span>
                        </div>
                        <div className="font-semibold text-gray-900">{profile.parentCompanyName}</div>
                        {profile.parentCompanyHeadquarters && (
                          <div className="text-sm text-cyan-700 mt-1">
                            HQ: {profile.parentCompanyHeadquarters}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Stock Information */}
                    {profile.isPubliclyTraded && (
                      <div className="p-4 bg-violet-50 rounded-xl border border-violet-200">
                        <div className="flex items-center gap-3 mb-2">
                          <TrendingUp className="w-5 h-5 text-violet-600" />
                          <span className="font-medium text-violet-900">Public Trading</span>
                        </div>
                        <div className="space-y-1">
                          {profile.stockExchange && (
                            <div className="text-sm text-violet-700">Exchange: {profile.stockExchange}</div>
                          )}
                          {profile.tickerSymbol && (
                            <div className="text-sm text-violet-700">Ticker: {profile.tickerSymbol}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Profile Metadata */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-900">Profile Timeline</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="text-gray-700">Created: {formatDate(profile.createdAt)}</div>
                        <div className="text-gray-700">Updated: {formatDate(profile.updatedAt)}</div>
                        {profile.completedAt && (
                          <div className="text-green-700">Completed: {formatDate(profile.completedAt)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}