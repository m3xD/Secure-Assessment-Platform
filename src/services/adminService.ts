import { ActivityTimeline, AdminDashboardSummary, SystemStatus } from './../types/AdminServiceTypes';
import axios from "axios";
import { getTokenFromLocalStorage } from "../utils/localStorageUtils";

const API_URL = "https://main-backend-f59ecff5cbde.herokuapp.com";

const adminApi = () => {
    const token = getTokenFromLocalStorage();
    return axios.create({
        baseURL: API_URL,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

const adminService = {
    /**
     * Returns summary statistics for the admin dashboard
     * @returns {Promise<AdminDashboardSummary>} - Admin dashboard summary
     */
    async getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
        try {
            const res = await adminApi().get('/admin/dashboard/summary');
            const AdminDashboardSummaryData: AdminDashboardSummary = res.data;
            console.log(">>> check res getAdminDashboardSummary: ", AdminDashboardSummaryData);
            return AdminDashboardSummaryData;
        } catch (error) {
            throw new Error("Failed to fetch admin dashboard summary");
        }
    },

    /**
     * Returns recent activity for the admin dashboard
     * @returns {Promise<ActivityTimeline>} - Activity timeline
     */
    async getActivityTimeline(): Promise<ActivityTimeline> {
        try {
            const res = await adminApi().get('/admin/dashboard/activity');
            const activityTimelineData: ActivityTimeline = res.data;
            console.log(">>> check res getActivityTimeline: ", activityTimelineData);
            return activityTimelineData;
        } catch (error) {
            throw new Error("Failed to fetch activity timeline");
        }
    },

    /**
     * Returns the current system status
     * @returns {Promise<SystemStatus>} - System status
     */
    async getSystemStatus(): Promise<SystemStatus> {
        try {
            const res = await adminApi().get('/admin/system/status');
            const systemStatusData: SystemStatus = res.data;
            console.log(">>> check res getSystemStatus: ", systemStatusData);
            return systemStatusData;
        } catch (error) {
            throw new Error("Failed to fetch system status");
        }
    }
};
export default adminService;