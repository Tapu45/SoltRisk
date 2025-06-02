import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get('token')

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 })
        }

        // Find initiation by secure token
        const initiation = await prisma.rifInitiation.findFirst({
            where: {
                secureToken: token,
                tokenExpiry: { gt: new Date() }, // Token not expired
                status: { in: ['ASSIGNED', 'PENDING'] } // Valid statuses
            },
            include: {
                Client: { 
                    include: { 
                        User: { select: { name: true } } 
                    } 
                },
                Vendor: { 
                    include: { 
                        User: { select: { name: true, email: true } } 
                    } 
                }
            }
        })

        if (!initiation) {
            return NextResponse.json({ 
                error: 'Invalid or expired token. Please contact the administrator for a new link.' 
            }, { status: 404 })
        }

        // Update status to PENDING if it was ASSIGNED (user accessed the link)
        if (initiation.status === 'ASSIGNED') {
            await prisma.rifInitiation.update({
                where: { id: initiation.id },
                data: { 
                    status: 'PENDING',
                    updatedAt: new Date()
                }
            })
        }

        // Extract vendor name from section1Data if vendor doesn't exist
        const vendorName = initiation.Vendor?.User?.name ||
                          (Array.isArray(initiation.section1Data)
                            ? initiation.section1Data.find((answer: any) =>
                                answer.value && typeof answer.value === 'string' &&
                                !answer.value.includes('@') &&
                                !answer.value.includes('http') &&
                                answer.value.length > 2
                              )?.valueOf
                            : undefined) ||
                          'Third Party'

        return NextResponse.json({
            initiationId: initiation.id,
            vendorName,
            clientName: initiation.Client?.User?.name,
            assignedBy: initiation.internalUserName,
            dueDate: initiation.dueDate,
            tokenExpiry: initiation.tokenExpiry,
            assignmentComments: initiation.assignmentComments,
            section1Data: initiation.section1Data,
            
            // Pre-populate user details from assignment
            internalUserName: initiation.internalUserName,
            internalUserEmail: initiation.internalUserEmail,
            internalUserDept: initiation.internalUserDept,
            internalUserRole: initiation.internalUserRole
        })

    } catch (error) {
        console.error('Error validating token:', error)
        return NextResponse.json({ 
            error: 'Internal server error' 
        }, { status: 500 })
    }
}