export interface VendorUser {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface VendorProfile {
  id: string
  vendorId: string
  companyName: string
  registeredAddress: string
  country: string
  region: string
  primaryContactName: string
  primaryContactTitle: string
  primaryContactEmail: string
  primaryContactPhone: string
  companyWebsite: string
  yearEstablished: number
  companySize: 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE'
  employeeCount: number
  legalStructure: string
  hasParentCompany: boolean
  parentCompanyName: string
  parentCompanyHeadquarters: string
  keyExecutives: KeyExecutive[]
  businessSectors: string[]
  productsServices: string
  geographicalPresence: string[]
  isPubliclyTraded: boolean
  stockExchange: string
  tickerSymbol: string
  certifications: Certification[]
  isCompleted: boolean
  completedAt?: string
  completionPercentage: number
}

export interface KeyExecutive {
  name: string
  title: string
  email: string
}

export interface Certification {
  name: string
  issuedBy: string
  validUntil: string
}

export interface QuestionnaireTemplate {
  id: string
  name: string
  description: string
  riskLevel: string
  estimatedTime: number
  sections: QuestionnaireSection[]
}

export interface QuestionnaireSection {
  id: string
  title: string
  description: string
  order: number
  weightage: number
  questions: QuestionnaireQuestion[]
}

export interface QuestionnaireQuestion {
  id: string
  questionText: string
  description?: string
  questionType: 'TEXT' | 'TEXTAREA' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'BOOLEAN' | 'DATE' | 'NUMBER' | 'EMAIL' | 'URL' | 'FILE_UPLOAD'
  options?: {
    conditionalText?: {
      trigger: string | string[]
      prompt?: string
    }
    choices?: Array<{ 
      value: string
      label: string
      points?: number
      requiresText?: boolean  // Add this property
    }>
    maxLength?: number
    minLength?: number
    accept?: string
    maxFiles?: number
    maxSize?: number
    placeholder?: string
  }
  isRequired: boolean
  evidenceRequired: boolean
  order: number
  category?: string
  points?: number
  response?: VendorResponse
}

export interface VendorResponse {
  id: string
  questionnaireId: string
  questionId: string
  vendorId: string
  responseText?: string
  responseData?: any
  evidenceFiles?: string[]
  evidenceNotes?: string
  status: 'DRAFT' | 'SUBMITTED'
  createdAt: string
  updatedAt: string
}

export interface VendorQuestionnaire {
  id: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  assignedAt: string
  startedAt?: string
  submittedAt?: string
  dueDate: string
  totalQuestions: number
  answeredQuestions: number
  progressPercentage: number
}

export interface QuestionnaireProgress {
  answeredQuestions: number
  totalQuestions: number
  progressPercentage: number
  sectionProgress: Record<string, SectionProgress>
}

export interface SectionProgress {
  title: string
  order: number
  answeredQuestions: number
  totalQuestions: number
  percentage: number
}

export interface QuestionnaireData {
  questionnaire: VendorQuestionnaire
  template: QuestionnaireTemplate
  vendor: {
    id: string
    name: string
    email: string
    profile: VendorProfile
  }
  client: {
    name?: string
  }
  riskLevel?: string
}

export interface AutoSaveData {
  questionId: string
  responseText?: string
  responseData?: any
  evidenceFiles?: string[]
  evidenceNotes?: string
}

export interface ValidationError {
  questionId: string
  message: string
}

export interface FileUploadResult {
  success: boolean
  fileName?: string
  fileUrl?: string
  error?: string
}