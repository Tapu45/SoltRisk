'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Send,
  FileText,
  Save,
  Building,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Target,
  Eye,
  Calendar,
  Archive,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { API_ROUTES } from '@/lib/api'

// Types
interface Question {
  id: string
  questionText: string
  questionType: string
  questionOptions?: any
  options?: any
  isRequired: boolean
  order: number
  sectionId: string
}

interface Section {
  id: string
  title: string
  description: string
  order: number
  Questions: Question[]
}

interface UserDetails {
  fullName: string
  email: string
  jobTitle: string
  department: string
  organization: string
}

// REPLACE the FloatingParticles component with this:
const FloatingParticles = () => {
  const [isClient, setIsClient] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 1000, height: 1000 })
  
  // Generate stable particles only on client
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    targetX: number
    targetY: number
    duration: number
  }>>([])
  
  useEffect(() => {
    setIsClient(true)
    
    // Set dimensions and generate particles only on client side
    const updateDimensions = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setDimensions({ width, height })
      
      // Generate stable particles with fixed seed-like behavior
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: (i * 123 + 456) % width, // Pseudo-random but deterministic
        y: (i * 789 + 234) % height,
        targetX: ((i + 1) * 345 + 678) % width,
        targetY: ((i + 1) * 567 + 890) % height,
        duration: 10 + (i % 8) * 2 // Deterministic duration between 10-25
      }))
      setParticles(newParticles)
    }
    
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])
  
  // Don't render anything during SSR
  if (!isClient) {
    return null
  }
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full opacity-30"
          initial={{
            x: particle.x,
            y: particle.y,
          }}
          animate={{
            x: particle.targetX,
            y: particle.targetY,
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}

export default function CompleteRifPage() {
  const params = useParams()
  const token = params.token as string
  
  // Form state
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [userDetails, setUserDetails] = useState<UserDetails>({
    fullName: '',
    email: '',
    jobTitle: '',
    department: '',
    organization: ''
  })
  const [allAnswers, setAllAnswers] = useState<{[sectionId: string]: any[]}>({})
  const [initiation, setInitiation] = useState<any>(null)
  const [rifForm, setRifForm] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [userDetailsExpanded, setUserDetailsExpanded] = useState(false)
  const saveTimeouts = useRef<{[key: string]: NodeJS.Timeout}>({})
  const lastSavedAnswers = useRef<{[key: string]: any}>({})
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)

  // Load initiation details and validate token
  useEffect(() => {
    validateTokenAndLoadData()
  }, [token])

    // ADD THIS NEW useEffect AFTER EXISTING ONES:
  useEffect(() => {
    return () => {
      // Cleanup timeouts on unmount
      Object.values(saveTimeouts.current).forEach(timeout => {
        clearTimeout(timeout)
      })
    }
  }, [])

  const validateTokenAndLoadData = async () => {
    try {
      setLoading(true)
      
      // Validate token
      const tokenResponse = await fetch(API_ROUTES.RIF.VALIDATE_TOKEN(token))
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json()
        throw new Error(errorData.error || 'Invalid or expired token')
      }
      const tokenData = await tokenResponse.json()
      setInitiation(tokenData)

      // Pre-fill user details from assignment
      setUserDetails({
        fullName: tokenData.internalUserName || '',
        email: tokenData.internalUserEmail || '',
        department: tokenData.internalUserDept || '',
        jobTitle: tokenData.internalUserRole || '',
        organization: ''
      })

      // Get form structure
      const formResponse = await fetch(API_ROUTES.RIF.GET_FORM_STRUCTURE)
      if (!formResponse.ok) throw new Error('Failed to fetch form')
      const formData = await formResponse.json()
      setRifForm(formData)

      // Create or get submission
      await createOrGetSubmission(tokenData.initiationId)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createOrGetSubmission = async (initiationId: string) => {
    try {
      // Check if submission exists
      const checkResponse = await fetch(API_ROUTES.RIF.CHECK_SUBMISSION(initiationId))
      const checkData = await checkResponse.json()
      
      if (checkData.exists) {
        setSubmissionId(checkData.submissionId)
        // Load existing answers if they exist
        loadExistingAnswers(checkData.submissionId)
      } else {
        // Create new submission
        const createResponse = await fetch(API_ROUTES.RIF.CREATE_DRAFT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initiationId })
        })
        const createData = await createResponse.json()
        setSubmissionId(createData.submissionId)
      }
    } catch (error) {
      console.error('Error creating submission:', error)
      toast.error('Failed to create submission')
    }
  }

  const loadExistingAnswers = async (submissionId: string) => {
    try {
      const response = await fetch(API_ROUTES.RIF.GET_DRAFT(submissionId))
      if (response.ok) {
        const draftData = await response.json()
        
        // Pre-populate answers if they exist
        if (draftData.Answers && draftData.Answers.length > 0) {
          const answersBySection = draftData.Answers.reduce((acc: any, answer: any) => {
            const sectionId = answer.Question.sectionId
            if (!acc[sectionId]) acc[sectionId] = []
            acc[sectionId].push({
              questionId: answer.questionId,
              value: answer.answerValue
            })
            return acc
          }, {})
          setAllAnswers(answersBySection)
        }
      }
    } catch (error) {
      console.error('Error loading existing answers:', error)
    }
  }

 const saveAnswers = async (answers: any[], sectionId: string) => {
    if (!submissionId) return

    try {
      setSaving(true)
      
      // Enhance answers with question details for proper scoring
      const enhancedAnswers = answers.map(answer => {
        const question = rifForm?.Sections
          ?.find((s: Section) => s.id === sectionId)
          ?.Questions?.find((q: Question) => q.id === answer.questionId)
        
        return {
          ...answer,
          questionType: question?.questionType,
          questionOptions: question?.questionOptions || question?.options, // ← ADD THIS!
          isRequired: question?.isRequired,
          maxPoints: question?.maxPoints || 0,
          weightage: question?.weightage || 1.0
        }
      })
      
      const response = await fetch(API_ROUTES.RIF.SAVE_ANSWERS, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          answers: enhancedAnswers, // ← Send enhanced answers with questionOptions
          sectionId,
          submittedBy: userDetails.fullName
        })
      })
      
      if (response.ok) {
        setLastSavedTime(new Date())
      }
    } catch (error) {
      console.error('Error saving answers:', error)
      toast.error('Failed to save progress')
    } finally {
      setSaving(false)
    }
  }

  // Submit final form
  const submitForm = async () => {
    if (!submissionId) return

    try {
      setSubmitting(true)
      const response = await fetch(API_ROUTES.RIF.SUBMIT_FORM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          clientComments: '',
          submittedBy: userDetails.fullName
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        toast.success('RIF Assessment submitted successfully!')
        setIsSubmitted(true)
      } else {
        throw new Error('Failed to submit form')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Failed to submit form')
    } finally {
      setSubmitting(false)
    }
  }

   // REPLACE THE EXISTING handleAnswerChange FUNCTION WITH THIS:
  const handleAnswerChange = (sectionId: string, questionId: string, value: any) => {
    const saveKey = `${sectionId}_${questionId}`
    
    // Update UI immediately (optimistic update)
    setAllAnswers(prev => {
      const sectionAnswers = prev[sectionId] || []
      const existing = sectionAnswers.find(a => a.questionId === questionId)
      
      let newSectionAnswers
      if (existing) {
        newSectionAnswers = sectionAnswers.map(a => 
          a.questionId === questionId ? { ...a, value } : a
        )
      } else {
        newSectionAnswers = [...sectionAnswers, { questionId, value }]
      }
      
      return {
        ...prev,
        [sectionId]: newSectionAnswers
      }
    })
    
    // Clear existing timeout for this specific question
    if (saveTimeouts.current[saveKey]) {
      clearTimeout(saveTimeouts.current[saveKey])
    }
    
    // Check if value actually changed
    if (lastSavedAnswers.current[saveKey] === value) {
      return // Don't save if value hasn't changed
    }
    
    // Set new debounced timeout
    saveTimeouts.current[saveKey] = setTimeout(async () => {
      const answerToSave = [{ questionId, value }]
      await saveAnswers(answerToSave, sectionId)
      lastSavedAnswers.current[saveKey] = value
      delete saveTimeouts.current[saveKey]
    }, 2000)
  }

  const handleUserDetailsChange = (field: keyof UserDetails, value: string) => {
    setUserDetails(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const isUserDetailsComplete = () => {
    return userDetails.fullName && 
           userDetails.email && 
           userDetails.jobTitle && 
           userDetails.department && 
           userDetails.organization
  }

  const isSectionComplete = (section: Section) => {
    // Section 1 is always complete (filled by admin)
    if (section.order === 1) {
      return true
    }
    
    const sectionAnswers = allAnswers[section.id] || []
    const requiredQuestions = section.Questions.filter((q: Question) => q.isRequired)
    
    // Check if all required questions have valid answers
    const answeredRequired = requiredQuestions.filter(question => {
      const answer = sectionAnswers.find(a => a.questionId === question.id)
      if (!answer) return false
      
      // Check if answer has valid value based on question type
      const value = answer.value
      if (value === null || value === undefined || value === '') return false
      
      // For arrays (multiple choice), check if at least one option is selected
      if (Array.isArray(value) && value.length === 0) return false
      
      return true
    })
    
    return answeredRequired.length === requiredQuestions.length
  }

  const getOverallProgress = () => {
    if (!rifForm?.Sections) return 0
    
    let totalSections = 0
    let completedSections = 0
    
    // Check each section completion
    rifForm.Sections.forEach((section: Section) => {
      totalSections++
      if (isSectionComplete(section)) {
        completedSections++
      }
    })
    
    // Check user details completion
    const userDetailsComplete = isUserDetailsComplete() ? 1 : 0
    
    // Total progress = (completed sections + user details) / (total sections + 1 for user details)
    // Cap at 100%
    const progress = ((completedSections + userDetailsComplete) / (totalSections + 1)) * 100
    return Math.min(Math.round(progress), 100)
  }

  const renderQuestion = (question: Question, sectionId: string) => {
    const sectionAnswers = allAnswers[sectionId] || []
    const currentAnswer = sectionAnswers.find(a => a.questionId === question.id)?.value || ''

    const getQuestionWidth = (questionType: string) => {
      switch (questionType) {
        case 'TEXTAREA':
          return 'col-span-full' // Full width for textarea
        case 'TEXT':
        case 'DATE':
          return 'lg:col-span-1 col-span-full' // Half width for text inputs on large screens
        case 'SINGLE_CHOICE':
        case 'MULTIPLE_CHOICE':
        case 'BOOLEAN':
          return 'col-span-full' // Full width for choice questions
        case 'DROPDOWN':
          return 'lg:col-span-1 col-span-full' // Half width for dropdowns on large screens
        default:
          return 'lg:col-span-1 col-span-full'
      }
    }

    const renderInput = () => {
      switch (question.questionType) {
        case 'TEXT':
          return (
            <Input
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(sectionId, question.id, e.target.value)}
              placeholder="Enter your answer"
              className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          )

        case 'TEXTAREA':
          return (
            <textarea
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(sectionId, question.id, e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-vertical"
              placeholder="Enter your detailed answer"
            />
          )

        case 'SINGLE_CHOICE':
          const singleChoices = question.questionOptions?.choices || question.options?.choices || []
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {singleChoices.map((choice: any) => (
                <motion.label 
                  key={choice.value} 
                  className="flex items-center group cursor-pointer bg-gray-50 hover:bg-teal-50 p-3 rounded-lg border border-gray-200 hover:border-teal-300 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={choice.value}
                    checked={currentAnswer === choice.value}
                    onChange={(e) => handleAnswerChange(sectionId, question.id, e.target.value)}
                    className="mr-3 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-teal-700 transition-colors font-medium">
                    {choice.label}
                  </span>
                </motion.label>
              ))}
            </div>
          )

        case 'MULTIPLE_CHOICE':
          const selectedValues = Array.isArray(currentAnswer) ? currentAnswer : []
          const multipleChoices = question.questionOptions?.choices || question.options?.choices || []
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {multipleChoices.map((choice: any) => (
                <motion.label 
                  key={choice.value} 
                  className="flex items-center group cursor-pointer bg-gray-50 hover:bg-teal-50 p-3 rounded-lg border border-gray-200 hover:border-teal-300 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="checkbox"
                    value={choice.value}
                    checked={selectedValues.includes(choice.value)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...selectedValues, choice.value]
                        : selectedValues.filter(v => v !== choice.value)
                      handleAnswerChange(sectionId, question.id, newValues)
                    }}
                    className="mr-3 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-teal-700 transition-colors font-medium">
                    {choice.label}
                  </span>
                </motion.label>
              ))}
            </div>
          )

        case 'DROPDOWN':
          const dropdownChoices = question.questionOptions?.choices || question.options?.choices || []
          return (
            <select
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(sectionId, question.id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
            >
              <option value="">Select an option</option>
              {dropdownChoices.map((choice: any) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
          )

        case 'DATE':
          return (
            <Input
              type="date"
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(sectionId, question.id, e.target.value)}
              className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          )

        case 'BOOLEAN':
          return (
            <div className="flex flex-wrap gap-4">
              <motion.label 
                className="flex items-center group cursor-pointer bg-gray-50 hover:bg-green-50 p-3 rounded-lg border border-gray-200 hover:border-green-300 transition-all duration-200 min-w-[120px]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  type="radio"
                  name={question.id}
                  value="true"
                  checked={currentAnswer === 'true'}
                  onChange={(e) => handleAnswerChange(sectionId, question.id, e.target.value)}
                  className="mr-2 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-green-700 transition-colors font-medium">
                  ✓ Yes
                </span>
              </motion.label>
              <motion.label 
                className="flex items-center group cursor-pointer bg-gray-50 hover:bg-red-50 p-3 rounded-lg border border-gray-200 hover:border-red-300 transition-all duration-200 min-w-[120px]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  type="radio"
                  name={question.id}
                  value="false"
                  checked={currentAnswer === 'false'}
                  onChange={(e) => handleAnswerChange(sectionId, question.id, e.target.value)}
                  className="mr-2 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-red-700 transition-colors font-medium">
                  ✗ No
                </span>
              </motion.label>
            </div>
          )

        default:
          return (
            <Input
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(sectionId, question.id, e.target.value)}
              placeholder="Enter your answer"
              className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          )
      }
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`space-y-3 ${getQuestionWidth(question.questionType)}`}
      >
        <label className="block text-sm font-semibold text-gray-800">
          {question.questionText}
          {question.isRequired && (
            <span className="text-red-500 ml-1 text-base">*</span>
          )}
        </label>
        {renderInput()}
      </motion.div>
    )
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
              className="w-12 h-12 border-3 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-600">Loading RIF assessment...</p>
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
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h1>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-sm text-gray-600">
              This link may have expired or is invalid. Please contact the administrator for a new link.
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 relative overflow-hidden">
        <FloatingParticles />
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md mx-auto p-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-4">
              Assessment Submitted!
            </h1>
            <p className="text-green-600 mb-6">
              Your RIF assessment for <strong>{initiation?.vendorName || 'Third Party'}</strong> has been submitted successfully.
            </p>
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-4">
                <div className="text-sm text-gray-700 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Submitted by:</span>
                    <span>{userDetails.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{userDetails.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Organization:</span>
                    <span>{userDetails.organization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Submitted:</span>
                    <span>{new Date().toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <p className="text-sm text-gray-600 mt-6">
              You can now close this window. Thank you for completing the assessment!
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
                    Risk Intake Form Assessment
                  </h1>
                  <p className="text-gray-600">
                    Third Party: <strong>{initiation?.vendorName || 'Assessment'}</strong>
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4"
              >
                {/* Progress indicator */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {Math.round(getOverallProgress())}% Complete
                    </div>
                    <div className="text-xs text-gray-500">
                        {saving ? 'Saving...' : lastSavedTime ? `Saved ${lastSavedTime.toLocaleTimeString()}` : 'Not saved yet'}
                    </div>
                  </div>
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-teal-500 to-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${getOverallProgress()}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Token expiry warning */}
                {initiation?.tokenExpiry && (
                  <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
                    <Clock className="w-3 h-3 mr-1" />
                    Expires: {new Date(initiation.tokenExpiry).toLocaleDateString()}
                  </Badge>
                )}
              </motion.div>
            </div>
          </div>
        </motion.header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* User Details Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => setUserDetailsExpanded(!userDetailsExpanded)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      Your Information
                      {isUserDetailsComplete() && (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </Badge>
                      )}
                    </CardTitle>
                    <motion.div
                      animate={{ rotate: userDetailsExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Eye className="h-5 w-5 text-gray-400" />
                    </motion.div>
                  </div>
                </CardHeader>
                
                <AnimatePresence>
                  {userDetailsExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-2"
                          >
                            <label className="flex items-center text-sm font-medium text-gray-700">
                              <User className="w-4 h-4 mr-2 text-gray-400" />
                              Full Name *
                            </label>
                            <Input
                              value={userDetails.fullName}
                              onChange={(e) => handleUserDetailsChange('fullName', e.target.value)}
                              placeholder="John Doe"
                              className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-2"
                          >
                            <label className="flex items-center text-sm font-medium text-gray-700">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              Email Address *
                            </label>
                            <Input
                              type="email"
                              value={userDetails.email}
                              onChange={(e) => handleUserDetailsChange('email', e.target.value)}
                              placeholder="john.doe@company.com"
                              className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-2"
                          >
                            <label className="flex items-center text-sm font-medium text-gray-700">
                              <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                              Job Title *
                            </label>
                            <Input
                              value={userDetails.jobTitle}
                              onChange={(e) => handleUserDetailsChange('jobTitle', e.target.value)}
                              placeholder="Risk Analyst"
                              className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-2"
                          >
                            <label className="flex items-center text-sm font-medium text-gray-700">
                              <Building className="w-4 h-4 mr-2 text-gray-400" />
                              Department *
                            </label>
                            <Input
                              value={userDetails.department}
                              onChange={(e) => handleUserDetailsChange('department', e.target.value)}
                              placeholder="IT Security"
                              className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="md:col-span-2 space-y-2"
                          >
                            <label className="flex items-center text-sm font-medium text-gray-700">
                              <Building className="w-4 h-4 mr-2 text-gray-400" />
                              Organization *
                            </label>
                            <Input
                              value={userDetails.organization}
                              onChange={(e) => handleUserDetailsChange('organization', e.target.value)}
                              placeholder="Your Company Name"
                              className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                          </motion.div>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

            {/* Section 1 Review */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    Section 1: Third Party Information
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Completed by Client
                    </Badge>
                  </CardTitle>
                  <p className="text-gray-600">
                    This section was completed by {initiation?.assignedBy}. Review the information below.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {initiation?.section1Data?.map((answer: any, index: number) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-lg p-4 border border-gray-200"
                      >
                        <p className="text-sm font-medium text-gray-600 mb-2">
                          Response {index + 1}
                        </p>
                        <p className="text-gray-900 font-medium">
                          {Array.isArray(answer.value) ? answer.value.join(', ') : answer.value}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Assessment Sections */}
            {rifForm?.Sections
              ?.filter((section: Section) => section.order > 1)
              ?.sort((a: Section, b: Section) => a.order - b.order)
              ?.map((section: Section, index: number) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        Section {section.order}: {section.title}
                        {isSectionComplete(section) && (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Complete
                          </Badge>
                        )}
                      </CardTitle>
                      {section.description && (
                        <p className="text-gray-600">{section.description}</p>
                      )}
                    </CardHeader>
                                       <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {section.Questions
                          ?.sort((a: Question, b: Question) => a.order - b.order)
                          ?.map((question: Question, qIndex: number) => (
                            <div key={question.id}> {/* ADD THIS WRAPPER WITH KEY */}
                              {renderQuestion(question, section.id)}
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

            {/* Submit Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="sticky bottom-8"
            >
              <Card className="border-0 bg-gradient-to-r from-teal-600 to-blue-600 shadow-2xl">
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
                        <h3 className="text-lg font-semibold">Ready to Submit?</h3>
                        <p className="text-blue-100 text-sm">
                          Complete all required sections to submit your assessment
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {Math.round(getOverallProgress())}%
                        </div>
                        <div className="text-xs text-blue-100">
                          Progress
                        </div>
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={submitForm}
                          disabled={submitting || getOverallProgress() < 100}
                          className="bg-white text-teal-600 hover:bg-gray-100 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3"
                        >
                          {submitting && (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full mr-2"
                            />
                          )}
                          Submit Assessment
                          <Send className="h-4 w-4 ml-2" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center text-sm text-gray-500"
          >
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Assigned by: <strong>{initiation?.assignedBy}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Due: <strong>{initiation?.dueDate ? new Date(initiation.dueDate).toLocaleDateString() : 'Not set'}</strong></span>
              </div>
              {initiation?.assignmentComments && (
                <div className="flex items-center gap-2">
                  <Archive className="w-4 h-4" />
                  <span className="italic">"{initiation.assignmentComments}"</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}