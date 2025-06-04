'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Shield, User, Building, Mail, Users, Award, Briefcase, Target, CheckCircle, AlertTriangle, Eye, EyeOff, ArrowRight, Clock,Zap,Star,Plus,X, BarChart3} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { API_ROUTES } from '@/lib/api'
import { InvitationData, AccountData, ProfileData } from '../../../../types/register.type'
import FloatingParticles from '@/components/animation/floatingparticles'

// Form validation
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhone = (phone: string) => {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,20}$/
  return phoneRegex.test(phone)
}

const validateWebsite = (website: string) => {
  try {
    new URL(website)
    return true
  } catch {
    return false
  }
}

export default function VendorRegistrationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  
  // State management
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Form data
  const [accountData, setAccountData] = useState<AccountData>({
    name: '',
    password: '',
    confirmPassword: ''
  })

  const [profileData, setProfileData] = useState<ProfileData>({
    companyName: '',
    registeredAddress: '',
    country: '',
    region: '',
    primaryContactName: '',
    primaryContactTitle: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    companyWebsite: '',
    yearEstablished: new Date().getFullYear(),
    companySize: 'MEDIUM',
    employeeCount: 1,
    legalStructure: 'PRIVATE_LIMITED',
    hasParentCompany: false,
    parentCompanyName: '',
    parentCompanyHeadquarters: '',
    keyExecutives: [{ name: '', title: '', email: '' }],
    businessSectors: [],
    productsServices: '',
    geographicalPresence: [],
    isPubliclyTraded: false,
    stockExchange: '',
    tickerSymbol: '',
    certifications: [{ name: '', issuedBy: '', validUntil: '' }]
  })

  // Constants
  const COMPANY_SIZES = [
    { value: 'MICRO', label: 'Micro (1-9 employees)' },
    { value: 'SMALL', label: 'Small (10-49 employees)' },
    { value: 'MEDIUM', label: 'Medium (50-249 employees)' },
    { value: 'LARGE', label: 'Large (250-999 employees)' },
    { value: 'ENTERPRISE', label: 'Enterprise (1000+ employees)' }
  ]

  const LEGAL_STRUCTURES = [
    { value: 'PRIVATE_LIMITED', label: 'Private Limited Company' },
    { value: 'PUBLIC_LIMITED', label: 'Public Limited Company' },
    { value: 'PARTNERSHIP', label: 'Partnership' },
    { value: 'SOLE_PROPRIETORSHIP', label: 'Sole Proprietorship' },
    { value: 'LLC', label: 'Limited Liability Company (LLC)' },
    { value: 'CORPORATION', label: 'Corporation' },
    { value: 'NON_PROFIT', label: 'Non-Profit Organization' },
    { value: 'OTHER', label: 'Other' }
  ]

  const BUSINESS_SECTORS = [
    'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail',
    'Education', 'Construction', 'Transportation', 'Energy', 'Agriculture',
    'Real Estate', 'Entertainment', 'Telecommunications', 'Consulting',
    'Government', 'Non-Profit', 'Other'
  ]

  const GEOGRAPHICAL_REGIONS = [
    'North America', 'South America', 'Europe', 'Asia Pacific', 
    'Middle East', 'Africa', 'Australia', 'Global'
  ]

  // Load invitation data
  useEffect(() => {
    if (token) {
      validateToken()
    }
  }, [token])

  const validateToken = async () => {
    try {
      setLoading(true)
      const response = await fetch(API_ROUTES.VENDOR.VERIFY_TOKEN(token))
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Invalid invitation token')
      }
      
      const data = await response.json()
      setInvitation(data)
      
      // Pre-fill some data from invitation
      setAccountData(prev => ({
        ...prev,
        name: data.vendorName || ''
      }))
      
      setProfileData(prev => ({
        ...prev,
        companyName: data.vendorName || '',
        primaryContactEmail: data.vendorEmail || ''
      }))
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAccountChange = (field: keyof AccountData, value: string) => {
    setAccountData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleProfileChange = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addKeyExecutive = () => {
    setProfileData(prev => ({
      ...prev,
      keyExecutives: [...prev.keyExecutives, { name: '', title: '', email: '' }]
    }))
  }

  const removeKeyExecutive = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      keyExecutives: prev.keyExecutives.filter((_, i) => i !== index)
    }))
  }

  const updateKeyExecutive = (index: number, field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      keyExecutives: prev.keyExecutives.map((exec, i) => 
        i === index ? { ...exec, [field]: value } : exec
      )
    }))
  }

  const addCertification = () => {
    setProfileData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { name: '', issuedBy: '', validUntil: '' }]
    }))
  }

  const removeCertification = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }))
  }

  const updateCertification = (index: number, field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }))
  }

  const validateStep1 = () => {
    if (!accountData.name.trim()) {
      toast.error('Full name is required')
      return false
    }
    if (accountData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return false
    }
    if (accountData.password !== accountData.confirmPassword) {
      toast.error('Passwords do not match')
      return false
    }
    return true
  }

 const validateStep2 = () => {
  const requiredFields = [
    'companyName', 'registeredAddress', 'country', 'region',
    'primaryContactName', 'primaryContactTitle', 'primaryContactEmail',
    'primaryContactPhone', 'companyWebsite', 'productsServices'
  ]

  for (const field of requiredFields) {
    if (!profileData[field as keyof ProfileData]) {
      toast.error(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`)
      return false
    }
  }

  // Conditional validation for parent company
  if (profileData.hasParentCompany) {
    if (!profileData.parentCompanyName.trim()) {
      toast.error('Parent company name is required')
      return false
    }
    if (!profileData.parentCompanyHeadquarters.trim()) {
      toast.error('Parent company headquarters is required')
      return false
    }
  }

  // Conditional validation for public trading
  if (profileData.isPubliclyTraded) {
    if (!profileData.stockExchange) {
      toast.error('Stock exchange is required for publicly traded companies')
      return false
    }
    if (!profileData.tickerSymbol.trim()) {
      toast.error('Ticker symbol is required for publicly traded companies')
      return false
    }
  }

  if (!validateEmail(profileData.primaryContactEmail)) {
    toast.error('Please enter a valid email address')
    return false
  }

  if (!validatePhone(profileData.primaryContactPhone)) {
    toast.error('Please enter a valid phone number')
    return false
  }

  if (!validateWebsite(profileData.companyWebsite)) {
    toast.error('Please enter a valid website URL')
    return false
  }

  if (profileData.businessSectors.length === 0) {
    toast.error('Please select at least one business sector')
    return false
  }

  if (profileData.geographicalPresence.length === 0) {
    toast.error('Please select at least one geographical region')
    return false
  }

  return true
}

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const submitRegistration = async () => {
    if (!validateStep2()) return

    try {
      setSubmitting(true)
      
      const response = await fetch(API_ROUTES.VENDOR.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          accountData,
          profileData
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Registration failed')
      }

      const result = await response.json()
      
      toast.success('Registration completed successfully!')
      
      // Store vendor info for dashboard
      localStorage.setItem('vendor', JSON.stringify({
        id: result.vendor.id,
        name: result.vendor.name,
        email: result.vendor.email
      }))

      // Redirect to questionnaire
      router.push(result.redirectUrl)
      
    } catch (error: any) {
      toast.error(error.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
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
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Validating Invitation</h2>
            <p className="text-gray-600">Please wait while we verify your invitation...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 relative overflow-hidden">
        <FloatingParticles />
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md mx-auto p-8"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <AlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            </motion.div>
            <h1 className="text-3xl font-bold text-red-700 mb-4">Invalid Invitation</h1>
            <p className="text-red-600 mb-6">{error}</p>
            <p className="text-sm text-gray-600">
              Please contact the client administrator for a new invitation link.
            </p>
          </motion.div>
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
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                    Vendor Registration
                  </h1>
                  <p className="text-gray-600">
                    Complete your profile to access the questionnaire
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4"
              >
                {invitation && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {invitation.clientName}
                    </div>
                    <div className="text-xs text-gray-500">
                      Due: {new Date(invitation.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
                <Badge variant="outline" className="border-teal-200 text-teal-700 bg-teal-50">
                  <Clock className="w-3 h-3 mr-1" />
                  Step {currentStep} of 3
                </Badge>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Invitation Details */}
          {invitation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <Card className="border-0 bg-gradient-to-r from-teal-600 to-blue-600 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"
                      >
                        <Target className="h-6 w-6" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-semibold">Questionnaire Assignment</h3>
                        <p className="text-blue-100 text-sm">
                          {invitation.templateName} • {invitation.totalQuestions} questions • Est. {invitation.estimatedTime}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge className={`px-3 py-1 text-sm font-bold ${
                        invitation.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700 border-red-200' :
                        invitation.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                        'bg-green-100 text-green-700 border-green-200'
                      }`}>
                        {invitation.riskLevel} Risk
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center">
              {[1, 2, 3].map((step, index) => (
                <React.Fragment key={step}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                      step <= currentStep
                        ? 'bg-gradient-to-br from-teal-500 to-blue-500 text-white border-teal-500'
                        : 'bg-white text-gray-400 border-gray-300'
                    }`}
                  >
                    {step < currentStep ? <CheckCircle className="w-6 h-6" /> : step}
                  </motion.div>
                  {index < 2 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className={`w-16 h-1 mx-2 ${
                        step < currentStep ? 'bg-gradient-to-r from-teal-500 to-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex items-center justify-center mt-4">
              <div className="grid grid-cols-3 gap-8 text-center text-sm">
                <div className={`${currentStep >= 1 ? 'text-teal-600 font-semibold' : 'text-gray-500'}`}>
                  Account Setup
                </div>
                <div className={`${currentStep >= 2 ? 'text-teal-600 font-semibold' : 'text-gray-500'}`}>
                  Company Profile
                </div>
                <div className={`${currentStep >= 3 ? 'text-teal-600 font-semibold' : 'text-gray-500'}`}>
                  Review & Submit
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Steps */}
          <AnimatePresence mode="wait">
            {/* Step 1: Account Setup */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      Account Setup
                    </CardTitle>
                    <p className="text-gray-600">Create your vendor account credentials</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        value={accountData.name}
                        onChange={(e) => handleAccountChange('name', e.target.value)}
                        placeholder="Enter your full name"
                        className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Password *
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={accountData.password}
                          onChange={(e) => handleAccountChange('password', e.target.value)}
                          placeholder="Create a secure password (min 8 characters)"
                          className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                        Confirm Password *
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={accountData.confirmPassword}
                          onChange={(e) => handleAccountChange('confirmPassword', e.target.value)}
                          placeholder="Confirm your password"
                          className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex justify-end pt-4"
                    >
                      <Button
                        onClick={nextStep}
                        className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 px-8"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Company Profile */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Basic Information */}
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <Building className="w-5 h-5 text-white" />
                      </div>
                      Basic Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-2"
                      >
                        <Label className="text-sm font-medium text-gray-700">Company Name *</Label>
                        <Input
                          value={profileData.companyName}
                          onChange={(e) => handleProfileChange('companyName', e.target.value)}
                          placeholder="Your company name"
                          className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2"
                      >
                        <Label className="text-sm font-medium text-gray-700">Website *</Label>
                        <Input
                          value={profileData.companyWebsite}
                          onChange={(e) => handleProfileChange('companyWebsite', e.target.value)}
                          placeholder="https://example.com"
                          className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="md:col-span-2 space-y-2"
                      >
                        <Label className="text-sm font-medium text-gray-700">Registered Address *</Label>
                        <Textarea
                          value={profileData.registeredAddress}
                          onChange={(e) => handleProfileChange('registeredAddress', e.target.value)}
                          placeholder="Complete registered address"
                          rows={3}
                          className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-2"
                      >
                        <Label className="text-sm font-medium text-gray-700">Country *</Label>
                        <Input
                          value={profileData.country}
                          onChange={(e) => handleProfileChange('country', e.target.value)}
                          placeholder="Country"
                          className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-2"
                      >
                        <Label className="text-sm font-medium text-gray-700">Region/State *</Label>
                        <Input
                          value={profileData.region}
                          onChange={(e) => handleProfileChange('region', e.target.value)}
                          placeholder="Region or State"
                          className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      Primary Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-2"
                      >
                        <Label className="text-sm font-medium text-gray-700">Contact Name *</Label>
                        <Input
                          value={profileData.primaryContactName}
                          onChange={(e) => handleProfileChange('primaryContactName', e.target.value)}
                          placeholder="Primary contact person"
                          className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2"
                      >
                        <Label className="text-sm font-medium text-gray-700">Title/Position *</Label>
                        <Input
                          value={profileData.primaryContactTitle}
                          onChange={(e) => handleProfileChange('primaryContactTitle', e.target.value)}
                          placeholder="Job title"
                          className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-2"
                      >
                        <Label className="text-sm font-medium text-gray-700">Email Address *</Label>
                        <Input
                          type="email"
                          value={profileData.primaryContactEmail}
                          onChange={(e) => handleProfileChange('primaryContactEmail', e.target.value)}
                          placeholder="contact@company.com"
                          className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-2"
                      >
                        <Label className="text-sm font-medium text-gray-700">Phone Number *</Label>
                        <Input
                          value={profileData.primaryContactPhone}
                          onChange={(e) => handleProfileChange('primaryContactPhone', e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>

                {/* Company Details */}
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-white" />
                      </div>
                      Company Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-2"
                      >
                        <Label className="text-sm font-medium text-gray-700">Year Established *</Label>
                        <Input
                          type="number"
                          value={profileData.yearEstablished}
                          onChange={(e) => handleProfileChange('yearEstablished', parseInt(e.target.value))}
                          min="1800"
                          max={new Date().getFullYear()}
                          className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2"
                      >
                        <Label className="text-sm font-medium text-gray-700">Employee Count *</Label>
                        <Input
                          type="number"
                          value={profileData.employeeCount}
                          onChange={(e) => handleProfileChange('employeeCount', parseInt(e.target.value))}
                          min="1"
                          className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-2"
                      >
                        <Label className="text-sm font-medium text-gray-700">Company Size *</Label>
                        <select
                          value={profileData.companySize}
                          onChange={(e) => handleProfileChange('companySize', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                          {COMPANY_SIZES.map((size) => (
                            <option key={size.value} value={size.value}>
                              {size.label}
                            </option>
                          ))}
                        </select>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-2"
                      >
                        <Label className="text-sm font-medium text-gray-700">Legal Structure *</Label>
                        <select
                          value={profileData.legalStructure}
                          onChange={(e) => handleProfileChange('legalStructure', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                          {LEGAL_STRUCTURES.map((structure) => (
                            <option key={structure.value} value={structure.value}>
                              {structure.label}
                            </option>
                          ))}
                        </select>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="md:col-span-2 space-y-2"
                      >
                        <Label className="text-sm font-medium text-gray-700">Products/Services Description *</Label>
                        <Textarea
                          value={profileData.productsServices}
                          onChange={(e) => handleProfileChange('productsServices', e.target.value)}
                          placeholder="Describe your main products and services"
                          rows={4}
                          className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="md:col-span-2 space-y-3"
                      >
                        <Label className="text-sm font-medium text-gray-700">Business Sectors * (Select all that apply)</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {BUSINESS_SECTORS.map((sector) => (
                            <label key={sector} className="flex items-center space-x-2 cursor-pointer">
                              <Checkbox
                                checked={profileData.businessSectors.includes(sector)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handleProfileChange('businessSectors', [...profileData.businessSectors, sector])
                                  } else {
                                    handleProfileChange('businessSectors', 
                                      profileData.businessSectors.filter(s => s !== sector)
                                    )
                                  }
                                }}
                              />
                              <span className="text-sm text-gray-700">{sector}</span>
                            </label>
                          ))}
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="md:col-span-2 space-y-3"
                      >
                        <Label className="text-sm font-medium text-gray-700">Geographical Presence * (Select all that apply)</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {GEOGRAPHICAL_REGIONS.map((region) => (
                            <label key={region} className="flex items-center space-x-2 cursor-pointer">
                              <Checkbox
                                checked={profileData.geographicalPresence.includes(region)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handleProfileChange('geographicalPresence', [...profileData.geographicalPresence, region])
                                  } else {
                                    handleProfileChange('geographicalPresence', 
                                      profileData.geographicalPresence.filter(r => r !== region)
                                    )
                                  }
                                }}
                              />
                              <span className="text-sm text-gray-700">{region}</span>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
                {/* Parent Company Information - Add after Company Details Card */}
<Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
  <CardHeader>
    <CardTitle className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
        <Building className="w-5 h-5 text-white" />
      </div>
      Parent Company Information
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center space-x-3"
      >
        <Checkbox
          id="hasParentCompany"
          checked={profileData.hasParentCompany}
          onCheckedChange={(checked) => {
            handleProfileChange('hasParentCompany', checked)
            if (!checked) {
              handleProfileChange('parentCompanyName', '')
              handleProfileChange('parentCompanyHeadquarters', '')
            }
          }}
        />
        <Label htmlFor="hasParentCompany" className="text-sm font-medium text-gray-700">
          This company has a parent company
        </Label>
      </motion.div>

      {profileData.hasParentCompany && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <Label className="text-sm font-medium text-gray-700">Parent Company Name *</Label>
            <Input
              value={profileData.parentCompanyName}
              onChange={(e) => handleProfileChange('parentCompanyName', e.target.value)}
              placeholder="Name of parent company"
              className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <Label className="text-sm font-medium text-gray-700">Parent Company Headquarters *</Label>
            <Input
              value={profileData.parentCompanyHeadquarters}
              onChange={(e) => handleProfileChange('parentCompanyHeadquarters', e.target.value)}
              placeholder="Location of parent company headquarters"
              className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  </CardContent>
</Card>

{/* Public Trading Information - Add after Parent Company Card */}
<Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
  <CardHeader>
    <CardTitle className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
        <BarChart3 className="w-5 h-5 text-white" />
      </div>
      Public Trading Information
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center space-x-3"
      >
        <Checkbox
          id="isPubliclyTraded"
          checked={profileData.isPubliclyTraded}
          onCheckedChange={(checked) => {
            handleProfileChange('isPubliclyTraded', checked)
            if (!checked) {
              handleProfileChange('stockExchange', '')
              handleProfileChange('tickerSymbol', '')
            }
          }}
        />
        <Label htmlFor="isPubliclyTraded" className="text-sm font-medium text-gray-700">
          This company is publicly traded
        </Label>
      </motion.div>

      {profileData.isPubliclyTraded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <Label className="text-sm font-medium text-gray-700">Stock Exchange *</Label>
            <select
              value={profileData.stockExchange}
              onChange={(e) => handleProfileChange('stockExchange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Select stock exchange</option>
              <option value="NYSE">New York Stock Exchange (NYSE)</option>
              <option value="NASDAQ">NASDAQ</option>
              <option value="LSE">London Stock Exchange (LSE)</option>
              <option value="TSE">Tokyo Stock Exchange (TSE)</option>
              <option value="EURONEXT">Euronext</option>
              <option value="TSX">Toronto Stock Exchange (TSX)</option>
              <option value="ASX">Australian Securities Exchange (ASX)</option>
              <option value="BSE">Bombay Stock Exchange (BSE)</option>
              <option value="NSE">National Stock Exchange of India (NSE)</option>
              <option value="SSE">Shanghai Stock Exchange (SSE)</option>
              <option value="SZSE">Shenzhen Stock Exchange (SZSE)</option>
              <option value="OTHER">Other</option>
            </select>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <Label className="text-sm font-medium text-gray-700">Ticker Symbol *</Label>
            <Input
              value={profileData.tickerSymbol}
              onChange={(e) => handleProfileChange('tickerSymbol', e.target.value.toUpperCase())}
              placeholder="e.g., AAPL, MSFT, GOOGL"
              className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  </CardContent>
</Card>

                {/* Key Executives */}
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        Key Executives
                      </div>
                      <Button
                        type="button"
                        onClick={addKeyExecutive}
                        size="sm"
                        variant="outline"
                        className="border-teal-200 text-teal-700 hover:bg-teal-50"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Executive
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {profileData.keyExecutives.map((executive, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border"
                        >
                          <Input
                            value={executive.name}
                            onChange={(e) => updateKeyExecutive(index, 'name', e.target.value)}
                            placeholder="Executive name"
                            className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                          <Input
                            value={executive.title}
                            onChange={(e) => updateKeyExecutive(index, 'title', e.target.value)}
                            placeholder="Title/Position"
                            className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                          <Input
                            type="email"
                            value={executive.email}
                            onChange={(e) => updateKeyExecutive(index, 'email', e.target.value)}
                            placeholder="Email address"
                            className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                          <div className="flex items-center">
                            {profileData.keyExecutives.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => removeKeyExecutive(index)}
                                size="sm"
                                variant="outline"
                                className="border-red-200 text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Certifications */}
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        Certifications & Compliance
                      </div>
                      <Button
                        type="button"
                        onClick={addCertification}
                        size="sm"
                        variant="outline"
                        className="border-teal-200 text-teal-700 hover:bg-teal-50"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Certification
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {profileData.certifications.map((cert, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border"
                        >
                          <Input
                            value={cert.name}
                            onChange={(e) => updateCertification(index, 'name', e.target.value)}
                            placeholder="Certification name"
                            className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                          <Input
                            value={cert.issuedBy}
                            onChange={(e) => updateCertification(index, 'issuedBy', e.target.value)}
                            placeholder="Issued by"
                            className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                          <Input
                            type="date"
                            value={cert.validUntil}
                            onChange={(e) => updateCertification(index, 'validUntil', e.target.value)}
                            className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                          <div className="flex items-center">
                            {profileData.certifications.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => removeCertification(index)}
                                size="sm"
                                variant="outline"
                                className="border-red-200 text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Navigation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center justify-between pt-4"
                >
                  <Button
                    onClick={prevStep}
                    variant="outline"
                    className="border-gray-300 hover:border-teal-500 hover:bg-teal-50"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 px-8"
                  >
                    Review & Submit
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {/* Step 3: Review & Submit */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      Review Your Information
                    </CardTitle>
                    <p className="text-gray-600">Please review all information before submitting</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Account Summary */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <h4 className="font-semibold text-blue-900 mb-2">Account Information</h4>
                      <p className="text-sm text-blue-800">Name: <strong>{accountData.name}</strong></p>
                      <p className="text-sm text-blue-800">Password: <strong>••••••••</strong></p>
                    </motion.div>

                    {/* Company Summary */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="p-4 bg-green-50 rounded-lg border border-green-200"
                    >
                      <h4 className="font-semibold text-green-900 mb-2">Company Profile</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-800">
                        <p>Company: <strong>{profileData.companyName}</strong></p>
                        <p>Contact: <strong>{profileData.primaryContactName}</strong></p>
                        <p>Email: <strong>{profileData.primaryContactEmail}</strong></p>
                        <p>Phone: <strong>{profileData.primaryContactPhone}</strong></p>
                        <p>Employees: <strong>{profileData.employeeCount}</strong></p>
                        <p>Established: <strong>{profileData.yearEstablished}</strong></p>
                        <p>Sectors: <strong>{profileData.businessSectors.length} selected</strong></p>
                        <p>Regions: <strong>{profileData.geographicalPresence.length} selected</strong></p>
                        <p>Executives: <strong>{profileData.keyExecutives.length} listed</strong></p>
                        <p>Certifications: <strong>{profileData.certifications.length} listed</strong></p>
                      </div>
                    </motion.div>

                    {/* Next Steps */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="p-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-200"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Zap className="w-8 h-8 text-teal-600" />
                        <h4 className="text-lg font-semibold text-teal-900">What happens next?</h4>
                      </div>
                      <div className="space-y-3 text-sm text-teal-800">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-600" />
                          <span>Your vendor account will be created</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-600" />
                          <span>You'll be redirected to the questionnaire</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-600" />
                          <span>Complete {invitation?.totalQuestions} questions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-600" />
                          <span>Submit for client review</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center justify-between pt-6"
                    >
                      <Button
                        onClick={prevStep}
                        variant="outline"
                        disabled={submitting}
                        className="border-gray-300 hover:border-teal-500 hover:bg-teal-50"
                      >
                        Previous
                      </Button>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={submitRegistration}
                          disabled={submitting}
                          size="lg"
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl px-12"
                        >
                          {submitting && (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                          )}
                          Complete Registration
                          <Star className="w-5 h-5 ml-2" />
                        </Button>
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}