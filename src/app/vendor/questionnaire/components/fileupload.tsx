import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  File, 
  X, 
  Check, 
  AlertCircle, 
  FileText, 
  Image, 
  FileVideo,
  Download,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface UploadedFile {
  fileName: string
  fileUrl: string
  publicId: string
  resourceType: string
  format: string
  bytes: number
  uploadedAt: string
}

interface FileUploadProps {
  questionId: string
  questionnaireId: string
  files: UploadedFile[]
  onFilesChange: (files: UploadedFile[]) => void
  maxFiles?: number
  maxFileSize?: number // in MB
  acceptedTypes?: string[]
  disabled?: boolean
}

export const FileUpload: React.FC<FileUploadProps> = ({
  questionId,
  questionnaireId,
  files,
  onFilesChange,
  maxFiles = 5,
  maxFileSize = 10,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (resourceType: string, format: string) => {
    if (resourceType === 'image') return <Image className="w-4 h-4" />
    if (resourceType === 'video') return <FileVideo className="w-4 h-4" />
    if (format === 'pdf') return <FileText className="w-4 h-4 text-red-500" />
    return <File className="w-4 h-4" />
  }

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`
    }

    const fileType = file.type
    const fileName = file.name.toLowerCase()
    
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileName.endsWith(type)
      }
      if (type.includes('*')) {
        const baseType = type.split('/')[0]
        return fileType.startsWith(baseType + '/')
      }
      return fileType === type
    })

    if (!isValidType) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`
    }

    return null
  }

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('questionId', questionId)
    formData.append('questionnaireId', questionnaireId)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      
      return {
        fileName: result.fileName,
        fileUrl: result.fileUrl,
        publicId: result.publicId,
        resourceType: result.resourceType,
        format: result.format,
        bytes: result.bytes,
        uploadedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Upload failed:', error)
      throw error
    }
  }

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    if (disabled) return

    const filesToProcess = Array.from(fileList)
    
    // Check if adding these files would exceed the limit
    if (files.length + filesToProcess.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} files`)
      return
    }

    // Validate all files first
    const validationErrors: string[] = []
    filesToProcess.forEach((file, index) => {
      const error = validateFile(file)
      if (error) {
        validationErrors.push(`File ${index + 1}: ${error}`)
      }
    })

    if (validationErrors.length > 0) {
      toast.error(validationErrors.join('\n'))
      return
    }

    setUploading(true)

    try {
      const uploadPromises = filesToProcess.map(uploadFile)
      const uploadResults = await Promise.all(uploadPromises)
      
      const successfulUploads = uploadResults.filter(result => result !== null) as UploadedFile[]
      
      if (successfulUploads.length > 0) {
        const updatedFiles = [...files, ...successfulUploads]
        onFilesChange(updatedFiles)
        toast.success(`${successfulUploads.length} file(s) uploaded successfully`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [files, onFilesChange, maxFiles, questionId, questionnaireId, disabled])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
    e.target.value = '' // Reset input value
  }, [handleFiles])

  const removeFile = useCallback((index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    onFilesChange(updatedFiles)
    toast.success('File removed')
  }, [files, onFilesChange])

  const openFile = useCallback((file: UploadedFile) => {
    window.open(file.fileUrl, '_blank')
  }, [])

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <motion.div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          disabled={disabled || uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="space-y-3">
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-blue-500 mx-auto animate-spin" />
              <p className="text-sm text-gray-600">Uploading files...</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mx-auto" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Drop files here or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  Max {maxFiles} files, {maxFileSize}MB each
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supported: {acceptedTypes.join(', ')}
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                Uploaded Files ({files.length}/{maxFiles})
              </h4>
              {files.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {files.reduce((total, file) => total + file.bytes, 0) > 1024 * 1024 
                    ? `${(files.reduce((total, file) => total + file.bytes, 0) / (1024 * 1024)).toFixed(1)} MB`
                    : `${Math.round(files.reduce((total, file) => total + file.bytes, 0) / 1024)} KB`
                  }
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              {files.map((file, index) => (
                <motion.div
                  key={file.publicId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border border-gray-200">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {getFileIcon(file.resourceType, file.format)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.fileName}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>{formatFileSize(file.bytes)}</span>
                              <span>•</span>
                              <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openFile(file)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-700"
                            disabled={disabled}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File limit warning */}
      {files.length >= maxFiles && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-lg"
        >
          <AlertCircle className="w-4 h-4" />
          <span>Maximum number of files reached</span>
        </motion.div>
      )}
    </div>
  )
}