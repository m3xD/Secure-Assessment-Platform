import axios from "axios";
import { getTokenFromLocalStorage } from "../utils/localStorageUtils";
import { AssessmentPerformance, UserActivity } from "../types/AnalyticTypes";

const API_URL = "https://main-backend-f59ecff5cbde.herokuapp.com";

const analyticsApi = () => {
  const token = getTokenFromLocalStorage();
  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const analyticsService = {
  /**
   * Returns aggregated analytics on user activity
   * @returns {Promise<UserActivity>} Promise object represents the analytics data  
   */
  async getUserActivityAnalytics(): Promise<UserActivity> {
    try {
      const res = await analyticsApi().get('/analytics/user-activity');
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
      const res = await analyticsApi().get('/analytics/assessment-performance');
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
