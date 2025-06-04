import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  FileText, 
  Hash, 
  Mail, 
  Globe, 
  Upload,
  AlertCircle,
  CheckCircle,
  Paperclip,
  X,
  Download,
  Eye
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { QuestionnaireQuestion, VendorResponse, ValidationError } from '../../../../types/question.type'

interface QuestionRendererProps {
  question: QuestionnaireQuestion
  response?: VendorResponse
  validationError?: ValidationError
  onResponseChange: (questionId: string, data: any) => void
  onFileUpload: (file: File, questionId: string) => Promise<any>
  savingQuestionId?: string | null 
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  response,
  validationError,
  onResponseChange,
  onFileUpload,

  savingQuestionId
}) => {
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const hasError = validationError?.questionId === question.id
  const isCurrentlySaving = savingQuestionId === question.id
  const hasResponse = response && (
    (response.responseText && response.responseText.trim() !== '') ||
    (response.responseData && Object.keys(response.responseData).length > 0) ||
    (response.evidenceFiles && response.evidenceFiles.length > 0)
  )

  // Helper function to check if conditional text should be shown
  // Helper function to check if conditional text should be shown
const shouldShowConditionalText = () => {
  if (!question.options?.conditionalText) return false
  
  const trigger = question.options.conditionalText.trigger
  const currentValue = response?.responseText || ''
  
  console.log('DEBUG - Conditional check:', {
    questionId: question.id,
    questionType: question.questionType,
    trigger,
    currentValue,
    conditionalOptions: question.options?.conditionalText
  })
  
  // For boolean questions, map "true"/"false" to "Yes"/"No" for trigger matching
  if (question.questionType === 'BOOLEAN') {
    const mappedValue = currentValue === 'true' ? 'Yes' : currentValue === 'false' ? 'No' : currentValue
    
    if (Array.isArray(trigger)) {
      return trigger.includes(mappedValue)
    }
    return trigger === mappedValue
  }
  
  // For other question types, use direct comparison
  if (Array.isArray(trigger)) {
    return trigger.includes(currentValue)
  }
  
  return currentValue === trigger
}

  // Helper function to check if a choice requires additional text
  const choiceRequiresText = (choiceValue: string) => {
    const choice = question.options?.choices?.find(c => c.value === choiceValue)
    return choice?.requiresText === true
  }

  const getQuestionIcon = () => {
    switch (question.questionType) {
      case 'EMAIL': return <Mail className="w-4 h-4 text-blue-500" />
      case 'URL': return <Globe className="w-4 h-4 text-green-500" />
      case 'NUMBER': return <Hash className="w-4 h-4 text-purple-500" />
      case 'DATE': return <Calendar className="w-4 h-4 text-orange-500" />
      case 'FILE_UPLOAD': return <Upload className="w-4 h-4 text-teal-500" />
      case 'TEXTAREA': return <FileText className="w-4 h-4 text-indigo-500" />
      default: return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const file = files[0]
    const fileKey = `${question.id}-${file.name}`
    
    try {
      setUploading(prev => ({ ...prev, [fileKey]: true }))
      
      const result = await onFileUpload(file, question.id)
      
      if (result.success) {
        const currentFiles = response?.evidenceFiles || []
        const newFiles = [...currentFiles, result.fileUrl]
        
        onResponseChange(question.id, {
          evidenceFiles: newFiles
        })
      }
    } catch (error) {
      console.error('File upload failed:', error)
    } finally {
      setUploading(prev => ({ ...prev, [fileKey]: false }))
    }
  }

  const removeFile = (fileIndex: number) => {
    const currentFiles = response?.evidenceFiles || []
    const newFiles = currentFiles.filter((_, index) => index !== fileIndex)
    
    onResponseChange(question.id, {
      evidenceFiles: newFiles
    })
  }

 const renderInput = () => {
  const baseClasses = `bg-white/70 backdrop-blur-sm focus:ring-2 transition-all duration-200 ${
    hasError 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
      : 'border-gray-300 focus:border-teal-500 focus:ring-teal-500/20'
  }`

    switch (question.questionType) {
      case 'TEXT':
      case 'EMAIL':
      case 'URL':
        return (
          <Input
            type={question.questionType === 'EMAIL' ? 'email' : question.questionType === 'URL' ? 'url' : 'text'}
            value={response?.responseText || ''}
            onChange={(e) => onResponseChange(question.id, { responseText: e.target.value })}
            placeholder={question.options?.placeholder || `Enter your ${question.questionType.toLowerCase()}`}
            className={baseClasses}
            maxLength={question.options?.maxLength}
          />
        )

      case 'NUMBER':
        return (
          <Input
            type="number"
            value={response?.responseText || ''}
            onChange={(e) => onResponseChange(question.id, { responseText: e.target.value })}
            placeholder={question.options?.placeholder || 'Enter a number'}
            className={baseClasses}
          />
        )

      case 'DATE':
        return (
          <Input
            type="date"
            value={response?.responseText || ''}
            onChange={(e) => onResponseChange(question.id, { responseText: e.target.value })}
            className={baseClasses}
          />
        )

      case 'TEXTAREA':
        return (
          <div className="space-y-2">
            <Textarea
              value={response?.responseText || ''}
              onChange={(e) => onResponseChange(question.id, { responseText: e.target.value })}
              placeholder={question.options?.placeholder || 'Enter your detailed response'}
              className={baseClasses}
              rows={4}
              maxLength={question.options?.maxLength}
            />
            {question.options?.maxLength && (
              <div className="text-xs text-gray-500 text-right">
                {(response?.responseText || '').length} / {question.options.maxLength}
              </div>
            )}
          </div>
        )

      case 'BOOLEAN':
        return (
          <div className="space-y-4">
            <RadioGroup
              value={response?.responseText || ''}
              onValueChange={(value) => onResponseChange(question.id, { responseText: value })}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id={`${question.id}-yes`} />
                <Label htmlFor={`${question.id}-yes`} className="font-medium">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id={`${question.id}-no`} />
                <Label htmlFor={`${question.id}-no`} className="font-medium">No</Label>
              </div>
            </RadioGroup>

            {/* Conditional Text Input for Boolean Questions */}
           {shouldShowConditionalText() && (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ duration: 0.3 }}
    className="mt-4 p-5 bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-xl shadow-sm"
  >
    <Label className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
      <FileText className="w-4 h-4" />
      {question.options?.conditionalText?.prompt || 'Please provide additional details:'}
    </Label>
    <Textarea
      value={response?.responseData?.conditionalText || ''}
      onChange={(e) => onResponseChange(question.id, { 
        responseData: { 
          ...response?.responseData,
          conditionalText: e.target.value 
        }
      })}
      placeholder="Please provide additional details..."
      rows={3}
      className="bg-white/70 backdrop-blur-sm border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  </motion.div>
)}
          </div>
        )

      case 'SINGLE_CHOICE':
        return (
          <div className="space-y-4">
            <RadioGroup
              value={response?.responseText || ''}
              onValueChange={(value) => onResponseChange(question.id, { responseText: value })}
              className="space-y-3"
            >
              {question.options?.choices?.map((choice, index) => (
              <motion.div 
  key={index} 
  className="flex items-center space-x-3 p-4 rounded-xl border border-gray-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-teal-50/50 hover:border-teal-300 transition-all duration-200 bg-white/60 backdrop-blur-sm"
  whileHover={{ scale: 1.01, y: -1 }}
  whileTap={{ scale: 0.99 }}
>
  <RadioGroupItem value={choice.value} id={`${question.id}-${index}`} className="border-2 border-teal-400" />
  <Label htmlFor={`${question.id}-${index}`} className="flex-1 cursor-pointer">
    <div className="flex items-center justify-between">
      <span className="font-medium text-gray-800">{choice.label}</span>
      {choice.points && (
        <Badge variant="outline" className="text-xs border-teal-200 text-teal-700 bg-teal-50">
          {choice.points} pts
        </Badge>
      )}
    </div>
  </Label>
</motion.div>
              ))}
            </RadioGroup>

            {/* Conditional Text Input for Single Choice Questions */}
            {choiceRequiresText(response?.responseText || '') && (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ duration: 0.3 }}
    className="mt-4 p-5 bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-xl shadow-sm"
  >
    <Label className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
      <FileText className="w-4 h-4" />
      {question.options?.conditionalText?.prompt || 'Please provide additional details:'}
    </Label>
    <Textarea
      value={response?.responseData?.conditionalText || ''}
      onChange={(e) => onResponseChange(question.id, { 
        responseData: { 
          ...response?.responseData,
          conditionalText: e.target.value 
        }
      })}
      placeholder="Please provide additional details..."
      rows={3}
      className="bg-white/70 backdrop-blur-sm border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  </motion.div>
)}
          </div>
        )

      case 'MULTIPLE_CHOICE':
        const selectedChoices = response?.responseData?.choices || []
        return (
          <div className="space-y-3">
            {question.options?.choices?.map((choice, index) => (
              <motion.div 
                key={index} 
                className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.01 }}
              >
                <Checkbox
                  checked={selectedChoices.includes(choice.value)}
                  onCheckedChange={(checked) => {
                    const newChoices = checked
                      ? [...selectedChoices, choice.value]
                      : selectedChoices.filter((c: string) => c !== choice.value)
                    
                    onResponseChange(question.id, {
                      responseData: { 
                        ...response?.responseData,
                        choices: newChoices 
                      }
                    })
                  }}
                  id={`${question.id}-${index}`}
                />
                <Label htmlFor={`${question.id}-${index}`} className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span>{choice.label}</span>
                    {choice.points && (
                      <Badge variant="outline" className="text-xs">
                        {choice.points} pts
                      </Badge>
                    )}
                  </div>
                </Label>
              </motion.div>
            ))}
          </div>
        )

      case 'FILE_UPLOAD':
        return (
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                hasError ? 'border-red-300' : 'border-gray-300 hover:border-teal-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => handleFileUpload(e.target.files)}
                accept={question.options?.accept}
                className="hidden"
                multiple={question.options?.maxFiles ? question.options.maxFiles > 1 : false}
              />
              
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mb-3">
                {question.options?.accept || 'All file types'} • Max {question.options?.maxSize ? `${question.options.maxSize}MB` : '10MB'}
              </p>
              
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
              >
                Choose File
              </Button>
            </div>

            {/* Uploaded Files */}
            {response?.evidenceFiles && response.evidenceFiles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Uploaded Files:</Label>
                {response.evidenceFiles.map((fileUrl, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 truncate">
                        {fileUrl.split('/').pop()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(fileUrl, '_blank')}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )

      default:
        return (
          <Input
            value={response?.responseText || ''}
            onChange={(e) => onResponseChange(question.id, { responseText: e.target.value })}
            placeholder="Enter your response"
            className={baseClasses}
          />
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
     
<Card className={`border-0 bg-white/80 backdrop-blur-sm shadow-xl transition-all duration-200 ${
  hasError ? 'ring-2 ring-red-200 bg-red-50/30' : 
  hasResponse ? 'ring-2 ring-green-200 bg-green-50/30' : ''
}`}>
  <CardContent className="p-6">
    {/* Question Header */}
    <div className="flex items-start gap-4 mb-6">
      <div className="flex-shrink-0 mt-1">
        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl flex items-center justify-center">
          {getQuestionIcon()}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <Label className="text-lg font-semibold text-gray-900">
            {question.questionText}
          </Label>
          {question.isRequired && (
            <Badge variant="destructive" className="text-xs bg-red-500 hover:bg-red-600">
              Required
            </Badge>
          )}
          {question.evidenceRequired && (
            <Badge variant="outline" className="text-xs border-teal-200 text-teal-700 bg-teal-50">
              Evidence Required
            </Badge>
          )}
          {hasResponse && !isCurrentlySaving && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full"
            >
              <CheckCircle className="w-3 h-3" />
              <span className="text-xs font-medium">Answered</span>
            </motion.div>
          )}
          {isCurrentlySaving && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full"
              />
              <span className="text-xs font-medium">Saving...</span>
            </motion.div>
          )}
        </div>
        
        {question.description && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-lg mb-4">
            <p className="text-sm text-blue-800 leading-relaxed">
              {question.description}
            </p>
          </div>
        )}
        
        {/* Error Message */}
        {hasError && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 p-3 bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm mb-4"
          >
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">{validationError?.message}</span>
          </motion.div>
        )}
      </div>
    </div>

    {/* Question Input */}
    <div className="space-y-4">
      {renderInput()}
      
      {/* Evidence/Notes Section */}
      {question.evidenceRequired && (
        <div className="pt-6 border-t border-gray-200">
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
            <Label className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Evidence Notes (Optional)
            </Label>
            <Textarea
              value={response?.evidenceNotes || ''}
              onChange={(e) => onResponseChange(question.id, { evidenceNotes: e.target.value })}
              placeholder="Provide additional context or notes about your evidence..."
              rows={3}
              className="bg-white/70 backdrop-blur-sm border-amber-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
      )}
    </div>
  </CardContent>
</Card>
    </motion.div>
  )
}