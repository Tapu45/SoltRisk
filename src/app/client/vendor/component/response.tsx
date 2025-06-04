'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  Download,
  MessageSquare,
  Paperclip,
  BarChart3,
  Shield,
  Target,
  Calendar,
  ChevronDown,
  ChevronRight,
  Zap,
  Star,
  FileCheck,
  Upload,
  ExternalLink,
  CheckSquare,
  Square,
  Archive,
  FileImage,
  FileVideo,
  FileSpreadsheet,
  Layers,
  Activity,
  Timer,
  BookOpen,
  Settings,
  TrendingUp,
  FileX
} from 'lucide-react'

interface VendorResponsesProps {
  questionnaires: Array<{
    id: string
    status: string
    progressPercentage: number
    answeredQuestions: number
    totalQuestions: number
    assignedAt: string
    startedAt: string | null
    submittedAt: string | null
    dueDate: string
    template: {
      id: string
      name: string
      riskLevel: string
      totalQuestions: number
    }
    responseCount: number
    responses: Array<{
      id: string
      questionId: string
      responseText?: string
      responseData?: any
      answer?: any
      isCompleted?: boolean
      submittedAt: string | null
      Question: {
        id: string
        questionText: string
        questionType: string
        isRequired: boolean
        evidenceRequired: boolean
        Section: {
          id: string
          title: string
          order: number
        }
      }
      Evidence: Array<{
        id: string
        fileName: string
        fileSize: number
        fileType: string
        uploadedAt: string
      }>
    }>
    riskAssessment: any
    rifRiskLevel: string
  }>
  onViewQuestionnaire?: (questionnaireId: string) => void
  isExpanded?: boolean
  onToggle?: () => void
}

const statusConfig = {
  NOT_STARTED: {
    color: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: Clock,
    iconColor: 'text-slate-600',
    description: 'Awaiting vendor response'
  },
  IN_PROGRESS: {
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: Activity,
    iconColor: 'text-blue-600',
    description: 'Actively being completed'
  },
  SUBMITTED: {
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    icon: FileCheck,
    iconColor: 'text-amber-600',
    description: 'Under review by assessors'
  },
  UNDER_REVIEW: {
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    icon: Eye,
    iconColor: 'text-purple-600',
    description: 'Being evaluated by experts'
  },
  APPROVED: {
    color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    icon: CheckCircle,
    iconColor: 'text-emerald-600',
    description: 'Successfully approved'
  },
  REJECTED: {
    color: 'bg-red-100 text-red-700 border-red-300',
    icon: XCircle,
    iconColor: 'text-red-600',
    description: 'Requires revision and resubmission'
  },
  EXPIRED: {
    color: 'bg-gray-100 text-gray-600 border-gray-300',
    icon: Archive,
    iconColor: 'text-gray-500',
    description: 'Past due date - action required'
  }
}

const riskLevelConfig = {
  LOW: {
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: Shield,
    accent: 'from-red-500 to-pink-500'
  },
  MEDIUM: {
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    icon: AlertTriangle,
    accent: 'from-red-500 to-pink-500'
  },
  HIGH: {
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    icon: Zap,
    accent: 'from-red-500 to-pink-500'
  },
  CRITICAL: {
    color: 'bg-red-100 text-red-700 border-red-300',
    icon: Star,
    accent: 'from-red-500 to-pink-500'
  }
}

const questionTypeIcons = {
  'TEXT': FileText,
  'TEXTAREA': FileText,
  'MULTIPLE_CHOICE': CheckSquare,
  'SINGLE_CHOICE': CheckSquare,
  'BOOLEAN': Square,
  'NUMBER': BarChart3,
  'DATE': Calendar,
  'FILE': Upload,
  'EMAIL': MessageSquare,
  'URL': ExternalLink,
  'PHONE': Target,
  'text': FileText,
  'multipleChoice': CheckSquare,
  'boolean': Square,
  'number': BarChart3,
  'date': Calendar,
  'file': Upload,
  'email': MessageSquare,
  'url': ExternalLink,
  'phone': Target
}

const getFileIcon = (fileType: string) => {
  const type = fileType.toLowerCase()
  if (type.includes('image')) return FileImage
  if (type.includes('video')) return FileVideo
  if (type.includes('spreadsheet') || type.includes('excel')) return FileSpreadsheet
  return Paperclip
}

export default function VendorResponses({ 
  questionnaires, 
  onViewQuestionnaire
}: VendorResponsesProps) {
  const [showEvidence, setShowEvidence] = useState<{ [key: string]: boolean }>({})

  // Helper function to format response text for display
  const formatResponseText = (response: VendorResponsesProps['questionnaires'][0]['responses'][0]) => {
    // Check for responseText (new format)
    const hasResponseText = response.responseText && response.responseText.trim() !== ''
    
    // Check for responseData (conditional/additional data)
    const hasResponseData = response.responseData && 
      Object.keys(response.responseData).length > 0
    
    // Fallback to answer field (legacy format)
    const hasAnswer = response.answer && 
      (typeof response.answer === 'string' ? response.answer.trim() !== '' : true)
    
    if (!hasResponseText && !hasResponseData && !hasAnswer) {
      return 'No response yet'
    }
    
    let displayText = ''
    
    // Handle boolean questions specially
    if (response.Question.questionType === 'BOOLEAN' || response.Question.questionType === 'boolean') {
      if (response.responseText === 'true') {
        displayText = 'Yes'
      } else if (response.responseText === 'false') {
        displayText = 'No'
      } else if (response.answer === true || response.answer === 'true') {
        displayText = 'Yes'
      } else if (response.answer === false || response.answer === 'false') {
        displayText = 'No'
      } else {
        displayText = response.responseText || String(response.answer || '')
      }
      
      // Add conditional text if available
      if (hasResponseData && response.responseData.conditionalText) {
        displayText += ` - ${response.responseData.conditionalText}`
      }
    } else {
      // For other question types, show the response text or answer
      displayText = response.responseText || String(response.answer || '')
      
      // Add any additional response data
      if (hasResponseData) {
        const dataValues = Object.values(response.responseData)
          .filter(val => val && typeof val === 'string' && val.trim() !== '')
          .join(', ')
        
        if (dataValues) {
          displayText = displayText ? `${displayText} - ${dataValues}` : dataValues
        }
      }
    }
    
    // Truncate if too long
    const maxLength = 120
    if (displayText.length > maxLength) {
      return displayText.substring(0, maxLength) + '...'
    }
    
    return displayText || 'Response provided'
  }

  // Helper function to check if response is completed
  const isResponseCompleted = (response: VendorResponsesProps['questionnaires'][0]['responses'][0]) => {
    const hasResponseText = response.responseText && response.responseText.trim() !== ''
    const hasResponseData = response.responseData && Object.keys(response.responseData).length > 0
    const hasAnswer = response.answer && 
      (typeof response.answer === 'string' ? response.answer.trim() !== '' : true)
    const hasCompletedFlag = response.isCompleted === true
    
    return hasResponseText || hasResponseData || hasAnswer || hasCompletedFlag
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getResponsesBySection = (responses: any[]) => {
    const sections: { [key: string]: any[] } = {}
    
    responses.forEach(response => {
      const sectionTitle = response.Question.Section.title
      if (!sections[sectionTitle]) {
        sections[sectionTitle] = []
      }
      sections[sectionTitle].push(response)
    })

    return Object.entries(sections).sort(([, a], [, b]) => 
      a[0].Question.Section.order - b[0].Question.Section.order
    )
  }

  const getOverallStats = () => {
    const totalQuestions = questionnaires.reduce((acc, q) => acc + q.totalQuestions, 0)
    const answeredQuestions = questionnaires.reduce((acc, q) => acc + q.answeredQuestions, 0)
    const totalEvidence = questionnaires.reduce((acc, q) => 
      acc + q.responses.reduce((evidenceAcc, r) => evidenceAcc + r.Evidence.length, 0), 0
    )
    const avgProgress = questionnaires.length > 0 
      ? questionnaires.reduce((acc, q) => acc + q.progressPercentage, 0) / questionnaires.length 
      : 0
    const completedQuestionnaires = questionnaires.filter(q => q.status === 'SUBMITTED' || q.status === 'APPROVED').length

    return {
      totalQuestions,
      answeredQuestions,
      totalEvidence,
      avgProgress,
      completedQuestionnaires
    }
  }

  if (questionnaires.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden"
      >
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-12 text-center">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1] 
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <BookOpen className="h-12 w-12 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Assessment Activities</h3>
            <p className="text-gray-600 max-w-md mx-auto leading-relaxed mb-6">
              This vendor hasn't been assigned any questionnaires yet. Assessment activities will appear here once assigned by administrators.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-teal-600">
              <Timer className="h-4 w-4" />
              <span>Waiting for assignment...</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const stats = getOverallStats()
  const mainQuestionnaire = questionnaires[0] // Use first questionnaire for main display
  const statusInfo = statusConfig[mainQuestionnaire.status as keyof typeof statusConfig]
  const riskInfo = riskLevelConfig[mainQuestionnaire.template.riskLevel as keyof typeof riskLevelConfig]
  const StatusIcon = statusInfo.icon
  const RiskIcon = riskInfo.icon
  const isOverdue = new Date(mainQuestionnaire.dueDate) < new Date() && 
    !['SUBMITTED', 'APPROVED'].includes(mainQuestionnaire.status)

  return (
    <div className="space-y-6">
      {/* Unified Header with All Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-0 shadow-xl bg-white overflow-hidden">
          <CardContent className="p-6">
            {/* Main Header Row */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`w-16 h-16 bg-gradient-to-br ${riskInfo.accent} rounded-2xl flex items-center justify-center shadow-lg`}
                >
                  <RiskIcon className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {mainQuestionnaire.template.name}
                  </h1>
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <Badge className={`${statusInfo.color} border shadow-sm`}>
                      <StatusIcon className="h-4 w-4 mr-2" />
                      {mainQuestionnaire.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={`${riskInfo.color} border shadow-sm`}>
                      <RiskIcon className="h-4 w-4 mr-2" />
                      {mainQuestionnaire.template.riskLevel} Risk
                    </Badge>
                    {isOverdue && (
                      <Badge variant="destructive" className="shadow-sm">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Overdue
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600">{statusInfo.description}</p>
                </div>
              </div>
              
              {onViewQuestionnaire && (
                <Button 
                  onClick={() => onViewQuestionnaire(mainQuestionnaire.id)}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Review Assessment
                </Button>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {[
                {
                  label: 'Questions',
                  value: `${stats.answeredQuestions}/${stats.totalQuestions}`,
                  icon: MessageSquare,
                  accent: 'from-teal-500 to-cyan-500'
                },
                {
                  label: 'Progress',
                  value: `${Math.round(stats.avgProgress)}%`,
                  icon: TrendingUp,
                  accent: 'from-red-500 to-pink-500'
                },
                {
                  label: 'Evidence',
                  value: stats.totalEvidence.toString(),
                  icon: Paperclip,
                  accent: 'from-teal-500 to-cyan-500'
                },
                {
                  label: 'Assigned',
                  value: formatDate(mainQuestionnaire.assignedAt),
                  icon: Calendar,
                  accent: 'from-red-500 to-pink-500'
                },
                {
                  label: 'Due Date',
                  value: formatDate(mainQuestionnaire.dueDate),
                  icon: Timer,
                  accent: isOverdue ? 'from-red-500 to-pink-500' : 'from-teal-500 to-cyan-500'
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 bg-gradient-to-br ${item.accent} rounded-lg flex items-center justify-center`}>
                      {React.createElement(item.icon, { className: "h-4 w-4 text-white" })}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{item.value}</div>
                </motion.div>
              ))}
            </div>
            
            {/* Overall Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Overall Progress</span>
                <span className="font-bold text-gray-900">{Math.round(stats.avgProgress)}%</span>
              </div>
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.avgProgress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Responses Section - Always Visible */}
      <div className="space-y-4">
        {questionnaires.map((questionnaire, index) => (
          <motion.div
            key={questionnaire.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-lg bg-white overflow-hidden">
              {/* Responses Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Question Responses</h3>
                      <p className="text-sm text-gray-600">{questionnaire.responses.length} questions • {questionnaire.responses.filter(r => isResponseCompleted(r)).length} completed</p>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEvidence(prev => ({ 
                      ...prev, 
                      [questionnaire.id]: !prev[questionnaire.id] 
                    }))}
                    className="text-sm"
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Evidence ({questionnaire.responses.reduce((acc, r) => acc + r.Evidence.length, 0)})
                  </Button>
                </div>
              </div>

              {/* Responses Content */}
              <div className="p-4">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {getResponsesBySection(questionnaire.responses).map(([sectionTitle, responses], sectionIdx) => (
                    <div key={sectionTitle} className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 bg-gray-100 p-2 rounded-lg">
                        <Layers className="w-4 h-4 text-gray-600" />
                        {sectionTitle} ({responses.length} questions)
                      </div>
                      
                      <div className="grid gap-3">
                        {responses.map((response, idx) => {
                          const QuestionIcon = questionTypeIcons[response.Question.questionType as keyof typeof questionTypeIcons] || FileText
                          const isCompleted = isResponseCompleted(response)
                          
                          return (
                            <div 
                              key={response.id}
                              className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                  isCompleted 
                                    ? 'bg-gradient-to-br from-red-500 to-pink-500 text-white' 
                                    : 'bg-gray-200 text-gray-600'
                                }`}>
                                  <QuestionIcon className="w-4 h-4" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 mb-2">
                                    {response.Question.questionText}
                                  </p>
                                  <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                                    {formatResponseText(response)}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {isCompleted ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <Clock className="h-5 w-5 text-gray-400" />
                                  )}
                                  {response.Evidence.length > 0 && (
                                    <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                                      {response.Evidence.length} files
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence Section */}
              <AnimatePresence>
                {showEvidence[questionnaire.id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                          <Paperclip className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Evidence Files</h4>
                      </div>
                      
                      {questionnaire.responses.filter(response => response.Evidence.length > 0).length > 0 ? (
                        <div className="space-y-4 max-h-64 overflow-y-auto">
                          {questionnaire.responses
                            .filter(response => response.Evidence.length > 0)
                            .map((response, idx) => (
                              <div key={response.id} className="space-y-2">
                                <div className="text-sm font-medium text-gray-700 bg-white p-2 rounded-lg">
                                  {response.Question.questionText.substring(0, 80)}...
                                </div>
                                
                                <div className="grid gap-2">
                                  {response.Evidence.map((evidence, evidenceIdx) => {
                                    const FileIcon = getFileIcon(evidence.fileType)
                                    
                                    return (
                                      <div 
                                        key={evidence.id}
                                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                                      >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                                            <FileIcon className="h-4 w-4 text-white" />
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <div className="font-medium text-gray-900 text-sm truncate">
                                              {evidence.fileName}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              {evidence.fileType.toUpperCase()} • {formatFileSize(evidence.fileSize)}
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-1">
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <Download className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FileX className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-500">No evidence files uploaded yet</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}