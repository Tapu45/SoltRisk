import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ============================================================================
// GET /api/vendor/verify/[token] - Verify Invitation Token
// ============================================================================
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params

        if (!token) {
            return NextResponse.json({ 
                error: 'Token is required' 
            }, { status: 400 })
        }

        console.log('Looking for invitation with token:', token)

        // 1. Find invitation by token
        const invitation = await prisma.vendorInvitation.findUnique({
            where: { inviteToken: token },
            include: {
                template: {
                    include: {
                        Questions: true // Include questions to count them
                    }
                },
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
        })

        console.log('Found invitation:', invitation ? 'Yes' : 'No')

        if (!invitation) {
            return NextResponse.json({ 
                error: 'Invalid invitation token',
                code: 'INVALID_TOKEN'
            }, { status: 404 })
        }

        // 2. Check if invitation has expired
        if (invitation.expiresAt < new Date()) {
            return NextResponse.json({ 
                error: 'Invitation has expired',
                code: 'EXPIRED_TOKEN',
                expiredAt: invitation.expiresAt
            }, { status: 410 })
        }

        // 3. Check invitation status
        if (invitation.status === 'CANCELLED') {
            return NextResponse.json({ 
                error: 'Invitation has been cancelled',
                code: 'CANCELLED_INVITATION'
            }, { status: 410 })
        }

        // 4. Calculate question count and estimated time
        const totalQuestions = invitation.template?.Questions?.length || 20
        const estimatedMinutes = Math.max(Math.ceil(totalQuestions * 2), 15)
        const estimatedTime = `${estimatedMinutes} minutes`

        // 5. Return invitation details matching frontend expectations
        const response = {
            success: true,
            // Main fields expected by frontend
            id: invitation.id,
            vendorName: invitation.vendorName,
            vendorEmail: invitation.vendorEmail,
            templateName: invitation.template?.name || 'Security Assessment',
            riskLevel: invitation.riskLevel,
            clientName: invitation.rifSubmission.Initiation.Client?.User?.name || 'Client',
            expiresAt: invitation.expiresAt.toISOString(),
            totalQuestions,
            estimatedTime,
            
            // Additional nested objects
            invitation: {
                id: invitation.id,
                vendorEmail: invitation.vendorEmail,
                vendorName: invitation.vendorName,
                riskLevel: invitation.riskLevel,
                expiresAt: invitation.expiresAt
            },
            client: {
                name: invitation.rifSubmission.Initiation.Client?.User?.name,
                email: invitation.rifSubmission.Initiation.Client?.User?.email
            },
            template: {
                id: invitation.template?.id,
                name: invitation.template?.name,
                riskLevel: invitation.template?.riskLevel,
                description: invitation.template?.description
            },
            riskAssessment: {
                riskLevel: invitation.rifSubmission.RiskAssessment?.riskLevel,
                totalScore: invitation.rifSubmission.RiskAssessment?.totalScore
            },
            message: 'Please complete your vendor profile to start the questionnaire.'
        }

        console.log('Returning response:', JSON.stringify(response, null, 2))
        return NextResponse.json(response)

    } catch (error) {
        console.error('Error in GET /api/vendor/verify/[token]:', error)
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}