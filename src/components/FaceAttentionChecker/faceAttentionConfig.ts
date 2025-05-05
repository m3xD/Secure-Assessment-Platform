// import { FaceAttentionConfig } from './detectionUtils'; // Import the interface defined in detectionUtils


// --- Configuration Interface ---
// Define the structure for the configuration values needed by the detection functions
export interface FaceAttentionConfig {
	YAW_THRESHOLD_DEGREES: number;
	PITCH_THRESHOLD_DEGREES: number;
	GAZE_THRESHOLD_RATIO: number;
	ENABLE_GAZE_CHECK: boolean;
	ENABLE_HEAD_POSE_CHECK: boolean;
	YAW_ESTIMATION_MULTIPLIER: number;
	PITCH_ESTIMATION_MULTIPLIER: number;
	MAX_FACES_ALLOWED: number;
	ENABLE_MULTI_FACE_CHECK: boolean;
	// Add other config values if needed by detection logic
	// LOOKING_AWAY_DURATION_MS: number; // Duration logic is handled in the component
	// COOLDOWN_PERIOD_MS: number;      // Cooldown logic is handled in the component
}

// Default configuration values specifically for the detection functions
// based on temp/Face recog JS/client/config.js
export const defaultDetectionConfig: FaceAttentionConfig = {
	// --- Detection thresholds and settings (used by detectionUtils.ts) ---
	YAW_THRESHOLD_DEGREES: 25,      // Max allowed head yaw rotation (left/right turn) in degrees.
	PITCH_THRESHOLD_DEGREES: 20,    // Max allowed head pitch rotation (up/down tilt) in degrees.
	GAZE_THRESHOLD_RATIO: 0.3,      // How far from the center of the eye the iris can deviate (0.0 center, 0.5 edge). Lower is stricter.
	ENABLE_GAZE_CHECK: true,        // Set to true to enable gaze direction checking.
	ENABLE_HEAD_POSE_CHECK: true,   // Set to true to enable head pose (yaw/pitch) checking.
	YAW_ESTIMATION_MULTIPLIER: 50,  // Adjusts sensitivity of yaw estimation. Higher means smaller movements trigger threshold.
	PITCH_ESTIMATION_MULTIPLIER: 60,// Adjusts sensitivity of pitch estimation. Higher means smaller movements trigger threshold.
	MAX_FACES_ALLOWED: 1,           // Maximum number of faces allowed in the frame. Usually 1 for exams.
	ENABLE_MULTI_FACE_CHECK: true,  // Set to true to enable checking for more faces than MAX_FACES_ALLOWED.
};

// --- Component-level settings REMOVED from here ---
// Settings like LOOKING_AWAY_DURATION_MS, COOLDOWN_PERIOD_MS, VIDEO_WIDTH, VIDEO_HEIGHT,
// and API endpoints should be managed within the FaceAttentionChecker component itself
// or passed to it via props/context. They are not part of the core detection logic config.