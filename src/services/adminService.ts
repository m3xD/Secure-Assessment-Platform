import {
  ActivityTimeline,
  AdminDashboardSummary,
  StudentAttemptHistory,
  StudentAttemptHistoryDetails,
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

  /**
   * Returns the attempts list of a specific assessment for a specific user
   * @param {string} assessmentId - Assessment ID
   * @param {string} userId - User ID
   * @returns {Promise<StudentAttemptHistory[]>} - List of attempts
   */
  async getStudentAttemptHistory(
    assessmentId: string,
    userId: string
  ): Promise<StudentAttemptHistory[]> {
    try {
      const res = await mainApi.get(
        `/admin/attempts/${assessmentId}/users/${userId}`
      );
      const studentAttemptHistory: StudentAttemptHistory[] = res.data.content;
      return studentAttemptHistory;
    } catch (error) {
      throw new Error("Failed to fetch student attempt history");
    }
  },

  /**
   * Returns the details of a specific attempt
   * @param {string} attemptId - Attempt ID
   * @param {string} userId - User ID
   * @returns {Promise<StudentAttemptHistoryDetails>} - Attempt details
   */
  async getStudentAttemptHistoryDetails(
    attemptId: string,
    userId: string
  ): Promise<StudentAttemptHistoryDetails> {
    try {
      const res = await mainApi.get(
        `/admin/attempt/${attemptId}/users/${userId}`
      );
      const studentAttemptHistoryDetails: StudentAttemptHistoryDetails =
        res.data;
      return studentAttemptHistoryDetails;
    } catch (error) {
      throw new Error("Failed to fetch student attempt history details");
    }
  },
};
export default adminService;
