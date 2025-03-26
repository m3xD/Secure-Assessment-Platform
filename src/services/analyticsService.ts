import { AssessmentPerformance, UserActivity } from "../types/AnalyticTypes";
import { mainApi } from "../utils/AxiosInterceptor";

const analyticsService = {
  /**
   * Returns aggregated analytics on user activity
   * @returns {Promise<UserActivity>} Promise object represents the analytics data
   */
  async getUserActivityAnalytics(): Promise<UserActivity> {
    try {
      const res = await mainApi.get("/analytics/user-activity");
      const userActivitData: UserActivity = res.data;
      return userActivitData;
    } catch (error) {
      throw new Error("Failed to get user activity analytics");
    }
  },

  /**
   * Returns analytics on assessment performance
   * @returns {Promise<AssessmentPerformance>} Promise object represents the analytics data
   */
  async getAssessmentPerformanceAnalytics(): Promise<AssessmentPerformance> {
    try {
      const res = await mainApi.get("/analytics/assessment-performance");
      const assessmentPerformanceData: AssessmentPerformance = res.data;
      return assessmentPerformanceData;
    } catch (error) {
      throw new Error("Failed to get assessment performance");
    }
  },

  /**
   *
   */
};
export default analyticsService;
