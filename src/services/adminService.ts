/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ActivityTimeline,
  AdminDashboardSummary,
  Answer,
  StudentAttemptHistory,
  StudentAttemptHistoryDetails,
  SystemStatus,
} from "./../types/AdminServiceTypes";

import { mainApi } from "../utils/AxiosInterceptor";
import { LogSuspiciousActivity } from "../types/AnalyticTypes";

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

  /**
   * Grade a student's assessment attempt
   * @param {string} attemptId - Attempt ID
   * @param {string} feedback - Feedback for the attempt
   * @param {number} score - Score for the attempt
   * @param {Answer[]} answers - Answers for the attempt
   * @returns {Promise<any>} - Result of the update attempt
   */
  async gradeAttempt(
    attemptId: string,
    feedback?: string,
    score?: number,
    answers?: Answer[]
  ): Promise<any> {
    try {
      const reqData: any = {};
      if (feedback !== undefined) reqData.feedback = feedback;
      if (score !== undefined) reqData.score = score;
      if (answers !== undefined) reqData.answers = answers;

      console.log(">>> check reqData: ", reqData);

      const res = await mainApi.post(
        `/admin/attempt/grade/${attemptId}`,
        reqData
      );
      console.log(">>> check res gradeAttempt: ", res);
      return res.data;
    } catch (error) {
      throw new Error("Failed to update attempt");
    }
  },

  /**
   * List all suspicious action of a specific user in a specific assessment
   * @param {string} userId - User ID
   * @param {string} attemptId - Attempt ID
   * @return {Promise<LogSuspiciousActivity[]>} - List of suspicious actions
   */
  async getSuspiciousActOfUserInAttempt(
    userId: string,
    attemptId: string
  ): Promise<LogSuspiciousActivity[]> {
    try {
      const res = await mainApi.get(
        `/admin/activity/${userId}/${attemptId}`
      );
      const suspiciousActions: LogSuspiciousActivity[] = res.data.content;
      return suspiciousActions;
    } catch (error) {
      throw new Error(
        "Failed to fetch suspicious actions of user in assessment"
      );
    }
  },
};
export default adminService;
