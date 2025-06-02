'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  ArrowRight,
  ArrowLeft,
  Send,
  FileText,
  Save,
  Building,
  Mail,
  Phone,
  MapPin,
  Briefcase
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export default function CompleteRifPage() {
  const params = useParams()
  const token = params.token as string
  
  // Form state
  const [currentStep, setCurrentStep] = useState(1) // 1: User Details, 2: Review Section 1, 3+: Sections 2-7
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [userDetails, setUserDetails] = useState<UserDetails>({
    fullName: '',
    email: '',
    jobTitle: '',
    department: '',
    organization: ''
  })
  const [currentSectionAnswers, setCurrentSectionAnswers] = useState<any[]>([])
  const [allAnswers, setAllAnswers] = useState<{[sectionId: string]: any[]}>({})
  const [initiation, setInitiation] = useState<any>(null)
  const [rifForm, setRifForm] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Load initiation details and validate token
  useEffect(() => {
    validateTokenAndLoadData()
  }, [token])

  const validateTokenAndLoadData = async () => {
    try {
      setLoading(true)
      
      // Validate token using API_ROUTES
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

      // Get form structure using API_ROUTES
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
      // Check if submission exists using API_ROUTES
      const checkResponse = await fetch(API_ROUTES.RIF.CHECK_SUBMISSION(initiationId))
      const checkData = await checkResponse.json()
      
      if (checkData.exists) {
        setSubmissionId(checkData.submissionId)
        // Load existing answers if they exist
        loadExistingAnswers(checkData.submissionId)
      } else {
        // Create new submission using API_ROUTES
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

  // Save answers using API_ROUTES
  const saveAnswers = async (answers: any[], sectionId: string) => {
    if (!submissionId) return

    try {
      setSaving(true)
      const response = await fetch(API_ROUTES.RIF.SAVE_ANSWERS, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          answers,
          sectionId,
          submittedBy: userDetails.fullName // Pass submitter name
        })
      })
      
      if (response.ok) {
        toast.success('Progress saved')
      }
    } catch (error) {
      console.error('Error saving answers:', error)
      toast.error('Failed to save progress')
    } finally {
      setSaving(false)
    }
  }

  // Submit final form using API_ROUTES
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
          submittedBy: userDetails.fullName // Pass submitter name
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        toast.success('RIF Assessment submitted successfully!')
        setCurrentStep(99) // Success step
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

  const handleAnswerChange = (questionId: string, value: any) => {
    setCurrentSectionAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId)
      if (existing) {
        return prev.map(a => a.questionId === questionId ? { ...a, value } : a)
      } else {
        return [...prev, { questionId, value }]
      }
    })
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

  const isSectionComplete = (sectionIndex: number) => {
    if (!rifForm?.Sections?.[sectionIndex]) return false
    const section = rifForm.Sections[sectionIndex]
    const requiredQuestions = section.Questions.filter((q: Question) => q.isRequired)
    const answeredRequired = currentSectionAnswers.filter(a => {
      const question = requiredQuestions.find((q: Question) => q.id === a.questionId)
      return question && a.value !== '' && a.value !== null && a.value !== undefined
    })
    return answeredRequired.length === requiredQuestions.length
  }

  const renderQuestion = (question: Question) => {
    const currentAnswer = currentSectionAnswers.find(a => a.questionId === question.id)?.value || ''

    switch (question.questionType) {
      case 'TEXT':
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer"
            className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        )

      case 'TEXTAREA':
        return (
          <textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your answer"
          />
        )

      case 'SINGLE_CHOICE':
        const singleChoices = question.questionOptions?.choices || question.options?.choices || []
        return (
          <div className="space-y-2">
            {singleChoices.map((choice: any) => (
              <label key={choice.value} className="flex items-center group cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={choice.value}
                  checked={currentAnswer === choice.value}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                  {choice.label}
                </span>
              </label>
            ))}
          </div>
        )

      case 'MULTIPLE_CHOICE':
        const selectedValues = Array.isArray(currentAnswer) ? currentAnswer : []
        const multipleChoices = question.questionOptions?.choices || question.options?.choices || []
        return (
          <div className="space-y-2">
            {multipleChoices.map((choice: any) => (
              <label key={choice.value} className="flex items-center group cursor-pointer">
                <input
                  type="checkbox"
                  value={choice.value}
                  checked={selectedValues.includes(choice.value)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, choice.value]
                      : selectedValues.filter(v => v !== choice.value)
                    handleAnswerChange(question.id, newValues)
                  }}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                  {choice.label}
                </span>
              </label>
            ))}
          </div>
        )

      case 'DROPDOWN':
        const dropdownChoices = question.questionOptions?.choices || question.options?.choices || []
        return (
          <select
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        )

      case 'BOOLEAN':
        return (
          <div className="flex space-x-6">
            <label className="flex items-center group cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value="true"
                checked={currentAnswer === 'true'}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">Yes</span>
            </label>
            <label className="flex items-center group cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value="false"
                checked={currentAnswer === 'false'}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">No</span>
            </label>
          </div>
        )

      default:
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer"
            className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Loading RIF assessment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-gray-600">
            This link may have expired or is invalid. Please contact the administrator for a new link.
          </p>
        </div>
      </div>
    )
  }

  // Success step
  if (currentStep === 99) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-green-700 mb-4">Assessment Submitted!</h1>
          <p className="text-green-600 mb-6">
            Your RIF assessment for <strong>{initiation?.vendorName || 'Third Party'}</strong> has been submitted successfully.
          </p>
          <div className="bg-green-100 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>Submitted by:</strong> {userDetails.fullName}<br/>
              <strong>Email:</strong> {userDetails.email}<br/>
              <strong>Organization:</strong> {userDetails.organization}<br/>
              <strong>Submission Time:</strong> {new Date().toLocaleString()}
            </p>
          </div>
          <p className="text-sm text-gray-600">
            You can now close this window. Thank you for completing the assessment!
          </p>
        </motion.div>
      </div>
    )
  }

  const totalSteps = (rifForm?.Sections?.length || 0) + 1 // +1 for user details step
  const currentSection = currentStep >= 3 ? rifForm?.Sections?.[currentStep - 3] : null

  // Load current section answers from saved data
  useEffect(() => {
    if (currentSection && allAnswers[currentSection.id]) {
      setCurrentSectionAnswers(allAnswers[currentSection.id])
    } else {
      setCurrentSectionAnswers([])
    }
  }, [currentSection, allAnswers])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Risk Intake Form Assessment
          </h1>
          <p className="text-gray-600">
            Complete the assessment for: <strong>{initiation?.vendorName || 'Third Party'}</strong>
          </p>
          
          {/* Progress bar */}
          <div className="mt-6 bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Step {currentStep} of {totalSteps}
          </p>
          
          {/* Token expiry warning */}
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-orange-100 border border-orange-200 rounded-lg">
            <Clock className="w-4 h-4 text-orange-600 mr-2" />
            <span className="text-sm text-orange-700">
              Link expires: {new Date(initiation?.tokenExpiry).toLocaleString()}
            </span>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: User Details */}
          {currentStep === 1 && (
            <motion.div
              key="user-details"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    Your Information
                  </CardTitle>
                  <p className="text-gray-600">
                    Please verify and complete your details. This information will be used for the submission record.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        Full Name *
                      </label>
                      <Input
                        value={userDetails.fullName}
                        onChange={(e) => handleUserDetailsChange('fullName', e.target.value)}
                        placeholder="John Doe"
                        className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        value={userDetails.email}
                        onChange={(e) => handleUserDetailsChange('email', e.target.value)}
                        placeholder="john.doe@company.com"
                        className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                        Job Title *
                      </label>
                      <Input
                        value={userDetails.jobTitle}
                        onChange={(e) => handleUserDetailsChange('jobTitle', e.target.value)}
                        placeholder="Risk Analyst"
                        className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Building className="w-4 h-4 mr-2 text-gray-400" />
                        Department *
                      </label>
                      <Input
                        value={userDetails.department}
                        onChange={(e) => handleUserDetailsChange('department', e.target.value)}
                        placeholder="IT Security"
                        className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Building className="w-4 h-4 mr-2 text-gray-400" />
                        Organization *
                      </label>
                      <Input
                        value={userDetails.organization}
                        onChange={(e) => handleUserDetailsChange('organization', e.target.value)}
                        placeholder="Your Company Name"
                        className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Review Section 1 */}
          {currentStep === 2 && (
            <motion.div
              key="review-section1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <CardTitle>Section 1: Third Party Information (Completed)</CardTitle>
                      <p className="text-gray-600 text-sm mt-1">
                        This section was completed by {initiation?.assignedBy}. Please review the information below.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 text-sm">
                      ✅ This section has been completed by the client administrator. 
                      Review the information below and proceed to complete the remaining sections.
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {initiation?.section1Data?.map((answer: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-600 mb-2">
                          Question {index + 1}
                        </p>
                        <p className="text-gray-900 font-medium mb-1">
                          {Array.isArray(answer.value) ? answer.value.join(', ') : answer.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Steps 3+: Sections 2-7 */}
          {currentStep >= 3 && currentSection && (
            <motion.div
              key={`section-${currentSection.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    Section {currentSection.order}: {currentSection.title}
                  </CardTitle>
                  {currentSection.description && (
                    <p className="text-gray-600">{currentSection.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentSection.Questions
                    ?.sort((a: Question, b: Question) => a.order - b.order)
                    ?.map((question: Question, index: number) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-3"
                      >
                        <label className="block text-sm font-medium text-gray-700">
                          {question.questionText}
                          {question.isRequired && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        {renderQuestion(question)}
                      </motion.div>
                    ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-between items-center mt-8"
        >
          <div>
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => {
                  // Save current progress before going back
                  if (currentStep >= 3 && currentSection) {
                    setAllAnswers(prev => ({
                      ...prev,
                      [currentSection.id]: currentSectionAnswers
                    }))
                  }
                  setCurrentStep(currentStep - 1)
                }}
                className="border-gray-300 hover:border-blue-500 hover:bg-blue-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Auto-save indicator */}
            {currentStep >= 3 && (
              <Button
                variant="ghost"
                onClick={() => {
                  if (currentSection) {
                    saveAnswers(currentSectionAnswers, currentSection.id)
                  }
                }}
                className="text-gray-600 hover:text-blue-600"
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Progress'}
              </Button>
            )}

            {currentStep < totalSteps && (
              <Button
                onClick={() => {
                  // Save current progress before moving to next step
                  if (currentStep >= 3 && currentSection) {
                    setAllAnswers(prev => ({
                      ...prev,
                      [currentSection.id]: currentSectionAnswers
                    }))
                    saveAnswers(currentSectionAnswers, currentSection.id)
                  }
                  setCurrentStep(currentStep + 1)
                }}
                disabled={
                  (currentStep === 1 && !isUserDetailsComplete()) ||
                  (currentStep >= 3 && !isSectionComplete(currentStep - 3))
                }
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {currentStep === totalSteps && (
              <Button
                onClick={() => {
                  // Save final section before submitting
                  if (currentSection) {
                    setAllAnswers(prev => ({
                      ...prev,
                      [currentSection.id]: currentSectionAnswers
                    }))
                  }
                  submitForm()
                }}
                disabled={submitting || !isUserDetailsComplete()}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {submitting && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                )}
                Submit Assessment
                <Send className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </motion.div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Assigned by: <strong>{initiation?.assignedBy}</strong> | 
            Due: <strong>{new Date(initiation?.dueDate).toLocaleDateString()}</strong>
          </p>
          {initiation?.assignmentComments && (
            <p className="mt-2 italic">
              "{initiation.assignmentComments}"
            </p>
          )}
        </div>
      </div>
    </div>
  )
}