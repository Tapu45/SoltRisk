export interface Assignment {
  name: string;
  email: string;
  department: string;
  role: string;
  dueDate: string;
  comments?: string;
}

export interface Question {
  questionKey: string;
  id: string;
  questionText: string;
  questionType: string;
  questionOptions?: any;
  options?: any;
  isRequired: boolean;
  order: number;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  order: number;
  Questions: Question[];
}

export interface RifForm {
  id: string;
  title: string;
  Sections: Section[];
}

export interface Questions {
  questionId: string
  questionText: string
  questionType: string
  answerValue: any
  points: number
  isRequired: boolean
  order: number
}

export interface Sections {
  id: string
  title: string
  order: number
  answers: Questions[]
}

export interface AssessmentData {
  submission: {
    id: string
    submittedAt: string
    submittedBy: string
    clientComments: string
    totalScore: number
    riskLevel: string
    isReviewed: boolean
    approvalStatus: string
    approvedBy?: string
    approvedAt?: string
    rejectionReason?: string
    approvalComments?: string
  }
  initiation: {
    internalUserName: string
    internalUserEmail: string
    internalUserDept: string
    internalUserRole: string
    assignmentComments: string
    dueDate: string
    section1Data: any[]
  }
  vendor: {
    name: string
    email: string
  }
  riskAssessment: {
    totalScore: number
    maxPossibleScore: number
    riskPercentage: number
    riskLevel: string
    sectionScores: any
    recommendations: string
  }
  sections: Sections[]
}