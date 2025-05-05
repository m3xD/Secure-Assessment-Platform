/* eslint-disable @typescript-eslint/no-unused-vars */
import * as cam from '@mediapipe/camera_utils';
import { FaceMesh, Results as FaceMeshResults, NormalizedLandmarkList } from '@mediapipe/face_mesh';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import studentService from '../../services/studentService';
import { WebcamEvent } from '../../types/StudentServiceTypes';
import { checkAttentionAndGaze, checkMultiFace, ViolationReason } from './detectionUtils';
import { defaultDetectionConfig } from './faceAttentionConfig';

// --- Component-Level Configuration ---
const LOOKING_AWAY_DURATION_MS = 3000; // Minimum duration (ms) a violation must persist before triggering proof capture.
const COOLDOWN_PERIOD_MS = 10000;     // Minimum time (ms) between consecutive proof submissions to prevent spamming.

/**
 * Props for the FaceAttentionChecker component.
 */
interface FaceAttentionCheckerProps {
	/** The unique identifier for the current assessment attempt. */
	attemptId: string;
	/** Optional callback function triggered when a violation proof is successfully captured and sent. */
	onViolationDetected?: (reason: ViolationReason, imageDataUrl: string) => void;
}

/**
 * Translates internal violation reasons (e.g., 'head_yaw') into standardized
 * event types expected by the backend API (e.g., 'LOOKING_AWAY').
 * @param reason The internal violation reason detected.
 * @returns The corresponding API event type string, or null if the reason is unknown.
 */
const mapReasonToEventType = (reason: ViolationReason): WebcamEvent['eventType'] | null => {
	switch (reason) {
		case 'head_yaw':
		case 'head_pitch':
		case 'gaze_direction':
			return "LOOKING_AWAY";
		case 'multiple_faces':
			return "MULTIPLE_FACES";
		case 'no_face':
			return "FACE_NOT_DETECTED";
		default:
			console.warn("Unknown violation reason:", reason);
			return null;
	}
};

/**
 * A component that uses the webcam and MediaPipe Face Mesh to monitor user attention
 * during an assessment. It detects violations like looking away or multiple faces,
 * captures image proof, and sends it to the backend API.
 */
const FaceAttentionChecker: React.FC<FaceAttentionCheckerProps> = ({ attemptId, onViolationDetected }) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const faceMeshRef = useRef<FaceMesh | null>(null);
	const cameraRef = useRef<cam.Camera | null>(null);

	// --- State ---
	/** Current status message displayed to the user (e.g., 'Initializing...', 'Attention OK', 'Violation: head_yaw'). */
	const [status, setStatus] = useState<string>('Initializing...');
	/** The type of violation currently being tracked (null if none). */
	const [currentViolation, setCurrentViolation] = useState<ViolationReason | null>(null);
	/** Timestamp (ms) when the current violation started. */
	const [violationStartTime, setViolationStartTime] = useState<number | null>(null);
	/** Timestamp (ms) when the last violation proof was successfully sent. */
	const [lastProofSentTime, setLastProofSentTime] = useState<number | null>(null);

	// --- Refs for Stable Callback Access ---
	// These refs hold the latest state values to ensure stable callback references for useEffect dependencies.
	const violationStateRef = useRef({ currentViolation, violationStartTime });
	const proofStateRef = useRef({ lastProofSentTime });
	const propsRef = useRef({ attemptId, onViolationDetected });

	// Update violation state ref when state changes.
	useEffect(() => {
		violationStateRef.current = { currentViolation, violationStartTime };
	}, [currentViolation, violationStartTime]);

	// Update proof state ref when state changes.
	useEffect(() => {
		proofStateRef.current = { lastProofSentTime };
	}, [lastProofSentTime]);

	// Update props ref when props change.
	useEffect(() => {
		propsRef.current = { attemptId, onViolationDetected };
	}, [attemptId, onViolationDetected]);

	/**
	 * Captures a frame from the video, prepares the violation event data,
	 * sends it to the backend API via `studentService.submitWebcamMonitorEvent`,
	 * and triggers the `onViolationDetected` callback. Respects the cooldown period.
	 * @param reason The internal reason for the violation.
	 * @param startTime The timestamp when the violation started.
	 */
	const captureAndSendProof = useCallback(async (reason: ViolationReason, startTime: number) => {
		// Access current values from refs for stability within useCallback.
		const { lastProofSentTime: currentLastProofTime } = proofStateRef.current;
		const { attemptId: currentAttemptId, onViolationDetected: currentOnViolationDetected } = propsRef.current;

		if (!videoRef.current || !currentAttemptId) {
			console.error("Missing video reference or attemptId for sending proof.");
			return;
		}

		const now = Date.now();
		// Enforce cooldown period between submissions.
		if (currentLastProofTime && (now - currentLastProofTime < COOLDOWN_PERIOD_MS)) {
			console.log(`Cooldown active (${((COOLDOWN_PERIOD_MS - (now - currentLastProofTime)) / 1000).toFixed(1)}s remaining), skipping proof submission.`);
			return;
		}

		const eventType = mapReasonToEventType(reason);
		if (!eventType) {
			console.error("Cannot map reason to event type:", reason);
			return;
		}

		console.log(`Violation detected (${reason} -> ${eventType}), capturing proof...`);
		setStatus(`Violation: ${reason}. Capturing proof...`);

		// Capture image frame from video element.
		const canvas = document.createElement('canvas');
		canvas.width = videoRef.current.videoWidth;
		canvas.height = videoRef.current.videoHeight;
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			console.error("Failed to get canvas context for proof capture.");
			return;
		}
		ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
		const imageDataUrl = canvas.toDataURL('image/jpeg'); // Base64 encoded image

		// Prepare the event payload for the API.
		const eventData: WebcamEvent = {
			eventType: eventType,
			timestamp: new Date(now).toISOString(),
			imageData: imageDataUrl,
			details: {
				duration: now - startTime, // Duration of the violation persistence.
				confidence: 1.0 // Placeholder confidence value.
			}
		};

		setLastProofSentTime(now); // Update last sent time immediately to enforce cooldown.

		// Send the event data to the backend.
		try {
			console.log(`Sending ${eventType} event for attempt ${currentAttemptId}...`);
			const response = await studentService.submitWebcamMonitorEvent(currentAttemptId, eventData);
			console.log("Webcam monitor event submitted successfully:", response);
			setStatus(`Proof sent (${eventType}). Monitoring...`);
		} catch (error) {
			console.error("Failed to submit webcam monitor event:", error);
			setStatus(`Error sending proof: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}

		// Notify the parent component via the callback prop.
		if (currentOnViolationDetected) {
			currentOnViolationDetected(reason, imageDataUrl);
		}

	}, []); // Empty dependency array because internal logic uses stable refs.

	/**
	 * Callback function executed by MediaPipe FaceMesh for each processed frame.
	 * It analyzes the results (face count, landmarks) using detection utilities,
	 * manages the violation state (starting/stopping timers), and triggers
	 * `captureAndSendProof` if a violation persists long enough.
	 * @param results The results object from MediaPipe FaceMesh.
	 */
	const onResults = useCallback((results: FaceMeshResults) => {
		// Access current violation state from refs for stability.
		const { currentViolation: currentViol, violationStartTime: currentStartTime } = violationStateRef.current;

		const faceCount = results.multiFaceLandmarks?.length ?? 0;
		let immediateViolation: ViolationReason | null = null;

		// --- Run Detection Checks ---
		immediateViolation = checkMultiFace(faceCount, defaultDetectionConfig);
		if (!immediateViolation && faceCount === 1) {
			const landmarks = results.multiFaceLandmarks[0] as NormalizedLandmarkList;
			immediateViolation = checkAttentionAndGaze(landmarks, defaultDetectionConfig);
		} else if (!immediateViolation && faceCount === 0) {
			setStatus('No face detected'); // Update status if no face is present.
		}

		// --- Manage Violation State & Timers ---
		const now = Date.now();

		if (immediateViolation) {
			// A potential violation is currently detected.
			setStatus(prev => prev.startsWith(`Potential Violation: ${immediateViolation}`) ? prev : `Potential Violation: ${immediateViolation}`);

			if (currentViol === immediateViolation) {
				// Violation persists, check if duration threshold is met.
				if (currentStartTime && (now - currentStartTime >= LOOKING_AWAY_DURATION_MS)) {
					captureAndSendProof(immediateViolation, currentStartTime);
					// Reset timer start after capture to prevent immediate re-capture.
					setViolationStartTime(now);
				}
			} else {
				// A new type of violation is detected, start the timer.
				console.log(`New immediate violation detected: ${immediateViolation}. Starting timer.`);
				setCurrentViolation(immediateViolation);
				setViolationStartTime(now);
			}
		} else {
			// No violation is currently detected.
			if (currentViol) {
				console.log(`Violation (${currentViol}) ended.`); // Log when a tracked violation stops.
			}
			// Update status based on face count.
			setStatus(prev => {
				const newStatus = faceCount === 1 ? 'Attention OK' : (faceCount === 0 ? 'No face detected' : `Multiple faces: ${faceCount}`);
				return prev === newStatus ? prev : newStatus; // Avoid redundant state updates.
			});
			// Reset violation tracking state.
			setCurrentViolation(null);
			setViolationStartTime(null);
		}

	}, [captureAndSendProof]); // Depends only on the stable captureAndSendProof callback.

	/**
	 * Initializes MediaPipe FaceMesh and the camera stream when the component mounts.
	 * Sets up the `onResults` callback for processing frames.
	 * Includes a cleanup function to stop the camera and release resources on unmount.
	 */
	useEffect(() => {
		console.log(">>> FaceAttentionChecker INITIALIZATION EFFECT RUNNING <<<");

		if (!videoRef.current) return;
		const videoElement = videoRef.current;

		// Initialize MediaPipe FaceMesh.
		const faceMesh = new FaceMesh({
			locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
		});
		faceMesh.setOptions({
			maxNumFaces: defaultDetectionConfig.MAX_FACES_ALLOWED + 1, // Detect slightly more to handle multi-face check.
			refineLandmarks: true, // Required for gaze estimation.
			minDetectionConfidence: 0.5,
			minTrackingConfidence: 0.5
		});
		faceMesh.onResults(onResults); // Set the stable callback.
		faceMeshRef.current = faceMesh;

		// Initialize the camera stream.
		const camera = new cam.Camera(videoElement, {
			onFrame: async () => {
				// Send the video frame to FaceMesh for processing if ready.
				if (videoElement && videoElement.readyState >= 3 && faceMeshRef.current) {
					try {
						await faceMeshRef.current.send({ image: videoElement });
					} catch (error) {
						console.error("Error sending frame to MediaPipe:", error);
					}
				}
			},
		});
		camera.start()
			.then(() => {
				setStatus('Camera started. Monitoring...');
				// Potential place for initial face verification logic if needed in the future.
			})
			.catch(err => {
				console.error("Failed to start camera:", err);
				setStatus(`Error starting camera: ${err.message}. Please grant permission.`);
			});
		cameraRef.current = camera;

		// Cleanup function runs on component unmount.
		return () => {
			console.log(">>> FaceAttentionChecker CLEANUP EFFECT RUNNING <<<");
			cameraRef.current?.stop();
			faceMeshRef.current?.close();
			faceMeshRef.current = null;
			cameraRef.current = null;
		};
	}, [onResults]); // Dependency on the stable onResults callback reference.

	return (
		<div>
			<p>Status: {status}</p>
			{/* Video element for displaying camera feed and providing input to MediaPipe */}
			<video
				ref={videoRef}
				autoPlay
				playsInline
				style={{
					display: 'block',
					width: '100%',    // Responsive width.
					height: 'auto',   // Maintain aspect ratio.
					transform: 'scaleX(-1)' // Mirrors the video horizontally, often preferred for user-facing cameras.
				}}
			></video>
		</div>
	);
};

export default FaceAttentionChecker;