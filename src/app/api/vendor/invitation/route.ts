import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVendorQuestionnaireInvitation } from '@/service/email'
import crypto from 'crypto'

// ============================================================================
// POST /api/vendor/invitation - Send Questionnaire Invitation
// ============================================================================
export async function POST(request: NextRequest) {
    try {
        const { rifSubmissionId, clientId } = await request.json()
         console.log('Received data:', { rifSubmissionId, clientId }) // Debug log

        if (!rifSubmissionId || !clientId) {
            return NextResponse.json({ 
                error: 'RIF Submission ID and Client ID are required' 
            }, { status: 400 })
        }

        // 1. Get RIF submission with risk assessment
        const rifSubmission = await prisma.rifSubmission.findUnique({
            where: { id: rifSubmissionId },
            include: {
                Initiation: {
                    include: {
                        Vendor: {
                            include: {
                                User: true
                            }
                        },
                        Client: {
                            include: {
                                User: true
                            }
                        }
                    }
                },
                RiskAssessment: true
            }
        })

        if (!rifSubmission) {
            return NextResponse.json({ error: 'RIF submission not found' }, { status: 404 })
        }

        if (!rifSubmission.RiskAssessment) {
            return NextResponse.json({ 
                error: 'Risk assessment not completed yet' 
            }, { status: 400 })
        }

        if (rifSubmission.approvalStatus !== 'APPROVED') {
            return NextResponse.json({ 
                error: 'RIF must be approved before sending questionnaire' 
            }, { status: 400 })
        }

        // 2. Check if invitation already exists
        const existingInvitation = await prisma.vendorInvitation.findUnique({
            where: { rifSubmissionId }
        })

        if (existingInvitation) {
            return NextResponse.json({ 
                error: 'Invitation already sent for this RIF submission',
                invitationId: existingInvitation.id,
                status: existingInvitation.status
            }, { status: 409 })
        }

        // 3. Get questionnaire template based on risk level
        const template = await prisma.questionnaireTemplate.findFirst({
            where: {
                riskLevel: rifSubmission.RiskAssessment.riskLevel,
                isActive: true
            }
        })

        if (!template) {
            return NextResponse.json({ 
                error: `No active template found for ${rifSubmission.RiskAssessment.riskLevel} risk level` 
            }, { status: 404 })
        }

        // 4. Generate secure invitation token
        const inviteToken = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 14) // 14 days expiry

        // 5. Create vendor invitation
        const invitation = await prisma.vendorInvitation.create({
            data: {
                rifSubmissionId,
                clientId,
                vendorEmail: rifSubmission.Initiation.Vendor?.User?.email || '',
                vendorName: rifSubmission.Initiation.Vendor?.User?.name || '',
                inviteToken,
                riskLevel: rifSubmission.RiskAssessment.riskLevel,
                templateId: template.id,
                expiresAt,
                status: 'PENDING'
            }
        })

        // 6. Send invitation email
        try {
            await sendVendorQuestionnaireInvitation({
                to: invitation.vendorEmail,
                vendorName: invitation.vendorName || '',
                clientName: rifSubmission.Initiation.Client?.User?.name || 'Client',
                riskLevel: invitation.riskLevel,
                templateName: template.name,
                dueDate: expiresAt.toISOString(),
                registrationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/vendor/register/${invitation.inviteToken}`
            })

            // Update invitation status to SENT
            await prisma.vendorInvitation.update({
                where: { id: invitation.id },
                data: { 
                    status: 'SENT',
                    sentAt: new Date()
                }
            })

            console.log(`✅ Questionnaire invitation sent to: ${invitation.vendorEmail}`)

        } catch (emailError) {
            console.error('❌ Failed to send invitation email:', emailError)
            
            // Delete the invitation if email fails
            await prisma.vendorInvitation.delete({
                where: { id: invitation.id }
            })

            return NextResponse.json({ 
                error: 'Failed to send invitation email' 
            }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Questionnaire invitation sent successfully',
            invitationId: invitation.id,
            vendorEmail: invitation.vendorEmail,
            riskLevel: invitation.riskLevel,
            templateName: template.name,
            expiresAt: invitation.expiresAt
        })

    } catch (error) {
        console.error('Error in POST /api/vendor/invitation:', error)
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

// ============================================================================
// GET /api/vendor/invitation - Get Invitation Details
// ============================================================================
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')
        const clientId = searchParams.get('clientId')
        const invitationId = searchParams.get('invitationId')

        // Get all invitations for client dashboard
        if (action === 'list' && clientId) {
            const invitations = await prisma.vendorInvitation.findMany({
                where: { clientId },
                include: {
                    template: {
                        select: {
                            name: true,
                            riskLevel: true
                        }
                    },
                    rifSubmission: {
                        include: {
                            Initiation: {
                                include: {
                                    Vendor: {
                                        include: {
                                            User: {
                                                select: {
                                                    name: true,
                                                    email: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    questionnaire: {
                        select: {
                            id: true,
                            status: true,
                            progressPercentage: true,
                            submittedAt: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })

            return NextResponse.json({ invitations })
        }

        // Get specific invitation details
        if (action === 'details' && invitationId) {
            const invitation = await prisma.vendorInvitation.findUnique({
                where: { id: invitationId },
                include: {
                    template: true,
                    rifSubmission: {
                        include: {
                            RiskAssessment: true,
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
                    },
                    questionnaire: {
                        include: {
                            Responses: {
                                include: {
                                    Question: true
                                }
                            }
                        }
                    }
                }
            })

            if (!invitation) {
                return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
            }

            return NextResponse.json({ invitation })
        }

        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 })

    } catch (error) {
        console.error('Error in GET /api/vendor/invitation:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// ============================================================================
// PUT /api/vendor/invitation - Update Invitation
// ============================================================================
export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')

        if (action === 'resend') {
            const { invitationId } = await request.json()

            const invitation = await prisma.vendorInvitation.findUnique({
                where: { id: invitationId },
                include: {
                    template: true,
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
            })

            if (!invitation) {
                return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
            }

            if (invitation.status === 'ACCEPTED') {
                return NextResponse.json({ 
                    error: 'Cannot resend accepted invitation' 
                }, { status: 400 })
            }

            // Extend expiry date
            const newExpiresAt = new Date()
            newExpiresAt.setDate(newExpiresAt.getDate() + 14)

            // Resend email
            await sendVendorQuestionnaireInvitation({
                to: invitation.vendorEmail,
                vendorName: invitation.vendorName || '',
                clientName: invitation.rifSubmission.Initiation.Client?.User?.name || 'Client',
                riskLevel: invitation.riskLevel,
                templateName: invitation.template?.name || '',
                dueDate: newExpiresAt.toISOString(),
                registrationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/vendor/register/${invitation.inviteToken}`
            })

            // Update invitation
            const updatedInvitation = await prisma.vendorInvitation.update({
                where: { id: invitationId },
                data: {
                    status: 'SENT',
                    sentAt: new Date(),
                    expiresAt: newExpiresAt
                }
            })

            return NextResponse.json({
                success: true,
                message: 'Invitation resent successfully',
                invitation: updatedInvitation
            })
        }

        if (action === 'cancel') {
            const { invitationId } = await request.json()

            const updatedInvitation = await prisma.vendorInvitation.update({
                where: { id: invitationId },
                data: { status: 'CANCELLED' }
            })

            return NextResponse.json({
                success: true,
                message: 'Invitation cancelled successfully',
                invitation: updatedInvitation
            })
        }

        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 })

    } catch (error) {
        console.error('Error in PUT /api/vendor/invitation:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}