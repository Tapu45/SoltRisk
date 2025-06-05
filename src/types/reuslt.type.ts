export interface Question {
  id: string;
  questionText: string;
  description?: string;
  questionType: string;
  options?: any;
  isRequired: boolean;
  evidenceRequired: boolean;
  order: number;
  category?: string;
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  order: number;
  weightage: number;
  isRequired: boolean;
  questionCount: number;
  questions: Question[];
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  riskLevel: string;
  templateType: string;
  version: string;
  isActive: boolean;
  totalQuestions: number;
  estimatedTime?: number;
  sections: Section[];
}

export interface SubmissionData {
  submission: {
    id: string;
    approvalStatus: string;
    submittedAt: string;
    submittedBy: string;
    riskLevel: string;
  };
  vendor: {
    name: string;
    email: string;
  };
  riskAssessment: {
    riskLevel: string;
    totalScore: number;
    maxPossibleScore: number;
    riskPercentage: number;
  };
}

export interface QuestionFormState {
  questionText: string;
  description: string;
  questionType: string;
  isRequired: boolean;
  evidenceRequired: boolean;
  category: string;
  sectionId: string;
  createNewSection: boolean;
  newSectionTitle: string;
  newSectionDescription: string;
  options: any;
}

export interface SectionFormState {
  title: string;
  description: string;
  weightage: number;
  isRequired: boolean;
}

export const QuestionTypes = [
  { value: "TEXT", label: "Short Text" },
  { value: "TEXTAREA", label: "Long Text" },
  { value: "SINGLE_CHOICE", label: "Single Choice" },
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
  { value: "BOOLEAN", label: "Yes/No" },
  { value: "SCALE", label: "Rating Scale" },
  { value: "FILE_UPLOAD", label: "File Upload" },
  { value: "DATE", label: "Date" },
  { value: "NUMBER", label: "Number" },
];