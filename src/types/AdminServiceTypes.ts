export interface UsersSummary {
    total: number;
    active: number;
    inactive: number;
    newThisWeek: number;
}

export interface AssessmentsSummary {
    total: number;
    active: number;
    draft: number;
    expired: number;
    newThisWeek: number;
}

export interface ActivitySummary {
    assessmentAttempts: {
        total: number;
        thisWeek: number;
        passRate: number,
    },
    usersOnline: number;
    recentSuspiciousActivity: number;
}

export interface AdminDashboardSummary {
    users: UsersSummary;
    assessments: AssessmentsSummary;
    activity: ActivitySummary;
}

/* -------------------------------------------- */

export interface TimelineDetails {
    id: string;
    type: string;
    user: string;
    userId: string;
    assessment: string;
    assessmentId: string;
    result: {
        score: number;
        status: string;
    };
    details: string;
    timestamp: string;
}

export interface ActivityTimeline {
    timeline: TimelineDetails[];
}

/* -------------------------------------------- */ 

export interface SystemStatus {
    status: 'healthy' | 'degraded' | 'down';
    services: {
        database: string;
        storage: string;
        webcam: string;
        ai: string;
    };
    statistics: {
        uptime: string;
        activeConnections: number;
        averageResponseTime: number;
        cpuUsage: number;
        memoryUsage: number;
    };
    lastChecked: string;
}