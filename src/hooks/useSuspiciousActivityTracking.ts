import { useCallback, useRef } from "react";
import { SuspiciousActivityType } from "../types/AnalyticTypes";
import { useAuth } from "./useAuth";
import { toast } from "react-toastify";
import analyticsService from "../services/analyticsService";

interface UseSuspiciousActivityTrackingProps {
  attemptId: string | undefined;
  assessmentId: string | undefined;
  onExceedThreshold?: () => void;
  thresholds?: {
    [key in SuspiciousActivityType]?: number;
  };
}

export const useSuspiciousActivityTracking = ({
  attemptId,
  assessmentId,
  onExceedThreshold,
  thresholds = {
    TAB_SWITCHING: 3,
    FACE_NOT_DETECTED: 5,
    MULTIPLE_FACES: 3,
    LOOKING_AWAY: 5,
    SUSPICIOUS_OBJECT: 2,
    VOICE_DETECTED: 3,
  },
}: UseSuspiciousActivityTrackingProps) => {
  const { authState } = useAuth();

  // Counter for tracking times of suspicious activities
  const activityCounters = useRef<{ [key in SuspiciousActivityType]: number }>({
    TAB_SWITCHING: 0,
    FACE_NOT_DETECTED: 0,
    MULTIPLE_FACES: 0,
    LOOKING_AWAY: 0,
    SUSPICIOUS_OBJECT: 0,
    VOICE_DETECTED: 0,
  });

  //   handle suspicious activity
  const trackSuspiciousActivity = useCallback(
    async (type: SuspiciousActivityType, details?: string) => {
      try {
        // increment the counter for the specific activity type
        activityCounters.current[type] += 1;
        const currentCount = activityCounters.current[type];

        // create detail if not provided
        const activityDetails =
          details || `${type} detected ${currentCount} times`;

        // toast for user
        toast.warning(
          `Warning: ${activityDetails}. This activity is being recorded.`
        );

        console.log("assessmentId type:", typeof assessmentId, "value:", assessmentId);
        // log to server
        await analyticsService.logSuspiciousActivity({
          attemptId: String(attemptId || ""),
          assessmentId: String(assessmentId || ""),
          type: type,
          details: activityDetails,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        });

        // check exceeding threshold
        const threshold = thresholds[type];
        if (threshold && currentCount >= threshold && onExceedThreshold) {
          toast.error(
            `Multiple ${type
              .toLowerCase()
              .replace(
                "_",
                " "
              )} activities detected. Your assessment may be submitted automatically.`
          );
          onExceedThreshold();
        }
      } catch (error) {
        console.error(`Error tracking ${type}:`, error);
      }
    },
    [attemptId, assessmentId, authState.user?.id, onExceedThreshold, thresholds]
  );

  //   reset counter for the specific actiivity type
  const resetActivityCounter = useCallback((type: SuspiciousActivityType) => {
    activityCounters.current[type] = 0;
  }, []);

  //   reset all counter
  const resetAllCounters = useCallback(() => {
    Object.keys(activityCounters.current).forEach((key) => {
      activityCounters.current[key as SuspiciousActivityType] = 0;
    });
  }, []);

  return {
    trackSuspiciousActivity,
    resetActivityCounter,
    resetAllCounters,

    // helper for some popular suspicious activity types
    trackTabSwitching: (details?: string) =>
      trackSuspiciousActivity("TAB_SWITCHING", details),
    trackFaceNotDetected: (details?: string) =>
      trackSuspiciousActivity("FACE_NOT_DETECTED", details),
    trackMultipleFaces: (details?: string) =>
      trackSuspiciousActivity("MULTIPLE_FACES", details),
    trackLookingAway: (details?: string) =>
      trackSuspiciousActivity("LOOKING_AWAY", details),
  };
};
