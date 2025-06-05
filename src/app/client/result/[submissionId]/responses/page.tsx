'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { API_ROUTES } from '@/lib/api'
import { 
  ArrowLeft, CheckCircle, XCircle, FileText, Star, MessageSquare, 
  ThumbsUp, ThumbsDown, Send, X, Target, Eye, Building
} from 'lucide-react'
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

export default function AssessmentResponsesPage() {
  const params = useParams()
  const router = useRouter()
  const submissionId = params.submissionId as string
  const [currentUser] = useState(getCurrentUser())
  const [showApprovalSection, setShowApprovalSection] = useState(false)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null)
  const [approvalComments, setApprovalComments] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
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

  const cancelApproval = () => {
    setShowApprovalSection(false)
    setApprovalAction(null)
    setApprovalComments('')
    setRejectionReason('')
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
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Assessment Responses</h2>
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
            <h1 className="text-3xl font-bold text-red-700 mb-4">Error Loading Responses</h1>
            <p className="text-red-600 mb-6">Failed to load assessment responses. Please try again.</p>
            <Button onClick={() => window.close()} variant="outline" size="lg">
              Close Tab
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40 relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
                      Assessment Responses
                    </h1>
                    <p className="text-gray-600 mt-1 text-lg">
                      {assessmentData.vendor.name} - Detailed Assessment Responses
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {assessmentData.submission.isReviewed && 
                 assessmentData.submission.approvalStatus === 'PENDING_REVIEW' && 
                 !showApprovalSection && (
                  <div className="flex items-center gap-3">
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
                        Reject
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
                        Approve
                      </Button>
                    </motion.div>
                  </div>
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


          {/* Assessment Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            {assessmentData.sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="group"
              >
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Section Header */}
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br ${
                        index % 4 === 0 ? 'from-blue-500 to-purple-600' :
                        index % 4 === 1 ? 'from-emerald-500 to-teal-600' :
                        index % 4 === 2 ? 'from-orange-500 to-red-600' :
                        'from-pink-500 to-purple-600'
                      }`}>
                        <span className="text-white font-bold text-xl">{section.order}</span>
                      </div>
                      <div>
                        <div className="text-xl">Section {section.order}: {section.title}</div>
                        <div className="text-sm text-gray-600 font-normal flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {section.answers.length} Questions
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {section.answers.reduce((sum, answer) => sum + answer.points, 0)} Points
                          </span>
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  
                  {/* Table Content */}
                  <CardContent className="pt-0 pb-6">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          {/* Table Header */}
                          <thead className={`bg-gradient-to-r ${
                            index % 4 === 0 ? 'from-blue-50 via-indigo-50 to-purple-50' :
                            index % 4 === 1 ? 'from-emerald-50 via-teal-50 to-cyan-50' :
                            index % 4 === 2 ? 'from-orange-50 via-red-50 to-pink-50' :
                            'from-pink-50 via-purple-50 to-indigo-50'
                          }`}>
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 w-16">
                                #
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                                Question
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                                Response
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 w-24">
                                Points
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 w-24">
                                Status
                              </th>
                            </tr>
                          </thead>
                          
                          {/* Table Body */}
                          <tbody className="bg-white divide-y divide-gray-100">
                            {section.answers.map((answer, answerIndex) => (
                              <motion.tr 
                                key={answer.questionId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: answerIndex * 0.05 }}
                                className="hover:bg-gray-50 transition-colors duration-200 group/row"
                              >
                                {/* Question Number */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-sm bg-gradient-to-br ${
                                    index % 4 === 0 ? 'from-blue-500 to-purple-600' :
                                    index % 4 === 1 ? 'from-emerald-500 to-teal-600' :
                                    index % 4 === 2 ? 'from-orange-500 to-red-600' :
                                    'from-pink-500 to-purple-600'
                                  }`}>
                                    {answerIndex + 1}
                                  </div>
                                </td>
                                
                                {/* Question Text */}
                                <td className="px-6 py-4">
                                  <div className="flex flex-col gap-2">
                                    <p className="text-sm font-medium text-gray-900 leading-relaxed">
                                      {answer.questionText}
                                    </p>
                                    {answer.isRequired && (
                                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs px-2 py-1 w-fit">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                </td>
                                
                                {/* Response */}
                                <td className="px-6 py-4">
                                  <div className={`p-3 rounded-lg border text-sm font-medium leading-relaxed bg-gradient-to-r ${
                                    index % 4 === 0 ? 'from-blue-50 to-indigo-50 border-blue-200 text-blue-900' :
                                    index % 4 === 1 ? 'from-emerald-50 to-teal-50 border-emerald-200 text-emerald-900' :
                                    index % 4 === 2 ? 'from-orange-50 to-red-50 border-orange-200 text-orange-900' :
                                    'from-pink-50 to-purple-50 border-pink-200 text-pink-900'
                                  }`}>
                                    <div className="flex items-start gap-2">
                                      <div className={`w-4 h-4 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${
                                        index % 4 === 0 ? 'bg-blue-500' :
                                        index % 4 === 1 ? 'bg-emerald-500' :
                                        index % 4 === 2 ? 'bg-orange-500' :
                                        'bg-pink-500'
                                      }`}>
                                        <CheckCircle className="w-2.5 h-2.5 text-white" />
                                      </div>
                                      <span className="break-words">
                                        {renderAnswerValue(answer)}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                
                                {/* Points */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {answer.points > 0 ? (
                                    <motion.div
                                      whileHover={{ scale: 1.05 }}
                                      className="flex items-center gap-1 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg px-3 py-2 w-fit"
                                    >
                                      <Star className="w-4 h-4 text-amber-600 fill-current" />
                                      <span className="text-sm font-bold text-amber-800">{answer.points}</span>
                                    </motion.div>
                                  ) : (
                                    <span className="text-gray-400 text-sm">—</span>
                                  )}
                                </td>
                                
                                {/* Status */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge className={`px-3 py-1 font-semibold border ${
                                    index % 4 === 0 ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                    index % 4 === 1 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                    index % 4 === 2 ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                    'bg-pink-100 text-pink-800 border-pink-200'
                                  }`}>
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Answered
                                  </Badge>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Section Summary Footer */}
                      <div className={`px-6 py-4 border-t border-gray-200 bg-gradient-to-r ${
                        index % 4 === 0 ? 'from-blue-50 to-indigo-50' :
                        index % 4 === 1 ? 'from-emerald-50 to-teal-50' :
                        index % 4 === 2 ? 'from-orange-50 to-red-50' :
                        'from-pink-50 to-purple-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <MessageSquare className={`w-4 h-4 ${
                                index % 4 === 0 ? 'text-blue-600' :
                                index % 4 === 1 ? 'text-emerald-600' :
                                index % 4 === 2 ? 'text-orange-600' :
                                'text-pink-600'
                              }`} />
                              <span className={`text-sm font-semibold ${
                                index % 4 === 0 ? 'text-blue-900' :
                                index % 4 === 1 ? 'text-emerald-900' :
                                index % 4 === 2 ? 'text-orange-900' :
                                'text-pink-900'
                              }`}>
                                {section.answers.length} Questions Completed
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className={`w-4 h-4 ${
                                index % 4 === 0 ? 'text-blue-600' :
                                index % 4 === 1 ? 'text-emerald-600' :
                                index % 4 === 2 ? 'text-orange-600' :
                                'text-pink-600'
                              }`} />
                              <span className={`text-sm font-semibold ${
                                index % 4 === 0 ? 'text-blue-900' :
                                index % 4 === 1 ? 'text-emerald-900' :
                                index % 4 === 2 ? 'text-orange-900' :
                                'text-pink-900'
                              }`}>
                                {section.answers.reduce((sum, answer) => sum + answer.points, 0)} Total Points
                              </span>
                            </div>
                          </div>
                          <Badge className={`px-3 py-1 font-semibold border ${
                            index % 4 === 0 ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            index % 4 === 1 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                            index % 4 === 2 ? 'bg-orange-100 text-orange-800 border-orange-200' :
                            'bg-pink-100 text-pink-800 border-pink-200'
                          }`}>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Section Complete
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>


        </div>
      </div>
    </div>
  )
}