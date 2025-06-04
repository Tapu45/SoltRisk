import { prisma } from '../lib/prisma'
import { RiskLevel, QuestionType } from '../generated/prisma'


async function main() {
    console.log('🌱 Starting questionnaire seed...')

    // Create Questionnaire Templates
    const lowRiskTemplate = await prisma.questionnaireTemplate.create({
        data: {
            name: 'Low Risk Vendor Assessment',
            description: 'For vendors with minimal data/system access and low business impact',
            riskLevel: RiskLevel.LOW,
            templateType: 'STANDARD',
            version: '1.0',
            isActive: true,
            totalQuestions: 19,
            estimatedTime: 45
        }
    })

    const mediumRiskTemplate = await prisma.questionnaireTemplate.create({
        data: {
            name: 'Medium Risk Vendor Assessment',
            description: 'For vendors with moderate data/system access and business impact',
            riskLevel: RiskLevel.MEDIUM,
            templateType: 'ENHANCED',
            version: '1.0',
            isActive: true,
            totalQuestions: 31,
            estimatedTime: 90
        }
    })

    const highRiskTemplate = await prisma.questionnaireTemplate.create({
        data: {
            name: 'High Risk Vendor Assessment',
            description: 'For vendors with extensive data/system access and critical business impact',
            riskLevel: RiskLevel.HIGH,
            templateType: 'COMPREHENSIVE',
            version: '1.0',
            isActive: true,
            totalQuestions: 44,
            estimatedTime: 180
        }
    })

    // LOW RISK QUESTIONNAIRE SECTIONS
    const lowRiskSections = [
        { title: 'Governance & Organization', order: 1, weightage: 1.0 },
        { title: 'Security Policies & Training', order: 2, weightage: 1.2 },
        { title: 'Technical Controls', order: 3, weightage: 1.5 },
        { title: 'Risk Management', order: 4, weightage: 1.3 },
        { title: 'Third Party Management', order: 5, weightage: 1.0 }
    ]

    const createdLowSections = []
    for (const section of lowRiskSections) {
        const createdSection = await prisma.questionnaireSection.create({
            data: {
                templateId: lowRiskTemplate.id,
                ...section
            }
        })
        createdLowSections.push(createdSection)
    }

    // LOW RISK QUESTIONS (Updated - Removed unnecessary fields)
    const lowRiskQuestions = [
        // Section 1: Governance & Organization
        {
            sectionIndex: 0,
            questionText: 'Do you have a formal organizational structure with defined roles and responsibilities?',
            description: 'Briefly confirm and optionally upload an org chart or describe reporting lines.',
            questionType: QuestionType.BOOLEAN,
            options: { choices: [{ value: 'Yes' }, { value: 'No' }] },
            isRequired: true,
            evidenceRequired: false,
            order: 1,
            category: 'Governance'
        },
        {
            sectionIndex: 0,
            questionText: 'Who is responsible for cybersecurity within your organization?',
            description: 'Provide the name, title, and contact of the person overseeing cybersecurity (e.g., CISO, IT Head).',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 2,
            category: 'Governance'
        },
        {
            sectionIndex: 0,
            questionText: 'Do you outsource any IT or IT security functions to other service providers?',
            description: 'State Yes/No. If Yes, name the providers and describe the type of services and access they have.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please name the providers and describe the type of services and access they have:'
                }
            },
            isRequired: true,
            evidenceRequired: false,
            order: 3,
            category: 'Third Party'
        },

        // Section 2: Security Policies & Training
        {
            sectionIndex: 1,
            questionText: 'Do you have documented information security policies in place?',
            description: 'Answer Yes/No. If Yes, list policy names (e.g., Acceptable Use, Access Control).',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please list your policy names (e.g., Acceptable Use, Access Control):'
                }
            },
            isRequired: true,
            evidenceRequired: true,
            order: 1,
            category: 'Policy'
        },
        {
            sectionIndex: 1,
            questionText: 'How frequently are employees trained on IT security policies?',
            description: 'Provide frequency (e.g., annually) and confirm if it\'s automated or instructor-led.',
            questionType: QuestionType.SINGLE_CHOICE,
            options: {
                choices: [
                    { value: 'Quarterly or more frequent' },
                    { value: 'Annually' },
                    { value: 'Every 2-3 years' },
                    { value: 'No formal training' }
                ]
            },
            isRequired: true,
            evidenceRequired: false,
            order: 2,
            category: 'Training'
        },
        {
            sectionIndex: 1,
            questionText: 'When was your last cybersecurity assessment by a third party?',
            description: 'Indicate the date and whether issues were found/resolved. Attach summary if available.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please specify the date, whether issues were found/resolved, and attach a summary if available:'
                }
            },
            isRequired: true,
            evidenceRequired: true,
            order: 3,
            category: 'Assessment'
        },

        // Section 3: Technical Controls
        {
            sectionIndex: 2,
            questionText: 'Do you use firewalls and antivirus/anti-malware software across systems?',
            description: 'Confirm Yes/No and mention if protection is kept up-to-date.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please mention if protection is kept up-to-date and describe the tools used (e.g., firewalls, antivirus software):'
                }
            },
            isRequired: true,
            evidenceRequired: false,
            order: 1,
            category: 'Technical'
        },
        {
            sectionIndex: 2,
            questionText: 'Are user accounts and access levels reviewed periodically?',
            description: 'Confirm if access control reviews are performed regularly (e.g., quarterly).',
            questionType: QuestionType.SINGLE_CHOICE,
            options: {
                choices: [
                    { value: 'Quarterly or more frequent' },
                    { value: 'Semi-annually' },
                    { value: 'Annually' },
                    { value: 'Never or ad-hoc' }
                ]
            },
            isRequired: true,
            evidenceRequired: false,
            order: 2,
            category: 'Access Control'
        },
        {
            sectionIndex: 2,
            questionText: 'How is remote access to your network managed and secured?',
            description: 'Explain if VPN, MFA, or other secure methods are in use for remote access.',
            questionType: QuestionType.MULTIPLE_CHOICE,
            options: {
                choices: [
                    { value: 'VPN with MFA' },
                    { value: 'VPN only' },
                    { value: 'Direct access with password' },
                    { value: 'No remote access' },
                    { value: 'Other secure method' }
                ]
            },
            isRequired: true,
            evidenceRequired: false,
            order: 3,
            category: 'Remote Access'
        },
        {
            sectionIndex: 2,
            questionText: 'Do you maintain logs for key systems and review them regularly?',
            description: 'Confirm Yes/No and mention tools (e.g., SIEM) if applicable.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please mention the tools you use (e.g., SIEM) and review frequency:'
                }
            },
            isRequired: true,
            evidenceRequired: false,
            order: 4,
            category: 'Monitoring'
        },
        {
            sectionIndex: 2,
            questionText: 'Are physical access controls in place at your office/data centers?',
            description: 'Describe basic measures such as locked access, security badges, and visitor logs.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please describe the physical access controls in place, such as locked access, security badges, and visitor logs:'
                }
            },
            isRequired: true,
            evidenceRequired: false,
            order: 5,
            category: 'Physical Security'
        },
        {
            sectionIndex: 2,
            questionText: 'Do you have a policy restricting the use of removable media (e.g., USBs)?',
            description: 'Confirm if usage is restricted or monitored and whether encryption is required.',
            questionType: QuestionType.BOOLEAN,
            options: { choices: [{ value: 'Yes' }, { value: 'No' }] },
            isRequired: true,
            evidenceRequired: false,
            order: 6,
            category: 'Data Protection'
        },

        // Section 4: Risk Management
        {
            sectionIndex: 3,
            questionText: 'Have you ever experienced a cybersecurity incident?',
            description: 'If Yes, provide a high-level summary of what happened and how it was resolved.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please provide a high-level summary of what happened and how it was resolved:'
                }
            },
            isRequired: true,
            evidenceRequired: false,
            order: 1,
            category: 'Incident Response'
        },
        {
            sectionIndex: 3,
            questionText: 'Do you have a business continuity or disaster recovery plan?',
            description: 'Confirm existence of BCP/DRP and whether it\'s been tested in the last 12 months.',
            questionType: QuestionType.BOOLEAN,
            options: { choices: [{ value: 'Yes' }, { value: 'No' }] },
            isRequired: true,
            evidenceRequired: false,
            order: 2,
            category: 'Business Continuity'
        },
        {
            sectionIndex: 3,
            questionText: 'Do you carry liability or cyber insurance?',
            description: 'Confirm insurance coverage and whether it includes cyber liability.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please confirm whether it includes cyber liability and provide coverage details:'
                }
            },
            isRequired: true,
            evidenceRequired: false,
            order: 3,
            category: 'Insurance'
        },
        {
            sectionIndex: 3,
            questionText: 'Do you regularly test your systems for vulnerabilities (e.g., scanning or pen testing)?',
            description: 'Confirm whether any tests are done and who performs them. Basic external scanning suffices.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please specify how frequently tests are done and who performs them (internal team, external vendor, etc.):'
                }
            },
            isRequired: true,
            evidenceRequired: false,
            order: 4,
            category: 'Vulnerability Management'
        },

        // Section 5: Third Party Management
        {
            sectionIndex: 4,
            questionText: 'Have you identified any subcontractors or third parties who access client data or systems?',
            description: 'Provide a list or state "Not Applicable" if no access is provided.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 1,
            category: 'Third Party Risk'
        },
        {
            sectionIndex: 4,
            questionText: 'Do you monitor your third-party service providers\' security practices?',
            description: 'Briefly explain how you ensure your vendors follow security practices (e.g., regular assessments).',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please explain how you ensure your vendors follow security practices (e.g., regular assessments):'
                }
            },
            isRequired: true,
            evidenceRequired: false,
            order: 2,
            category: 'Third Party Monitoring'
        },
        {
            sectionIndex: 4,
            questionText: 'How do you respond to cybersecurity incidents that may affect client data?',
            description: 'Describe how incidents are communicated to clients and within your organization.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 3,
            category: 'Incident Communication'
        }
    ]

    // Create Low Risk Questions
    for (const question of lowRiskQuestions) {
        const { sectionIndex, ...questionData } = question
        await prisma.questionnaireQuestion.create({
            data: {
                templateId: lowRiskTemplate.id,
                sectionId: createdLowSections[sectionIndex].id,
                ...questionData
            }
        })
    }

    // MEDIUM RISK QUESTIONNAIRE SECTIONS
    const mediumRiskSections = [
        { title: 'Governance & Security Program Management', order: 1, weightage: 1.2 },
        { title: 'Information Security Controls', order: 2, weightage: 1.5 },
        { title: 'Data Privacy & Confidentiality', order: 3, weightage: 1.8 },
        { title: 'Legal & Compliance', order: 4, weightage: 1.4 },
        { title: 'Business Continuity & Disaster Recovery', order: 5, weightage: 1.3 },
        { title: 'Network Security & Access Control', order: 6, weightage: 1.6 },
        { title: 'IT Infrastructure Management', order: 7, weightage: 1.3 },
        { title: 'Physical Security', order: 8, weightage: 1.0 },
        { title: 'Insurance & Risk Transfer', order: 9, weightage: 1.1 }
    ]

    const createdMediumSections = []
    for (const section of mediumRiskSections) {
        const createdSection = await prisma.questionnaireSection.create({
            data: {
                templateId: mediumRiskTemplate.id,
                ...section
            }
        })
        createdMediumSections.push(createdSection)
    }

    // MEDIUM RISK QUESTIONS (Updated with conditional logic)
    const mediumRiskQuestions = [
        // Section 1: Governance & Security Program Management
        {
            sectionIndex: 0,
            questionText: 'Who is responsible for cybersecurity within your organization?',
            description: 'Name, title, and contact of the cybersecurity lead (e.g., CISO, Security Officer).',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 1,
            category: 'Governance'
        },
        {
            sectionIndex: 0,
            questionText: 'Do you have a cross-functional committee that regularly meets to discuss cybersecurity risks?',
            description: 'Confirm Yes/No. If Yes, describe its purpose and frequency.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please describe its purpose and frequency:'
                }
            },
            isRequired: true,
            evidenceRequired: false,
            order: 2,
            category: 'Governance'
        },
        {
            sectionIndex: 0,
            questionText: 'Describe the experience and qualifications of your IT security team.',
            description: 'Share a summary of team certifications, skillsets, and experience.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 3,
            category: 'Team Qualifications'
        },
        {
            sectionIndex: 0,
            questionText: 'Do you outsource any IT or security functions?',
            description: 'List providers, services outsourced, and the type of system/data access granted.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 4,
            category: 'Third Party Services'
        },

        // Section 2: Information Security Controls
        {
            sectionIndex: 1,
            questionText: 'Do you have documented information security policies?',
            description: 'Confirm Yes/No. Mention major policies (e.g., Acceptable Use, Access Control).',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please mention major policies (e.g., Acceptable Use, Access Control):'
                }
            },
            isRequired: true,
            evidenceRequired: true,
            order: 1,
            category: 'Policy'
        },
        {
            sectionIndex: 1,
            questionText: 'Do you conduct annual third-party security assessments or audits?',
            description: 'Confirm Yes/No and attach or summarize findings from the latest assessment.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please attach or summarize findings from the latest assessment:'
                }
            },
            isRequired: true,
            evidenceRequired: true,
            order: 2,
            category: 'Third Party Assessment'
        },
        {
            sectionIndex: 1,
            questionText: 'What were the results of your most recent vulnerability scan or penetration test?',
            description: 'Provide the date, testing party, and key outcomes/remediation.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: true,
            order: 3,
            category: 'Vulnerability Testing'
        },
        {
            sectionIndex: 1,
            questionText: 'What controls are in place to prevent unauthorized access to your systems and network?',
            description: 'Describe use of firewalls, antivirus, endpoint protection, and DLP.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 4,
            category: 'Access Controls'
        },
        {
            sectionIndex: 1,
            questionText: 'How do you monitor internal and external threats?',
            description: 'List monitoring tools (e.g., SIEM, EDR) and alert management process.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 5,
            category: 'Threat Monitoring'
        },
        {
            sectionIndex: 1,
            questionText: 'Do you restrict the use of removable media (e.g., USBs)?',
            description: 'Confirm policy enforcement and technical controls in place.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please describe the policy enforcement and technical controls in place:'
                }
            },
            isRequired: true,
            evidenceRequired: false,
            order: 6,
            category: 'Media Controls'
        },

        // Section 3: Data Privacy & Confidentiality
        {
            sectionIndex: 2,
            questionText: 'How is customer data classified and protected?',
            description: 'Describe data classification levels, encryption, and retention policies.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: true,
            order: 1,
            category: 'Data Protection'
        },
        {
            sectionIndex: 2,
            questionText: 'Do you conduct background checks on employees with access to personal/client data?',
            description: 'Confirm type of checks done (pre-hire, periodic) and for which roles.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please specify the type of checks done (pre-hire, periodic) and for which roles:'
                }
            },
            isRequired: true,
            evidenceRequired: false,
            order: 2,
            category: 'HR Security'
        },
        {
            sectionIndex: 2,
            questionText: 'How are data breach incidents handled and communicated?',
            description: 'Describe your breach escalation and client notification process.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: true,
            order: 3,
            category: 'Incident Response'
        },

        // Section 4: Legal & Compliance
        {
            sectionIndex: 3,
            questionText: 'Do you have an incident response plan in place?',
            description: 'Provide a copy or summary of how incidents are classified, managed, and reported.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please provide a copy or summary of how incidents are classified, managed, and reported:'
                }
            },
            isRequired: true,
            evidenceRequired: true,
            order: 1,
            category: 'Incident Management'
        },
        {
            sectionIndex: 3,
            questionText: 'Have you experienced any security incidents impacting client data?',
            description: 'If Yes, summarize the event and actions taken.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please summarize the event and actions taken:'
                }
            },
            isRequired: true,
            evidenceRequired: false,
            order: 2,
            category: 'Security Incidents'
        },
        {
            sectionIndex: 3,
            questionText: 'Do you assess and monitor the security of subcontractors handling client data?',
            description: 'Describe your third-party oversight or risk assessment practices.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 3,
            category: 'Third Party Risk'
        },

        // Section 5: Business Continuity & Disaster Recovery
        {
            sectionIndex: 4,
            questionText: 'Do you have a documented disaster recovery or business continuity plan?',
            description: 'Confirm Yes/No and attach or summarize key parts.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please attach or summarize key parts:'
                }
            },
            isRequired: true,
            evidenceRequired: true,
            order: 1,
            category: 'Business Continuity'
        },
        {
            sectionIndex: 4,
            questionText: 'How frequently is your BCP/DR plan tested?',
            description: 'Provide last test date and the type of test conducted.',
            questionType: QuestionType.SINGLE_CHOICE,
            options: {
                choices: [
                    { value: 'Quarterly', requiresText: true },
                    { value: 'Semi-annually', requiresText: true },
                    { value: 'Annually', requiresText: true },
                    { value: 'Every 2-3 years', requiresText: true },
                    { value: 'Never tested', requiresText: false }
                ],
                conditionalText: {
                    trigger: ['Quarterly', 'Semi-annually', 'Annually', 'Every 2-3 years'],
                    prompt: 'Please provide last test date and the type of test conducted:'
                }
            },
            isRequired: true,
            evidenceRequired: false,
            order: 2,
            category: 'BCP Testing'
        },
        {
            sectionIndex: 4,
            questionText: 'Do you have defined recovery time objectives (RTO) and recovery point objectives (RPO)?',
            description: 'State target RTO/RPO for critical services or systems.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 3,
            category: 'Recovery Objectives'
        },

        // Section 6: Network Security & Access Control
        {
            sectionIndex: 5,
            questionText: 'How is remote access to your systems secured?',
            description: 'Explain use of VPN, MFA, endpoint validation, etc.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 1,
            category: 'Remote Access'
        },
        {
            sectionIndex: 5,
            questionText: 'How do you manage and monitor privileged accounts?',
            description: 'Describe processes for provisioning, reviewing, and logging admin access.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 2,
            category: 'Privileged Access'
        },
        {
            sectionIndex: 5,
            questionText: 'How do you segment and secure your internal networks?',
            description: 'Describe use of VLANs, firewalls, and separation between production/test/dev.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 3,
            category: 'Network Segmentation'
        },

        // Section 7: IT Infrastructure Management
        {
            sectionIndex: 6,
            questionText: 'How do you maintain and update your IT asset inventory?',
            description: 'Describe tools or methods for tracking authorized/unauthorized hardware and software.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 1,
            category: 'Asset Management'
        },
        {
            sectionIndex: 6,
            questionText: 'Do you follow secure software development lifecycle (SDLC) practices?',
            description: 'Explain secure coding, testing, and deployment processes.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please explain secure coding, testing, and deployment processes:'
                }
            },
            isRequired: true,
            evidenceRequired: false,
            order: 2,
            category: 'SDLC'
        },

        // Section 8: Physical Security
        {
            sectionIndex: 7,
            questionText: 'What physical security controls are in place at your locations or data centres?',
            description: 'List controls like access cards, visitor logs, CCTV, etc.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 1,
            category: 'Physical Security'
        },

        // Section 9: Insurance & Risk Transfer
        {
            sectionIndex: 8,
            questionText: 'Do you carry business liability and cyber insurance?',
            description: 'Share policy summary (cyber-specific coverage, limits, insurer name).',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please share policy summary (cyber-specific coverage, limits, insurer name):'
                }
            },
            isRequired: true,
            evidenceRequired: true,
            order: 1,
            category: 'Insurance'
        }
    ]

    // Create Medium Risk Questions
    for (const question of mediumRiskQuestions) {
        const { sectionIndex, ...questionData } = question
        await prisma.questionnaireQuestion.create({
            data: {
                templateId: mediumRiskTemplate.id,
                sectionId: createdMediumSections[sectionIndex].id,
                ...questionData
            }
        })
    }

    // HIGH RISK QUESTIONNAIRE SECTIONS
    const highRiskSections = [
        { title: 'Governance & Security Program Management', order: 1, weightage: 1.3 },
        { title: 'Information Security Controls', order: 2, weightage: 1.8 },
        { title: 'Data Privacy & Confidentiality', order: 3, weightage: 2.0 },
        { title: 'Legal & Regulatory Compliance', order: 4, weightage: 1.6 },
        { title: 'Business Continuity & Disaster Recovery', order: 5, weightage: 1.5 },
        { title: 'Network Security & Access Control', order: 6, weightage: 1.8 },
        { title: 'IT Infrastructure & Asset Management', order: 7, weightage: 1.4 },
        { title: 'Physical Security', order: 8, weightage: 1.2 },
        { title: 'Insurance & Risk Transfer', order: 9, weightage: 1.1 }
    ]

    const createdHighSections = []
    for (const section of highRiskSections) {
        const createdSection = await prisma.questionnaireSection.create({
            data: {
                templateId: highRiskTemplate.id,
                ...section
            }
        })
        createdHighSections.push(createdSection)
    }

    // HIGH RISK QUESTIONS (Updated with conditional logic)
    const highRiskQuestions = [
        // Section 1: Governance & Security Program Management
        {
            sectionIndex: 0,
            questionText: 'Who is responsible for cybersecurity within your organization?',
            description: 'Name, title, contact details of the cybersecurity lead (e.g., CISO).',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 1,
            category: 'Governance'
        },
        {
            sectionIndex: 0,
            questionText: 'Do you have a cross-functional cybersecurity or risk committee?',
            description: 'Confirm and describe its function, members, and meeting frequency.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 2,
            category: 'Governance'
        },
        {
            sectionIndex: 0,
            questionText: 'Provide an overview of your cybersecurity governance structure.',
            description: 'Attach or describe reporting lines, responsibilities, and oversight.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: true,
            order: 3,
            category: 'Governance Structure'
        },
        {
            sectionIndex: 0,
            questionText: 'Describe the qualifications of your cybersecurity/IT team.',
            description: 'List certifications (e.g., CISSP, CISA), experience, and headcount.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 4,
            category: 'Team Qualifications'
        },
        {
            sectionIndex: 0,
            questionText: 'Do you conduct internal security audits?',
            description: 'Describe scope, frequency, and attach a recent summary/report.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please describe scope, frequency, and attach a recent summary/report:'
                }
            },
            isRequired: true,
            evidenceRequired: true,
            order: 5,
            category: 'Internal Audit'
        },

        // Section 2: Information Security Controls
        {
            sectionIndex: 1,
            questionText: 'Provide copies or summaries of your key information security policies.',
            description: 'Include policies on acceptable use, access control, remote work, etc.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: true,
            order: 1,
            category: 'Policy Documentation'
        },
        {
            sectionIndex: 1,
            questionText: 'Describe your vulnerability management lifecycle.',
            description: 'Tools used, frequency of scanning, SLAs for remediation.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 2,
            category: 'Vulnerability Management'
        },
        {
            sectionIndex: 1,
            questionText: 'Do you conduct penetration tests or red team exercises?',
            description: 'Confirm, state provider name, frequency, and provide latest summary.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please state provider name, frequency, and provide latest summary:'
                }
            },
            isRequired: true,
            evidenceRequired: true,
            order: 3,
            category: 'Penetration Testing'
        },
        {
            sectionIndex: 1,
            questionText: 'Do you have a defined incident response process?',
            description: 'Attach or summarize your playbooks, incident severity levels, and roles.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please attach or summarize your playbooks, incident severity levels, and roles:'
                }
            },
            isRequired: true,
            evidenceRequired: true,
            order: 4,
            category: 'Incident Response'
        },
        {
            sectionIndex: 1,
            questionText: 'Describe how you control and monitor privileged account access.',
            description: 'Explain use of PAM tools, session logging, and periodic reviews.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 5,
            category: 'Privileged Access'
        },
        {
            sectionIndex: 1,
            questionText: 'How do you detect, alert, and respond to security events?',
            description: 'Describe technologies used (e.g., SIEM, EDR, UEBA) and staffing model (24/7 vs. business hours).',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 6,
            category: 'Security Monitoring'
        },
        {
            sectionIndex: 1,
            questionText: 'Are logs of critical systems monitored and retained?',
            description: 'Confirm retention period, monitoring approach, and automation level.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please confirm retention period, monitoring approach, and automation level:'
                }
            },
            isRequired: true,
            evidenceRequired: false,
            order: 7,
            category: 'Log Management'
        },

        // Section 3: Data Privacy & Confidentiality
        {
            sectionIndex: 2,
            questionText: 'What types of personal data do you process or access?',
            description: 'Specify data types (e.g., PII, financial, health), and processing context.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 1,
            category: 'Data Types'
        },
        {
            sectionIndex: 2,
            questionText: 'Describe how personal and sensitive data is protected.',
            description: 'Include encryption standards (in transit/at rest), access control, and masking.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: true,
            order: 2,
            category: 'Data Protection'
        },
        {
            sectionIndex: 2,
            questionText: 'Do you conduct Data Protection Impact Assessments (DPIAs)?',
            description: 'Confirm and provide example scenarios where DPIAs are performed.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please provide example scenarios where DPIAs are performed:'
                }
            },
            isRequired: true,
            evidenceRequired: true,
            order: 3,
            category: 'DPIA'
        },
        {
            sectionIndex: 2,
            questionText: 'Do you comply with data privacy laws (e.g., GDPR, HIPAA, etc.)?',
            description: 'Specify applicable laws and your compliance approach (e.g., DPO role, breach reporting).',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: true,
            order: 4,
            category: 'Privacy Compliance'
        },
        {
            sectionIndex: 2,
            questionText: 'How do you handle cross-border data transfers?',
            description: 'Mention countries involved, legal bases (e.g., SCCs), and safeguards used.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 5,
            category: 'Data Transfers'
        },

        // Section 4: Legal & Regulatory Compliance
        {
            sectionIndex: 3,
            questionText: 'Are you certified under any compliance standards?',
            description: 'Provide valid certificates for ISO 27001, SOC 2, PCI DSS, HIPAA, etc.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: true,
            order: 1,
            category: 'Certifications'
        },
        {
            sectionIndex: 3,
            questionText: 'Are you currently or have you been subject to any regulatory actions related to data or security?',
            description: 'If yes, provide high-level description and resolution status.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please provide high-level description and resolution status:'
                }
            },
            isRequired: true,
            evidenceRequired: false,
            order: 2,
            category: 'Regulatory Actions'
        },
        {
            sectionIndex: 3,
            questionText: 'How do you assess and monitor legal and regulatory risks?',
            description: 'Describe internal controls, audits, or legal counsel involvement.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 3,
            category: 'Risk Assessment'
        },

        // Section 5: Business Continuity & Disaster Recovery
        {
            sectionIndex: 4,
            questionText: 'Do you have a formal, tested BCP and DRP?',
            description: 'Attach summaries including RTOs, RPOs, and recent test results.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please attach summaries including RTOs, RPOs, and recent test results:'
                }
            },
            isRequired: true,
            evidenceRequired: true,
            order: 1,
            category: 'BCP/DRP'
        },
        {
            sectionIndex: 4,
            questionText: 'How do you ensure availability of services in case of disasters or cyber events?',
            description: 'Describe failover mechanisms, data replication, and backup practices.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 2,
            category: 'Service Availability'
        },
        {
            sectionIndex: 4,
            questionText: 'Have you experienced a business disruption in the last 24 months?',
            description: 'Describe incident, impact, and recovery time.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please describe incident, impact, and recovery time:'
                }
            },
            isRequired: true,
            evidenceRequired: false,
            order: 3,
            category: 'Business Disruption'
        },

        // Section 6: Network Security & Access Control
        {
            sectionIndex: 5,
            questionText: 'How is your network segmented and protected?',
            description: 'Detail VLANs, DMZs, firewall zones, and cloud network controls.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 1,
            category: 'Network Segmentation'
        },
        {
            sectionIndex: 5,
            questionText: 'How do you manage remote access securely?',
            description: 'Mention technologies (e.g., VPN, Zero Trust, MFA) and conditional access rules.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 2,
            category: 'Remote Access'
        },
        {
            sectionIndex: 5,
            questionText: 'Do you use allow/block lists for traffic or domains?',
            description: 'Confirm and describe how rules are updated and monitored.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please describe how rules are updated and monitored:'
                }
            },
            isRequired: true,
            evidenceRequired: false,
            order: 3,
            category: 'Traffic Control'
        },
        {
            sectionIndex: 5,
            questionText: 'Describe your wireless network controls.',
            description: 'Include encryption used, SSID segregation, and endpoint policies.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 4,
            category: 'Wireless Security'
        },

        // Section 7: IT Infrastructure & Asset Management
        {
            sectionIndex: 6,
            questionText: 'How do you track authorized and unauthorized devices/software?',
            description: 'Describe use of asset inventory tools, discovery, and endpoint agents.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 1,
            category: 'Asset Tracking'
        },
        {
            sectionIndex: 6,
            questionText: 'How do you secure your infrastructure (on-prem and cloud)?',
            description: 'Detail configuration management, cloud security posture tools, and hardening guidelines.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 2,
            category: 'Infrastructure Security'
        },
        {
            sectionIndex: 6,
            questionText: 'Do you perform regular patching and system updates?',
            description: 'Describe schedule, automation level, and toolset.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 3,
            category: 'Patch Management'
        },
        {
            sectionIndex: 6,
            questionText: 'For software vendors: How is secure SDLC implemented?',
            description: 'Detail threat modeling, secure code reviews, static/dynamic testing, and DevSecOps tools.',
            questionType: QuestionType.TEXTAREA,
            isRequired: false,
            evidenceRequired: true,
            order: 4,
            category: 'Secure SDLC'
        },

        // Section 8: Physical Security
        {
            sectionIndex: 7,
            questionText: 'What physical security measures protect your premises or data centers?',
            description: 'Describe building access controls, surveillance, guards, and visitor management.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 1,
            category: 'Physical Controls'
        },
        {
            sectionIndex: 7,
            questionText: 'How do you restrict access to sensitive or regulated data locations?',
            description: 'Describe access zoning, badge systems, and escorting procedures.',
            questionType: QuestionType.TEXTAREA,
            isRequired: true,
            evidenceRequired: false,
            order: 2,
            category: 'Data Location Security'
        },

        // Section 9: Insurance & Risk Transfer
        {
            sectionIndex: 8,
            questionText: 'Do you have cyber liability insurance?',
            description: 'Share details on policy type, insurer, coverage amounts, and renewal dates.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please share details on policy type, insurer, coverage amounts, and renewal dates:'
                }
            },
            isRequired: true,
            evidenceRequired: true,
            order: 1,
            category: 'Cyber Insurance'
        },
        {
            sectionIndex: 8,
            questionText: 'Does your policy cover client data breaches and liability?',
            description: 'Confirm and describe any relevant exclusions or limitations.',
            questionType: QuestionType.BOOLEAN,
            options: {
                choices: [
                    { value: 'Yes', requiresText: true },
                    { value: 'No', requiresText: false }
                ],
                conditionalText: {
                    trigger: 'Yes',
                    prompt: 'Please describe coverage details and any relevant exclusions or limitations:'
                }
            },
            isRequired: true,
            evidenceRequired: false,
            order: 2,
            category: 'Client Liability Coverage'
        }
    ]

    // Create High Risk Questions
    for (const question of highRiskQuestions) {
        const { sectionIndex, ...questionData } = question
        await prisma.questionnaireQuestion.create({
            data: {
                templateId: highRiskTemplate.id,
                sectionId: createdHighSections[sectionIndex].id,
                ...questionData
            }
        })
    }

    console.log('✅ Questionnaire templates and questions seeded successfully!')

    // Log summary
    console.log(`📊 Created:`)
    console.log(`   - 3 Templates (Low: ${lowRiskQuestions.length} questions, Medium: ${mediumRiskQuestions.length} questions, High: ${highRiskQuestions.length} questions)`)
    console.log(`   - ${lowRiskSections.length + mediumRiskSections.length + highRiskSections.length} Sections total`)
    console.log(`   - ${lowRiskQuestions.length + mediumRiskQuestions.length + highRiskQuestions.length} Questions total`)
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })