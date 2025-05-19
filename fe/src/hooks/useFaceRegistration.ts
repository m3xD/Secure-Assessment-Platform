import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { captureImageAsBlob } from '../utils/imageUtils';
import { useAuth } from './useAuth';
import axios from 'axios';

export const useFaceRegistration = () => {
  const { authState } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Change the state type to store Blobs instead of base64 strings
  const [capturedImages, setCapturedImages] = useState<Blob[]>([]);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [progressMessage, setProgressMessage] = useState<string>('Position your face and start capturing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  
  // Initialize camera when component mounts
  useEffect(() => {
    initializeCamera();
    return () => {
      // Clean up by stopping all tracks in the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);
  
  const initializeCamera = useCallback(async () => {
    try {
      setErrorMessage(null);
      
      // Try with ideal constraints first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        // Save stream reference for cleanup
        streamRef.current = stream;
        setProgressMessage('Camera initialized. Ready to capture.');
        return;
      } catch (initialError) {
        console.warn('Failed with ideal constraints, trying simpler constraints:', initialError);
        
        // If failed with ideal constraints, try with basic constraints
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true,
            audio: false 
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          
          // Save stream reference for cleanup
          streamRef.current = stream;
          setProgressMessage('Camera initialized with basic settings. Ready to capture.');
          return;
        } catch (fallbackError) {
          throw fallbackError; // Re-throw to be caught by the outer catch
        }
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      
      // Provide more specific error messages based on the error type
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setErrorMessage('Camera access denied. Please grant camera permissions and refresh the page.');
        } else if (err.name === 'NotFoundError') {
          setErrorMessage('No camera detected. Please connect a camera and try again.');
        } else if (err.name === 'NotReadableError') {
          setErrorMessage('Camera is already in use by another application. Please close other applications using the camera and try again.');
        } else {
          setErrorMessage(`Camera error: ${err.name}. Please ensure your camera is working properly.`);
        }
      } else {
        setErrorMessage('Unable to access camera. Please ensure camera permissions are granted.');
      }
    }
  }, []);
  
  const captureImage = useCallback(async () => {
    if (!videoRef.current || capturedImages.length >= 3) return;
    
    try {
      setIsCapturing(true);
      setProgressMessage('Capturing...');
      
      // Add a slight delay for the flash effect
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Capture image from video as a Blob directly
      const imageBlob = await captureImageAsBlob(videoRef.current, 'image/jpeg', 0.8, 640, 480);
      
      // Add to captured images
      setCapturedImages(prev => [...prev, imageBlob]);
      
      // Update progress message
      const newCount = capturedImages.length + 1;
      if (newCount < 3) {
        setProgressMessage(`${newCount}/3 captured. Please continue.`);
      } else {
        setProgressMessage('All images captured. Ready to submit.');
      }
      
    } catch (err) {
      console.error('Error capturing image:', err);
      setErrorMessage('Failed to capture image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  }, [capturedImages.length]);
  
  const resetCapture = useCallback(() => {
    setCapturedImages([]);
    setProgressMessage('Images reset. Ready to capture again.');
    setErrorMessage(null);
    setIsComplete(false);
  }, []);
  
  const submitRegistration = useCallback(async () => {
    if (capturedImages.length !== 3 || !authState.user?.id) {
      setErrorMessage('Please capture all 3 images before submitting');
      return;
    }
    
    setIsRegistering(true);
    setProgressMessage('Registering your face...');
    
    try {
      // Create FormData object
      const formData = new FormData();
      
      // Add name to form data
      formData.append('name', authState.user.name);
      
      // Append images directly to formData (they're already Blobs)
      for (let i = 0; i < capturedImages.length; i++) {
        formData.append('images', capturedImages[i], `face_${i+1}.jpg`);
      }

      console.log('Submitting face registration with FormData');
      
      // Send to API with content-type multipart/form-data
      const response = await axios.post(
        'https://api-sap.m3xd.dev/ai/register', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      if (response.status === 200) {
        console.log('Face registration successful:', response);
        setIsComplete(true);
        setProgressMessage('Registration successful!');
        toast.success('Face registration completed successfully!');
      } else {
        toast.error('Face registration failed. Please try again.');
        resetCapture();
      }
      
    } catch (err) {
      console.error('Error registering face:', err);
      setErrorMessage('Face registration failed. Please try again.');
      toast.error('Face registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  }, [capturedImages, authState.user?.name, resetCapture]);
  
  return {
    videoRef,
    capturedImages,
    isCapturing,
    progressMessage,
    errorMessage,
    isRegistering,
    isComplete,
    initializeCamera,
    captureImage,
    resetCapture,
    submitRegistration
  };
};