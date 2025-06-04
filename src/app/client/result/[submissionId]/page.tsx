'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { API_ROUTES } from '@/lib/api'
import { ArrowLeft,Shield, CheckCircle, XCircle,AlertTriangle, User, Calendar,Building,Mail,FileText,Target,Clock,TrendingUp,Award,MessageSquare,Eye,X,ThumbsUp,ThumbsDown,Send,ChevronDown,Activity,BarChart3,Star,} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { AssessmentData, Questions } from '@/types/rif.types'
import FloatingParticles from '@/components/animation/floatingparticles'


// Get current user from localStorage
const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        return JSON.parse(userData)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }
  return null
}

export default function AssessmentResultsPage() {
  const params = useParams()
  const router = useRouter()
  const submissionId = params.submissionId as string
  const [currentUser] = useState(getCurrentUser())
  const [showApprovalSection, setShowApprovalSection] = useState(false)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null)
  const [approvalComments, setApprovalComments] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const queryClient = useQueryClient()

  // Fetch submission details
  const { data: assessmentData, isLoading, error } = useQuery<AssessmentData>({
    queryKey: ['submission-details', submissionId],
    queryFn: async () => {
      const response = await fetch(API_ROUTES.RIF.GET_SUBMISSION_DETAILS(submissionId))
      if (!response.ok) {
        throw new Error('Failed to fetch assessment details')
      }
      return response.json()
    },
    enabled: !!submissionId
  })

 const sendQuestionnaireMutation = useMutation({
  mutationFn: async () => {
     const clientId = currentUser.id;
    
    if (!clientId) {
      throw new Error('Client ID not found. Please ensure you are logged in properly.');
    }


    const response = await fetch(API_ROUTES.VENDOR.SEND_INVITATION, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rifSubmissionId: submissionId,
        clientId: clientId
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to send questionnaire invitation')
    }
    
    return response.json()
  },
  onSuccess: (data) => {
    toast.success(
      <div className="flex flex-col gap-1">
        <div className="font-semibold">Questionnaire Invitation Sent!</div>
        <div className="text-sm text-gray-600">
          Email sent to {data.vendorEmail} for {data.riskLevel} risk assessment
        </div>
      </div>
    )
    queryClient.invalidateQueries({ queryKey: ['submission-details', submissionId] })
  },
  onError: (error: any) => {
    if (error.message.includes('already sent')) {
      toast.warning(
        <div className="flex flex-col gap-1">
          <div className="font-semibold">Invitation Already Sent</div>
          <div className="text-sm text-gray-600">
            A questionnaire invitation has already been sent for this assessment
          </div>
        </div>
      )
    } else {
      toast.error(error.message || 'Failed to send questionnaire invitation')
    }
  }
})

  // Approve/Reject mutations
  const approveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(API_ROUTES.RIF.APPROVE_SUBMISSION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          approvedBy: currentUser?.name || 'Client Admin',
          approvalComments
        })
      })
      if (!response.ok) throw new Error('Failed to approve submission')
      return response.json()
    },
    onSuccess: () => {
      toast.success('Assessment approved successfully!')
      queryClient.invalidateQueries({ queryKey: ['submission-details', submissionId] })
      queryClient.invalidateQueries({ queryKey: ['my-initiations'] })
      setShowApprovalSection(false)
      setApprovalAction(null)
      setApprovalComments('')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve assessment')
    }
  })

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(API_ROUTES.RIF.REJECT_SUBMISSION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          rejectedBy: currentUser?.name || 'Client Admin',
          rejectionReason,
          approvalComments
        })
      })
      if (!response.ok) throw new Error('Failed to reject submission')
      return response.json()
    },
    onSuccess: () => {
      toast.success('Assessment rejected. User will be notified.')
      queryClient.invalidateQueries({ queryKey: ['submission-details', submissionId] })
      queryClient.invalidateQueries({ queryKey: ['my-initiations'] })
      setShowApprovalSection(false)
      setApprovalAction(null)
      setApprovalComments('')
      setRejectionReason('')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject assessment')
    }
  })

  const handleApprovalAction = (action: 'approve' | 'reject') => {
    setApprovalAction(action)
    setShowApprovalSection(true)
  }

  const confirmApproval = () => {
    if (approvalAction === 'approve') {
      approveMutation.mutate()
    } else if (approvalAction === 'reject') {
      if (!rejectionReason.trim()) {
        toast.error('Rejection reason is required')
        return
      }
      rejectMutation.mutate()
    }
  }

  const handleSendQuestionnaire = () => {
    if (assessmentData?.submission?.approvalStatus !== 'APPROVED') {
      toast.error('Assessment must be approved before sending questionnaire')
      return
    }
    sendQuestionnaireMutation.mutate()
  }

  const cancelApproval = () => {
    setShowApprovalSection(false)
    setApprovalAction(null)
    setApprovalComments('')
    setRejectionReason('')
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getApprovalStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'pending_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const renderAnswerValue = (answer: Questions) => {
    let value = answer.answerValue

    // Handle JSON strings
    if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
      try {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed)) {
          return parsed.join(', ')
        }
        value = parsed
      } catch (e) {
        // Keep original value if JSON parsing fails
      }
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.join(', ')
    }

    // Handle booleans
    if (value === 'true') return 'Yes'
    if (value === 'false') return 'No'

    return value || 'Not answered'
  }

  if (isLoading) {
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
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Assessment Results</h2>
            <p className="text-gray-600">Please wait while we fetch the details...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (error || !assessmentData) {
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
            <h1 className="text-3xl font-bold text-red-700 mb-4">Error Loading Assessment</h1>
            <p className="text-red-600 mb-6">Failed to load assessment results. Please try again.</p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button onClick={() => router.back()} variant="outline" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </motion.div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col gap-6">
              {/* Back Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="self-start"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  className="border-gray-300 hover:border-teal-500 hover:bg-teal-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </motion.div>
              
              {/* Main Header Content */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                      RIF Assessment Results
                    </h1>
                    <p className="text-gray-600 mt-1 text-lg">
                      {assessmentData.vendor.name || 'Third Party Assessment'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Submitted: {new Date(assessmentData.submission.submittedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        By: {assessmentData.submission.submittedBy}
                      </span>
                    </div>
                  </div>
                </div>
                {assessmentData.submission.approvalStatus === 'APPROVED' && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={handleSendQuestionnaire}
                        disabled={sendQuestionnaireMutation.isPending}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-xl text-white"
                        size="lg"
                      >
                        {sendQuestionnaireMutation.isPending ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                        ) : (
                          <Send className="w-5 h-5 mr-2" />
                        )}
                        Send Questionnaire
                      </Button>
                    </motion.div>
                  )}

                {/* Quick Action Buttons */}
                {assessmentData.submission.isReviewed && 
                 assessmentData.submission.approvalStatus === 'PENDING_REVIEW' && 
                 !showApprovalSection && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={() => handleApprovalAction('reject')}
                        variant="outline"
                        className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                        size="lg"
                      >
                        <ThumbsDown className="w-5 h-5 mr-2" />
                        Reject Assessment
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={() => handleApprovalAction('approve')}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl"
                        size="lg"
                      >
                        <ThumbsUp className="w-5 h-5 mr-2" />
                        Approve Assessment
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.header>

          {/* Approval Action Section */}
          <AnimatePresence>
            {showApprovalSection && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden"
              >
                <Card className="border-0 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 shadow-2xl">
                  <CardContent className="p-8">
                    <div className="text-white">
                      <div className="flex items-center gap-4 mb-6">
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
                          className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg"
                        >
                          {approvalAction === 'approve' ? (
                            <ThumbsUp className="h-8 w-8" />
                          ) : (
                            <ThumbsDown className="h-8 w-8" />
                          )}
                        </motion.div>
                        <div>
                          <h3 className="text-2xl font-bold">
                            {approvalAction === 'approve' ? 'Approve Assessment' : 'Reject Assessment'}
                          </h3>
                          <p className="text-blue-100 text-lg">
                            {approvalAction === 'approve' 
                              ? 'Confirm your approval of this risk assessment'
                              : 'Provide feedback and reject this assessment'
                            }
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {approvalAction === 'reject' && (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-3"
                          >
                            <label className="block text-sm font-semibold text-white">
                              Rejection Reason *
                            </label>
                            <Textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Please provide a detailed reason for rejection..."
                              rows={4}
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40"
                            />
                          </motion.div>
                        )}
                        
                        <motion.div
                          initial={{ opacity: 0, x: approvalAction === 'reject' ? 20 : 0 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: approvalAction === 'reject' ? 0.2 : 0.1 }}
                          className={`space-y-3 ${approvalAction === 'approve' ? 'lg:col-span-2' : ''}`}
                        >
                          <label className="block text-sm font-semibold text-white">
                            Additional Comments {approvalAction === 'approve' ? '(Optional)' : ''}
                          </label>
                          <Textarea
                            value={approvalComments}
                            onChange={(e) => setApprovalComments(e.target.value)}
                            placeholder={approvalAction === 'approve' 
                              ? "Any additional comments or recommendations..."
                              : "Additional feedback or specific requirements for resubmission..."
                            }
                            rows={4}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40"
                          />
                        </motion.div>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-white/20"
                      >
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={cancelApproval}
                            variant="outline"
                            size="lg"
                            className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50"
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                          >
                            <X className="w-5 h-5 mr-2" />
                            Cancel
                          </Button>
                        </motion.div>
                        
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={confirmApproval}
                            size="lg"
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            className={`${
                              approvalAction === 'approve' 
                                ? 'bg-white text-green-600 hover:bg-gray-100' 
                                : 'bg-white text-red-600 hover:bg-gray-100'
                            } shadow-xl font-semibold px-8`}
                          >
                            {(approveMutation.isPending || rejectMutation.isPending) && (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2"
                              />
                            )}
                            <Send className="w-5 h-5 mr-2" />
                            {approvalAction === 'approve' ? 'Approve Assessment' : 'Reject Assessment'}
                          </Button>
                        </motion.div>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Overview Cards */}
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
  {/* Risk Level Card */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
  >
    <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <Badge className={`px-3 py-1 text-sm font-bold border-2 ${getRiskColor(assessmentData.submission.riskLevel)}`}>
            {assessmentData.submission.riskLevel}
          </Badge>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">Risk Level</h3>
        <div className="space-y-2 flex-1 flex flex-col justify-end">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Score</span>
            <span className="font-medium">{assessmentData.riskAssessment.totalScore}/{assessmentData.riskAssessment.maxPossibleScore}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${
                assessmentData.submission.riskLevel === 'HIGH' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                assessmentData.submission.riskLevel === 'MEDIUM' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                'bg-gradient-to-r from-green-500 to-emerald-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${assessmentData.riskAssessment.riskPercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center">
            {Math.round(assessmentData.riskAssessment.riskPercentage)}% Risk Score
          </p>
        </div>
      </CardContent>
    </Card>
  </motion.div>

  {/* Approval Status Card */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
  >
    <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            {assessmentData.submission.approvalStatus === 'APPROVED' ? (
              <CheckCircle className="w-6 h-6 text-white" />
            ) : assessmentData.submission.approvalStatus === 'REJECTED' ? (
              <XCircle className="w-6 h-6 text-white" />
            ) : (
              <Clock className="w-6 h-6 text-white" />
            )}
          </div>
          <Badge className={`px-3 py-1 text-sm font-bold border-2 ${getApprovalStatusColor(assessmentData.submission.approvalStatus)}`}>
            {assessmentData.submission.approvalStatus?.replace('_', ' ')}
          </Badge>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">Approval Status</h3>
        <div className="flex-1 flex flex-col justify-end">
          {assessmentData.submission.approvedBy && (
            <p className="text-sm text-gray-600 mb-1">
              By: <span className="font-medium">{assessmentData.submission.approvedBy}</span>
            </p>
          )}
          {assessmentData.submission.approvedAt && (
            <p className="text-xs text-gray-500">
              {new Date(assessmentData.submission.approvedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  </motion.div>

  {/* Submission Info Card */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
  >
    <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <Badge variant="outline" className="border-teal-200 text-teal-700 bg-teal-50">
            Completed
          </Badge>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">Submitted</h3>
        <div className="flex-1 flex flex-col justify-end">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {new Date(assessmentData.submission.submittedAt).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
          <p className="text-sm text-gray-600">
            By: <span className="font-medium">{assessmentData.submission.submittedBy}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  </motion.div>

  {/* Overall Score Card */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
  >
    <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(assessmentData.riskAssessment.riskPercentage)}%
            </div>
            <div className="text-xs text-gray-500">Risk Score</div>
          </div>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">Overall Score</h3>
        <div className="flex-1 flex flex-col justify-end">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Points</span>
            <span className="font-medium">{assessmentData.riskAssessment.totalScore}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
</div>

           <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  Assignment & Vendor Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Assignment Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Assignment Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Assigned To</span>
                        </div>
                        <p className="text-sm text-blue-800 font-semibold">{assessmentData.initiation.internalUserName}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">Email</span>
                        </div>
                        <p className="text-sm text-green-800 font-semibold">{assessmentData.initiation.internalUserEmail}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Building className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">Department</span>
                        </div>
                        <p className="text-sm text-purple-800 font-semibold">{assessmentData.initiation.internalUserDept}</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium text-orange-900">Role</span>
                        </div>
                        <p className="text-sm text-orange-800 font-semibold">{assessmentData.initiation.internalUserRole}</p>
                      </div>
                    </div>
                    
                    {assessmentData.initiation.assignmentComments && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-900">Assignment Comments</span>
                        </div>
                        <p className="text-sm text-blue-800 italic">{assessmentData.initiation.assignmentComments}</p>
                      </div>
                    )}
                  </div>

                  {/* Vendor Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Building className="w-5 h-5 text-teal-600" />
                      Vendor Information
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-teal-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Building className="w-4 h-4 text-teal-600" />
                          <span className="text-sm font-medium text-teal-900">Company Name</span>
                        </div>
                        <p className="text-lg text-teal-800 font-bold">{assessmentData.vendor.name}</p>
                      </div>
                      
                      <div className="bg-cyan-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4 text-cyan-600" />
                          <span className="text-sm font-medium text-cyan-900">Contact Email</span>
                        </div>
                        <p className="text-sm text-cyan-800 font-semibold">{assessmentData.vendor.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Risk Assessment Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-8"
          >
            <Card className="border-0 bg-gradient-to-br from-white via-blue-50/30 to-teal-50/40 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xl">Risk Assessment Summary</div>
                    <div className="text-sm text-gray-600 font-normal">Comprehensive risk analysis and recommendations</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <div className="text-3xl font-bold text-white">
                        {Math.round(assessmentData.riskAssessment.riskPercentage)}%
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Risk Percentage</h4>
                    <p className="text-sm text-gray-600">Overall risk score calculated</p>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <div className="text-3xl font-bold text-white">
                        {assessmentData.riskAssessment.totalScore}
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Total Score</h4>
                    <p className="text-sm text-gray-600">Points achieved in assessment</p>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.0 }}
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <div className="text-3xl font-bold text-white">
                        {assessmentData.riskAssessment.maxPossibleScore}
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Maximum Possible</h4>
                    <p className="text-sm text-gray-600">Total points available</p>
                  </motion.div>
                </div>
                
                {assessmentData.riskAssessment.recommendations && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="p-6 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 rounded-xl border border-orange-200 shadow-inner"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-orange-900">Risk Management Recommendations</h4>
                    </div>
                    <div className="text-sm text-orange-800 leading-relaxed whitespace-pre-line bg-white/50 p-4 rounded-lg border border-orange-200">
                      {assessmentData.riskAssessment.recommendations}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Assessment Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Assessment Responses</h2>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                {assessmentData.sections.length} Sections
              </Badge>
            </div>

            {assessmentData.sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
              >
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold">{section.order}</span>
                        </div>
                        <div>
                          <div className="text-lg">Section {section.order}: {section.title}</div>
                          <div className="text-sm text-gray-600 font-normal">
                            {section.answers.length} responses
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Complete
                        </Badge>
                      </CardTitle>
                      <motion.div
                        animate={{ rotate: expandedSections.includes(section.id) ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      </motion.div>
                    </div>
                  </CardHeader>
                  
                  <AnimatePresence>
                    {expandedSections.includes(section.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {section.answers.map((answer, answerIndex) => (
                              <motion.div 
                                key={answer.questionId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: answerIndex * 0.05 }}
                                className="p-5 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors duration-200"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                                    {answer.questionText}
                                    {answer.isRequired && <span className="text-red-500 ml-1">*</span>}
                                  </h4>
                                  {answer.points > 0 && (
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                                      <Star className="w-3 h-3" />
                                      {answer.points} pts
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-gray-700 bg-white p-3 rounded-md border border-gray-200 font-medium">
                                  {renderAnswerValue(answer)}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Approval/Rejection Comments */}
          {(assessmentData.submission.approvalComments || assessmentData.submission.rejectionReason) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-8"
            >
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      assessmentData.submission.approvalStatus === 'APPROVED' 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                        : 'bg-gradient-to-br from-red-500 to-pink-600'
                    }`}>
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    {assessmentData.submission.approvalStatus === 'APPROVED' ? 'Approval Comments' : 'Rejection Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assessmentData.submission.rejectionReason && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.3 }}
                      className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-bold text-red-900">Rejection Reason</span>
                      </div>
                      <p className="text-sm text-red-800 leading-relaxed">{assessmentData.submission.rejectionReason}</p>
                    </motion.div>
                  )}
                  
                  {assessmentData.submission.approvalComments && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.4 }}
                      className={`p-4 rounded-lg border ${
                        assessmentData.submission.approvalStatus === 'APPROVED'
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className={`w-4 h-4 ${
                          assessmentData.submission.approvalStatus === 'APPROVED' ? 'text-green-600' : 'text-blue-600'
                        }`} />
                        <span className={`text-sm font-bold ${
                          assessmentData.submission.approvalStatus === 'APPROVED' ? 'text-green-900' : 'text-blue-900'
                        }`}>
                          Additional Comments
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${
                        assessmentData.submission.approvalStatus === 'APPROVED' ? 'text-green-800' : 'text-blue-800'
                      }`}>
                        {assessmentData.submission.approvalComments}
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-12 text-center text-sm text-gray-500"
          >
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Generated by SoltRisk Assessment Platform</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Last updated: {new Date().toLocaleString()}</span>
              </div>
            </div>
          </motion.footer>
        </div>
      </div>
    </div>
  )
}