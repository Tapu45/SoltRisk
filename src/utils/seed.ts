import { prisma } from '../lib/prisma'



async function seedRifForm() {
  try {
    // Create the RIF Form
    const rifForm = await prisma.rifForm.create({
      data: {
        title: "TRACS Risk Intake Form (RIF)",
        description: "Comprehensive third-party vendor risk assessment form",
        version: "1.0",
        isActive: true
      }
    })

    console.log('✅ Created RIF Form:', rifForm.title)

    // Create Sections
    const sections = []
    
    const sectionData = [
      { title: "Third Party Information", order: 1 },
      { title: "Nature of Engagement", order: 2 },
      { title: "Data & System Access", order: 3 },
      { title: "Risk Considerations", order: 4 },
      { title: "Compliance & Security", order: 5 },
      { title: "Reputational & Sanctions Screening", order: 6 },
      { title: "Supporting Documentation & Assessment Opt-Out", order: 7 }
    ]

    for (const section of sectionData) {
      const createdSection = await prisma.rifSection.create({
        data: {
          formId: rifForm.id,
          title: section.title,
          order: section.order,
          isRequired: section.order <= 5 // First 5 sections are required
        }
      })
      sections.push(createdSection)
      console.log(`✅ Created Section ${section.order}: ${section.title}`)
    }

    // Questions Data
    const questionsData = [
      // Section 1: Third Party Information
      {
        sectionIndex: 0,
        questionText: "Third Party Legal Name",
        questionType: "TEXT",
        isRequired: true,
        order: 1,
        maxPoints: 0
      },
      {
        sectionIndex: 0,
        questionText: "Country of Operations",
        questionType: "SINGLE_CHOICE",
        isRequired: true,
        order: 2,
        maxPoints: 3,
        weightage: 1.0,
        options: {
          choices: [
            { value: "USA", label: "USA", riskScore: 1 },
            { value: "Canada", label: "Canada", riskScore: 1 },
            { value: "UK", label: "United Kingdom", riskScore: 1 },
            { value: "Germany", label: "Germany", riskScore: 1 },
            { value: "UAE", label: "UAE", riskScore: 2 },
            { value: "India", label: "India", riskScore: 2 },
            { value: "China", label: "China", riskScore: 2 },
            { value: "Russia", label: "Russia", riskScore: 3 },
            { value: "Iran", label: "Iran", riskScore: 3 },
            { value: "North Korea", label: "North Korea", riskScore: 3 }
          ]
        }
      },
      {
        sectionIndex: 0,
        questionText: "Website URL",
        questionType: "TEXT",
        isRequired: false,
        order: 3,
        maxPoints: 0
      },
      {
        sectionIndex: 0,
        questionText: "SPOC Contact Name",
        questionType: "TEXT",
        isRequired: true,
        order: 4,
        maxPoints: 0
      },
      {
        sectionIndex: 0,
        questionText: "SPOC Email",
        questionType: "TEXT",
        isRequired: true,
        order: 5,
        maxPoints: 0
      },
      {
        sectionIndex: 0,
        questionText: "SPOC Phone Number",
        questionType: "TEXT",
        isRequired: true,
        order: 6,
        maxPoints: 0
      },
      {
        sectionIndex: 0,
        questionText: "Type of Third Party",
        questionType: "SINGLE_CHOICE",
        isRequired: true,
        order: 7,
        maxPoints: 2,
        options: {
          choices: [
            { value: "Cybersecurity / IT Services", label: "Cybersecurity / IT Services", riskScore: 2 },
            { value: "Banking / Fintech", label: "Banking / Fintech", riskScore: 3 },
            { value: "Healthcare / Healthtech", label: "Healthcare / Healthtech", riskScore: 3 },
            { value: "Retail / E-commerce", label: "Retail / E-commerce", riskScore: 2 },
            { value: "Manufacturing / IoT / Industrial", label: "Manufacturing / IoT / Industrial", riskScore: 2 },
            { value: "Telecom / Cloud / SaaS", label: "Telecom / Cloud / SaaS", riskScore: 2 },
            { value: "Professional Services / BPO", label: "Professional Services / BPO", riskScore: 1 },
            { value: "Government / Regulated Sector", label: "Government / Regulated Sector", riskScore: 3 },
            { value: "General Services", label: "General Services", riskScore: 1 },
            { value: "Other", label: "Other", riskScore: 2 }
          ]
        }
      },
      {
        sectionIndex: 0,
        questionText: "Nature of the Third Party",
        questionType: "SINGLE_CHOICE",
        isRequired: true,
        order: 8,
        maxPoints: 2,
        options: {
          choices: [
            { value: "Established / Reputed", label: "Established / Reputed", riskScore: 1 },
            { value: "New / Niche", label: "New / Niche", riskScore: 2 },
            { value: "Other", label: "Other", riskScore: 2 }
          ]
        }
      },
      {
        sectionIndex: 0,
        questionText: "Data Hosting Arrangement",
        questionType: "MULTIPLE_CHOICE",
        isRequired: true,
        order: 9,
        maxPoints: 3,
        options: {
          choices: [
            { value: "On-Prem", label: "On-Premises", riskScore: 1 },
            { value: "Cloud - IaaS", label: "Cloud - Infrastructure as a Service", riskScore: 2 },
            { value: "Cloud - PaaS", label: "Cloud - Platform as a Service", riskScore: 2 },
            { value: "Cloud - SaaS", label: "Cloud - Software as a Service", riskScore: 3 }
          ]
        }
      },

      // Section 2: Nature of Engagement
      {
        sectionIndex: 1,
        questionText: "Description of Services",
        questionType: "TEXT",
        isRequired: true,
        order: 1,
        maxPoints: 0
      },
      {
        sectionIndex: 1,
        questionText: "Expected Start Date",
        questionType: "DATE",
        isRequired: true,
        order: 2,
        maxPoints: 0
      },
      {
        sectionIndex: 1,
        questionText: "Contract Value (Approx.)",
        questionType: "NUMBER",
        isRequired: false,
        order: 3,
        maxPoints: 3,
        weightage: 1.5,
        options: {
          riskScoring: [
            { min: 0, max: 25000, riskScore: 1 },
            { min: 25001, max: 100000, riskScore: 2 },
            { min: 100001, max: 999999999, riskScore: 3 }
          ]
        }
      },
      {
        sectionIndex: 1,
        questionText: "Contract Type",
        questionType: "SINGLE_CHOICE",
        isRequired: true,
        order: 4,
        maxPoints: 2,
        options: {
          choices: [
            { value: "POC", label: "Proof of Concept", riskScore: 1 },
            { value: "POV", label: "Proof of Value", riskScore: 1 },
            { value: "Pilot", label: "Pilot", riskScore: 1 },
            { value: "Full Contract", label: "Full Contract", riskScore: 2 },
            { value: "Renewal", label: "Renewal", riskScore: 1 }
          ]
        }
      },
      {
        sectionIndex: 1,
        questionText: "Contract Duration",
        questionType: "SINGLE_CHOICE",
        isRequired: true,
        order: 5,
        maxPoints: 2,
        options: {
          choices: [
            { value: "<6 months", label: "Less than 6 months", riskScore: 1 },
            { value: "6-12 months", label: "6-12 months", riskScore: 1 },
            { value: ">12 months", label: "More than 12 months", riskScore: 2 }
          ]
        }
      },
      {
        sectionIndex: 1,
        questionText: "Renewal of Existing Third Party",
        questionType: "BOOLEAN",
        isRequired: true,
        order: 6,
        maxPoints: 1,
        options: {
          choices: [
            { value: "Yes", label: "Yes", riskScore: 1 },
            { value: "No", label: "No", riskScore: 2 }
          ]
        }
      },
      {
        sectionIndex: 1,
        questionText: "Third Party ID",
        questionType: "TEXT",
        isRequired: false,
        order: 7,
        maxPoints: 0
      },
      {
        sectionIndex: 1,
        questionText: "Fourth Party Involved?",
        questionType: "BOOLEAN",
        isRequired: true,
        order: 8,
        maxPoints: 2,
        weightage: 1.5,
        options: {
          choices: [
            { value: "Yes", label: "Yes", riskScore: 2 },
            { value: "No", label: "No", riskScore: 1 }
          ]
        }
      },
      {
        sectionIndex: 1,
        questionText: "Fourth Party Legal Name & Nature of Services",
        questionType: "TEXT",
        isRequired: false,
        order: 9,
        maxPoints: 0
      },

      // Section 3: Data & System Access
      {
        sectionIndex: 2,
        questionText: "Types of Data to be Accessed/Processed",
        questionType: "MULTIPLE_CHOICE",
        isRequired: true,
        order: 1,
        maxPoints: 3,
        weightage: 3.0, // Highest weightage for data sensitivity
        options: {
          choices: [
            { value: "Personal", label: "Personal Data", riskScore: 2 },
            { value: "Financial", label: "Financial Data", riskScore: 2 },
            { value: "Sensitive Personal/Health", label: "Sensitive Personal/Health Data", riskScore: 3 },
            { value: "IP", label: "Intellectual Property", riskScore: 2 },
            { value: "None", label: "None", riskScore: 1 }
          ]
        }
      },
      {
        sectionIndex: 2,
        questionText: "Data Classification",
        questionType: "MULTIPLE_CHOICE",
        isRequired: false,
        order: 2,
        maxPoints: 3,
        options: {
          choices: [
            { value: "Confidential", label: "Confidential", riskScore: 3 },
            { value: "Internal", label: "Internal", riskScore: 2 },
            { value: "Private", label: "Private", riskScore: 2 },
            { value: "Public", label: "Public", riskScore: 1 },
            { value: "None", label: "None", riskScore: 1 }
          ]
        }
      },
      {
        sectionIndex: 2,
        questionText: "Types of Personal Data Involved",
        questionType: "MULTIPLE_CHOICE",
        isRequired: false,
        order: 3,
        maxPoints: 2,
        options: {
          choices: [
            { value: "Customer", label: "Customer Data", riskScore: 2 },
            { value: "Employee", label: "Employee Data", riskScore: 2 },
            { value: "Company Data", label: "Company Data", riskScore: 1 }
          ]
        }
      },
      {
        sectionIndex: 2,
        questionText: "General Volume of Data Accessed or Processed",
        questionType: "SINGLE_CHOICE",
        isRequired: false,
        order: 4,
        maxPoints: 3,
        weightage: 2.0,
        options: {
          choices: [
            { value: "None", label: "None", riskScore: 1 },
            { value: "<1,000", label: "Less than 1,000", riskScore: 1 },
            { value: "1k-10k", label: "1,000 - 10,000", riskScore: 1 },
            { value: "10k-100k", label: "10,000 - 100,000", riskScore: 2 },
            { value: "100k-1M", label: "100,000 - 1 Million", riskScore: 3 },
            { value: ">1M", label: "More than 1 Million", riskScore: 3 },
            { value: "Unknown", label: "Unknown", riskScore: 2 }
          ]
        }
      },
      {
        sectionIndex: 2,
        questionText: "Volume of Personal Data Records (PII)",
        questionType: "SINGLE_CHOICE",
        isRequired: false,
        order: 5,
        maxPoints: 3,
        options: {
          choices: [
            { value: "None", label: "None", riskScore: 1 },
            { value: "<10", label: "Less than 10", riskScore: 1 },
            { value: "10-100", label: "10 - 100", riskScore: 1 },
            { value: "100-500", label: "100 - 500", riskScore: 2 },
            { value: ">500", label: "More than 500", riskScore: 3 },
            { value: "Unknown", label: "Unknown", riskScore: 2 }
          ]
        }
      },
      {
        sectionIndex: 2,
        questionText: "Client System Access Required?",
        questionType: "BOOLEAN",
        isRequired: true,
        order: 6,
        maxPoints: 3,
        weightage: 2.5,
        options: {
          choices: [
            { value: "Yes", label: "Yes", riskScore: 3 },
            { value: "No", label: "No", riskScore: 1 }
          ]
        }
      },
      {
        sectionIndex: 2,
        questionText: "Type of System Access",
        questionType: "TEXT",
        isRequired: false,
        order: 7,
        maxPoints: 0
      },

      // Section 4: Risk Considerations
      {
        sectionIndex: 3,
        questionText: "Cross-border Data Transfer Involved?",
        questionType: "BOOLEAN",
        isRequired: true,
        order: 1,
        maxPoints: 2,
        weightage: 1.5,
        options: {
          choices: [
            { value: "Yes", label: "Yes", riskScore: 2 },
            { value: "No", label: "No", riskScore: 1 }
          ]
        }
      },
      {
        sectionIndex: 3,
        questionText: "List Countries (Cross-border)",
        questionType: "TEXT",
        isRequired: false,
        order: 2,
        maxPoints: 0
      },
      {
        sectionIndex: 3,
        questionText: "Data Hosting/Processing Country",
        questionType: "TEXT",
        isRequired: false,
        order: 3,
        maxPoints: 0
      },
      {
        sectionIndex: 3,
        questionText: "Known Risks (Operational, Reputational, Breaches)",
        questionType: "BOOLEAN",
        isRequired: true,
        order: 4,
        maxPoints: 3,
        weightage: 2.0,
        options: {
          choices: [
            { value: "Yes", label: "Yes", riskScore: 3 },
            { value: "No", label: "No", riskScore: 1 }
          ]
        }
      },
      {
        sectionIndex: 3,
        questionText: "Describe Known Risks",
        questionType: "TEXT",
        isRequired: false,
        order: 5,
        maxPoints: 0
      },
      {
        sectionIndex: 3,
        questionText: "Would a sudden and unexpected loss of this vendor cause a material disruption to your organization?",
        questionType: "BOOLEAN",
        isRequired: true,
        order: 6,
        maxPoints: 3,
        weightage: 2.5, // High weightage for business criticality
        options: {
          choices: [
            { value: "Yes", label: "Yes", riskScore: 3 },
            { value: "No", label: "No", riskScore: 1 }
          ]
        }
      },
      {
        sectionIndex: 3,
        questionText: "Would that loss impact your organization's customers?",
        questionType: "BOOLEAN",
        isRequired: true,
        order: 7,
        maxPoints: 3,
        options: {
          choices: [
            { value: "Yes", label: "Yes", riskScore: 3 },
            { value: "No", label: "No", riskScore: 1 }
          ]
        }
      },
      {
        sectionIndex: 3,
        questionText: "How difficult will it be to replace this service with an alternative?",
        questionType: "SINGLE_CHOICE",
        isRequired: true,
        order: 8,
        maxPoints: 2,
        options: {
          choices: [
            { value: "Easy", label: "Easy", riskScore: 1 },
            { value: "Difficult", label: "Difficult", riskScore: 2 }
          ]
        }
      },
      {
        sectionIndex: 3,
        questionText: "Expected Annual Volume of Business-Critical Records",
        questionType: "SINGLE_CHOICE",
        isRequired: true,
        order: 9,
        maxPoints: 3,
        options: {
          choices: [
            { value: "<10,000", label: "Less than 10,000", riskScore: 1 },
            { value: "10,000-50,000", label: "10,000 - 50,000", riskScore: 2 },
            { value: ">50,000", label: "More than 50,000", riskScore: 3 }
          ]
        }
      },
      {
        sectionIndex: 3,
        questionText: "Access to IT Network/Infrastructure?",
        questionType: "BOOLEAN",
        isRequired: true,
        order: 10,
        maxPoints: 3,
        weightage: 2.0,
        options: {
          choices: [
            { value: "Yes", label: "Yes", riskScore: 3 },
            { value: "No", label: "No", riskScore: 1 }
          ]
        }
      },
      {
        sectionIndex: 3,
        questionText: "Is service performed domestically?",
        questionType: "BOOLEAN",
        isRequired: true,
        order: 11,
        maxPoints: 2,
        options: {
          choices: [
            { value: "Yes", label: "Yes", riskScore: 1 },
            { value: "No", label: "No", riskScore: 2 }
          ]
        }
      },
      {
        sectionIndex: 3,
        questionText: "Describe International Service",
        questionType: "TEXT",
        isRequired: false,
        order: 12,
        maxPoints: 0
      },

      // Section 5: Compliance & Security
      {
        sectionIndex: 4,
        questionText: "Frameworks/Regulations Applicable to This Engagement",
        questionType: "MULTIPLE_CHOICE",
        isRequired: true,
        order: 1,
        maxPoints: 3,
        weightage: 1.5,
        options: {
          choices: [
            { value: "GDPR", label: "GDPR", riskScore: 2 },
            { value: "HIPAA", label: "HIPAA", riskScore: 3 },
            { value: "ISO 27001", label: "ISO 27001", riskScore: 1 },
            { value: "SOC 2", label: "SOC 2", riskScore: 1 },
            { value: "PCI DSS", label: "PCI DSS", riskScore: 2 },
            { value: "NIS 2", label: "NIS 2", riskScore: 2 },
            { value: "Other", label: "Other", riskScore: 2 },
            { value: "None", label: "None", riskScore: 3 }
          ]
        }
      },
      {
        sectionIndex: 4,
        questionText: "Vendor Compliant/Certified with Any Frameworks?",
        questionType: "MULTIPLE_CHOICE",
        isRequired: false,
        order: 2,
        maxPoints: 3,
        weightage: 2.0, // This reduces risk (control effectiveness)
        options: {
          choices: [
            { value: "ISO 27001", label: "ISO 27001", controlScore: 3 },
            { value: "SOC 2", label: "SOC 2", controlScore: 2 },
            { value: "HIPAA", label: "HIPAA", controlScore: 3 },
            { value: "GDPR", label: "GDPR Compliant", controlScore: 2 },
            { value: "PCI DSS", label: "PCI DSS", controlScore: 3 },
            { value: "None", label: "None", controlScore: 1 }
          ]
        }
      },

      // Section 6: Reputational & Sanctions Screening
      {
        sectionIndex: 5,
        questionText: "Is the third party located in or affiliated with a sanctioned or high-risk country?",
        questionType: "BOOLEAN",
        isRequired: true,
        order: 1,
        maxPoints: 3,
        weightage: 3.0, // Very high risk
        options: {
          choices: [
            { value: "Yes", label: "Yes", riskScore: 3 },
            { value: "No", label: "No", riskScore: 1 }
          ]
        }
      },
      {
        sectionIndex: 5,
        questionText: "Is the third party listed on any international sanctions lists (e.g., OFAC, EU, UN, FATF)?",
        questionType: "BOOLEAN",
        isRequired: true,
        order: 2,
        maxPoints: 3,
        weightage: 3.0,
        options: {
          choices: [
            { value: "Yes", label: "Yes", riskScore: 3 },
            { value: "No", label: "No", riskScore: 1 }
          ]
        }
      },
      {
        sectionIndex: 5,
        questionText: "Is the third party involved in any litigation, regulatory action, or adverse media that could harm your organization's reputation?",
        questionType: "BOOLEAN",
        isRequired: true,
        order: 3,
        maxPoints: 3,
        weightage: 2.0,
        options: {
          choices: [
            { value: "Yes", label: "Yes", riskScore: 3 },
            { value: "No", label: "No", riskScore: 1 }
          ]
        }
      },

      // Section 7: Supporting Documentation & Assessment Opt-Out
      {
        sectionIndex: 6,
        questionText: "Upload Supporting Documents",
        questionType: "TEXT",
        isRequired: false,
        order: 1,
        maxPoints: 0
      },
      {
        sectionIndex: 6,
        questionText: "Additional Comments or Context",
        questionType: "TEXT",
        isRequired: false,
        order: 2,
        maxPoints: 0
      },
      {
        sectionIndex: 6,
        questionText: "Expected timeline to complete the assessment",
        questionType: "DATE",
        isRequired: true,
        order: 3,
        maxPoints: 0
      },
      {
        sectionIndex: 6,
        questionText: "Due Diligence exception form",
        questionType: "BOOLEAN",
        isRequired: true,
        order: 4,
        maxPoints: 0,
        options: {
          choices: [
            { value: "Yes", label: "Yes, I opt for exception form" },
            { value: "No", label: "No, proceed with assessment" }
          ]
        }
      }
    ]

    // Create questions
    let totalQuestions = 0
    for (const questionData of questionsData) {
      const question = await prisma.rifQuestion.create({
        data: {
          formId: rifForm.id,
          sectionId: sections[questionData.sectionIndex].id,
          questionText: questionData.questionText,
          questionType: questionData.questionType as any, // Cast to RifQuestionType if enum is imported, e.g. as RifQuestionType
          options: questionData.options ?? undefined,
          maxPoints: questionData.maxPoints,
          weightage: questionData.weightage || 1.0,
          isRequired: questionData.isRequired,
          order: questionData.order
        }
      })
      totalQuestions++
      console.log(`✅ Created Question ${totalQuestions}: ${questionData.questionText}`)
    }

    console.log(`\n🎉 Successfully seeded RIF Form with:`)
    console.log(`   - 1 Form: ${rifForm.title}`)
    console.log(`   - 7 Sections`)
    console.log(`   - ${totalQuestions} Questions`)
    console.log(`\n📊 Risk Scoring Features:`)
    console.log(`   - Inherent Risk Calculation`)
    console.log(`   - Control Effectiveness Scoring`)
    console.log(`   - Weighted Section Scoring`)
    console.log(`   - NIST-Aligned Risk Assessment`)

  } catch (error) {
    console.error('❌ Error seeding RIF form:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
seedRifForm()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })