export interface InvitationData {
  id: string
  vendorName: string
  vendorEmail: string
  templateName: string
  riskLevel: string
  clientName: string
  expiresAt: string
  totalQuestions: number
  estimatedTime: string
}

export interface AccountData {
  name: string
  password: string
  confirmPassword: string
}

export interface ProfileData {
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
  companySize: string
  employeeCount: number
  legalStructure: string
  hasParentCompany: boolean
  parentCompanyName: string
  parentCompanyHeadquarters: string
  keyExecutives: Array<{ name: string; title: string; email: string }>
  businessSectors: string[]
  productsServices: string
  geographicalPresence: string[]
  isPubliclyTraded: boolean
  stockExchange: string
  tickerSymbol: string
  certifications: Array<{ name: string; issuedBy: string; validUntil: string }>
}