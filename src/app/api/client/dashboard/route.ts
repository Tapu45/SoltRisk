import { prisma } from '@/lib/prisma';
import { RiskLevel, RifStatus, QuestionnaireStatus } from '../../../../generated/prisma';
import { NextRequest, NextResponse } from 'next/server';

interface DashboardMetrics {
  thirdPartyRequestStatus: ThirdPartyRequestStatus;
  vendorCriticalityOverview: VendorCriticalityOverview;
  assessmentStatusByDueDate: AssessmentStatusByDueDate;
  topCriticalVendors: TopCriticalVendor[];
  additionalMetrics: AdditionalMetrics;
}

// 1. Third-Party Request Status API
interface ThirdPartyRequestStatus {
  totalRequests: number;
  inProgress: number;
  completed: number;
  rejected: number;
}

async function getThirdPartyRequestStatus(clientId: string): Promise<ThirdPartyRequestStatus> {
  const requests = await prisma.rifInitiation.groupBy({
    by: ['status'],
    where: {
      clientId: clientId
    },
    _count: {
      id: true
    }
  });

  const statusCounts = requests.reduce((acc, item) => {
    acc[item.status] = item._count.id;
    return acc;
  }, {} as Record<RifStatus, number>);

  return {
    totalRequests: requests.reduce((sum, item) => sum + item._count.id, 0),
    inProgress: (statusCounts.PENDING || 0) + (statusCounts.ASSIGNED || 0),
    completed: statusCounts.COMPLETED || 0,
    rejected: 0 // Add logic for rejected if status exists
  };
}

// 2. Vendor Criticality Overview API
 interface VendorCriticalityOverview {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

 async function getVendorCriticalityOverview(clientId: string): Promise<VendorCriticalityOverview> {
  const riskAssessments = await prisma.riskAssessment.groupBy({
    by: ['riskLevel'],
    where: {
      Submission: {
        Initiation: {
          clientId: clientId
        }
      }
    },
    _count: {
      id: true
    }
  });

  const riskCounts = riskAssessments.reduce((acc, item) => {
    acc[item.riskLevel] = item._count.id;
    return acc;
  }, {} as Record<RiskLevel, number>);

  return {
    critical: riskCounts.HIGH || 0, // Treating HIGH as Critical
    high: riskCounts.HIGH || 0,
    medium: riskCounts.MEDIUM || 0,
    low: riskCounts.LOW || 0
  };
}

// 3. Assessment Status by Due Date API
interface AssessmentStatusByDueDate {
  overdue: number;
  dueSoon: number; // Within next 7 days
  pending: number;
}

async function getAssessmentStatusByDueDate(clientId: string): Promise<AssessmentStatusByDueDate> {
  const today = new Date();
  const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const assessments = await prisma.vendorQuestionnaire.findMany({
    where: {
      Vendor: {
        RifInitiations: {
          some: {
            clientId: clientId
          }
        }
      },
      status: {
        in: [QuestionnaireStatus.NOT_STARTED, QuestionnaireStatus.IN_PROGRESS]
      }
    },
    select: {
      dueDate: true,
      status: true
    }
  });

  let overdue = 0;
  let dueSoon = 0;
  let pending = 0;

  assessments.forEach(assessment => {
    if (assessment.dueDate < today) {
      overdue++;
    } else if (assessment.dueDate <= sevenDaysFromNow) {
      dueSoon++;
    } else {
      pending++;
    }
  });

  return { overdue, dueSoon, pending };
}

// 4. Top Critical Vendors API
interface TopCriticalVendor {
  vendorId: string;
  vendorName: string;
  riskCriticality: RiskLevel;
  contractValue: number | null;
  questionnaireStatus: QuestionnaireStatus;
  companyName: string;
}

async function getTopCriticalVendors(
  clientId: string, 
  limit: number = 10,
  filters?: {
    riskLevel?: RiskLevel;
    contractValue?: number;
    businessFunction?: string;
  }
): Promise<TopCriticalVendor[]> {
  const vendors = await prisma.vendor.findMany({
    where: {
      RifInitiations: {
        some: {
          clientId: clientId,
          RifSubmission: {
            RiskAssessment: {
              riskLevel: filters?.riskLevel || undefined
            }
          }
        }
      }
    },
    include: {
      Profile: true,
      Questionnaires: {
        orderBy: { assignedAt: 'desc' },
        take: 1
      },
      RifInitiations: {
        where: { clientId },
        include: {
          RifSubmission: {
            include: {
              RiskAssessment: true
            }
          }
        }
      }
    },
    take: limit,
    orderBy: {
      createdAt: 'desc'
    }
  });

  return vendors.map(vendor => ({
    vendorId: vendor.id,
    vendorName: vendor.Profile?.companyName || 'Unknown',
    riskCriticality: vendor.RifInitiations[0]?.RifSubmission?.RiskAssessment?.riskLevel || RiskLevel.LOW,
    contractValue: null, // Add contract value field to schema if needed
    questionnaireStatus: vendor.Questionnaires[0]?.status || QuestionnaireStatus.NOT_STARTED,
    companyName: vendor.Profile?.companyName || 'Unknown'
  }));
}

// 5. Additional Metrics API
 interface AdditionalMetrics {
  avgTimeToOnboard: number; // Days
  completionRate: number; // Percentage
  engagementHeatmap: EngagementHeatmapData[];
  riskTrend: RiskTrendData[];
}

 interface EngagementHeatmapData {
  date: string;
  count: number;
  intensity: 'low' | 'medium' | 'high';
}

interface RiskTrendData {
  month: string;
  high: number;
  medium: number;
  low: number;
}

 async function getAdditionalMetrics(clientId: string): Promise<AdditionalMetrics> {
  // Average Time to Onboard
  const completedOnboarding = await prisma.vendorQuestionnaire.findMany({
    where: {
      Vendor: {
        RifInitiations: {
          some: { clientId }
        }
      },
      status: QuestionnaireStatus.APPROVED,
      submittedAt: { not: null }
    },
    select: {
      assignedAt: true,
      submittedAt: true
    }
  });

  const avgTimeToOnboard = completedOnboarding.length > 0 
    ? completedOnboarding.reduce((sum, item) => {
        const days = Math.floor((item.submittedAt!.getTime() - item.assignedAt.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0) / completedOnboarding.length
    : 0;

  // Completion Rate
  const totalAssessments = await prisma.vendorQuestionnaire.count({
    where: {
      Vendor: {
        RifInitiations: {
          some: { clientId }
        }
      }
    }
  });

  const completedAssessments = await prisma.vendorQuestionnaire.count({
    where: {
      Vendor: {
        RifInitiations: {
          some: { clientId }
        }
      },
      status: {
        in: [QuestionnaireStatus.SUBMITTED, QuestionnaireStatus.APPROVED]
      }
    }
  });

  const completionRate = totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0;

  // Engagement Heatmap (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const engagementData = await prisma.vendorQuestionnaire.groupBy({
    by: ['assignedAt'],
    where: {
      Vendor: {
        RifInitiations: {
          some: { clientId }
        }
      },
      assignedAt: {
        gte: thirtyDaysAgo
      }
    },
    _count: {
      id: true
    }
  });

  const engagementHeatmap: EngagementHeatmapData[] = engagementData.map(item => ({
    date: item.assignedAt.toISOString().split('T')[0],
    count: item._count.id,
    intensity: item._count.id > 5 ? 'high' : item._count.id > 2 ? 'medium' : 'low'
  }));

  // Risk Trend (last 6 months)
  const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
  const riskTrendData = await prisma.riskAssessment.findMany({
    where: {
      Submission: {
        Initiation: {
          clientId: clientId
        }
      },
      assessedAt: {
        gte: sixMonthsAgo
      }
    },
    select: {
      riskLevel: true,
      assessedAt: true
    }
  });

  // Group by month and risk level
  const monthlyRiskCounts: Record<string, Record<RiskLevel, number>> = {};
  
  riskTrendData.forEach(item => {
    const month = item.assessedAt.toISOString().substring(0, 7); // YYYY-MM
    if (!monthlyRiskCounts[month]) {
      monthlyRiskCounts[month] = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    }
    monthlyRiskCounts[month][item.riskLevel]++;
  });

  const riskTrend: RiskTrendData[] = Object.entries(monthlyRiskCounts).map(([month, counts]) => ({
    month,
    high: counts.HIGH,
    medium: counts.MEDIUM,
    low: counts.LOW
  }));

  return {
    avgTimeToOnboard: Math.round(avgTimeToOnboard),
    completionRate: Math.round(completionRate * 100) / 100,
    engagementHeatmap,
    riskTrend
  };
}

// Main Dashboard API
 async function getDashboardMetrics(clientId: string): Promise<DashboardMetrics> {
  const [
    thirdPartyRequestStatus,
    vendorCriticalityOverview,
    assessmentStatusByDueDate,
    topCriticalVendors,
    additionalMetrics
  ] = await Promise.all([
    getThirdPartyRequestStatus(clientId),
    getVendorCriticalityOverview(clientId),
    getAssessmentStatusByDueDate(clientId),
    getTopCriticalVendors(clientId),
    getAdditionalMetrics(clientId)
  ]);

  return {
    thirdPartyRequestStatus,
    vendorCriticalityOverview,
    assessmentStatusByDueDate,
    topCriticalVendors,
    additionalMetrics
  };
}

// HTTP Method Handlers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const action = searchParams.get('action');

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Route to specific functions based on action parameter
    switch (action) {
      case 'request-status':
        const requestStatus = await getThirdPartyRequestStatus(clientId);
        return NextResponse.json(requestStatus);
        
      case 'vendor-criticality':
        const vendorCriticality = await getVendorCriticalityOverview(clientId);
        return NextResponse.json(vendorCriticality);
        
      case 'assessment-due-dates':
        const assessmentDueDates = await getAssessmentStatusByDueDate(clientId);
        return NextResponse.json(assessmentDueDates);
        
      case 'critical-vendors':
        const limit = parseInt(searchParams.get('limit') || '10');
        const riskLevel = searchParams.get('riskLevel') as RiskLevel;
        const filters = riskLevel ? { riskLevel } : undefined;
        const criticalVendors = await getTopCriticalVendors(clientId, limit, filters);
        return NextResponse.json(criticalVendors);
        
      case 'additional-metrics':
        const additionalMetrics = await getAdditionalMetrics(clientId);
        return NextResponse.json(additionalMetrics);
        
      default:
        // Return all dashboard metrics by default
        const dashboardMetrics = await getDashboardMetrics(clientId);
        return NextResponse.json(dashboardMetrics);
    }
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, action, ...data } = body;

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Handle POST actions (for future use)
    switch (action) {
      case 'refresh-metrics':
        const refreshedMetrics = await getDashboardMetrics(clientId);
        return NextResponse.json(refreshedMetrics);
        
      case 'update-filters':
        const { filters } = data;
        const filteredVendors = await getTopCriticalVendors(clientId, 10, filters);
        return NextResponse.json(filteredVendors);
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Dashboard POST API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// // API Route Handlers (for internal use)
// export const dashboardRoutes = {
//   // GET /api/client/dashboard?clientId=xxx
//   getMetrics: async (clientId: string) => getDashboardMetrics(clientId),
  
//   // GET /api/client/dashboard?clientId=xxx&action=request-status
//   getRequestStatus: async (clientId: string) => getThirdPartyRequestStatus(clientId),
  
//   // GET /api/client/dashboard?clientId=xxx&action=vendor-criticality
//   getVendorCriticality: async (clientId: string) => getVendorCriticalityOverview(clientId),
  
//   // GET /api/client/dashboard?clientId=xxx&action=assessment-due-dates
//   getAssessmentDueDates: async (clientId: string) => getAssessmentStatusByDueDate(clientId),
  
//   // GET /api/client/dashboard?clientId=xxx&action=critical-vendors
//   getCriticalVendors: async (clientId: string, filters?: any) => getTopCriticalVendors(clientId, 10, filters),
  
//   // GET /api/client/dashboard?clientId=xxx&action=additional-metrics
//   getAdditionalMetrics: async (clientId: string) => getAdditionalMetrics(clientId)
// };