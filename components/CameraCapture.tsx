import React, { useState, useEffect } from 'react';
import { useCamera } from '../hooks/useCamera';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/Card';
import { ComparisonStatus, Reference } from '../types';
import { findMatchInClass } from '../services/geminiService';

interface CameraCaptureProps {
  references: Reference[];
  apiKeys: string[];
  status: ComparisonStatus;
  statusMessage: string;
  onStatusChange: (status: ComparisonStatus, message?: string) => void;
  onMatchFound: (references: Reference[]) => void;
}

const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
        <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.152-.177.465-.067.87-.327 1.11-.71l.82-1.318a2.994 2.994 0 012.332-1.39zM6.75 12a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" clipRule="evenodd" />
    </svg>
);


const StatusIndicator: React.FC<{ status: ComparisonStatus; message: string }> = ({ status, message }) => {
  const baseClasses = "text-center font-medium py-2 px-4 rounded-md text-sm w-full";
  switch (status) {
    case ComparisonStatus.Checking:
      return <div className={`${baseClasses} bg-blue-100 text-blue-800`}>Checking...</div>;
    case ComparisonStatus.Match:
      return <div className={`${baseClasses} bg-green-100 text-green-800`}>{message}</div>;
    case ComparisonStatus.NoMatch:
    case ComparisonStatus.Error:
      return <div className={`${baseClasses} bg-red-100 text-red-800`}>{message}</div>;
    case ComparisonStatus.Idle:
    default:
      return <div className={`${baseClasses} bg-gray-100 text-gray-800`}>Ready to capture</div>;
  }
};


const CameraCapture: React.FC<CameraCaptureProps> = ({ references, apiKeys, status, statusMessage, onStatusChange, onMatchFound }) => {
  const { videoRef, canvasRef, error, isCameraReady, captureFrame, handleCanPlay, startCamera, stopCamera } = useCamera();
  const [lastCapture, setLastCapture] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
        stopCamera();
    }
  }, [startCamera, stopCamera]);

  const handleCaptureClick = async () => {
    if (apiKeys.length === 0) {
        onStatusChange(ComparisonStatus.Error, "Cannot compare: No API keys have been added or detected.");
        return;
    }
    const imageData = captureFrame();
    if (!imageData) return;

    setLastCapture(imageData);
    onStatusChange(ComparisonStatus.Checking);

    const result = await findMatchInClass(imageData, references, apiKeys);
    
    if (result.error) {
      onStatusChange(ComparisonStatus.Error, result.error);
    } else if (result.matches.length > 0) {
      onMatchFound(result.matches);
    } else {
      onStatusChange(ComparisonStatus.NoMatch, 'No match found in this class.');
    }
  };

  const isReferenceSet = references.length > 0;
  const canCapture = isReferenceSet && isCameraReady && status !== ComparisonStatus.Checking && apiKeys.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Camera Capture</CardTitle>
        <CardDescription>
          {apiKeys.length === 0 
            ? "Please add an API key or set environment variables to enable comparison."
            : "Capture a photo to mark attendance for this session."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-video bg-secondary rounded-md overflow-hidden flex items-center justify-center">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onCanPlay={handleCanPlay}
                className="w-full h-full object-cover"
            />
            {!isCameraReady && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-black bg-opacity-50">
                <p>Starting camera...</p>
              </div>
            )}
            {error && <p className="absolute text-center text-destructive-foreground bg-destructive p-4">{error}</p>}
        </div>
        {lastCapture && (
            <div className="mt-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Last Capture:</h4>
                <img src={lastCapture} alt="Last capture" className="rounded-md w-32 h-auto mx-auto" />
            </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button 
          onClick={handleCaptureClick} 
          disabled={!canCapture}
          className="w-full"
          aria-label={status === ComparisonStatus.Checking ? 'Processing...' : 'Capture and Compare'}
          title={apiKeys.length === 0 ? "Add an API key or set environment variables to enable" : !isReferenceSet ? "Add references to the class first" : ""}
        >
          <CameraIcon className="w-5 h-5 mr-2"/>
          {status === ComparisonStatus.Checking ? 'Processing...' : 'Capture & Compare'}
        </Button>
        <StatusIndicator status={status} message={statusMessage} />
      </CardFooter>
      <canvas ref={canvasRef} className="hidden"></canvas>
    </Card>
  );
};

export default CameraCapture;