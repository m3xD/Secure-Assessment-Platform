/* eslint-disable @typescript-eslint/no-unused-vars */
// filepath: src/components/FaceAttentionChecker/FaceAttentionChecker.tsx
import * as cam from '@mediapipe/camera_utils';
import { FaceMesh, Results as FaceMeshResults, NormalizedLandmarkList } from '@mediapipe/face_mesh';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import studentService from '../../services/studentService'; // Import student service
import { WebcamEvent } from '../../types/StudentServiceTypes'; // Import WebcamEvent type
import { checkAttentionAndGaze, checkMultiFace, ViolationReason } from './detectionUtils'; // Import detection utils
import { defaultDetectionConfig } from './faceAttentionConfig'; // Import default detection config
// Import API utilities (you'll need to create/adapt these)
// import { sendVerificationImage, sendViolationProof } from '../../services/faceApi'; // Example path

// --- Component-Level Configuration ---
const LOOKING_AWAY_DURATION_MS = 3000; // How long violation must persist
const COOLDOWN_PERIOD_MS = 10000;     // Min time between sending proofs
// Remove fixed dimensions here if not needed elsewhere, or keep for reference
// const VIDEO_WIDTH = 640;
// const VIDEO_HEIGHT = 480;

// --- Prop Interface (Example) ---
// Define any props needed, e.g., user ID, attempt ID
interface FaceAttentionCheckerProps {
	attemptId: string; // Make attemptId mandatory
	onViolationDetected?: (reason: ViolationReason, imageDataUrl: string) => void; // Callback for parent component
	// userId?: string; // Example prop
	// attemptId?: string; // Example prop
}

// Helper function to map internal reason to API event type
const mapReasonToEventType = (reason: ViolationReason): WebcamEvent['eventType'] | null => {
	switch (reason) {
		case 'head_yaw':
		case 'head_pitch':
		case 'gaze_direction':
			return "LOOKING_AWAY";
		case 'multiple_faces':
			return "MULTIPLE_FACES";
		// Add mapping for 'no_face' if you implement it as a violation
		// case 'no_face':
		//     return "FACE_NOT_DETECTED";
		default:
			console.warn("Unknown violation reason:", reason);
			return null; // Or handle as needed
	}
};

const FaceAttentionChecker: React.FC<FaceAttentionCheckerProps> = ({ attemptId, onViolationDetected }) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null); // Optional: for drawing landmarks
	const faceMeshRef = useRef<FaceMesh | null>(null);
	const cameraRef = useRef<cam.Camera | null>(null);

	// --- State ---
	const [status, setStatus] = useState<string>('Initializing...');
	const [isVerified, setIsVerified] = useState<boolean>(false); // Add verification state if needed
	const [currentViolation, setCurrentViolation] = useState<ViolationReason | null>(null);
	const [violationStartTime, setViolationStartTime] = useState<number | null>(null);
	const [lastProofSentTime, setLastProofSentTime] = useState<number | null>(null);

	// --- Refs for stable access in callbacks ---
	const violationStateRef = useRef({ currentViolation, violationStartTime });
	const proofStateRef = useRef({ lastProofSentTime });
	const propsRef = useRef({ attemptId, onViolationDetected });

	// Update refs whenever state/props change
	useEffect(() => {
		violationStateRef.current = { currentViolation, violationStartTime };
	}, [currentViolation, violationStartTime]);

	useEffect(() => {
		proofStateRef.current = { lastProofSentTime };
	}, [lastProofSentTime]);

	useEffect(() => {
		propsRef.current = { attemptId, onViolationDetected };
	}, [attemptId, onViolationDetected]);

	console.log("FaceAttentionChecker re-rendering"); // Log on every render

	// --- Capture Proof Function (Example) ---
	const captureAndSendProof = useCallback(async (reason: ViolationReason, startTime: number) => {
		// Access current values from refs
		const { lastProofSentTime: currentLastProofTime } = proofStateRef.current;
		const { attemptId: currentAttemptId, onViolationDetected: currentOnViolationDetected } = propsRef.current;

		if (!videoRef.current || !currentAttemptId) {
			console.error("Missing video reference or attemptId for sending proof.");
			return;
		}

		const now = Date.now();
		// Check cooldown using ref value
		if (currentLastProofTime && (now - currentLastProofTime < COOLDOWN_PERIOD_MS)) {
			console.log(`Cooldown active (${((COOLDOWN_PERIOD_MS - (now - currentLastProofTime)) / 1000).toFixed(1)}s remaining), skipping proof submission.`);
			return;
		}

		const eventType = mapReasonToEventType(reason);
		if (!eventType) {
			console.error("Cannot map reason to event type:", reason);
			return; // Don't send if reason is unknown
		}

		console.log(`Violation detected (${reason} -> ${eventType}), capturing proof...`);
		setStatus(`Violation: ${reason}. Capturing proof...`);

		// Capture image from video
		const canvas = document.createElement('canvas');
		canvas.width = videoRef.current.videoWidth;
		canvas.height = videoRef.current.videoHeight;
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			console.error("Failed to get canvas context for proof capture.");
			return;
		}
		ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
		const imageDataUrl = canvas.toDataURL('image/jpeg'); // Or 'image/png'

		// Prepare event data
		const eventData: WebcamEvent = {
			eventType: eventType,
			timestamp: new Date(now).toISOString(), // Use ISO string format
			imageData: imageDataUrl, // Assign captured image data
			details: {
				duration: now - startTime, // Calculate duration
				confidence: 1.0 // Default confidence to 1.0, adjust if needed
			}
		};

		setLastProofSentTime(now); // Update last sent time *before* async call

		// --- Call API Service ---
		try {
			console.log(`Sending ${eventType} event for attempt ${currentAttemptId}...`);
			const response = await studentService.submitWebcamMonitorEvent(currentAttemptId, eventData);
			console.log("Webcam monitor event submitted successfully:", response);
			setStatus(`Proof sent (${eventType}). Monitoring...`);
		} catch (error) {
			console.error("Failed to submit webcam monitor event:", error);
			setStatus(`Error sending proof: ${error instanceof Error ? error.message : 'Unknown error'}`);
			// Optionally reset lastProofSentTime if sending failed critically?
			// setLastProofSentTime(null);
		}

		// Notify parent component if callback provided
		if (currentOnViolationDetected) {
			currentOnViolationDetected(reason, imageDataUrl);
		}

	}, []); // <-- Empty dependency array

	// --- MediaPipe Results Callback ---
	const onResults = useCallback((results: FaceMeshResults) => {
		// Access current values from refs
		const { currentViolation: currentViol, violationStartTime: currentStartTime } = violationStateRef.current;

		const faceCount = results.multiFaceLandmarks?.length ?? 0;
		let immediateViolation: ViolationReason | null = null;

		// --- Run Detection Checks ---
		// 1. Check for multiple faces first
		immediateViolation = checkMultiFace(faceCount, defaultDetectionConfig);

		// 2. If no multi-face violation and exactly one face, check attention/gaze
		if (!immediateViolation && faceCount === 1) {
			const landmarks = results.multiFaceLandmarks[0] as NormalizedLandmarkList; // Type assertion
			immediateViolation = checkAttentionAndGaze(landmarks, defaultDetectionConfig);
		} else if (!immediateViolation && faceCount === 0) {
			// Handle "no face detected" - treat as a violation? Or just update status?
			// For now, we reset any ongoing violation if no face is detected
			// immediateViolation = 'no_face'; // Or handle differently
			setStatus('No face detected');
		}

		// --- Manage Violation State & Timers ---
		const now = Date.now();

		if (immediateViolation) {
			// Use state setters directly
			setStatus(prev => prev.startsWith(`Potential Violation: ${immediateViolation}`) ? prev : `Potential Violation: ${immediateViolation}`); // Avoid redundant status updates

			// Use ref values for comparison
			if (currentViol === immediateViolation) {
				// Violation persists, check duration
				if (currentStartTime && (now - currentStartTime >= LOOKING_AWAY_DURATION_MS)) {
					// Duration threshold met, capture proof (includes cooldown check)
					captureAndSendProof(immediateViolation, currentStartTime); // Pass start time
					// Keep violationStartTime set? Or reset? Resetting prevents immediate re-capture after cooldown.
					setViolationStartTime(now); // Reset timer start after capture
				}
				// else: Violation persists but duration not met yet
			} else {
				// New type of violation detected, or first detection
				console.log(`New immediate violation detected: ${immediateViolation}. Starting timer.`);
				setCurrentViolation(immediateViolation);
				setViolationStartTime(now);
			}
		} else {
			// No immediate violation detected
			// Use ref value for comparison
			if (currentViol) {
				console.log(`Violation (${currentViol}) ended.`);
			}
			setStatus(prev => { // Avoid redundant status updates
				const newStatus = faceCount === 1 ? 'Attention OK' : (faceCount === 0 ? 'No face detected' : `Multiple faces: ${faceCount}`);
				return prev === newStatus ? prev : newStatus;
			});
			setCurrentViolation(null);
			setViolationStartTime(null); // Reset timer
		}

	}, [captureAndSendProof]); // <-- captureAndSendProof is now stable

	// --- Initialization Effect ---
	useEffect(() => {
		console.log(">>> FaceAttentionChecker INITIALIZATION EFFECT RUNNING <<<"); // Log when effect runs

		if (!videoRef.current) return;

		const videoElement = videoRef.current;

		// --- Initialize MediaPipe Face Mesh ---
		const faceMesh = new FaceMesh({
			locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
		});
		faceMesh.setOptions({
			maxNumFaces: defaultDetectionConfig.MAX_FACES_ALLOWED + 1, // Detect slightly more to catch multi-face
			refineLandmarks: true, // Needed for gaze estimation
			minDetectionConfidence: 0.5,
			minTrackingConfidence: 0.5
		});
		faceMesh.onResults(onResults);
		faceMeshRef.current = faceMesh;

		// --- Initialize Camera ---
		const camera = new cam.Camera(videoElement, {
			onFrame: async () => {
				if (videoElement && videoElement.readyState >= 3 && faceMeshRef.current) { // Check facemesh ref too
					try {
						// Use the ref to access the current facemesh instance
						await faceMeshRef.current.send({ image: videoElement });
					} catch (error) {
						console.error("Error sending frame to MediaPipe:", error);
						// Handle potential errors, maybe stop camera/facemesh
					}
				}
			},
			// Remove fixed width/height here if using CSS for display size
			// width: VIDEO_WIDTH,
			// height: VIDEO_HEIGHT
		});
		camera.start()
			.then(() => {
				setStatus('Camera started. Monitoring...');
				// TODO: Add initial verification step here if needed
				// e.g., capture one image and call sendVerificationImage()
				// setIsVerified(true); // Set to true after successful verification
			})
			.catch(err => {
				console.error("Failed to start camera:", err);
				setStatus(`Error starting camera: ${err.message}. Please grant permission.`);
			});
		cameraRef.current = camera;

		// --- Cleanup function ---
		return () => {
			console.log(">>> FaceAttentionChecker CLEANUP EFFECT RUNNING <<<"); // Log on cleanup
			cameraRef.current?.stop();
			faceMeshRef.current?.close();
			faceMeshRef.current = null;
			cameraRef.current = null;
		};
	}, [onResults]); // onResults is a dependency now due to useCallback

	return (
		<div>
			<p>Status: {status}</p>
			{/* Remove width/height attributes, use CSS for responsive sizing */}
			<video
				ref={videoRef}
				autoPlay
				playsInline
				style={{
					display: 'block', // Keep display block
					width: '100%',    // Make width responsive
					height: 'auto',   // Adjust height automatically to maintain aspect ratio
					transform: 'scaleX(-1)' // Keep this line ONLY if you WANT the mirrored view
				}}
			></video>
		</div>
	);
};

export default FaceAttentionChecker;