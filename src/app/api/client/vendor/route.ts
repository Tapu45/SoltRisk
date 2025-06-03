import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RiskLevel } from '@/generated/prisma'
import { sendRifAssignmentEmail, sendRifReviewNotificationEmail } from '@/service/email'
import { v4 as uuidv4 } from 'uuid'

// ============================================================================
// GET /api/client/vendor - Get RIF Form Structure
// ============================================================================
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')
        const submissionId = searchParams.get('submissionId')
        const initiationId = searchParams.get('initiationId')

        // Get RIF Form Structure
        if (action === 'form') {
            const form = await prisma.rifForm.findFirst({
                where: { isActive: true },
                include: {
                    Sections: {
                        orderBy: { order: 'asc' },
                        include: {
                            Questions: {
                                orderBy: { order: 'asc' }
                            }
                        }
                    }
                }
            })

            if (!form) {
                return NextResponse.json({ error: 'No active RIF form found' }, { status: 404 })
            }

            return NextResponse.json(form)
        }

        // Get Draft Submission
        if (action === 'draft' && submissionId) {
            const submission = await prisma.rifSubmission.findUnique({
                where: { id: submissionId },
                include: {
                    Answers: {
                        include: {
                            Question: true
                        }
                    },
                    Form: {
                        include: {
                            Sections: {
                                orderBy: { order: 'asc' },
                                include: {
                                    Questions: {
                                        orderBy: { order: 'asc' }
                                    }
                                }
                            }
                        }
                    }
                }
            })

            if (!submission) {
                return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
            }

            return NextResponse.json(submission)
        }

        // Get Risk Assessment Results
        if (action === 'risk-assessment' && submissionId) {
            const riskAssessment = await prisma.riskAssessment.findUnique({
                where: { submissionId },
                include: {
                    Submission: {
                        include: {
                            Initiation: {
                                include: {
                                    Vendor: {
                                        include: {
                                            User: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })

            if (!riskAssessment) {
                return NextResponse.json({ error: 'Risk assessment not found' }, { status: 404 })
            }

            return NextResponse.json(riskAssessment)
        }

        // Check if submission exists for initiation
        if (action === 'check-submission' && initiationId) {
            const submission = await prisma.rifSubmission.findUnique({
                where: { initiationId }
            })

            return NextResponse.json({
                exists: !!submission,
                submissionId: submission?.id || null
            })
        }

        if (action === 'summary' && submissionId) {
            const submission = await prisma.rifSubmission.findUnique({
                where: { id: submissionId },
                include: {
                    Answers: {
                        include: {
                            Question: {
                                include: {
                                    Section: true
                                }
                            }
                        }
                    },
                    Form: {
                        include: {
                            Sections: {
                                orderBy: { order: 'asc' },
                                include: {
                                    Questions: {
                                        orderBy: { order: 'asc' }
                                    }
                                }
                            }
                        }
                    },
                    Initiation: {
                        include: {
                            Vendor: {
                                include: {
                                    User: {
                                        select: {
                                            id: true,
                                            name: true,
                                            email: true,
                                            createdAt: true // Make sure this is selected
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })

            if (!submission) {
                return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
            }

            // Calculate current progress and preliminary risk
            const progress = await calculateProgress(submissionId)
            const preliminaryRisk = await calculatePreliminaryRisk(submission)

            // Group answers by section for better display
            const answersBySection = submission.Answers.reduce((acc: any, answer: any) => {
                const sectionId = answer.Question.sectionId
                const sectionTitle = answer.Question.Section.title

                if (!acc[sectionId]) {
                    acc[sectionId] = {
                        sectionTitle,
                        sectionOrder: answer.Question.Section.order,
                        answers: []
                    }
                }

                acc[sectionId].answers.push({
                    questionId: answer.questionId,
                    questionText: answer.Question.questionText,
                    questionType: answer.Question.questionType,
                    answerValue: answer.answerValue,
                    isRequired: answer.Question.isRequired,
                    points: answer.points
                })

                return acc
            }, {})

            return NextResponse.json({
                submission: {
                    id: submission.id,
                    createdAt: submission.submittedAt,
                    isReviewed: submission.isReviewed,
                    clientComments: submission.clientComments
                },
                vendor: {
                    name: submission.Initiation.Vendor?.User?.name ?? null,
                    email: submission.Initiation.Vendor?.User?.email ?? null
                },
                progress,
                preliminaryRisk,
                answersBySection: Object.values(answersBySection).sort((a: any, b: any) => a.sectionOrder - b.sectionOrder),
                totalSections: submission.Form.Sections.length
            })
        }

        // Validate Submission Completeness
        if (action === 'validate' && submissionId) {
            const validation = await validateSubmission(submissionId)
            return NextResponse.json(validation)
        }

        if (action === 'section1-form') {
            const form = await prisma.rifForm.findFirst({
                where: { isActive: true },
                include: {
                    Sections: {
                        where: { order: 1 }, // Only Section 1
                        include: {
                            Questions: { orderBy: { order: 'asc' } }
                        }
                    }
                }
            })

            if (!form) {
                return NextResponse.json({ error: 'No active form found' }, { status: 404 })
            }

            return NextResponse.json(form)
        }

        // Get Client Admin's Initiated RIFs
        if (action === 'my-initiations') {
            const adminId = searchParams.get('adminId')

            if (!adminId) {
                return NextResponse.json({ error: 'adminId is required' }, { status: 400 })
            }

            const initiations = await prisma.rifInitiation.findMany({
                where: { initiatedBy: adminId },
                include: {
                    Vendor: { include: { User: { select: { name: true, email: true } } } },
                    RifSubmission: {
                        select: {
                            id: true,
                            isReviewed: true,
                            riskLevel: true,
                            approvalStatus: true,
                            submittedBy: true,
                            submittedAt: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })

            return NextResponse.json({ initiations })
        }

        if (action === 'submission-details' && submissionId) {
            const submission = await prisma.rifSubmission.findUnique({
                where: { id: submissionId },
                include: {
                    Answers: {
                        include: {
                            Question: {
                                include: {
                                    Section: true
                                }
                            }
                        }
                    },
                    Form: {
                        include: {
                            Sections: {
                                orderBy: { order: 'asc' },
                                include: {
                                    Questions: {
                                        orderBy: { order: 'asc' }
                                    }
                                }
                            }
                        }
                    },
                    Initiation: {
                        include: {
                            Vendor: {
                                include: {
                                    User: true
                                }
                            }
                        }
                    },
                    RiskAssessment: true
                }
            })

            if (!submission) {
                return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
            }

            // Group answers by section (for sections 2-7)
            const answersBySection = submission.Answers.reduce((acc: any, answer: any) => {
                const sectionId = answer.Question.sectionId
                const sectionTitle = answer.Question.Section.title
                const sectionOrder = answer.Question.Section.order

                if (!acc[sectionId]) {
                    acc[sectionId] = {
                        id: sectionId,
                        title: sectionTitle,
                        order: sectionOrder,
                        answers: []
                    }
                }

                acc[sectionId].answers.push({
                    questionId: answer.questionId,
                    questionText: answer.Question.questionText,
                    questionType: answer.Question.questionType,
                    answerValue: answer.answerValue,
                    points: answer.points,
                    isRequired: answer.Question.isRequired,
                    order: answer.Question.order
                })

                return acc
            }, {})

            // ADD SECTION 1 DATA FROM INITIATION
            const allSections = []

            // Add Section 1 from initiation data
            if (submission.Initiation?.section1Data && Array.isArray(submission.Initiation.section1Data)) {
                const section1 = submission.Form.Sections.find(s => s.order === 1)
                if (section1) {
                    const section1Answers = submission.Initiation.section1Data.map((answer: any, index: number) => {
                        // Try to match with actual questions or create generic structure
                        const question = section1.Questions[index]
                        return {
                            questionId: question?.id || `section1-q-${index}`,
                            questionText: question?.questionText || `Question ${index + 1}`,
                            questionType: question?.questionType || 'TEXT',
                            answerValue: answer.value,
                            points: 0, // Section 1 typically doesn't have risk points
                            isRequired: question?.isRequired || false,
                            order: question?.order || index + 1,
                            completedBy: 'CLIENT_ADMIN' // Mark this as completed by client admin
                        }
                    })

                    allSections.push({
                        id: section1.id,
                        title: section1.title,
                        order: 1,
                        answers: section1Answers,
                        completedBy: 'CLIENT_ADMIN',
                        completedAt: submission.Initiation.section1CompletedAt || submission.Initiation.createdAt
                    })
                }
            }

            // Add sections 2-7 from user answers
            const userSections = Object.values(answersBySection)
                .sort((a: any, b: any) => a.order - b.order)
                .map((section: any) => ({
                    ...section,
                    answers: section.answers.sort((a: any, b: any) => a.order - b.order),
                    completedBy: 'INTERNAL_USER'
                }))

            allSections.push(...userSections)

            // Sort all sections by order
            const sortedSections = allSections.sort((a, b) => a.order - b.order)

            return NextResponse.json({
                submission: {
                    id: submission.id,
                    submittedAt: submission.submittedAt,
                    reviewedAt: submission.reviewedAt,
                    submittedBy: submission.submittedBy,
                    clientComments: submission.clientComments,
                    totalScore: submission.totalScore,
                    riskLevel: submission.riskLevel,
                    isReviewed: submission.isReviewed,
                    approvalStatus: submission.approvalStatus,
                    approvedBy: submission.approvedBy,
                    approvedAt: submission.approvedAt,
                    rejectionReason: submission.rejectionReason,
                    approvalComments: submission.approvalComments
                },
                initiation: {
                    id: submission.Initiation.id,
                    internalUserName: submission.Initiation.internalUserName,
                    internalUserEmail: submission.Initiation.internalUserEmail,
                    internalUserDept: submission.Initiation.internalUserDept,
                    internalUserRole: submission.Initiation.internalUserRole,
                    assignmentComments: submission.Initiation.assignmentComments,
                    dueDate: submission.Initiation.dueDate,
                    section1Data: submission.Initiation.section1Data,
                    section1CompletedAt: submission.Initiation.section1CompletedAt,
                    createdBy: submission.Initiation.initiatedBy // Who created the RIF
                },
                vendor: {
                    name: submission.Initiation.Vendor?.User?.name,
                    email: submission.Initiation.Vendor?.User?.email
                },
                riskAssessment: submission.RiskAssessment,
                sections: sortedSections // This now includes Section 1 + Sections 2-7
            })
        }

        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 })

    } catch (error) {
        console.error('Error in GET /api/client/vendor:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// ============================================================================
// POST /api/client/vendor - Create Draft Submission
// ============================================================================
export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')

        if (action === 'create-draft') {
            const { initiationId } = await request.json()

            // Check if draft already exists
            const existingSubmission = await prisma.rifSubmission.findUnique({
                where: { initiationId }
            })

            if (existingSubmission) {
                return NextResponse.json({
                    error: 'Submission already exists',
                    submissionId: existingSubmission.id
                }, { status: 409 })
            }

            // Validate initiation exists and is valid
            const initiation = await prisma.rifInitiation.findUnique({
                where: {
                    id: initiationId,
                    tokenExpiry: { gt: new Date() },
                    status: 'PENDING'
                }
            })

            if (!initiation) {
                return NextResponse.json({ error: 'Invalid or expired initiation' }, { status: 404 })
            }

            // Get active form
            const form = await prisma.rifForm.findFirst({
                where: { isActive: true }
            })

            if (!form) {
                return NextResponse.json({ error: 'No active form found' }, { status: 404 })
            }

            // Create new draft submission
            const submission = await prisma.rifSubmission.create({
                data: {
                    initiationId,
                    formId: form.id,
                    isReviewed: false
                }
            })

            return NextResponse.json({ submissionId: submission.id })
        }

        if (action === 'submit') {
            const { submissionId, clientComments, submittedBy } = await request.json()

            // Validate submission exists
            const submission = await prisma.rifSubmission.findUnique({
                where: { id: submissionId },
                include: {
                    Answers: {
                        include: {
                            Question: true
                        }
                    },
                   Initiation: {
                        include: {
                            Client: {
                                include: {
                                    User: true  // Get client user details for email
                                }
                            },
                            Vendor: {
                                include: {
                                    User: true
                                }
                            }
                        }
                    }
                }
            })

            if (!submission) {
                return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
            }

            // Calculate risk assessment
            const riskAssessment = await calculateRiskAssessment(submission)

            // Update submission and initiation status
            const updatedSubmission = await prisma.$transaction(async (tx) => {
                // Update submission
                const updated = await tx.rifSubmission.update({
                    where: { id: submissionId },
                    data: {
                        clientComments,
                        submittedBy: submittedBy, // Save submitter name
                        totalScore: riskAssessment.totalScore,
                        riskLevel: riskAssessment.riskLevel,
                        isReviewed: true,
                        reviewedAt: new Date(),
                        approvalStatus: 'PENDING_REVIEW'
                    }
                })

                // Update initiation status
                await tx.rifInitiation.update({
                    where: { id: submission.initiationId },
                    data: {
                        status: 'SUBMITTED'
                    }
                })

                // Create risk assessment record
                await tx.riskAssessment.create({
                    data: {
                        submissionId,
                        totalScore: riskAssessment.totalScore,
                        maxPossibleScore: riskAssessment.maxPossibleScore,
                        riskPercentage: riskAssessment.riskPercentage,
                        riskLevel: riskAssessment.riskLevel,
                        sectionScores: riskAssessment.sectionScores,
                        recommendations: riskAssessment.recommendations
                    }
                })

                return updated
            })

            try {
                const clientUser = submission.Initiation.Client?.User
                const vendorName = submission.Initiation.Vendor?.User?.name || 'Unknown Vendor'
                
                if (clientUser?.email) {
                    await sendRifReviewNotificationEmail({
                        to: clientUser.email,
                        clientName: clientUser.name || 'Client Admin',
                        vendorName: vendorName,
                        submittedBy: submittedBy,
                        submittedAt: updatedSubmission.submittedAt?.toISOString() || new Date().toISOString(),
                        riskLevel: riskAssessment.riskLevel,
                        reviewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/client/result/${submissionId}`,
                        submissionId: submissionId
                    })
                    
                    console.log(`✅ Review notification email sent to: ${clientUser.email}`)
                } else {
                    console.log('⚠️ Client email not found, skipping notification')
                }
            } catch (emailError) {
                console.error('❌ Failed to send review notification email:', emailError)
                // Don't fail the submission if email fails
            }

            return NextResponse.json({
                success: true,
                submissionId,
                riskAssessment,
                approvalStatus: 'PENDING_REVIEW'
            })
        }

        if (action === 'initiate-rif') {
            const { section1Answers, assignment, adminUserId } = await request.json()

            const secureToken = require('crypto').randomBytes(32).toString('hex')
            const tokenExpiry = new Date()
            tokenExpiry.setHours(tokenExpiry.getHours() + 48)

            try {
                const initiation = await prisma.$transaction(async (tx) => {
                    // 1. Get the logged-in admin user (Client) and their info
                    const adminUser = await tx.user.findUnique({
                        where: { id: adminUserId },
                        include: {
                            Client: true  // Use Client directly, not ClientAdmin
                        }
                    })

                    if (!adminUser?.Client) {
                        throw new Error('Admin user not found or not associated with a client')
                    }

                    const clientId = adminUser.Client.id

                    // 2. Extract vendor information from Section 1 answers
                    const getAnswerValue = (searchTerms: string[]) => {
                        return section1Answers.find((answer: { questionId: string; value: { toString: () => string } }) =>
                            searchTerms.some(term =>
                                answer.questionId?.toLowerCase().includes(term.toLowerCase()) ||
                                answer.value?.toString().toLowerCase().includes(term.toLowerCase())
                            )
                        )?.value
                    }

                    // Extract vendor details from section1 answers
                    const vendorName = getAnswerValue(['legal-name', 'company-name', 'vendor-name', 'third-party-name']) ||
                        section1Answers.find((a: { value: string | string[] }) => a.value && typeof a.value === 'string' &&
                            !a.value.includes('@') &&
                            !a.value.includes('http') &&
                            a.value.length > 2)?.value

                    const vendorEmail = getAnswerValue(['email', 'contact-email']) ||
                        section1Answers.find((a: { value: string | string[] }) => a.value && typeof a.value === 'string' &&
                            a.value.includes('@'))?.value

                    const vendorWebsite = getAnswerValue(['website', 'url', 'web']) ||
                        section1Answers.find((a: { value: string | string[] }) => a.value && typeof a.value === 'string' &&
                            (a.value.includes('http') || a.value.includes('www')))?.value

                    const contactPerson = getAnswerValue(['contact-person', 'contact-name', 'representative'])

                    const phoneNumber = getAnswerValue(['phone', 'contact-number', 'telephone']) ||
                        section1Answers.find((a: { value: string }) => a.value && typeof a.value === 'string' &&
                            /[\d\+\-\(\)\s]{8,}/.test(a.value))?.value

                    // 3. Create or find vendor
                    let vendorId = null
                    if (vendorName) {
                        // Check if vendor already exists by name or email
                        let existingVendor = null
                        if (vendorEmail) {
                            existingVendor = await tx.vendor.findFirst({
                                where: {
                                    OR: [
                                        { User: { email: vendorEmail } },
                                        { User: { name: vendorName } }
                                    ]
                                }
                            })
                        }

                        if (existingVendor) {
                            vendorId = existingVendor.id
                        } else {
                            // Create new vendor with extracted information
                            const newVendor = await tx.vendor.create({
                                data: {
                                    id: uuidv4(), // Generate vendor ID
                                    User: {
                                        create: {
                                            id: uuidv4(), // Generate user ID using UUID
                                            name: vendorName,
                                            email: vendorEmail || `vendor-${Date.now()}@temp.com`,
                                            role: 'VENDOR',
                                            password: 'temp-password',
                                            createdAt: new Date(),
                                            updatedAt: new Date()
                                        }
                                    }
                                }
                            })
                            vendorId = newVendor.id
                        }
                    }

                    // 4. Create RIF Initiation with proper relations
                    const newInitiation = await tx.rifInitiation.create({
                        data: {
                            clientId: clientId, // Use actual logged-in client ID
                            vendorId: vendorId || '', // Provide empty string if null since vendorId is required in your schema
                            initiatedBy: adminUserId,
                            internalUserName: assignment.name,
                            internalUserEmail: assignment.email,
                            internalUserDept: assignment.department,
                            internalUserRole: assignment.role,
                            assignmentComments: assignment.comments || '',
                            dueDate: new Date(assignment.dueDate),
                            secureToken,
                            tokenExpiry,
                            status: 'ASSIGNED',
                            section1Data: section1Answers,
                            section1CompletedAt: new Date()
                        }
                    })

                    return {
                        initiation: newInitiation,
                        vendorName,
                        clientName: adminUser.name // Use admin user's name as client name
                    }
                })

                // 5. Get admin name for email
                const admin = await prisma.user.findUnique({
                    where: { id: adminUserId },
                    select: { name: true }
                })

                // 6. Send assignment email
                await sendRifAssignmentEmail({
                    to: assignment.email,
                    internalUserName: assignment.name,
                    vendorName: initiation.vendorName || 'Third Party',
                    assignedBy: admin?.name || 'Client Admin',
                    dueDate: assignment.dueDate,
                    secureToken,
                    comments: assignment.comments,
                    rifUrl: `${process.env.NEXT_PUBLIC_APP_URL}/rif/complete/${secureToken}`
                })

                return NextResponse.json({
                    success: true,
                    initiationId: initiation.initiation.id,
                    message: 'RIF assigned successfully. Email sent to internal user.',
                    vendorCreated: !!initiation.vendorName,
                    clientName: initiation.clientName
                })

            } catch (error) {
                console.error('Error creating RIF initiation:', error)
                return NextResponse.json({
                    error: 'Failed to create RIF initiation',
                    details: error instanceof Error ? error.message : 'Unknown error'
                }, { status: 500 })
            }
        }

        if (action === 'approve-submission') {
            const { submissionId, approvedBy, approvalComments } = await request.json()

            const submission = await prisma.rifSubmission.findUnique({
                where: { id: submissionId },
                include: { Initiation: true }
            })

            if (!submission) {
                return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
            }

            if (!submission.isReviewed) {
                return NextResponse.json({ error: 'Submission must be completed before approval' }, { status: 400 })
            }

            const updatedSubmission = await prisma.rifSubmission.update({
                where: { id: submissionId },
                data: {
                    approvalStatus: 'APPROVED',
                    approvedBy,
                    approvedAt: new Date(),
                    approvalComments
                }
            })

            // Update initiation status
            await prisma.rifInitiation.update({
                where: { id: submission.initiationId },
                data: {
                    status: 'COMPLETED'
                }
            })

            return NextResponse.json({
                success: true,
                message: 'RIF assessment approved successfully',
                submission: updatedSubmission
            })
        }

        if (action === 'reject-submission') {
            const { submissionId, rejectedBy, rejectionReason, approvalComments } = await request.json()

            const submission = await prisma.rifSubmission.findUnique({
                where: { id: submissionId },
                include: { Initiation: true }
            })

            if (!submission) {
                return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
            }

            if (!submission.isReviewed) {
                return NextResponse.json({ error: 'Submission must be completed before rejection' }, { status: 400 })
            }

            const updatedSubmission = await prisma.rifSubmission.update({
                where: { id: submissionId },
                data: {
                    approvalStatus: 'REJECTED',
                    approvedBy: rejectedBy,
                    approvedAt: new Date(),
                    rejectionReason,
                    approvalComments
                }
            })

            // Update initiation status back to PENDING for revision
            await prisma.rifInitiation.update({
                where: { id: submission.initiationId },
                data: {
                    status: 'PENDING'
                }
            })

            return NextResponse.json({
                success: true,
                message: 'RIF assessment rejected. User will be notified.',
                submission: updatedSubmission
            })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (error) {
        console.error('Error in POST /api/client/vendor:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// ============================================================================
// PUT /api/client/vendor - Update Draft Answers (Auto-save)
// ============================================================================
export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')

        if (action === 'save-answers') {
            const { submissionId, answers, sectionId, submittedBy } = await request.json()

            // Validate submission exists
            const submission = await prisma.rifSubmission.findUnique({
                where: { id: submissionId }
            })

            if (!submission) {
                return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
            }

            // Update submission with submitter name (only once)
            if (submittedBy && !submission.submittedBy) {
                await prisma.rifSubmission.update({
                    where: { id: submissionId },
                    data: {
                        submittedBy: submittedBy
                    }
                })
            }

            // Process answers in batch
            const answerPromises = answers.map((answer: any) => {
                const points = calculateAnswerPoints(answer)

                return prisma.rifAnswer.upsert({
                    where: {
                        submissionId_questionId: {
                            submissionId,
                            questionId: answer.questionId
                        }
                    },
                    update: {
                        answerValue: answer.value,
                        points
                    },
                    create: {
                        submissionId,
                        questionId: answer.questionId,
                        answerValue: answer.value,
                        points
                    }
                })
            })

            await Promise.all(answerPromises)

            // Calculate current progress and risk indicators
            const progress = await calculateProgress(submissionId)

            return NextResponse.json({
                success: true,
                progress,
                timestamp: new Date().toISOString()
            })
        }

        if (action === 'edit-section') {
            const { submissionId, sectionId, answers } = await request.json()

            // Validate submission exists
            const submission = await prisma.rifSubmission.findUnique({
                where: { id: submissionId }
            })

            if (!submission) {
                return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
            }

            if (submission.isReviewed) {
                return NextResponse.json({ error: 'Cannot edit reviewed submission' }, { status: 403 })
            }

            // Delete existing answers for this section
            await prisma.rifAnswer.deleteMany({
                where: {
                    submissionId,
                    Question: {
                        sectionId
                    }
                }
            })

            // Add new answers
            const answerPromises = answers.map((answer: any) => {
                const points = calculateAnswerPoints(answer)

                return prisma.rifAnswer.create({
                    data: {
                        submissionId,
                        questionId: answer.questionId,
                        answerValue: answer.value,
                        points
                    }
                })
            })

            await Promise.all(answerPromises)

            // Recalculate progress
            const progress = await calculateProgress(submissionId)

            return NextResponse.json({
                success: true,
                progress,
                message: 'Section updated successfully'
            })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (error) {
        console.error('Error in PUT /api/client/vendor:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Calculate points for an individual answer
function calculateAnswerPoints(answer: any): number {
    if (!answer.questionOptions?.choices) return 0

    const { value, questionOptions } = answer

    // Handle different answer types
    if (Array.isArray(value)) {
        // Multiple choice - sum all selected option scores
        return value.reduce((total: number, selectedValue: string) => {
            const option = questionOptions.choices.find((choice: any) => choice.value === selectedValue)
            return total + (option?.riskScore || option?.controlScore || 0)
        }, 0)
    } else {
        // Single choice or boolean
        const option = questionOptions.choices.find((choice: any) => choice.value === value)
        return option?.riskScore || option?.controlScore || 0
    }
}

// Calculate overall risk assessment
async function calculateRiskAssessment(submission: any) {
    const answers = submission.Answers
    let totalScore = 0
    let maxPossibleScore = 0
    const sectionScores: any = {}

    // Group answers by section
    const answersBySection = answers.reduce((acc: any, answer: any) => {
        const sectionId = answer.Question.sectionId
        if (!acc[sectionId]) acc[sectionId] = []
        acc[sectionId].push(answer)
        return acc
    }, {})

    // Calculate scores per section
    for (const [sectionId, sectionAnswers] of Object.entries(answersBySection)) {
        const answers = sectionAnswers as any[]
        let sectionScore = 0
        let sectionMaxScore = 0

        answers.forEach((answer: any) => {
            const question = answer.Question
            const weightage = question.weightage || 1.0

            // Add weighted points
            sectionScore += (answer.points * weightage)
            sectionMaxScore += (question.maxPoints * weightage)
        })

        sectionScores[sectionId] = {
            score: sectionScore,
            maxScore: sectionMaxScore,
            percentage: sectionMaxScore > 0 ? (sectionScore / sectionMaxScore) * 100 : 0
        }

        totalScore += sectionScore
        maxPossibleScore += sectionMaxScore
    }

    // Calculate overall risk percentage
    const riskPercentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0

    // Determine risk level based on NIST-aligned thresholds
    let riskLevel: RiskLevel
    if (riskPercentage <= 30) {
        riskLevel = 'LOW'
    } else if (riskPercentage <= 70) {
        riskLevel = 'MEDIUM'
    } else {
        riskLevel = 'HIGH'
    }

    // Generate recommendations
    const recommendations = generateRecommendations(riskLevel, sectionScores, riskPercentage)

    return {
        totalScore: Math.round(totalScore),
        maxPossibleScore: Math.round(maxPossibleScore),
        riskPercentage: Math.round(riskPercentage * 100) / 100,
        riskLevel,
        sectionScores,
        recommendations
    }
}

// Generate risk-based recommendations
function generateRecommendations(riskLevel: RiskLevel, sectionScores: any, riskPercentage: number): string {
    const recommendations = []

    if (riskLevel === 'HIGH') {
        recommendations.push('🔴 HIGH RISK: Detailed due diligence required before onboarding')
        recommendations.push('🔍 Enhanced security controls and monitoring needed')
        recommendations.push('📋 Quarterly risk reviews recommended')
    } else if (riskLevel === 'MEDIUM') {
        recommendations.push('🟡 MEDIUM RISK: Standard due diligence with additional controls')
        recommendations.push('📊 Semi-annual risk reviews recommended')
    } else {
        recommendations.push('🟢 LOW RISK: Standard onboarding process acceptable')
        recommendations.push('📅 Annual risk reviews sufficient')
    }

    // Section-specific recommendations
    Object.entries(sectionScores).forEach(([sectionId, scores]: [string, any]) => {
        if (scores.percentage > 80) {
            recommendations.push(`⚠️ Section ${sectionId}: High risk indicators detected`)
        }
    })

    return recommendations.join('\n')
}

async function calculateProgress(submissionId: string) {
    const submission = await prisma.rifSubmission.findUnique({
        where: { id: submissionId },
        include: {
            Answers: true,
            Form: {
                include: {
                    Sections: {
                        include: {
                            Questions: {
                                where: { isRequired: true }
                            }
                        }
                    }
                }
            },
            Initiation: true  // Include initiation to check section1Data
        }
    })

    if (!submission) return { overall: 0, sections: {} }

    // Calculate section-wise progress
    const sectionProgress: any = {}
    let totalRequiredQuestions = 0
    let totalAnsweredQuestions = 0

    submission.Form.Sections.forEach(section => {
        const sectionRequiredQuestions = section.Questions.length

        // Special handling for Section 1 (already completed by admin)
        if (section.order === 1) {
            // Section 1 is always 100% if section1Data exists
            sectionProgress[section.id] = submission.Initiation?.section1Data ? 100 : 0

            // If section1Data exists, count all questions as answered
            if (submission.Initiation?.section1Data) {
                totalRequiredQuestions += sectionRequiredQuestions
                totalAnsweredQuestions += sectionRequiredQuestions
            } else {
                totalRequiredQuestions += sectionRequiredQuestions
                // Don't add to answered if no section1Data
            }
        } else {
            // For other sections, count actual user answers
            const sectionAnsweredQuestions = submission.Answers.filter(answer => {
                const question = section.Questions.find(q => q.id === answer.questionId)
                if (!question) return false

                // Check if answer has valid value
                const value = answer.answerValue
                if (value === null || value === undefined || value === '') return false

                // Parse JSON for arrays and check length
                try {
                    if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
                        const parsed = JSON.parse(value)
                        if (Array.isArray(parsed) && parsed.length === 0) return false
                    }
                } catch (e) {
                    // If not JSON, treat as string
                }

                return true
            }).length

            sectionProgress[section.id] = sectionRequiredQuestions > 0 ?
                Math.round((sectionAnsweredQuestions / sectionRequiredQuestions) * 100) : 100

            totalRequiredQuestions += sectionRequiredQuestions
            totalAnsweredQuestions += sectionAnsweredQuestions
        }
    })

    // Calculate overall progress - cap at 100%
    const overallProgress = totalRequiredQuestions > 0 ?
        Math.min(Math.round((totalAnsweredQuestions / totalRequiredQuestions) * 100), 100) : 0

    return {
        overall: overallProgress,
        sections: sectionProgress,
        totalQuestions: totalRequiredQuestions,
        answeredQuestions: totalAnsweredQuestions
    }
}

async function calculatePreliminaryRisk(submission: any) {
    if (submission.Answers.length === 0) {
        return {
            currentRiskLevel: 'UNKNOWN',
            riskIndicators: [],
            completionRequired: true
        }
    }

    const riskAssessment = await calculateRiskAssessment(submission)

    // Identify high-risk answers
    const highRiskIndicators = submission.Answers
        .filter((answer: any) => answer.points >= 2)
        .map((answer: any) => ({
            question: answer.Question.questionText,
            section: answer.Question.Section.title,
            riskLevel: answer.points >= 3 ? 'HIGH' : 'MEDIUM',
            value: answer.answerValue
        }))

    return {
        currentRiskLevel: riskAssessment.riskLevel,
        riskPercentage: riskAssessment.riskPercentage,
        totalScore: riskAssessment.totalScore,
        maxPossibleScore: riskAssessment.maxPossibleScore,
        riskIndicators: highRiskIndicators,
        sectionScores: riskAssessment.sectionScores,
        completionRequired: false
    }
}

// Validate submission completeness and business rules
async function validateSubmission(submissionId: string) {
    const submission = await prisma.rifSubmission.findUnique({
        where: { id: submissionId },
        include: {
            Answers: {
                include: {
                    Question: true
                }
            },
            Form: {
                include: {
                    Questions: {
                        where: { isRequired: true }
                    }
                }
            }
        }
    })

    if (!submission) {
        return { isValid: false, errors: ['Submission not found'] }
    }

    const errors = []
    const warnings = []

    // Check required questions
    const requiredQuestions = submission.Form.Questions
    const answeredQuestionIds = submission.Answers.map(a => a.questionId)

    const missingRequired = requiredQuestions.filter(q =>
        !answeredQuestionIds.includes(q.id)
    )

    if (missingRequired.length > 0) {
        errors.push(`Missing ${missingRequired.length} required questions`)
        missingRequired.forEach(q => {
            errors.push(`Required: ${q.questionText}`)
        })
    }

    // Business rule validations
    const answers = submission.Answers.reduce((acc: any, answer) => {
        acc[answer.Question.questionText] = answer.answerValue
        return acc
    }, {})

    // Example business rules
    if (answers['Fourth Party Involved?'] === 'Yes' &&
        !answers['Fourth Party Legal Name & Nature of Services']) {
        errors.push('Fourth party details required when fourth party is involved')
    }

    if (answers['Cross-border Data Transfer Involved?'] === 'Yes' &&
        !answers['List Countries (Cross-border)']) {
        errors.push('Countries list required for cross-border transfers')
    }

    if (answers['Known Risks (Operational, Reputational, Breaches)'] === 'Yes' &&
        !answers['Describe Known Risks']) {
        errors.push('Risk description required when known risks exist')
    }

    // High-risk warnings
    const highRiskAnswers = submission.Answers.filter(a => a.points >= 3)
    if (highRiskAnswers.length > 0) {
        warnings.push(`${highRiskAnswers.length} high-risk indicators detected`)
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        requiredQuestionsCount: requiredQuestions.length,
        answeredQuestionsCount: answeredQuestionIds.length,
        completionPercentage: Math.round((answeredQuestionIds.length / requiredQuestions.length) * 100)
    }
}