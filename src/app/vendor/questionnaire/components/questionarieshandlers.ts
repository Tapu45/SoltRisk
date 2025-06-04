import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { API_ROUTES } from '@/lib/api'
import {
  QuestionnaireData,
  VendorResponse,
  AutoSaveData,
  ValidationError,
  QuestionnaireProgress,
  QuestionnaireQuestion,
  FileUploadResult
} from '../../../../types/question.type'

export const useQuestionnaire = (questionnaireId: string) => {
  // State management
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null)
  const [responses, setResponses] = useState<Record<string, VendorResponse>>({})
  const [progress, setProgress] = useState<QuestionnaireProgress | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null)
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)
  
  // Auto-save functionality
  const autoSaveTimeout = useRef<NodeJS.Timeout | undefined>(undefined)
  const pendingChanges = useRef<Record<string, AutoSaveData>>({})

  // Get current vendor from localStorage
  const getCurrentVendor = useCallback(() => {
    if (typeof window !== 'undefined') {
      const vendorData = localStorage.getItem('vendor')
      if (vendorData) {
        try {
          return JSON.parse(vendorData)
        } catch (error) {
          console.error('Error parsing vendor data:', error)
        }
      }
    }
    return null
  }, [])

  // Load questionnaire data
const loadQuestionnaire = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(
        API_ROUTES.VENDOR.GET_QUESTIONNAIRE(questionnaireId)
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load questionnaire')
      }
      
      const data = await response.json()
      setQuestionnaireData(data)
      
      // Build responses map
      const responsesMap: Record<string, VendorResponse> = {}
      data.template.sections.forEach((section: any) => {
        section.questions.forEach((question: any) => {
          if (question.response) {
            responsesMap[question.id] = question.response
          }
        })
      })
      setResponses(responsesMap)
      
      // Load progress
      await loadProgress()
      
    } catch (err: any) {
      console.error('Failed to load questionnaire:', err)
      setError(err.message)
      toast.error(err.message || 'Failed to load questionnaire')
    } finally {
      setLoading(false)
    }
  }, [questionnaireId])


  // Load progress
 const loadProgress = useCallback(async () => {
    try {
      const response = await fetch(
        API_ROUTES.VENDOR.GET_PROGRESS(questionnaireId)
      )
      
      if (response.ok) {
        const data = await response.json()
        setProgress(data.progress)
      }
    } catch (err) {
      console.error('Failed to load progress:', err)
    }
  }, [questionnaireId])

  // Auto-save response
 // Auto-save response
const autoSaveResponse = useCallback(async (questionId: string, data: AutoSaveData) => {
  const vendor = getCurrentVendor()
  if (!vendor) return

  try {
    setSavingQuestionId(questionId)  // Set saving state when API call starts
    
    const response = await fetch(`${API_ROUTES.VENDOR.SAVE_RESPONSE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionnaireId,
        questionId,
        vendorId: vendor.id,
        responseText: data.responseText,
        responseData: data.responseData,
        evidenceFiles: data.evidenceFiles || [],
        evidenceNotes: data.evidenceNotes,
        action: 'save-response'  // Add this line if missing
      })
    })

    if (response.ok) {
      const result = await response.json()
      
      // Update local responses
      setResponses(prev => {
        const updated = { ...prev }
        updated[questionId] = {
          ...prev[questionId],
          ...result.response,
          questionId,
          responseText: data.responseText,
          responseData: data.responseData,
          evidenceFiles: data.evidenceFiles || [],
          evidenceNotes: data.evidenceNotes || '',
          updatedAt: new Date().toISOString()
        }
        return updated
      })
      
      // Update progress
      if (result.progress) {
        setProgress(result.progress)
      }
      
      setLastSavedTime(new Date())
      
      // Remove from pending changes
      delete pendingChanges.current[questionId]
      
      console.log(`✅ Auto-saved response for question ${questionId}`)
    }
  } catch (err) {
    console.error('Auto-save failed:', err)
  } finally {
    setSavingQuestionId(null)  // Clear saving state when done
  }
}, [questionnaireId, getCurrentVendor])

  // Debounced auto-save
  const scheduleAutoSave = useCallback((questionId: string, data: AutoSaveData) => {
    // Store pending changes
    pendingChanges.current[questionId] = data
    
    // Clear existing timeout
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current)
    }
    
    // Schedule new auto-save
    autoSaveTimeout.current = setTimeout(() => {
      const pendingData = pendingChanges.current[questionId]
      if (pendingData) {
        autoSaveResponse(questionId, pendingData)
      }
    }, 2000) // Auto-save after 2 seconds of inactivity
  }, [autoSaveResponse])

  // Update response
  const updateResponse = useCallback((questionId: string, data: Partial<AutoSaveData>) => {
    // Update local state immediately for smooth UX
    setResponses(prev => {
      const currentResponse = prev[questionId]
      const updatedResponse = {
        ...currentResponse,
        id: currentResponse?.id || '',
        questionnaireId: currentResponse?.questionnaireId || questionnaireId,
        questionId,
        vendorId: currentResponse?.vendorId || '',
        status: currentResponse?.status || 'DRAFT' as const,
        createdAt: currentResponse?.createdAt || new Date().toISOString(),
        responseText: data.responseText ?? currentResponse?.responseText ?? '',
        responseData: data.responseData ?? currentResponse?.responseData ?? {},
        evidenceFiles: data.evidenceFiles ?? currentResponse?.evidenceFiles ?? [],
        evidenceNotes: data.evidenceNotes ?? currentResponse?.evidenceNotes ?? '',
        updatedAt: new Date().toISOString()
      }
      
      return {
        ...prev,
        [questionId]: updatedResponse
      }
    })
    
    // Prepare data for auto-save
    const currentResponse = responses[questionId]
    const updatedData: AutoSaveData = {
      questionId,
      responseText: data.responseText ?? currentResponse?.responseText ?? '',
      responseData: data.responseData ?? currentResponse?.responseData ?? {},
      evidenceFiles: data.evidenceFiles ?? currentResponse?.evidenceFiles ?? [],
      evidenceNotes: data.evidenceNotes ?? currentResponse?.evidenceNotes ?? ''
    }
    
    // Schedule auto-save
    scheduleAutoSave(questionId, updatedData)
  }, [questionnaireId, responses, scheduleAutoSave])

  // Validate response
  const validateResponse = useCallback((question: QuestionnaireQuestion, response?: VendorResponse): ValidationError | null => {
    if (!question.isRequired) return null
    
    const hasResponse = response && (
      (response.responseText && response.responseText.trim() !== '') ||
      (response.responseData && Object.keys(response.responseData).length > 0)
    )
    
    if (!hasResponse) {
      return {
        questionId: question.id,
        message: 'This question is required'
      }
    }
    
    // Type-specific validation
    switch (question.questionType) {
      case 'EMAIL':
        if (response?.responseText) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(response.responseText)) {
            return {
              questionId: question.id,
              message: 'Please enter a valid email address'
            }
          }
        }
        break
        
      case 'URL':
        if (response?.responseText) {
          try {
            new URL(response.responseText)
          } catch {
            return {
              questionId: question.id,
              message: 'Please enter a valid URL'
            }
          }
        }
        break
        
      case 'NUMBER':
        if (response?.responseText && isNaN(Number(response.responseText))) {
          return {
            questionId: question.id,
            message: 'Please enter a valid number'
          }
        }
        break
    }
    
    return null
  }, [])

  // Validate current section
  const validateCurrentSection = useCallback((): ValidationError[] => {
    if (!questionnaireData) return []
    
    const currentSection = questionnaireData.template.sections[currentSectionIndex]
    if (!currentSection) return []
    
    const errors: ValidationError[] = []
    
    currentSection.questions.forEach(question => {
      const response = responses[question.id]
      const error = validateResponse(question, response)
      if (error) {
        errors.push(error)
      }
    })
    
    return errors
  }, [questionnaireData, currentSectionIndex, responses, validateResponse])

  // Navigate to section
  const goToSection = useCallback((sectionIndex: number) => {
    if (!questionnaireData) return
    
    const maxIndex = questionnaireData.template.sections.length - 1
    const targetIndex = Math.max(0, Math.min(sectionIndex, maxIndex))
    
    setCurrentSectionIndex(targetIndex)
    setValidationErrors([])
  }, [questionnaireData])

  // Navigate to next section
  const nextSection = useCallback(() => {
    const errors = validateCurrentSection()
    if (errors.length > 0) {
      setValidationErrors(errors)
      toast.error(`Please complete all required questions in this section`)
      return false
    }
    
    if (questionnaireData && currentSectionIndex < questionnaireData.template.sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1)
      setValidationErrors([])
      return true
    }
    
    return false
  }, [validateCurrentSection, questionnaireData, currentSectionIndex])

  // Navigate to previous section
  const prevSection = useCallback(() => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1)
      setValidationErrors([])
      return true
    }
    return false
  }, [currentSectionIndex])

  // Start questionnaire
  const startQuestionnaire = useCallback(async () => {
    const vendor = getCurrentVendor()
    if (!vendor) return false
    
    try {
      const response = await fetch(`${API_ROUTES.VENDOR.START_QUESTIONNAIRE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionnaireId,
          vendorId: vendor.id
        })
      })
      
      if (response.ok) {
        await loadQuestionnaire()
        toast.success('Questionnaire started successfully!')
        return true
      }
      
      throw new Error('Failed to start questionnaire')
    } catch (err: any) {
      toast.error(err.message || 'Failed to start questionnaire')
      return false
    }
  }, [questionnaireId, getCurrentVendor, loadQuestionnaire])

  // Submit questionnaire
  const submitQuestionnaire = useCallback(async () => {
    const vendor = getCurrentVendor()
    if (!vendor || !questionnaireData) return false
    
    // Validate all sections
    const allErrors: ValidationError[] = []
    questionnaireData.template.sections.forEach((section, index) => {
      section.questions.forEach(question => {
        const response = responses[question.id]
        const error = validateResponse(question, response)
        if (error) {
          allErrors.push(error)
        }
      })
    })
    
    if (allErrors.length > 0) {
      setValidationErrors(allErrors)
      toast.error(`Please complete all required questions before submitting (${allErrors.length} errors found)`)
      return false
    }
    
    try {
      setSubmitting(true)
      
      const response = await fetch(`${API_ROUTES.VENDOR.SUBMIT_QUESTIONNAIRE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionnaireId,
          vendorId: vendor.id
        })
      })
      
      if (response.ok) {
        toast.success('Questionnaire submitted successfully!')
        await loadQuestionnaire()
        return true
      }
      
      throw new Error('Failed to submit questionnaire')
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit questionnaire')
      return false
    } finally {
      setSubmitting(false)
    }
  }, [questionnaireId, getCurrentVendor, questionnaireData, responses, validateResponse, loadQuestionnaire])

  // File upload handler
  const uploadFile = useCallback(async (file: File, questionId: string): Promise<FileUploadResult> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('questionId', questionId)
      formData.append('questionnaireId', questionnaireId)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        return {
          success: true,
          fileName: result.fileName,
          fileUrl: result.fileUrl
        }
      }
      
      throw new Error('Upload failed')
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Upload failed'
      }
    }
  }, [questionnaireId])

  // Initialize
  useEffect(() => {
    if (questionnaireId) {
      loadQuestionnaire()
    }
  }, [questionnaireId, loadQuestionnaire])

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current)
      }
    }
  }, [])

  return {
    // State
    loading,
    submitting,
    questionnaireData,
    responses,
    progress,
    validationErrors,
    currentSectionIndex,
    error,
    savingQuestionId,
    lastSavedTime,
    // Actions
    updateResponse,
    goToSection,
    nextSection,
    prevSection,
    startQuestionnaire,
    submitQuestionnaire,
    loadQuestionnaire,
    uploadFile,
    
    // Computed
    currentSection: questionnaireData?.template.sections[currentSectionIndex],
    isFirstSection: currentSectionIndex === 0,
    isLastSection: questionnaireData ? currentSectionIndex === questionnaireData.template.sections.length - 1 : false,
    canSubmit: questionnaireData?.questionnaire.status === 'IN_PROGRESS',
    isCompleted: questionnaireData?.questionnaire.status === 'SUBMITTED'
  }
}