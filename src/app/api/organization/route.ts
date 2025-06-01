import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { verifyAuth } from '../../../lib/jwt'
import { uploadImage } from '@/service/cloudinary'

const prisma = new PrismaClient()

// Schema for creating an organization
const createOrganizationSchema = z.object({
  name: z.string().min(2, "Organization name is required"),
  managementName: z.string().min(1, "Management name is required"),
  designation: z.string().min(1, "Designation is required"),
  address: z.string().min(1, "Address is required"),
  managementRepresentative: z.string().min(1, "Management representative is required"),
  email: z.string().email("Valid email address is required"),
  mobile: z.string().min(10, "Valid mobile number is required"),
  website: z.string().url("Valid website URL is required").optional().nullable(),
  consultantEnquiry: z.boolean().default(false),
  logo: z.string().optional().nullable()
})

// Schema for updating an organization
const updateOrganizationSchema = createOrganizationSchema.partial()

// GET: Fetch all organizations or a specific organization
export async function GET(request: NextRequest) {
  try {
    // Verify JWT token instead of session
    const auth = await verifyAuth(request)

    // Check if user is authenticated and is an admin
    if (!auth.authenticated || auth.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Unauthorized access", details: auth.error },
        { status: 401 }
      )
    }

    // Get admin information
    const admin = await prisma.admin.findUnique({
      where: { userId: auth.user.id }
    })

    if (!admin) {
      return NextResponse.json(
        { error: "Admin profile not found" },
        { status: 404 }
      )
    }

    // Check if specific organization ID is requested
    const organizationId = request.nextUrl.searchParams.get('id')

    if (organizationId) {
      // Fetch specific organization
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
          branches: true,
          admin: {
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
      })

      if (!organization) {
        return NextResponse.json(
          { error: "Organization not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        organization
      })
    } else {
      // Fetch all organizations (with pagination)
      const page = parseInt(request.nextUrl.searchParams.get('page') || '1')
      const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10')
      const skip = (page - 1) * limit

      const organizations = await prisma.organization.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { branches: true }
          }
        }
      })

      const total = await prisma.organization.count()

      return NextResponse.json({
        success: true,
        organizations,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      })
    }

  } catch (error) {
    console.error("Error fetching organizations:", error)
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 }
    )
  }
}

// POST: Create a new organization
export async function POST(request: NextRequest) {
  try {
    // Verify JWT token instead of session
    const auth = await verifyAuth(request)

    // Check if user is authenticated and is an admin
    if (!auth.authenticated || auth.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Unauthorized access", details: auth.error },
        { status: 401 }
      )
    }

    // Get admin information
    const admin = await prisma.admin.findUnique({
      where: { userId: auth.user.id }
    })

    if (!admin) {
      return NextResponse.json(
        { error: "Admin profile not found" },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()

    const validation = createOrganizationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      )
    }

    // Check if organization with same email already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { email: validation.data.email }
    })

    if (existingOrg) {
      return NextResponse.json(
        { error: "An organization with this email already exists" },
        { status: 409 }
      )
    }

    let logoUrl = null;
    if (validation.data.logo) {
      const uploadResult = await uploadImage(
        validation.data.logo,
        `organizations/logos/${new Date().getTime()}`
      );

      if (!uploadResult.success) {
        return NextResponse.json(
          { error: "Failed to upload logo", details: uploadResult.error },
          { status: 500 }
        );
      }

      logoUrl = uploadResult.url;
    }

    // Create new organization
    const organization = await prisma.organization.create({
      data: {
        id: uuidv4(),
        name: validation.data.name,
        managementName: validation.data.managementName,
        designation: validation.data.designation,
        address: validation.data.address,
        managementRepresentative: validation.data.managementRepresentative,
        email: validation.data.email,
        mobile: validation.data.mobile,
        website: validation.data.website,
        consultantEnquiry: validation.data.consultantEnquiry,
        logo: logoUrl,
        createdBy: admin.id,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: "Organization created successfully",
      organization
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating organization:", error)
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    )
  }
}

// PATCH: Update an existing organization
export async function PATCH(request: NextRequest) {
  try {
    // Verify JWT token instead of session
    const auth = await verifyAuth(request)

    // Check if user is authenticated and is an admin
    if (!auth.authenticated || auth.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Unauthorized access", details: auth.error },
        { status: 401 }
      )
    }

    // Get admin information
    const admin = await prisma.admin.findUnique({
      where: { userId: auth.user.id }
    })

    if (!admin) {
      return NextResponse.json(
        { error: "Admin profile not found" },
        { status: 404 }
      )
    }

    // Get organization ID from query parameters
    const organizationId = request.nextUrl.searchParams.get('id')

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      )
    }

    // Check if organization exists
    const existingOrg = await prisma.organization.findUnique({
      where: { id: organizationId }
    })

    if (!existingOrg) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()

    const validation = updateOrganizationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      )
    }

    // Check if updating email and if it already exists
    if (validation.data.email && validation.data.email !== existingOrg.email) {
      const emailExists = await prisma.organization.findUnique({
        where: { email: validation.data.email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: "An organization with this email already exists" },
          { status: 409 }
        )
      }
    }



    // Update organization
    const updatedOrganization = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        ...validation.data,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: "Organization updated successfully",
      organization: updatedOrganization
    })

  } catch (error) {
    console.error("Error updating organization:", error)
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 }
    )
  }
}

// DELETE: Delete an existing organization
export async function DELETE(request: NextRequest) {
  try {
    // Verify JWT token instead of session
    const auth = await verifyAuth(request)

    // Check if user is authenticated and is an admin
    if (!auth.authenticated || auth.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Unauthorized access", details: auth.error },
        { status: 401 }
      )
    }

    // Get admin information
    const admin = await prisma.admin.findUnique({
      where: { userId: auth.user.id }
    })

    if (!admin) {
      return NextResponse.json(
        { error: "Admin profile not found" },
        { status: 404 }
      )
    }

    // Get organization ID from query parameters
    const organizationId = request.nextUrl.searchParams.get('id')

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      )
    }

    // Check if organization exists
    const existingOrg = await prisma.organization.findUnique({
      where: { id: organizationId }
    })

    if (!existingOrg) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      )
    }

    // Check if the organization has branches
    const branchCount = await prisma.branch.count({
      where: { organizationId }
    })

    if (branchCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete organization with associated branches. Please remove branches first." },
        { status: 400 }
      )
    }

    // Delete organization
    await prisma.organization.delete({
      where: { id: organizationId }
    })

    return NextResponse.json({
      success: true,
      message: "Organization deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting organization:", error)
    return NextResponse.json(
      { error: "Failed to delete organization" },
      { status: 500 }
    )
  }
}