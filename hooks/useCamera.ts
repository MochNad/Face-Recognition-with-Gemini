

import { useState, useRef, useCallback } from 'react';

export const useCamera = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const startCamera = useCallback(async () => {
    if (stream) return;
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError('Camera permission denied. Please allow camera access in your browser settings.');
        } else {
          setError(`Error accessing camera: ${err.message}`);
        }
      } else {
         setError('An unknown error occurred while accessing the camera.');
      }
      setIsCameraReady(false);
    }
  }, [stream]);
  
  const stopCamera = useCallback(() => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
        setIsCameraReady(false);
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }
  }, [stream]);

  const handleCanPlay = () => {
    setIsCameraReady(true);
  }

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.paused || videoRef.current.ended) {
      console.warn("Video stream not available for capture.");
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) {
        console.error("Could not get 2D context from canvas");
        return null;
    }
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.9);
  }, []);

  return { videoRef, canvasRef, stream, error, isCameraReady, captureFrame, handleCanPlay, startCamera, stopCamera };
};