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

    // Create Sections with conditional logic
    const sections = []
    
    const sectionData = [
      { 
        title: "Third Party Information", 
        order: 1, 
        isRequired: true 
      },
      { 
        title: "Nature of Engagement", 
        order: 2, 
        isRequired: true 
      },
      { 
        title: "Data & System Access", 
        order: 3, 
        isRequired: true 
      },
      { 
        title: "Risk Considerations", 
        order: 4, 
        isRequired: true 
      },
      { 
        title: "Compliance & Security", 
        order: 5, 
        isRequired: true 
      },
      { 
        title: "Reputational & Sanctions Screening", 
        order: 6, 
        isRequired: false,
        conditionalLogic: {
          showIf: {
            operator: "OR",
            conditions: [
              {
                questionKey: "country_operations",
                operator: "IN",
                values: ["Russia", "Iran", "North Korea", "Syria", "Belarus"]
              },
              {
                operator: "AND",
                conditions: [
                  {
                    questionKey: "types_of_data",
                    operator: "INCLUDES_ANY",
                    values: ["Sensitive Personal/Health", "Financial"]
                  },
                  {
                    questionKey: "data_volume",
                    operator: "IN",
                    values: ["100k-1M", ">1M"]
                  }
                ]
              },
              {
                questionKey: "system_access_required",
                operator: "EQUALS",
                value: "Yes"
              },
              {
                questionKey: "fourth_party_involved",
                operator: "EQUALS",
                value: "Yes"
              }
            ]
          }
        }
      },
      { 
        title: "Supporting Documentation & Assessment Opt-Out", 
        order: 7, 
        isRequired: true 
      }
    ]

    for (const section of sectionData) {
      const createdSection = await prisma.rifSection.create({
        data: {
          formId: rifForm.id,
          title: section.title,
          order: section.order,
          isRequired: section.isRequired,
          conditionalLogic: section.conditionalLogic ?? undefined
        }
      })
      sections.push(createdSection)
      console.log(`✅ Created Section ${section.order}: ${section.title}`)
    }

    // Questions Data with conditional logic and question keys
    const questionsData = [
      // Section 1: Third Party Information
      {
        sectionIndex: 0,
        questionText: "Third Party Legal Name",
        questionType: "TEXT",
        isRequired: true,
        order: 1,
        maxPoints: 0,
        questionKey: "third_party_name"
      },
      {
        sectionIndex: 0,
        questionText: "Country of Operations",
        questionType: "SINGLE_CHOICE",
        isRequired: true,
        order: 2,
        maxPoints: 3,
        weightage: 1.0,
        questionKey: "country_operations",
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
            { value: "North Korea", label: "North Korea", riskScore: 3 },
            { value: "Syria", label: "Syria", riskScore: 3 },
            { value: "Belarus", label: "Belarus", riskScore: 3 }
          ]
        }
      },
      {
        sectionIndex: 0,
        questionText: "Website URL",
        questionType: "TEXT",
        isRequired: false,
        order: 3,
        maxPoints: 0,
        questionKey: "website_url"
      },
      {
        sectionIndex: 0,
        questionText: "SPOC Contact Name",
        questionType: "TEXT",
        isRequired: true,
        order: 4,
        maxPoints: 0,
        questionKey: "spoc_name"
      },
      {
        sectionIndex: 0,
        questionText: "SPOC Email",
        questionType: "TEXT",
        isRequired: true,
        order: 5,
        maxPoints: 0,
        questionKey: "spoc_email"
      },
      {
        sectionIndex: 0,
        questionText: "SPOC Phone Number",
        questionType: "TEXT",
        isRequired: true,
        order: 6,
        maxPoints: 0,
        questionKey: "spoc_phone"
      },
      // Replace the existing "Type of Third Party" question (around line 160) with this:

{
  sectionIndex: 0,
  questionText: "Type of Third Party",
  questionType: "SINGLE_CHOICE",
  isRequired: true,
  order: 7,
  maxPoints: 2,
  questionKey: "third_party_type",
  options: {
    choices: [
      { 
        value: "Cybersecurity / IT Services", 
        label: "Cybersecurity / IT Services", 
        riskScore: 2,
        subcategories: [
          "Managed Security Service Provider (MSSP)",
          "IT Services / ITES", 
          "Penetration Testing / VAPT Firm",
          "Security Product Vendor (SIEM, DLP, etc.)",
          "Threat Intelligence Provider",
          "SOC-as-a-Service Vendor",
          "Cloud Security Service Provider"
        ]
      },
      { 
        value: "Banking / Fintech", 
        label: "Banking / Fintech", 
        riskScore: 3,
        subcategories: [
          "Core Banking Software Vendor",
          "Digital Lending Platform", 
          "KYC/AML Solution Provider",
          "Payment Gateway / Processor",
          "Credit Scoring / Risk Rating Agency",
          "Regulatory Reporting Vendor",
          "Financial API Aggregator"
        ]
      },
      { 
        value: "Healthcare / Healthtech", 
        label: "Healthcare / Healthtech", 
        riskScore: 3,
        subcategories: [
          "Electronic Health Record (EHR) Vendor",
          "Revenue Cycle Management (RCM) Partner",
          "Telemedicine Platform",
          "Medical Billing & Coding Vendor", 
          "HIPAA-Compliant Cloud Provider",
          "Claims Processing Vendor",
          "Health Information Exchange (HIE)"
        ]
      },
      { 
        value: "Retail / E-commerce", 
        label: "Retail / E-commerce", 
        riskScore: 2,
        subcategories: [
          "POS System Provider",
          "Loyalty Program Vendor",
          "Digital Marketing Agency",
          "Customer Analytics Service",
          "Fulfillment / Logistics Partner", 
          "Payment Processing Vendor"
        ]
      },
      { 
        value: "Manufacturing / IoT / Industrial", 
        label: "Manufacturing / IoT / Industrial", 
        riskScore: 2,
        subcategories: [
          "SCADA / ICS Vendor",
          "IoT Device Manufacturer",
          "Industrial Automation Provider",
          "Robotics Vendor",
          "Predictive Maintenance Service",
          "Product Lifecycle Management (PLM) Vendor"
        ]
      },
      { 
        value: "Telecom / Cloud / SaaS", 
        label: "Telecom / Cloud / SaaS", 
        riskScore: 2,
        subcategories: [
          "Cloud Hosting Provider (AWS, Azure, GCP)",
          "Telco Infrastructure Provider",
          "SaaS Collaboration Tool (Zoom, Slack, etc.)",
          "CDN Provider",
          "Data Center Operator",
          "Email Security Vendor"
        ]
      },
      { 
        value: "Professional Services / BPO", 
        label: "Professional Services / BPO", 
        riskScore: 1,
        subcategories: [
          "Business Process Outsourcing (BPO) Vendor",
          "Legal / Contractual Advisory Firm",
          "Compliance Consulting Partner",
          "HR / Payroll Processing Vendor",
          "Background Verification Agency",
          "Audit & Assurance Firm"
        ]
      },
      { 
        value: "Government / Regulated Sector", 
        label: "Government / Regulated Sector", 
        riskScore: 3,
        subcategories: [
          "Regulatory Reporting / Audit Partner",
          "Digital Identity & e-KYC Provider",
          "Government-Sourced Vendor",
          "Public Cloud with Sovereignty Clause"
        ]
      },
      { 
        value: "General Services", 
        label: "General Services", 
        riskScore: 1,
        subcategories: [
          "Managed Services Provider (MSP)",
          "Professional Services",
          "Legal Advisory Services",
          "Logistics / Courier Services",
          "Training / Awareness Program Vendor",
          "Insurance Provider",
          "Staffing / Recruitment Agency",
          "Facility Management / AMC Vendor",
          "Software Development Partner"
        ]
      },
      { 
        value: "Other", 
        label: "Other", 
        riskScore: 2 
      }
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
        questionKey: "third_party_nature",
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
        questionKey: "data_hosting",
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
        maxPoints: 0,
        questionKey: "service_description"
      },
      {
        sectionIndex: 1,
        questionText: "Expected Start Date",
        questionType: "DATE",
        isRequired: true,
        order: 2,
        maxPoints: 0,
        questionKey: "start_date"
      },
      {
        sectionIndex: 1,
        questionText: "Contract Value (Approx.)",
        questionType: "NUMBER",
        isRequired: false,
        order: 3,
        maxPoints: 3,
        weightage: 1.5,
        questionKey: "contract_value",
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
        questionKey: "contract_type",
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
        questionKey: "contract_duration",
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
        questionKey: "renewal_existing_third_party",
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
        maxPoints: 0,
        questionKey: "third_party_id",
        conditionalLogic: {
          showIf: {
            questionKey: "renewal_existing_third_party",
            operator: "EQUALS",
            value: "Yes"
          }
        }
      },
      {
        sectionIndex: 1,
        questionText: "Fourth Party Involved?",
        questionType: "BOOLEAN",
        isRequired: true,
        order: 8,
        maxPoints: 2,
        weightage: 1.5,
        questionKey: "fourth_party_involved",
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
        maxPoints: 0,
        questionKey: "fourth_party_details",
        conditionalLogic: {
          showIf: {
            questionKey: "fourth_party_involved",
            operator: "EQUALS",
            value: "Yes"
          }
        }
      },

      // Section 3: Data & System Access
      {
        sectionIndex: 2,
        questionText: "Types of Data to be Accessed/Processed",
        questionType: "MULTIPLE_CHOICE",
        isRequired: true,
        order: 1,
        maxPoints: 3,
        weightage: 3.0,
        questionKey: "types_of_data",
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
        questionKey: "data_classification",
        conditionalLogic: {
          hideIf: {
            questionKey: "types_of_data",
            operator: "INCLUDES",
            value: "None"
          }
        },
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
        questionKey: "personal_data_types",
        conditionalLogic: {
          showIf: {
            questionKey: "types_of_data",
            operator: "INCLUDES_ANY",
            values: ["Personal", "Sensitive Personal/Health"]
          }
        },
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
        questionKey: "data_volume",
        conditionalLogic: {
          hideIf: {
            questionKey: "types_of_data",
            operator: "INCLUDES",
            value: "None"
          }
        },
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
        questionKey: "pii_volume",
        conditionalLogic: {
          showIf: {
            questionKey: "types_of_data",
            operator: "INCLUDES_ANY",
            values: ["Personal", "Sensitive Personal/Health"]
          }
        },
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
        questionKey: "system_access_required",
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
        maxPoints: 0,
        questionKey: "system_access_type",
        conditionalLogic: {
          showIf: {
            questionKey: "system_access_required",
            operator: "EQUALS",
            value: "Yes"
          }
        }
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
        questionKey: "cross_border_transfer",
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
        maxPoints: 0,
        questionKey: "cross_border_countries",
        conditionalLogic: {
          showIf: {
            questionKey: "cross_border_transfer",
            operator: "EQUALS",
            value: "Yes"
          }
        }
      },
      {
        sectionIndex: 3,
        questionText: "Data Hosting/Processing Country",
        questionType: "TEXT",
        isRequired: false,
        order: 3,
        maxPoints: 0,
        questionKey: "hosting_country",
        conditionalLogic: {
          showIf: {
            questionKey: "cross_border_transfer",
            operator: "EQUALS",
            value: "Yes"
          }
        }
      },
      {
        sectionIndex: 3,
        questionText: "Known Risks (Operational, Reputational, Breaches)",
        questionType: "BOOLEAN",
        isRequired: true,
        order: 4,
        maxPoints: 3,
        weightage: 2.0,
        questionKey: "known_risks",
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
        maxPoints: 0,
        questionKey: "describe_known_risks",
        conditionalLogic: {
          showIf: {
            questionKey: "known_risks",
            operator: "EQUALS",
            value: "Yes"
          }
        }
      },
      {
        sectionIndex: 3,
        questionText: "Would a sudden and unexpected loss of this vendor cause a material disruption to your organization?",
        questionType: "BOOLEAN",
        isRequired: true,
        order: 6,
        maxPoints: 3,
        weightage: 2.5,
        questionKey: "material_disruption",
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
        questionKey: "customer_impact",
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
        questionKey: "replacement_difficulty",
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
        questionKey: "critical_records_volume",
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
        questionKey: "network_access",
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
        questionKey: "domestic_service",
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
        maxPoints: 0,
        questionKey: "international_service_desc",
        conditionalLogic: {
          showIf: {
            questionKey: "domestic_service",
            operator: "EQUALS",
            value: "No"
          }
        }
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
        questionKey: "applicable_frameworks",
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
        weightage: 2.0,
        questionKey: "vendor_certifications",
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

      // Section 6: Reputational & Sanctions Screening (Conditional Section)
      {
        sectionIndex: 5,
        questionText: "Is the third party located in or affiliated with a sanctioned or high-risk country?",
        questionType: "BOOLEAN",
        isRequired: true,
        order: 1,
        maxPoints: 3,
        weightage: 3.0,
        questionKey: "sanctioned_country",
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
        questionKey: "sanctions_list",
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
        questionKey: "reputational_risks",
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
        maxPoints: 0,
        questionKey: "supporting_docs"
      },
      {
        sectionIndex: 6,
        questionText: "Additional Comments or Context",
        questionType: "TEXT",
        isRequired: false,
        order: 2,
        maxPoints: 0,
        questionKey: "additional_comments"
      },
      {
        sectionIndex: 6,
        questionText: "Expected timeline to complete the assessment",
        questionType: "DATE",
        isRequired: true,
        order: 3,
        maxPoints: 0,
        questionKey: "completion_timeline"
      },
      {
        sectionIndex: 6,
        questionText: "Due Diligence exception form",
        questionType: "BOOLEAN",
        isRequired: true,
        order: 4,
        maxPoints: 0,
        questionKey: "exception_form",
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
          questionType: questionData.questionType as any,
          options: questionData.options ?? undefined,
          maxPoints: questionData.maxPoints,
          weightage: questionData.weightage || 1.0,
          isRequired: questionData.isRequired,
          order: questionData.order,
          questionKey: questionData.questionKey,
          conditionalLogic: questionData.conditionalLogic ?? undefined
        }
      })
      totalQuestions++
      console.log(`✅ Created Question ${totalQuestions}: ${questionData.questionText}`)
    }

    console.log(`\n🎉 Successfully seeded RIF Form with:`)
    console.log(`   - 1 Form: ${rifForm.title}`)
    console.log(`   - 7 Sections (1 conditional)`)
    console.log(`   - ${totalQuestions} Questions (${questionsData.filter(q => q.conditionalLogic).length} conditional)`)
    console.log(`\n📊 Conditional Logic Features:`)
    console.log(`   - Section 6: Conditional based on risk factors`)
    console.log(`   - Questions with showIf/hideIf logic`)
    console.log(`   - Question keys for referencing`)
    console.log(`   - Progressive disclosure support`)

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