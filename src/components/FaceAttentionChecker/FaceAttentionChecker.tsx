/* eslint-disable @typescript-eslint/no-unused-vars */
// filepath: src/components/FaceAttentionChecker/FaceAttentionChecker.tsx
import * as cam from '@mediapipe/camera_utils';
import { FaceMesh, Results as FaceMeshResults, NormalizedLandmarkList } from '@mediapipe/face_mesh';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { checkAttentionAndGaze, checkMultiFace, ViolationReason } from './detectionUtils'; // Import detection utils
import { defaultDetectionConfig } from './faceAttentionConfig'; // Import default detection config
// Import API utilities (you'll need to create/adapt these)
// import { sendVerificationImage, sendViolationProof } from '../../services/faceApi'; // Example path

// --- Component-Level Configuration ---
const LOOKING_AWAY_DURATION_MS = 3000; // How long violation must persist
const COOLDOWN_PERIOD_MS = 10000;     // Min time between sending proofs
const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;

// --- Prop Interface (Example) ---
// Define any props needed, e.g., user ID, attempt ID
interface FaceAttentionCheckerProps {
	onViolationDetected?: (reason: ViolationReason, imageDataUrl: string) => void; // Callback for parent component
	// userId?: string; // Example prop
	// attemptId?: string; // Example prop
}

const FaceAttentionChecker: React.FC<FaceAttentionCheckerProps> = ({ onViolationDetected }) => {
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

	// --- Capture Proof Function (Example) ---
	const captureAndSendProof = useCallback(async (reason: ViolationReason) => {
		if (!videoRef.current) return;

		const now = Date.now();
		// Check cooldown
		if (lastProofSentTime && (now - lastProofSentTime < COOLDOWN_PERIOD_MS)) {
			console.log("Cooldown active, skipping proof submission.");
			return;
		}

		console.log(`Violation detected (${reason}), capturing proof...`);
		setStatus(`Violation: ${reason}. Capturing proof...`);

		// Capture image from video
		const canvas = document.createElement('canvas');
		canvas.width = videoRef.current.videoWidth;
		canvas.height = videoRef.current.videoHeight;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
		const imageDataUrl = canvas.toDataURL('image/jpeg'); // Or 'image/png'

		setLastProofSentTime(now); // Update last sent time *before* async call

		// TODO: Replace with actual API call
		console.log(`Simulating sending proof for ${reason}. Image size: ${imageDataUrl.length}`);
		// try {
		//     await sendViolationProof({ attemptId: 'your_attempt_id', reason, imageBase64: imageDataUrl }); // Pass necessary IDs
		//     console.log("Proof sent successfully.");
		// } catch (error) {
		//     console.error("Failed to send violation proof:", error);
		//     // Optionally reset lastProofSentTime if sending failed critically?
		// }

		// Notify parent component if callback provided
		if (onViolationDetected) {
			onViolationDetected(reason, imageDataUrl);
		}

		// Reset violation state after sending proof to avoid immediate re-triggering? Or rely on cooldown?
		// setCurrentViolation(null);
		// setViolationStartTime(null);
		// setStatus('Proof captured. Monitoring...'); // Update status

	}, [lastProofSentTime, onViolationDetected]); // Add dependencies like attemptId if needed

	// --- MediaPipe Results Callback ---
	const onResults = useCallback((results: FaceMeshResults) => {
		// Optional: Draw landmarks
		// const canvasCtx = canvasRef.current?.getContext('2d');
		// if (canvasCtx && results.multiFaceLandmarks) { ... drawConnectors, drawLandmarks ... }

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
			setStatus(`Potential Violation: ${immediateViolation}`);
			if (currentViolation === immediateViolation) {
				// Violation persists, check duration
				if (violationStartTime && (now - violationStartTime >= LOOKING_AWAY_DURATION_MS)) {
					// Duration threshold met, capture proof (includes cooldown check)
					captureAndSendProof(immediateViolation);
					// Keep violationStartTime set? Or reset? Resetting prevents immediate re-capture after cooldown.
					// setViolationStartTime(now); // Reset timer start after capture
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
			if (currentViolation) {
				console.log(`Violation (${currentViolation}) ended.`);
			}
			setStatus(faceCount === 1 ? 'Attention OK' : (faceCount === 0 ? 'No face detected' : `Multiple faces: ${faceCount}`));
			setCurrentViolation(null);
			setViolationStartTime(null); // Reset timer
		}

	}, [currentViolation, violationStartTime, captureAndSendProof]); // Dependencies for the callback

	// --- Initialization Effect ---
	useEffect(() => {
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
				if (videoElement && videoElement.readyState >= 3) { // Check if video frame is ready
					try {
						await faceMesh.send({ image: videoElement });
					} catch (error) {
						console.error("Error sending frame to MediaPipe:", error);
						// Handle potential errors, maybe stop camera/facemesh
					}
				}
			},
			width: VIDEO_WIDTH,
			height: VIDEO_HEIGHT
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
			console.log("Cleaning up FaceAttentionChecker...");
			camera.stop();
			faceMesh.close();
			faceMeshRef.current = null;
			cameraRef.current = null;
		};
	}, [onResults]); // onResults is a dependency now due to useCallback

	return (
		<div>
			<p>Status: {status}</p>
			{/* Keep video visible for debugging, hide in production? */}
			<video ref={videoRef} width={VIDEO_WIDTH} height={VIDEO_HEIGHT} autoPlay playsInline style={{ display: 'block', transform: 'scaleX(-1)' }}></video>
			{/* Optional canvas for drawing */}
			{/* <canvas ref={canvasRef} width={VIDEO_WIDTH} height={VIDEO_HEIGHT} style={{ position: 'absolute', top: 0, left: 0 }}></canvas> */}
		</div>
	);
};

export default FaceAttentionChecker;