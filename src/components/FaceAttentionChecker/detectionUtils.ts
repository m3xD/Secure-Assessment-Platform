/* eslint-disable @typescript-eslint/no-unused-vars */
import { NormalizedLandmarkList } from '@mediapipe/face_mesh';
import { FaceAttentionConfig } from './faceAttentionConfig';


// Define possible violation reasons
export type ViolationReason = 'head_yaw' | 'head_pitch' | 'gaze_direction' | 'multiple_faces';

/**
 * Analyzes face landmarks for immediate head pose and gaze direction violations.
 * Does NOT handle duration checks - that should be done in the calling component.
 * @param landmarks - Array of landmark objects from MediaPipe Face Mesh.
 * @param config - Configuration object with thresholds and flags.
 * @returns {ViolationReason | null} The reason for the *immediate* violation, or null if none.
 */
export function checkAttentionAndGaze(
	landmarks: NormalizedLandmarkList,
	config: FaceAttentionConfig
): ViolationReason | null {
	let headPoseViolation = false;
	let gazeViolation = false;
	let reason: ViolationReason | null = null;

	// Basic visibility check for essential landmarks
	const noseTip = landmarks[1];
	const leftEyeInner = landmarks[133];
	const rightEyeInner = landmarks[362];
	const chin = landmarks[152];
	const foreheadCenter = landmarks[10]; // Used for pitch estimation

	// Check visibility - adjust threshold as needed
	const visibilityThreshold = 0.5;
	if (!noseTip || !leftEyeInner || !rightEyeInner || !chin || !foreheadCenter ||
		(leftEyeInner.visibility != null && leftEyeInner.visibility < visibilityThreshold) ||
		(rightEyeInner.visibility != null && rightEyeInner.visibility < visibilityThreshold) ||
		(noseTip.visibility != null && noseTip.visibility < visibilityThreshold) ||
		(chin.visibility != null && chin.visibility < visibilityThreshold) ||
		(foreheadCenter.visibility != null && foreheadCenter.visibility < visibilityThreshold)) {
		// console.warn(">>> DEBUG: Insufficient landmark visibility for pose/gaze check.");
		return null; // Not enough data or low confidence
	}

	// --- 1. Estimate Head Pose ---
	if (config.ENABLE_HEAD_POSE_CHECK) {
		const eyeMidPointX = (leftEyeInner.x + rightEyeInner.x) / 2;
		const eyeMidPointY = (leftEyeInner.y + rightEyeInner.y) / 2;
		const horizontalDiff = noseTip.x - eyeMidPointX;
		const eyeDistance = Math.abs(leftEyeInner.x - rightEyeInner.x);

		// Avoid division by zero or near-zero
		if (eyeDistance > 0.01) {
			const yawRatio = horizontalDiff / eyeDistance;
			// Apply multiplier from config
			const estimatedYaw = yawRatio * config.YAW_ESTIMATION_MULTIPLIER;
			if (Math.abs(estimatedYaw) > config.YAW_THRESHOLD_DEGREES) {
				headPoseViolation = true;
				reason = "head_yaw";
			}
		}

		const verticalDiff = noseTip.y - eyeMidPointY;
		const faceHeight = Math.abs(foreheadCenter.y - chin.y); // Use forehead and chin for height
		// Avoid division by zero or near-zero
		if (faceHeight > 0.01) {
			const pitchRatio = verticalDiff / faceHeight;
			// Apply multiplier from config
			const estimatedPitch = pitchRatio * config.PITCH_ESTIMATION_MULTIPLIER;
			if (Math.abs(estimatedPitch) > config.PITCH_THRESHOLD_DEGREES) {
				headPoseViolation = true;
				// Keep yaw reason if already set, otherwise set pitch reason
				reason = reason || "head_pitch";
			}
		}
	}

	// --- 2. Estimate Gaze Direction ---
	// Option to check gaze even if head pose violation is already detected
	const checkGazeRegardlessOfHeadPose = true;

	if (config.ENABLE_GAZE_CHECK && (!headPoseViolation || checkGazeRegardlessOfHeadPose)) {
		// Iris landmarks (indices 473-477 for left, 468-472 for right)
		// Using center points: 473 (left iris center), 468 (right iris center)
		const leftIrisCenter = landmarks[473];
		const rightIrisCenter = landmarks[468];
		// Eye corners
		const leftEyeOuterCorner = landmarks[33];  // Far left corner
		const leftEyeInnerCorner = landmarks[133]; // Inner corner (near nose)
		const rightEyeOuterCorner = landmarks[263]; // Far right corner
		const rightEyeInnerCorner = landmarks[362]; // Inner corner (near nose)

		// Check visibility of gaze landmarks
		if (leftIrisCenter && leftEyeOuterCorner && leftEyeInnerCorner && rightIrisCenter && rightEyeOuterCorner && rightEyeInnerCorner &&
			(leftIrisCenter.visibility != null && leftIrisCenter.visibility > visibilityThreshold) &&
			(leftEyeOuterCorner.visibility != null && leftEyeOuterCorner.visibility > visibilityThreshold) &&
			(leftEyeInnerCorner.visibility != null && leftEyeInnerCorner.visibility > visibilityThreshold) &&
			(rightIrisCenter.visibility != null && rightIrisCenter.visibility > visibilityThreshold) &&
			(rightEyeOuterCorner.visibility != null && rightEyeOuterCorner.visibility > visibilityThreshold) &&
			(rightEyeInnerCorner.visibility != null && rightEyeInnerCorner.visibility > visibilityThreshold)) {
			// Calculate horizontal eye width (use absolute value)
			const leftEyeWidth = Math.abs(leftEyeOuterCorner.x - leftEyeInnerCorner.x);
			const rightEyeWidth = Math.abs(rightEyeOuterCorner.x - rightEyeInnerCorner.x);

			// Avoid division by zero or near-zero
			if (leftEyeWidth > 0.005 && rightEyeWidth > 0.005) { // Use a smaller threshold for eye width
				// Calculate iris position relative to the *inner* corner (landmark closer to 0)
				// Ensure correct calculation regardless of head orientation
				const leftIrisPosRelative = leftIrisCenter.x - Math.min(leftEyeOuterCorner.x, leftEyeInnerCorner.x);
				const rightIrisPosRelative = rightIrisCenter.x - Math.min(rightEyeOuterCorner.x, rightEyeInnerCorner.x);

				// Normalize iris position relative to eye width
				const leftIrisRatio = leftIrisPosRelative / leftEyeWidth;
				const rightIrisRatio = rightIrisPosRelative / rightEyeWidth;

				// Check if gaze is outside the allowed central ratio
				const lowerBound = config.GAZE_THRESHOLD_RATIO;
				const upperBound = 1.0 - config.GAZE_THRESHOLD_RATIO;

				if (leftIrisRatio < lowerBound || leftIrisRatio > upperBound ||
					rightIrisRatio < lowerBound || rightIrisRatio > upperBound) {
					gazeViolation = true;
					// Only set reason if head pose didn't already set one,
					// OR if we are checking gaze independently anyway.
					if (!reason || checkGazeRegardlessOfHeadPose) {
						reason = "gaze_direction";
					}
				}
			}
		} else {
			// console.warn(">>> DEBUG: Insufficient landmark visibility for gaze check.");
		}
	}

	// Return the first detected reason (head pose takes precedence unless gaze is checked independently)
	return reason; // This is the *immediate* violation reason
}


/**
 * Checks for multi-face violation based on the count.
 * Does NOT handle duration checks.
 * @param {number} faceCount - Number of faces detected.
 * @param {FaceAttentionConfig} config - Configuration object.
 * @returns {ViolationReason | null} "multiple_faces" if violation, else null.
 */
export function checkMultiFace(
	faceCount: number,
	config: FaceAttentionConfig
): ViolationReason | null {
	if (config.ENABLE_MULTI_FACE_CHECK && faceCount > config.MAX_FACES_ALLOWED) {
		// console.warn(`>>> DEBUG: Multiple faces detected! Count: ${faceCount}`);
		return "multiple_faces";
	}
	return null;
}

// --- Removed State Variables ---
// let lookingAwayStartTime = 0;
// let isCurrentlyLookingAway = false;
// let multiFaceDetectedTime = 0;
// let isCurrentlyMultiFace = false;

// --- Removed resetViolationState ---
// State should be reset within the component that manages it.
// export function resetViolationState() { ... }