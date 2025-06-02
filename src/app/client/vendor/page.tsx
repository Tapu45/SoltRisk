'use client'

import React, { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { API_ROUTES } from '@/lib/api'
import { 
  Plus, 
  FileText, 
  Users, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Send,
  Eye,
  Search,
  X,
  Filter,
  ArrowRight,
  Shield,
  Clock,
  Building,
  User,
  Mail,
  Target,
  ChevronDown,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

// Types
interface Assignment {
  name: string
  email: string
  department: string
  role: string
  dueDate: string
  comments?: string
}

interface Question {
  id: string
  questionText: string
  questionType: string
  questionOptions?: any
  options?: any
  isRequired: boolean
  order: number
}

interface Section {
  id: string
  title: string
  description: string
  order: number
  Questions: Question[]
}

interface RifForm {
  id: string
  title: string
  Sections: Section[]
}

// Floating particles animation
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => i)
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle}
          className="absolute w-1 h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full opacity-30"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          }}
          animate={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}

// Get current user from localStorage
const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    // Try to get from localStorage first
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        console.log('Current user loaded:', user)
        return user
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error)
      }
    }

    // Try to get from sessionStorage as backup
    const sessionUserData = sessionStorage.getItem('user')
    if (sessionUserData) {
      try {
        return JSON.parse(sessionUserData)
      } catch (error) {
        console.error('Error parsing user data from sessionStorage:', error)
      }
    }
  }
  return null
}

// RIF Creation Form Component
const RifCreationForm = ({ 
  onSuccess,
  currentUser 
}: { 
  onSuccess: () => void
  currentUser: any
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [section1Answers, setSection1Answers] = useState<any[]>([])
  const [assignment, setAssignment] = useState<Assignment>({
    name: '',
    email: '',
    department: '',
    role: '',
    dueDate: '',
    comments: ''
  })

  // Fetch Section 1 form
  const { data: rifForm, isLoading } = useQuery({
    queryKey: ['section1-form'],
    queryFn: async () => {
      const response = await fetch(API_ROUTES.RIF.GET_SECTION1_FORM)
      if (!response.ok) throw new Error('Failed to fetch form')
      return response.json()
    }
  })

  // Submit RIF initiation
  const initiateRifMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(API_ROUTES.RIF.INITIATE_RIF, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Failed to initiate RIF')
      }
      return response.json()
    },
    onSuccess: (data) => {
      const message = data.vendorCreated 
        ? `RIF assigned successfully! New vendor created and email sent to ${assignment.email} by ${currentUser.name}.`
        : `RIF assigned successfully! Email sent to ${assignment.email} by ${currentUser.name}.`
      
      toast.success(message)
      onSuccess()
      
      // Reset form
      setCurrentStep(1)
      setSection1Answers([])
      setAssignment({
        name: '',
        email: '',
        department: '',
        role: '',
        dueDate: '',
        comments: ''
      })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to initiate RIF')
    }
  })

  const handleAnswerChange = (questionId: string, value: any) => {
    setSection1Answers(prev => {
      const existing = prev.find(a => a.questionId === questionId)
      if (existing) {
        return prev.map(a => a.questionId === questionId ? { ...a, value } : a)
      } else {
        return [...prev, { questionId, value }]
      }
    })
  }

  const isSection1Complete = () => {
    if (!rifForm?.Sections?.[0]?.Questions) return false
    const requiredQuestions = rifForm.Sections[0].Questions.filter((q: Question) => q.isRequired)
    const answeredRequired = section1Answers.filter(a => {
      const question = requiredQuestions.find((q: Question) => q.id === a.questionId)
      return question && a.value !== '' && a.value !== null && a.value !== undefined
    })
    return answeredRequired.length === requiredQuestions.length
  }

  const isAssignmentComplete = () => {
    return assignment.name && 
           assignment.email && 
           assignment.department && 
           assignment.role && 
           assignment.dueDate
  }

  const handleSubmit = () => {
    if (!isSection1Complete() || !isAssignmentComplete()) {
      toast.error('Please complete all required fields')
      return
    }

    // Use real user data - remove hard-coded values
    initiateRifMutation.mutate({
      section1Answers: section1Answers.map(answer => ({
        questionId: answer.questionId,
        value: answer.value,
        questionOptions: rifForm.Sections[0].Questions.find((q: Question) => q.id === answer.questionId)?.questionOptions
      })),
      assignment: {
        name: assignment.name.trim(),
        email: assignment.email.trim(),
        department: assignment.department,
        role: assignment.role,
        dueDate: assignment.dueDate,
        comments: assignment.comments?.trim() || ''
      },
      adminUserId: currentUser.id // Use real logged-in user ID
    })
  }

  const renderQuestion = (question: Question) => {
    const currentAnswer = section1Answers.find(a => a.questionId === question.id)?.value || ''

    switch (question.questionType) {
      case 'TEXT':
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer"
            className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        )

      case 'TEXTAREA':
        return (
          <textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                  className="mr-3 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-teal-600 transition-colors">
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
                  className="mr-3 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-teal-600 transition-colors">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
            className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                className="mr-2 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-teal-600 transition-colors">Yes</span>
            </label>
            <label className="flex items-center group cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value="false"
                checked={currentAnswer === 'false'}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="mr-2 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-teal-600 transition-colors">No</span>
            </label>
          </div>
        )

      default:
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer"
            className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        )
    }
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-12"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Loading RIF form...</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Progress Bar */}
      <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Create New RIF Assessment</h3>
            <Badge variant="secondary" className="bg-teal-100 text-teal-700">
              Step {currentStep} of 2
            </Badge>
          </div>
          
          <div className="flex items-center">
            <motion.div 
              className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors duration-300 ${
                currentStep >= 1 ? 'bg-teal-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}
              animate={{ scale: currentStep === 1 ? 1.1 : 1 }}
            >
              {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
            </motion.div>
            <motion.div 
              className={`flex-1 h-2 mx-4 rounded-full transition-colors duration-500 ${
                currentStep >= 2 ? 'bg-teal-600' : 'bg-gray-300'
              }`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: currentStep >= 2 ? 1 : 0 }}
              style={{ originX: 0 }}
            />
            <motion.div 
              className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors duration-300 ${
                currentStep >= 2 ? 'bg-teal-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}
              animate={{ scale: currentStep === 2 ? 1.1 : 1 }}
            >
              2
            </motion.div>
          </div>
          
          <div className="flex justify-between mt-3">
            <span className="text-sm text-gray-600">Third Party Information</span>
            <span className="text-sm text-gray-600">Assignment Details</span>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  {rifForm?.Sections?.[0]?.title || 'Third Party Information'}
                </CardTitle>
                {rifForm?.Sections?.[0]?.description && (
                  <p className="text-gray-600">{rifForm.Sections[0].description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {rifForm?.Sections?.[0]?.Questions
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

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4"
            >
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <h4 className="font-medium text-green-900">Section 1 Completed</h4>
                  <p className="text-sm text-green-800 mt-1">
                    Third party information has been collected. Now assign the assessment to an internal user.
                  </p>
                </div>
              </div>
            </motion.div>

            <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  Assignment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-2"
                  >
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      Full Name *
                    </label>
                    <Input
                      value={assignment.name}
                      onChange={(e) => setAssignment({ ...assignment, name: e.target.value })}
                      placeholder="John Doe"
                      className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2"
                  >
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={assignment.email}
                      onChange={(e) => setAssignment({ ...assignment, email: e.target.value })}
                      placeholder="john.doe@company.com"
                      className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Building className="w-4 h-4 mr-2 text-gray-400" />
                      Department *
                    </label>
                    <select
                      value={assignment.department}
                      onChange={(e) => setAssignment({ ...assignment, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="">Select Department</option>
                      <option value="IT Security">IT Security</option>
                      <option value="Risk Management">Risk Management</option>
                      <option value="Compliance">Compliance</option>
                      <option value="Legal">Legal</option>
                      <option value="Procurement">Procurement</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Target className="w-4 h-4 mr-2 text-gray-400" />
                      Role *
                    </label>
                    <select
                      value={assignment.role}
                      onChange={(e) => setAssignment({ ...assignment, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="">Select Role</option>
                      <option value="Security Manager">Security Manager</option>
                      <option value="Risk Analyst">Risk Analyst</option>
                      <option value="Compliance Officer">Compliance Officer</option>
                      <option value="Senior Analyst">Senior Analyst</option>
                      <option value="Team Lead">Team Lead</option>
                    </select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-2"
                  >
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      Due Date *
                    </label>
                    <Input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={assignment.dueDate}
                      onChange={(e) => setAssignment({ ...assignment, dueDate: e.target.value })}
                      className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="md:col-span-2 space-y-2"
                  >
                    <label className="block text-sm font-medium text-gray-700">
                      Assignment Comments
                    </label>
                    <textarea
                      value={assignment.comments}
                      onChange={(e) => setAssignment({ ...assignment, comments: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Additional instructions or context for the assignee..."
                    />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-between items-center"
      >
        <div className="flex space-x-3">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="border-gray-300 hover:border-teal-500 hover:bg-teal-50"
            >
              Previous
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {currentStep === 1 && (
            <Button
              onClick={() => setCurrentStep(2)}
              disabled={!isSection1Complete()}
              className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Assignment
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {currentStep === 2 && (
            <Button
              onClick={handleSubmit}
              disabled={!isAssignmentComplete() || initiateRifMutation.isPending}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {initiateRifMutation.isPending && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
              )}
              Assign RIF Assessment
              <Send className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// Main Component
export default function ClientVendorPage() {
  const [showRifForm, setShowRifForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userLoading, setUserLoading] = useState(true)

  // Load user on component mount
  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      console.log('Using real user data:', user)
      setCurrentUser(user)
    }
    setUserLoading(false)
  }, [])

  const queryClient = useQueryClient()

  // Fetch my initiations
  const { data: initiations, isLoading: initiationsLoading } = useQuery({
    queryKey: ['my-initiations', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated')
      }
      const response = await fetch(API_ROUTES.RIF.GET_MY_INITIATIONS(currentUser.id))
      if (!response.ok) throw new Error('Failed to fetch initiations')
      return response.json()
    },
    enabled: !!currentUser?.id, // Only run when user is loaded
  })

  // Filter initiations
  const filteredInitiations = initiations?.initiations?.filter((initiation: any) => {
    if (filterStatus === 'all') return true
    return initiation.status.toLowerCase() === filterStatus.toLowerCase()
  }) || []

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Show loading if user not loaded or initiations loading
  if (userLoading || !currentUser) {
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
              <p className="text-gray-600 mb-2">
                {userLoading ? 'Loading user data...' : 'User not authenticated'}
              </p>
              {!userLoading && !currentUser && (
                <p className="text-sm text-red-600">
                  Please log in to access this page
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

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
            <div className="flex justify-between items-center py-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                  Risk Intake Form (RIF)
                </h1>
                <p className="mt-1 text-gray-600">
                  Welcome, {currentUser.name} ({currentUser.email}) - {currentUser.role} | Initiate and manage third-party risk assessments
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setShowRifForm(!showRifForm)}
                  className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-lg group"
                >
                  <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                  {showRifForm ? 'View Assessments' : 'Start New RIF Assessment'}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

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
                    setShowRifForm(false)
                    queryClient.invalidateQueries({ queryKey: ['my-initiations'] })
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
                {/* RIF Assessments List */}
                <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        My RIF Assessments ({filteredInitiations.length})
                      </CardTitle>
                      
                      <div className="flex items-center space-x-4">
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="relative"
                        >
                          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Input
                            placeholder="Search by vendor name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-64 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="relative"
                        >
                          <Filter className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none bg-white"
                          >
                            <option value="all">All Status</option>
                            <option value="assigned">Assigned</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                          <ChevronDown className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </motion.div>
                      </div>
                    </div>
                  </CardHeader>

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
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        </motion.div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No RIF Assessments</h3>
                        <p className="text-gray-500 mb-6">
                          Get started by creating your first Risk Intake Form assessment
                        </p>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={() => setShowRifForm(true)}
                            className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-lg group"
                          >
                            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                            Start First RIF Assessment
                          </Button>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {filteredInitiations
                          .filter((initiation: any) => {
                            if (!searchTerm) return true
                            return initiation.Vendor?.User?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   initiation.section1Data?.some((answer: any) => 
                                     answer.value?.toLowerCase().includes(searchTerm.toLowerCase())
                                   )
                          })
                          .map((initiation: any, index: number) => (
                            <motion.div
                              key={initiation.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-6 hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-blue-50/50 transition-all duration-300 group"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-4">
                                    <motion.h3 
                                      className="text-lg font-semibold text-gray-900 group-hover:text-teal-700 transition-colors"
                                      whileHover={{ x: 5 }}
                                    >
                                      {initiation.section1Data?.find((answer: any) => 
                                        answer.questionId.includes('vendor-name') || 
                                        answer.questionId.includes('third-party-name') ||
                                        answer.questionId.includes('legal-name')
                                      )?.value || initiation.Vendor?.User?.name || 'Third Party Assessment'}
                                    </motion.h3>
                                    
                                    <Badge className={`px-3 py-1 text-xs font-medium border ${getStatusColor(initiation.status)}`}>
                                      {initiation.status}
                                    </Badge>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                                    <motion.div 
                                      className="flex items-center"
                                      whileHover={{ x: 5 }}
                                    >
                                      <Users className="h-4 w-4 mr-3 text-teal-500" />
                                      <span>
                                        <strong className="text-gray-700">Assigned to:</strong> {initiation.internalUserName}
                                      </span>
                                    </motion.div>
                                    
                                    <motion.div 
                                      className="flex items-center"
                                      whileHover={{ x: 5 }}
                                    >
                                      <Calendar className="h-4 w-4 mr-3 text-blue-500" />
                                      <span>
                                        <strong className="text-gray-700">Due:</strong> {new Date(initiation.dueDate).toLocaleDateString()}
                                      </span>
                                    </motion.div>
                                    
                                    <motion.div 
                                      className="flex items-center"
                                      whileHover={{ x: 5 }}
                                    >
                                      <Mail className="h-4 w-4 mr-3 text-purple-500" />
                                      <span className="truncate">{initiation.internalUserEmail}</span>
                                    </motion.div>
                                    
                                    {initiation.RifSubmission?.riskLevel && (
                                      <motion.div 
                                        className="flex items-center"
                                        whileHover={{ x: 5 }}
                                      >
                                        <AlertCircle className="h-4 w-4 mr-3 text-orange-500" />
                                        <span>
                                          <strong className="text-gray-700">Risk:</strong>
                                          <Badge className={`ml-2 px-2 py-1 text-xs font-medium border ${getRiskColor(initiation.RifSubmission.riskLevel)}`}>
                                            {initiation.RifSubmission.riskLevel}
                                          </Badge>
                                        </span>
                                      </motion.div>
                                    )}
                                    
                                    <motion.div 
                                      className="flex items-center"
                                      whileHover={{ x: 5 }}
                                    >
                                      <Clock className="h-4 w-4 mr-3 text-gray-400" />
                                      <span>
                                        <strong className="text-gray-700">Created:</strong> {new Date(initiation.createdAt).toLocaleDateString()}
                                      </span>
                                    </motion.div>
                                    
                                    {initiation.assignmentComments && (
                                      <motion.div 
                                        className="md:col-span-2 lg:col-span-3"
                                        whileHover={{ x: 5 }}
                                      >
                                        <span className="text-gray-400 mr-2">💬</span>
                                        <span><strong className="text-gray-700">Comments:</strong> {initiation.assignmentComments}</span>
                                      </motion.div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-3 ml-6">
                                  {initiation.RifSubmission?.isReviewed && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => {/* View results */}}
                                      className="p-2 text-gray-400 hover:text-teal-600 transition-colors rounded-lg hover:bg-teal-50"
                                      title="View Assessment Results"
                                    >
                                      <Eye className="h-5 w-5" />
                                    </motion.button>
                                  )}
                                  <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                    ID: {initiation.id.slice(-8)}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
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
  )
}