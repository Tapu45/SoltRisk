import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// ============================================================================
// POST /api/vendor - Create Vendor Account & Profile
// ============================================================================
export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')

        // VENDOR REGISTRATION
        if (action === 'register') {
            const {
                token,
                accountData,
                profileData
            } = await request.json()

            if (!token) {
                return NextResponse.json({
                    error: 'Invitation token is required'
                }, { status: 400 })
            }

            // Base required fields (always required)
            const baseRequiredFields = [
                'companyName',
                'registeredAddress',
                'country',
                'region',
                'primaryContactName',
                'primaryContactTitle',
                'primaryContactEmail',
                'primaryContactPhone',
                'companyWebsite',
                'yearEstablished',
                'companySize',
                'employeeCount',
                'legalStructure',
                'businessSectors',
                'productsServices',
                'geographicalPresence'
            ]

            // Boolean fields that must be present
            const booleanFields = [
                'hasParentCompany',
                'isPubliclyTraded'
            ]

            // Array fields that must be present
            const arrayFields = [
                'keyExecutives',
                'certifications'
            ]

            const missingFields = []

            // Check base required fields
            baseRequiredFields.forEach(field => {
                const value = profileData[field]
                if (value === null || value === undefined) {
                    missingFields.push(field)
                } else if (typeof value === 'string' && value.trim() === '') {
                    missingFields.push(field)
                } else if (Array.isArray(value) && value.length === 0) {
                    missingFields.push(field)
                }
            })

            // Check boolean fields
            booleanFields.forEach(field => {
                if (typeof profileData[field] !== 'boolean') {
                    missingFields.push(field)
                }
            })

            // Check array fields
            arrayFields.forEach(field => {
                if (!Array.isArray(profileData[field]) || profileData[field].length === 0) {
                    missingFields.push(field)
                }
            })

            // Conditional field validation
            if (profileData.hasParentCompany === true) {
                if (!profileData.parentCompanyName || profileData.parentCompanyName.trim() === '') {
                    missingFields.push('parentCompanyName')
                }
                if (!profileData.parentCompanyHeadquarters || profileData.parentCompanyHeadquarters.trim() === '') {
                    missingFields.push('parentCompanyHeadquarters')
                }
            }

            if (profileData.isPubliclyTraded === true) {
                if (!profileData.stockExchange || profileData.stockExchange.trim() === '') {
                    missingFields.push('stockExchange')
                }
                if (!profileData.tickerSymbol || profileData.tickerSymbol.trim() === '') {
                    missingFields.push('tickerSymbol')
                }
            }

            if (missingFields.length > 0) {
                return NextResponse.json({
                    error: 'Please complete all required fields.',
                    missingFields,
                    details: `Missing required fields: ${missingFields.join(', ')}`,
                    totalFieldsRequired: baseRequiredFields.length + booleanFields.length + arrayFields.length,
                    fieldsMissing: missingFields.length
                }, { status: 400 })
            }

            // Additional validation
            const validationErrors = []

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(profileData.primaryContactEmail)) {
                validationErrors.push('Invalid primary contact email format')
            }

            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,20}$/
            if (!phoneRegex.test(profileData.primaryContactPhone)) {
                validationErrors.push('Invalid phone number format')
            }

            const currentYear = new Date().getFullYear()
            if (profileData.yearEstablished < 1800 || profileData.yearEstablished > currentYear) {
                validationErrors.push('Year established must be between 1800 and current year')
            }

            if (profileData.employeeCount < 1) {
                validationErrors.push('Employee count must be at least 1')
            }

            // Validate key executives
            if (Array.isArray(profileData.keyExecutives)) {
                profileData.keyExecutives.forEach((exec: { name: string; title: string; email: string }, index: number) => {
                    if (!exec.name || exec.name.trim() === '') {
                        validationErrors.push(`Key executive ${index + 1}: Name is required`)
                    }
                    if (!exec.title || exec.title.trim() === '') {
                        validationErrors.push(`Key executive ${index + 1}: Title is required`)
                    }
                    if (!exec.email || !emailRegex.test(exec.email)) {
                        validationErrors.push(`Key executive ${index + 1}: Valid email is required`)
                    }
                })
            }

            // Validate certifications
            if (Array.isArray(profileData.certifications)) {
                profileData.certifications.forEach((cert: { name: string; issuedBy: string }, index: number) => {
                    if (!cert.name || cert.name.trim() === '') {
                        validationErrors.push(`Certification ${index + 1}: Name is required`)
                    }
                    if (!cert.issuedBy || cert.issuedBy.trim() === '') {
                        validationErrors.push(`Certification ${index + 1}: Issued by is required`)
                    }
                })
            }

            // Validate website URL
            try {
                new URL(profileData.companyWebsite)
            } catch {
                validationErrors.push('Invalid company website URL')
            }

            if (validationErrors.length > 0) {
                return NextResponse.json({
                    error: 'Validation errors found',
                    validationErrors
                }, { status: 400 })
            }

            // Continue with existing logic...
            const invitation = await prisma.vendorInvitation.findUnique({
                where: { inviteToken: token },
                include: {
                    template: true,
                    rifSubmission: true
                }
            })

            if (!invitation) {
                return NextResponse.json({
                    error: 'Invalid invitation token'
                }, { status: 404 })
            }

            if (invitation.expiresAt < new Date()) {
                return NextResponse.json({
                    error: 'Invitation has expired'
                }, { status: 410 })
            }

            if (invitation.status !== 'SENT') {
                return NextResponse.json({
                    error: 'Invitation is not valid for registration'
                }, { status: 400 })
            }

            // Continue with vendor creation logic...
            const existingUser = await prisma.user.findUnique({
                where: { email: invitation.vendorEmail }
            })

            let user
            let vendor

            if (existingUser) {
                vendor = await prisma.vendor.findUnique({
                    where: { userId: existingUser.id },
                    include: { Profile: true }
                })

                if (!vendor) {
                    vendor = await prisma.vendor.create({
                        data: {
                            id: `vendor-${Date.now()}`,
                            userId: existingUser.id
                        },
                        include: { Profile: true }
                    })
                }

                user = existingUser
            } else {
                const hashedPassword = await bcrypt.hash(accountData.password, 12)

                user = await prisma.user.create({
                    data: {
                        id: `user-${Date.now()}`,
                        email: invitation.vendorEmail,
                        name: accountData.name || invitation.vendorName || '',
                        password: hashedPassword,
                        role: 'VENDOR',
                        updatedAt: new Date()
                    }
                })

                vendor = await prisma.vendor.create({
                    data: {
                        id: `vendor-${Date.now()}`,
                        userId: user.id
                    },
                    include: { Profile: true }
                })
            }

            // Handle conditional fields when creating profile
            const profileCreateData = {
                id: `profile-${Date.now()}`,
                vendorId: vendor.id,
                companyName: profileData.companyName,
                registeredAddress: profileData.registeredAddress,
                country: profileData.country,
                region: profileData.region,
                primaryContactName: profileData.primaryContactName,
                primaryContactTitle: profileData.primaryContactTitle,
                primaryContactEmail: profileData.primaryContactEmail,
                primaryContactPhone: profileData.primaryContactPhone,
                companyWebsite: profileData.companyWebsite,
                yearEstablished: parseInt(profileData.yearEstablished),
                companySize: profileData.companySize,
                employeeCount: parseInt(profileData.employeeCount),
                legalStructure: profileData.legalStructure,
                hasParentCompany: profileData.hasParentCompany,
                parentCompanyName: profileData.hasParentCompany ? profileData.parentCompanyName : null,
                parentCompanyHeadquarters: profileData.hasParentCompany ? profileData.parentCompanyHeadquarters : null,
                keyExecutives: profileData.keyExecutives,
                businessSectors: profileData.businessSectors,
                productsServices: profileData.productsServices,
                geographicalPresence: profileData.geographicalPresence,
                isPubliclyTraded: profileData.isPubliclyTraded,
                stockExchange: profileData.isPubliclyTraded ? profileData.stockExchange : null,
                tickerSymbol: profileData.isPubliclyTraded ? profileData.tickerSymbol : null,
                certifications: profileData.certifications,
                isCompleted: true,
                completedAt: new Date(),
                completionPercentage: 100,
                createdBy: user.id
            }

            const vendorProfile = await prisma.vendorProfile.upsert({
                where: { vendorId: vendor.id },
                create: profileCreateData,
                update: {
                    ...profileCreateData,
                    updatedAt: new Date()
                }
            })

            // Rest of the vendor creation logic remains the same...
            const questionnaire = await prisma.vendorQuestionnaire.create({
                data: {
                    id: `quest-${Date.now()}`,
                    vendorId: vendor.id,
                    templateId: invitation.templateId,
                    rifSubmissionId: invitation.rifSubmissionId,
                    invitationId: invitation.id,
                    status: 'NOT_STARTED',
                    assignedBy: invitation.clientId,
                    dueDate: invitation.expiresAt,
                    totalQuestions: await prisma.questionnaireQuestion.count({
                        where: { templateId: invitation.templateId }
                    })
                }
            })

            await prisma.vendorInvitation.update({
                where: { id: invitation.id },
                data: {
                    status: 'ACCEPTED',
                    acceptedAt: new Date()
                }
            })

            console.log(`✅ Vendor registered with complete profile: ${user.email}`)

            return NextResponse.json({
                success: true,
                message: 'Vendor registration completed successfully with complete profile',
                vendor: {
                    id: vendor.id,
                    userId: user.id,
                    email: user.email,
                    name: user.name
                },
                profile: {
                    id: vendorProfile.id,
                    companyName: vendorProfile.companyName,
                    isCompleted: vendorProfile.isCompleted,
                    completionPercentage: vendorProfile.completionPercentage,
                    primaryContactEmail: vendorProfile.primaryContactEmail,
                    businessSectors: vendorProfile.businessSectors,
                    companySize: vendorProfile.companySize,
                    employeeCount: vendorProfile.employeeCount
                },
                questionnaire: {
                    id: questionnaire.id,
                    templateId: questionnaire.templateId,
                    status: questionnaire.status,
                    totalQuestions: questionnaire.totalQuestions,
                    riskLevel: invitation.riskLevel
                },
                redirectUrl: `/vendor/questionnaire/${questionnaire.id}`
            })
        }

        // QUESTIONNAIRE MANAGEMENT
        if (action === 'start-questionnaire') {
            const { questionnaireId, vendorId } = await request.json()

            const questionnaire = await prisma.vendorQuestionnaire.findFirst({
                where: {
                    id: questionnaireId,
                    vendorId: vendorId
                }
            })

            if (!questionnaire) {
                return NextResponse.json({
                    error: 'Questionnaire not found or access denied'
                }, { status: 404 })
            }

            const updatedQuestionnaire = await prisma.vendorQuestionnaire.update({
                where: { id: questionnaireId },
                data: {
                    status: 'IN_PROGRESS',
                    startedAt: new Date()
                }
            })

            return NextResponse.json({
                success: true,
                message: 'Questionnaire started successfully',
                questionnaire: updatedQuestionnaire
            })
        }

        if (action === 'submit-questionnaire') {
            const { questionnaireId, vendorId } = await request.json()

            const questionnaire = await prisma.vendorQuestionnaire.findFirst({
                where: {
                    id: questionnaireId,
                    vendorId: vendorId
                },
                include: {
                    invitation: {  // Fixed: use lowercase 'invitation'
                        include: {
                            rifSubmission: {
                                include: {
                                    Initiation: {
                                        include: {
                                            Client: {
                                                include: {
                                                    User: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })

            if (!questionnaire) {
                return NextResponse.json({
                    error: 'Questionnaire not found or access denied'
                }, { status: 404 })
            }

            if (questionnaire.status === 'SUBMITTED') {
                return NextResponse.json({
                    error: 'Questionnaire already submitted'
                }, { status: 400 })
            }

            const updatedQuestionnaire = await prisma.vendorQuestionnaire.update({
                where: { id: questionnaireId },
                data: {
                    status: 'SUBMITTED',
                    submittedAt: new Date(),
                    progressPercentage: 100
                }
            })

            // TODO: Send notification to client
            console.log(`✅ Questionnaire submitted for review: ${questionnaireId}`)

            return NextResponse.json({
                success: true,
                message: 'Questionnaire submitted successfully for client review',
                questionnaire: updatedQuestionnaire
            })
        }

        // RESPONSE MANAGEMENT
        if (action === 'save-response') {
            const {
                questionnaireId,
                questionId,
                vendorId,
                responseText,
                responseData,
                evidenceFiles = [],
                evidenceNotes
            } = await request.json()

            if (!questionnaireId || !questionId || !vendorId) {
                return NextResponse.json({
                    error: 'Questionnaire ID, Question ID, and Vendor ID are required'
                }, { status: 400 })
            }

            // Check if questionnaire exists and is accessible
            const questionnaire = await prisma.vendorQuestionnaire.findFirst({
                where: {
                    id: questionnaireId,
                    vendorId: vendorId
                }
            })

            if (!questionnaire) {
                return NextResponse.json({
                    error: 'Questionnaire not found or access denied'
                }, { status: 404 })
            }

            if (questionnaire.status === 'SUBMITTED' || questionnaire.status === 'APPROVED') {
                return NextResponse.json({
                    error: 'Cannot modify submitted questionnaire'
                }, { status: 400 })
            }

            // Create or update response
            const response = await prisma.vendorResponse.upsert({
                where: {
                    questionnaireId_questionId: {
                        questionnaireId,
                        questionId
                    }
                },
                create: {
                    id: `resp-${Date.now()}`,
                    questionnaireId,
                    questionId,
                    vendorId,
                    responseText,
                    responseData,
                    evidenceFiles,
                    evidenceNotes,
                    status: 'SUBMITTED',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                update: {
                    responseText,
                    responseData,
                    evidenceFiles,
                    evidenceNotes,
                    status: 'SUBMITTED',
                    updatedAt: new Date()
                }
            })

            // Update questionnaire progress
            const progress = await calculateQuestionnaireProgress(questionnaireId)

            await prisma.vendorQuestionnaire.update({
                where: { id: questionnaireId },
                data: {
                    answeredQuestions: progress.answeredQuestions,
                    progressPercentage: progress.percentage,
                    status: questionnaire.status === 'NOT_STARTED' ? 'IN_PROGRESS' : questionnaire.status
                }
            })

            console.log(`✅ Response auto-saved for question ${questionId}`)

            return NextResponse.json({
                success: true,
                message: 'Response saved successfully',
                response: {
                    id: response.id,
                    questionId: response.questionId,
                    responseText: response.responseText,
                    responseData: response.responseData,
                    status: response.status,
                    updatedAt: response.updatedAt
                },
                progress: {
                    answeredQuestions: progress.answeredQuestions,
                    totalQuestions: progress.totalQuestions,
                    progressPercentage: progress.percentage
                }
            })
        }

        // BULK RESPONSE SAVE (for auto-save multiple responses)
        if (action === 'bulk-save-responses') {
            const { questionnaireId, vendorId, responses } = await request.json()

            if (!questionnaireId || !vendorId || !Array.isArray(responses)) {
                return NextResponse.json({
                    error: 'Invalid request data'
                }, { status: 400 })
            }

            const questionnaire = await prisma.vendorQuestionnaire.findFirst({
                where: {
                    id: questionnaireId,
                    vendorId: vendorId
                }
            })

            if (!questionnaire) {
                return NextResponse.json({
                    error: 'Questionnaire not found or access denied'
                }, { status: 404 })
            }

            if (questionnaire.status === 'SUBMITTED') {
                return NextResponse.json({
                    error: 'Cannot modify submitted questionnaire'
                }, { status: 400 })
            }

            // Process responses in batch
            const responsePromises = responses.map((responseData: any) => {
                return prisma.vendorResponse.upsert({
                    where: {
                        questionnaireId_questionId: {
                            questionnaireId,
                            questionId: responseData.questionId
                        }
                    },
                    create: {
                        id: `resp-${Date.now()}-${responseData.questionId}`,
                        questionnaireId,
                        questionId: responseData.questionId,
                        vendorId,
                        responseText: responseData.responseText,
                        responseData: responseData.responseData,
                        evidenceFiles: responseData.evidenceFiles || [],
                        evidenceNotes: responseData.evidenceNotes,
                        status: 'SUBMITTED',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    update: {
                        responseText: responseData.responseText,
                        responseData: responseData.responseData,
                        evidenceFiles: responseData.evidenceFiles || [],
                        evidenceNotes: responseData.evidenceNotes,
                        status: 'SUBMITTED',
                        updatedAt: new Date()
                    }
                })
            })

            await Promise.all(responsePromises)

            // Update progress
            const progress = await calculateQuestionnaireProgress(questionnaireId)

            await prisma.vendorQuestionnaire.update({
                where: { id: questionnaireId },
                data: {
                    answeredQuestions: progress.answeredQuestions,
                    progressPercentage: progress.percentage,
                    status: questionnaire.status === 'NOT_STARTED' ? 'IN_PROGRESS' : questionnaire.status
                }
            })

            return NextResponse.json({
                success: true,
                message: `${responses.length} responses saved successfully`,
                progress: {
                    answeredQuestions: progress.answeredQuestions,
                    totalQuestions: progress.totalQuestions,
                    progressPercentage: progress.percentage
                },
                timestamp: new Date().toISOString()
            })
        }

        if (action === 'add-question') {
            const {
                templateId,
                sectionId,
                newSectionData,
                questionData
            } = await request.json()

            if (!templateId || !questionData) {
                return NextResponse.json({
                    error: 'Template ID and question data are required'
                }, { status: 400 })
            }

            let targetSectionId = sectionId

            // If creating a new section
            if (!sectionId && newSectionData) {
                // Get the highest order number for sections in this template
                const maxOrder = await prisma.questionnaireSection.aggregate({
                    where: { templateId },
                    _max: { order: true }
                })

                const newSection = await prisma.questionnaireSection.create({
                    data: {
                        templateId,
                        title: newSectionData.title,
                        description: newSectionData.description || null,
                        order: (maxOrder._max.order || 0) + 1,
                        weightage: newSectionData.weightage || 1.0,
                        isRequired: newSectionData.isRequired !== false
                    }
                })

                targetSectionId = newSection.id
                console.log(`✅ New section created: ${newSection.title}`)
            }

            if (!targetSectionId) {
                return NextResponse.json({
                    error: 'Section ID is required or new section data must be provided'
                }, { status: 400 })
            }

            // Get the highest order number for questions in this section
            const maxQuestionOrder = await prisma.questionnaireQuestion.aggregate({
                where: { sectionId: targetSectionId },
                _max: { order: true }
            })

            // Create the new question
            const newQuestion = await prisma.questionnaireQuestion.create({
                data: {
                    templateId,
                    sectionId: targetSectionId,
                    questionText: questionData.questionText,
                    description: questionData.description || null,
                    questionType: questionData.questionType,
                    options: questionData.options || null,
                    isRequired: questionData.isRequired !== false,
                    evidenceRequired: questionData.evidenceRequired || false,
                    order: (maxQuestionOrder._max.order || 0) + 1,
                    category: questionData.category || null
                }
            })

            // Update template's total question count
            const totalQuestions = await prisma.questionnaireQuestion.count({
                where: { templateId }
            })

            await prisma.questionnaireTemplate.update({
                where: { id: templateId },
                data: { totalQuestions }
            })

            console.log(`✅ Question added: ${newQuestion.questionText}`)

            return NextResponse.json({
                success: true,
                message: 'Question added successfully',
                question: {
                    id: newQuestion.id,
                    questionText: newQuestion.questionText,
                    questionType: newQuestion.questionType,
                    sectionId: targetSectionId,
                    order: newQuestion.order
                },
                sectionCreated: sectionId ? false : true,
                updatedTotalQuestions: totalQuestions
            })
        }

        // CREATE NEW SECTION
        if (action === 'create-section') {
            const { templateId, sectionData } = await request.json()

            if (!templateId || !sectionData || !sectionData.title) {
                return NextResponse.json({
                    error: 'Template ID and section title are required'
                }, { status: 400 })
            }

            // Get the highest order number for sections in this template
            const maxOrder = await prisma.questionnaireSection.aggregate({
                where: { templateId },
                _max: { order: true }
            })

            const newSection = await prisma.questionnaireSection.create({
                data: {
                    templateId,
                    title: sectionData.title,
                    description: sectionData.description || null,
                    order: (maxOrder._max.order || 0) + 1,
                    weightage: sectionData.weightage || 1.0,
                    isRequired: sectionData.isRequired !== false
                }
            })

            console.log(`✅ Section created: ${newSection.title}`)

            return NextResponse.json({
                success: true,
                message: 'Section created successfully',
                section: {
                    id: newSection.id,
                    title: newSection.title,
                    description: newSection.description,
                    order: newSection.order,
                    weightage: newSection.weightage
                }
            })
        }

        // UPDATE QUESTION
        if (action === 'update-question') {
            const { questionId, questionData } = await request.json()

            if (!questionId || !questionData) {
                return NextResponse.json({
                    error: 'Question ID and question data are required'
                }, { status: 400 })
            }

            const updatedQuestion = await prisma.questionnaireQuestion.update({
                where: { id: questionId },
                data: {
                    questionText: questionData.questionText,
                    description: questionData.description,
                    questionType: questionData.questionType,
                    options: questionData.options,
                    isRequired: questionData.isRequired,
                    evidenceRequired: questionData.evidenceRequired,
                    category: questionData.category
                }
            })

            console.log(`✅ Question updated: ${updatedQuestion.questionText}`)

            return NextResponse.json({
                success: true,
                message: 'Question updated successfully',
                question: updatedQuestion
            })
        }

        // UPDATE SECTION
        if (action === 'update-section') {
            const { sectionId, sectionData } = await request.json()

            if (!sectionId || !sectionData) {
                return NextResponse.json({
                    error: 'Section ID and section data are required'
                }, { status: 400 })
            }

            const updatedSection = await prisma.questionnaireSection.update({
                where: { id: sectionId },
                data: {
                    title: sectionData.title,
                    description: sectionData.description,
                    weightage: sectionData.weightage,
                    isRequired: sectionData.isRequired
                }
            })

            console.log(`✅ Section updated: ${updatedSection.title}`)

            return NextResponse.json({
                success: true,
                message: 'Section updated successfully',
                section: updatedSection
            })
        }

        // REORDER QUESTIONS
        if (action === 'reorder-questions') {
            const { sectionId, questionOrders } = await request.json()

            if (!sectionId || !Array.isArray(questionOrders)) {
                return NextResponse.json({
                    error: 'Section ID and question orders array are required'
                }, { status: 400 })
            }

            // Update question orders in batch
            const updatePromises = questionOrders.map((item: { questionId: string, order: number }) => 
                prisma.questionnaireQuestion.update({
                    where: { id: item.questionId },
                    data: { order: item.order }
                })
            )

            await Promise.all(updatePromises)

            console.log(`✅ Questions reordered in section: ${sectionId}`)

            return NextResponse.json({
                success: true,
                message: 'Questions reordered successfully'
            })
        }

        // REORDER SECTIONS
        if (action === 'reorder-sections') {
            const { templateId, sectionOrders } = await request.json()

            if (!templateId || !Array.isArray(sectionOrders)) {
                return NextResponse.json({
                    error: 'Template ID and section orders array are required'
                }, { status: 400 })
            }

            // Update section orders in batch
            const updatePromises = sectionOrders.map((item: { sectionId: string, order: number }) => 
                prisma.questionnaireSection.update({
                    where: { id: item.sectionId },
                    data: { order: item.order }
                })
            )

            await Promise.all(updatePromises)

            console.log(`✅ Sections reordered in template: ${templateId}`)

            return NextResponse.json({
                success: true,
                message: 'Sections reordered successfully'
            })
        }


        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (error) {
        console.error('Error in POST /api/vendor:', error)
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

// ============================================================================
// GET /api/vendor - Get Vendor Profile & Questionnaire Data
// ============================================================================
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')
        const vendorId = searchParams.get('vendorId')
        const userId = searchParams.get('userId')
        const questionnaireId = searchParams.get('questionnaireId')
        const responseId = searchParams.get('responseId')
        const templateId = searchParams.get('templateId')
        const sectionId = searchParams.get('sectionId')

        // GET VENDOR PROFILE
        if (action === 'profile') {
            let vendor

            if (vendorId) {
                vendor = await prisma.vendor.findUnique({
                    where: { id: vendorId },
                    include: {
                        User: true,
                        Profile: true,  // Fixed: VendorProfile -> Profile
                        Questionnaires: {
                            include: {
                                Template: true
                            },
                            orderBy: { assignedAt: 'desc' }
                        }
                    }
                })
            } else if (userId) {
                vendor = await prisma.vendor.findUnique({
                    where: { userId },
                    include: {
                        User: true,
                        Profile: true,  // Fixed: VendorProfile -> Profile
                        Questionnaires: {
                            include: {
                                Template: true
                            },
                            orderBy: { assignedAt: 'desc' }
                        }
                    }
                })
            } else {
                return NextResponse.json({
                    error: 'Vendor ID or User ID is required'
                }, { status: 400 })
            }

            if (!vendor) {
                return NextResponse.json({
                    error: 'Vendor not found'
                }, { status: 404 })
            }

            return NextResponse.json({
                vendor: {
                    id: vendor.id,
                    userId: vendor.User.id,
                    email: vendor.User.email,
                    name: vendor.User.name,
                    createdAt: vendor.createdAt
                },
                profile: vendor.Profile,  // Fixed: VendorProfile -> Profile
                questionnaires: vendor.Questionnaires
            })
        }

        // GET QUESTIONNAIRE DETAILS
        if (action === 'questionnaire' && questionnaireId) {
            const questionnaire = await prisma.vendorQuestionnaire.findUnique({
                where: { id: questionnaireId },
                include: {
                    Template: {
                        include: {
                            Sections: {
                                include: {
                                    Questions: {
                                        orderBy: { order: 'asc' }
                                    }
                                },
                                orderBy: { order: 'asc' }
                            }
                        }
                    },
                    Vendor: {
                        include: {
                            User: true,
                            Profile: true  // Fixed: VendorProfile -> Profile
                        }
                    },
                    Responses: {
                        include: {
                            Question: true,
                            Evidence: true
                        }
                    },
                    invitation: {  // Fixed: use lowercase 'invitation'
                        include: {
                            rifSubmission: {
                                include: {
                                    RiskAssessment: true,
                                    Initiation: {
                                        include: {
                                            Client: {
                                                include: {
                                                    User: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })

            if (!questionnaire) {
                return NextResponse.json({
                    error: 'Questionnaire not found'
                }, { status: 404 })
            }

            return NextResponse.json({
                questionnaire: {
                    id: questionnaire.id,
                    status: questionnaire.status,
                    assignedAt: questionnaire.assignedAt,
                    startedAt: questionnaire.startedAt,
                    submittedAt: questionnaire.submittedAt,
                    dueDate: questionnaire.dueDate,
                    totalQuestions: questionnaire.totalQuestions,
                    answeredQuestions: questionnaire.answeredQuestions,
                    progressPercentage: questionnaire.progressPercentage
                },
                template: {
                    id: questionnaire.Template.id,
                    name: questionnaire.Template.name,
                    description: questionnaire.Template.description,
                    riskLevel: questionnaire.Template.riskLevel,
                    estimatedTime: questionnaire.Template.estimatedTime,
                    sections: questionnaire.Template.Sections.map(section => ({
                        id: section.id,
                        title: section.title,
                        description: section.description,
                        order: section.order,
                        weightage: section.weightage,
                        questions: section.Questions.map(question => ({
                            id: question.id,
                            questionText: question.questionText,
                            description: question.description,
                            questionType: question.questionType,
                            options: question.options,
                            isRequired: question.isRequired,
                            evidenceRequired: question.evidenceRequired,
                            order: question.order,
                            category: question.category,
                            // Add existing response if any
                            response: questionnaire.Responses.find(r => r.questionId === question.id)
                        }))
                    }))
                },
                vendor: {
                    id: questionnaire.Vendor.id,
                    name: questionnaire.Vendor.User.name,
                    email: questionnaire.Vendor.User.email,
                    profile: questionnaire.Vendor.Profile  // Fixed: VendorProfile -> Profile
                },
                client: {
                    name: questionnaire.invitation?.rifSubmission?.Initiation?.Client?.User?.name
                },
                riskLevel: questionnaire.invitation?.rifSubmission?.RiskAssessment?.riskLevel
            })
        }

        // GET QUESTIONNAIRE LIST FOR VENDOR
        if (action === 'questionnaire-list' && vendorId) {
            const questionnaires = await prisma.vendorQuestionnaire.findMany({
                where: { vendorId },
                include: {
                    Template: true,
                    invitation: {  // Fixed: use lowercase 'invitation'
                        include: {
                            rifSubmission: {
                                include: {
                                    Initiation: {
                                        include: {
                                            Client: {
                                                include: {
                                                    User: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: { assignedAt: 'desc' }
            })

            return NextResponse.json({
                questionnaires: questionnaires.map(q => ({
                    id: q.id,
                    status: q.status,
                    assignedAt: q.assignedAt,
                    dueDate: q.dueDate,
                    progressPercentage: q.progressPercentage,
                    totalQuestions: q.totalQuestions,
                    answeredQuestions: q.answeredQuestions,
                    template: {
                        name: q.Template.name,
                        riskLevel: q.Template.riskLevel,
                        estimatedTime: q.Template.estimatedTime
                    },
                    client: {
                        name: q.invitation?.rifSubmission?.Initiation?.Client?.User?.name
                    }
                }))
            })
        }

        // GET RESPONSES FOR QUESTIONNAIRE
        if (action === 'responses' && questionnaireId) {
            const responses = await prisma.vendorResponse.findMany({
                where: { questionnaireId },
                include: {
                    Question: {
                        include: {
                            Section: true
                        }
                    },
                    Evidence: true
                },
                orderBy: [
                    { Question: { Section: { order: 'asc' } } },
                    { Question: { order: 'asc' } }
                ]
            })

            return NextResponse.json({ responses })
        }

        // GET SPECIFIC RESPONSE
        if (action === 'response' && responseId) {
            const response = await prisma.vendorResponse.findUnique({
                where: { id: responseId },
                include: {
                    Question: true,
                    Evidence: true,
                    Comments: true
                }
            })

            if (!response) {
                return NextResponse.json({
                    error: 'Response not found'
                }, { status: 404 })
            }

            return NextResponse.json({ response })
        }

        // GET QUESTIONNAIRE PROGRESS
        if (action === 'progress' && questionnaireId) {
            const progress = await calculateQuestionnaireProgress(questionnaireId)

            return NextResponse.json({
                progress: {
                    answeredQuestions: progress.answeredQuestions,
                    totalQuestions: progress.totalQuestions,
                    progressPercentage: progress.percentage,
                    sectionProgress: progress.sectionProgress
                }
            })
        }

        if (action === 'vendor-list') {
            const clientId = searchParams.get('clientId')
            const questionnaireStatus = searchParams.get('questionnaireStatus')
            const riskLevel = searchParams.get('riskLevel')
            const limit = parseInt(searchParams.get('limit') || '50')
            const offset = parseInt(searchParams.get('offset') || '0')

            let whereClause: any = {}

            // Filter by questionnaire status if provided
            if (questionnaireStatus) {
                whereClause.Questionnaires = {
                    some: {
                        status: questionnaireStatus,
                        ...(clientId ? { assignedBy: clientId } : {})
                    }
                }
            } else if (clientId) {
                whereClause.Questionnaires = {
                    some: {
                        assignedBy: clientId
                    }
                }
            }

            const vendors = await prisma.vendor.findMany({
                where: whereClause,
                include: {
                    User: true,
                    Profile: true,
                    Questionnaires: {
                        where: clientId ? { assignedBy: clientId } : {},
                        include: {
                            Template: true,
                            Responses: {
                                include: {
                                    Question: {
                                        include: {
                                            Section: true
                                        }
                                    },
                                    Evidence: true
                                }
                            },
                            RiskAssessment: true,
                            invitation: {
                                include: {
                                    rifSubmission: {
                                        include: {
                                            RiskAssessment: true
                                        }
                                    }
                                }
                            }
                        },
                        orderBy: { assignedAt: 'desc' }
                    }
                },
                skip: offset,
                take: limit,
                orderBy: { createdAt: 'desc' }
            })

            // Filter by risk level if provided
            let filteredVendors = vendors
            if (riskLevel) {
                filteredVendors = vendors.filter(vendor => 
                    vendor.Questionnaires.some(q => 
                        q.invitation?.rifSubmission?.RiskAssessment?.riskLevel === riskLevel ||
                        q.Template.riskLevel === riskLevel
                    )
                )
            }

            const vendorList = filteredVendors.map(vendor => ({
                vendor: {
                    id: vendor.id,
                    userId: vendor.User.id,
                    name: vendor.User.name,
                    email: vendor.User.email,
                    createdAt: vendor.createdAt
                },
                profile: vendor.Profile,
                questionnaires: vendor.Questionnaires.map(q => ({
                    id: q.id,
                    status: q.status,
                    progressPercentage: q.progressPercentage,
                    answeredQuestions: q.answeredQuestions,
                    totalQuestions: q.totalQuestions,
                    assignedAt: q.assignedAt,
                    startedAt: q.startedAt,
                    submittedAt: q.submittedAt,
                    dueDate: q.dueDate,
                    template: {
                        id: q.Template.id,
                        name: q.Template.name,
                        riskLevel: q.Template.riskLevel,
                        totalQuestions: q.Template.totalQuestions
                    },
                    responseCount: q.Responses.length,
                    responses: q.Responses,
                    riskAssessment: q.RiskAssessment,
                    rifRiskLevel: q.invitation?.rifSubmission?.RiskAssessment?.riskLevel
                })),
                summary: {
                    totalQuestionnaires: vendor.Questionnaires.length,
                    completedQuestionnaires: vendor.Questionnaires.filter(q => q.status === 'APPROVED').length,
                    pendingQuestionnaires: vendor.Questionnaires.filter(q => ['NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED'].includes(q.status)).length,
                    averageProgress: vendor.Questionnaires.length > 0 
                        ? Math.round(vendor.Questionnaires.reduce((sum, q) => sum + q.progressPercentage, 0) / vendor.Questionnaires.length)
                        : 0
                }
            }))

            const totalVendors = await prisma.vendor.count({ where: whereClause })

            return NextResponse.json({
                success: true,
                vendors: vendorList,
                pagination: {
                    total: totalVendors,
                    limit,
                    offset,
                    hasMore: offset + limit < totalVendors
                },
                summary: {
                    totalVendors: vendorList.length,
                    withProfiles: vendorList.filter(v => v.profile?.isCompleted).length,
                    withActiveQuestionnaires: vendorList.filter(v => v.questionnaires.length > 0).length,
                    statusBreakdown: {
                        notStarted: vendorList.reduce((sum, v) => sum + v.questionnaires.filter(q => q.status === 'NOT_STARTED').length, 0),
                        inProgress: vendorList.reduce((sum, v) => sum + v.questionnaires.filter(q => q.status === 'IN_PROGRESS').length, 0),
                        submitted: vendorList.reduce((sum, v) => sum + v.questionnaires.filter(q => q.status === 'SUBMITTED').length, 0),
                        approved: vendorList.reduce((sum, v) => sum + v.questionnaires.filter(q => q.status === 'APPROVED').length, 0),
                        rejected: vendorList.reduce((sum, v) => sum + v.questionnaires.filter(q => q.status === 'REJECTED').length, 0)
                    }
                }
            })
        }

         if (action === 'template-structure' && templateId) {
            const template = await prisma.questionnaireTemplate.findUnique({
                where: { id: templateId },
                include: {
                    Sections: {
                        include: {
                            Questions: {
                                orderBy: { order: 'asc' }
                            }
                        },
                        orderBy: { order: 'asc' }
                    }
                }
            })

            if (!template) {
                return NextResponse.json({
                    error: 'Template not found'
                }, { status: 404 })
            }

            return NextResponse.json({
                template: {
                    id: template.id,
                    name: template.name,
                    description: template.description,
                    riskLevel: template.riskLevel,
                    templateType: template.templateType,
                    version: template.version,
                    isActive: template.isActive,
                    totalQuestions: template.totalQuestions,
                    estimatedTime: template.estimatedTime,
                    sections: template.Sections.map(section => ({
                        id: section.id,
                        title: section.title,
                        description: section.description,
                        order: section.order,
                        weightage: section.weightage,
                        isRequired: section.isRequired,
                        questionCount: section.Questions.length,
                        questions: section.Questions.map(question => ({
                            id: question.id,
                            questionText: question.questionText,
                            description: question.description,
                            questionType: question.questionType,
                            options: question.options,
                            isRequired: question.isRequired,
                            evidenceRequired: question.evidenceRequired,
                            order: question.order,
                            category: question.category
                        }))
                    }))
                }
            })
        }

        // GET ALL TEMPLATES (for selection)
        if (action === 'templates-list') {
            const templates = await prisma.questionnaireTemplate.findMany({
                include: {
                    _count: {
                        select: {
                            Sections: true,
                            Questions: true,
                            Assignments: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })

            return NextResponse.json({
                templates: templates.map(template => ({
                    id: template.id,
                    name: template.name,
                    description: template.description,
                    riskLevel: template.riskLevel,
                    templateType: template.templateType,
                    version: template.version,
                    isActive: template.isActive,
                    totalQuestions: template.totalQuestions,
                    estimatedTime: template.estimatedTime,
                    sectionCount: template._count.Sections,
                    questionCount: template._count.Questions,
                    assignmentCount: template._count.Assignments,
                    createdAt: template.createdAt,
                    updatedAt: template.updatedAt
                }))
            })
        }

        // GET SECTIONS FOR A TEMPLATE (for question assignment)
        if (action === 'template-sections' && templateId) {
            const sections = await prisma.questionnaireSection.findMany({
                where: { templateId },
                include: {
                    _count: {
                        select: { Questions: true }
                    }
                },
                orderBy: { order: 'asc' }
            })

            return NextResponse.json({
                sections: sections.map(section => ({
                    id: section.id,
                    title: section.title,
                    description: section.description,
                    order: section.order,
                    weightage: section.weightage,
                    isRequired: section.isRequired,
                    questionCount: section._count.Questions
                }))
            })
        }

        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 })

    } catch (error) {
        console.error('Error in GET /api/vendor:', error)
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

// ============================================================================
// PUT /api/vendor - Update Vendor Profile & Responses
// ============================================================================
export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')

        // UPDATE VENDOR PROFILE
        if (action === 'update-profile') {
            const { vendorId, profileData } = await request.json()

            if (!vendorId) {
                return NextResponse.json({
                    error: 'Vendor ID is required'
                }, { status: 400 })
            }

            const updatedProfile = await prisma.vendorProfile.update({
                where: { vendorId },
                data: {
                    ...profileData,
                    updatedAt: new Date()
                }
            })

            return NextResponse.json({
                success: true,
                message: 'Profile updated successfully',
                profile: updatedProfile
            })
        }

        // UPDATE RESPONSE
        if (action === 'update-response') {
            const { responseId, ...updateData } = await request.json()

            if (!responseId) {
                return NextResponse.json({
                    error: 'Response ID is required'
                }, { status: 400 })
            }

            const updatedResponse = await prisma.vendorResponse.update({
                where: { id: responseId },
                data: {
                    ...updateData,
                    updatedAt: new Date()
                }
            })

            // Update questionnaire progress
            const response = await prisma.vendorResponse.findUnique({
                where: { id: responseId },
                select: { questionnaireId: true }
            })

            if (response) {
                const progress = await calculateQuestionnaireProgress(response.questionnaireId)

                await prisma.vendorQuestionnaire.update({
                    where: { id: response.questionnaireId },
                    data: {
                        answeredQuestions: progress.answeredQuestions,
                        progressPercentage: progress.percentage
                    }
                })
            }

            return NextResponse.json({
                success: true,
                message: 'Response updated successfully',
                response: updatedResponse
            })
        }

        // UPDATE QUESTIONNAIRE STATUS
        if (action === 'update-questionnaire-status') {
            const { questionnaireId, status, vendorId } = await request.json()

            if (!questionnaireId || !status) {
                return NextResponse.json({
                    error: 'Questionnaire ID and status are required'
                }, { status: 400 })
            }

            const questionnaire = await prisma.vendorQuestionnaire.findFirst({
                where: {
                    id: questionnaireId,
                    vendorId: vendorId
                }
            })

            if (!questionnaire) {
                return NextResponse.json({
                    error: 'Questionnaire not found or access denied'
                }, { status: 404 })
            }

            const updateData: any = { status }

            if (status === 'IN_PROGRESS' && !questionnaire.startedAt) {
                updateData.startedAt = new Date()
            }

            if (status === 'SUBMITTED') {
                updateData.submittedAt = new Date()
                updateData.progressPercentage = 100
            }

            const updatedQuestionnaire = await prisma.vendorQuestionnaire.update({
                where: { id: questionnaireId },
                data: updateData
            })

            return NextResponse.json({
                success: true,
                message: `Questionnaire status updated to ${status}`,
                questionnaire: updatedQuestionnaire
            })
        }

        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 })

    } catch (error) {
        console.error('Error in PUT /api/vendor:', error)
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

// ============================================================================
// DELETE /api/vendor - Delete Questions & Sections
// ============================================================================
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')

        // DELETE QUESTION
        if (action === 'delete-question') {
            const { questionId, templateId } = await request.json()

            if (!questionId || !templateId) {
                return NextResponse.json({
                    error: 'Question ID and Template ID are required'
                }, { status: 400 })
            }

            // Get question details before deletion
            const question = await prisma.questionnaireQuestion.findUnique({
                where: { id: questionId },
                include: { Section: true }
            })

            if (!question) {
                return NextResponse.json({
                    error: 'Question not found'
                }, { status: 404 })
            }

            const sectionId = question.sectionId

            // Delete the question
            await prisma.questionnaireQuestion.delete({
                where: { id: questionId }
            })

            // Check if section has any remaining questions
            const remainingQuestions = await prisma.questionnaireQuestion.count({
                where: { sectionId: sectionId }
            })

            // If no questions left in section, delete the section
            if (remainingQuestions === 0) {
                await prisma.questionnaireSection.delete({
                    where: { id: sectionId }
                })
            }

            // Update template's total question count
            const totalQuestions = await prisma.questionnaireQuestion.count({
                where: { templateId: templateId }
            })

            await prisma.questionnaireTemplate.update({
                where: { id: templateId },
                data: { totalQuestions }
            })

            console.log(`✅ Question deleted: ${questionId}`)
            if (remainingQuestions === 0) {
                console.log(`✅ Section auto-deleted: ${question.Section.title}`)
            }

            return NextResponse.json({
                success: true,
                message: 'Question deleted successfully',
                sectionDeleted: remainingQuestions === 0,
                deletedSection: remainingQuestions === 0 ? question.Section.title : null,
                updatedTotalQuestions: totalQuestions
            })
        }

        // DELETE SECTION
        if (action === 'delete-section') {
            const { sectionId, templateId } = await request.json()

            if (!sectionId || !templateId) {
                return NextResponse.json({
                    error: 'Section ID and Template ID are required'
                }, { status: 400 })
            }

            // Get section details
            const section = await prisma.questionnaireSection.findUnique({
                where: { id: sectionId },
                include: { Questions: true }
            })

            if (!section) {
                return NextResponse.json({
                    error: 'Section not found'
                }, { status: 404 })
            }

            // Delete all questions in the section first
            await prisma.questionnaireQuestion.deleteMany({
                where: { sectionId: sectionId }
            })

            // Delete the section
            await prisma.questionnaireSection.delete({
                where: { id: sectionId }
            })

            // Update template's total question count
            const totalQuestions = await prisma.questionnaireQuestion.count({
                where: { templateId: templateId }
            })

            await prisma.questionnaireTemplate.update({
                where: { id: templateId },
                data: { totalQuestions }
            })

            console.log(`✅ Section deleted: ${section.title} (${section.Questions.length} questions)`)

            return NextResponse.json({
                success: true,
                message: `Section "${section.title}" and ${section.Questions.length} questions deleted successfully`,
                deletedQuestions: section.Questions.length,
                updatedTotalQuestions: totalQuestions
            })
        }

        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 })

    } catch (error) {
        console.error('Error in DELETE /api/vendor:', error)
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Calculate questionnaire progress with section breakdown
async function calculateQuestionnaireProgress(questionnaireId: string) {
    const questionnaire = await prisma.vendorQuestionnaire.findUnique({
        where: { id: questionnaireId },
        include: {
            Template: {
                include: {
                    Sections: {
                        include: {
                            Questions: true
                        }
                    }
                }
            },
            Responses: true
        }
    })

    if (!questionnaire) {
        return {
            answeredQuestions: 0,
            totalQuestions: 0,
            percentage: 0,
            sectionProgress: {}
        }
    }

    const totalQuestions = questionnaire.totalQuestions
    const answeredQuestions = questionnaire.Responses.filter(response => {
        // Check if response has valid content
        const hasText = response.responseText && response.responseText.trim() !== ''
        const hasData = response.responseData && Object.keys(response.responseData).length > 0
        return hasText || hasData
    }).length

    // Calculate section-wise progress
    const sectionProgress: any = {}

    questionnaire.Template.Sections.forEach(section => {
        const sectionQuestions = section.Questions.length
        const sectionResponses = questionnaire.Responses.filter(response => {
            const question = section.Questions.find(q => q.id === response.questionId)
            if (!question) return false

            const hasText = response.responseText && response.responseText.trim() !== ''
            const hasData = response.responseData && Object.keys(response.responseData).length > 0
            return hasText || hasData
        }).length

        sectionProgress[section.id] = {
            title: section.title,
            order: section.order,
            answeredQuestions: sectionResponses,
            totalQuestions: sectionQuestions,
            percentage: sectionQuestions > 0 ? Math.round((sectionResponses / sectionQuestions) * 100) : 0
        }
    })

    const percentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0

    return {
        answeredQuestions,
        totalQuestions,
        percentage,
        sectionProgress
    }
}