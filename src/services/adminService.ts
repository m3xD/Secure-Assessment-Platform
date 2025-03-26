import {
  ActivityTimeline,
  AdminDashboardSummary,
  SystemStatus,
} from "./../types/AdminServiceTypes";

import { mainApi } from "../utils/AxiosInterceptor";

const adminService = {
  /**
   * Returns summary statistics for the admin dashboard
   * @returns {Promise<AdminDashboardSummary>} - Admin dashboard summary
   */
  async getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
    try {
      const res = await mainApi.get("/admin/dashboard/summary");
      const AdminDashboardSummaryData: AdminDashboardSummary = res.data;
      console.log(
        ">>> check res getAdminDashboardSummary: ",
        AdminDashboardSummaryData
      );
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
      const res = await mainApi.get("/admin/dashboard/activity");
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
      const res = await mainApi.get("/admin/system/status");
      const systemStatusData: SystemStatus = res.data;
      console.log(">>> check res getSystemStatus: ", systemStatusData);
      return systemStatusData;
    } catch (error) {
      throw new Error("Failed to fetch system status");
    }
  },
};
export default adminService;
