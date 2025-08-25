import React, { useState, useRef } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/Card';
import { Input } from './ui/Input';
import { ClassRecord } from '../types';
import { useCamera } from '../hooks/useCamera';

interface ReferenceManagerProps {
    selectedClass: ClassRecord;
    onAddReference: (classId: string, referenceName: string, imageBase64: string) => void;
    onDeleteReference: (classId: string, referenceId: string) => void;
}

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
);

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.966-.784-1.75-1.75-1.75h-1.5c-.966 0-1.75.784-1.75 1.75v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
    </svg>
);

const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M10 8a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />
        <path fillRule="evenodd" d="M3 5.75A2.75 2.75 0 015.75 3h8.5A2.75 2.75 0 0117 5.75v8.5A2.75 2.75 0 0114.25 17h-8.5A2.75 2.75 0 013 14.25v-8.5zM5.75 4.5a1.25 1.25 0 00-1.25 1.25v8.5c0 .69.56 1.25 1.25 1.25h8.5c.69 0 1.25-.56 1.25-1.25v-8.5c0-.69-.56-1.25-1.25-1.25h-8.5z" clipRule="evenodd" />
    </svg>
);

const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M9.25 13.25a.75.75 0 001.5 0V4.636l2.955 3.129a.75.75 0 001.09-1.03l-4.25-4.5a.75.75 0 00-1.09 0l-4.25 4.5a.75.75 0 101.09 1.03L9.25 4.636v8.614z" />
        <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
    </svg>
);


const ReferenceManager: React.FC<ReferenceManagerProps> = ({ selectedClass, onAddReference, onDeleteReference }) => {
    const [newName, setNewName] = useState('');
    const [newImage, setNewImage] = useState<string | null>(null);
    const [isCameraActive, setCameraActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { videoRef, canvasRef, isCameraReady, captureFrame, startCamera, stopCamera, handleCanPlay } = useCamera();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleCloseCamera();
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setNewImage(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };
    
    const handleAddReference = () => {
        if (newName.trim() && newImage) {
            onAddReference(selectedClass.id, newName, newImage);
            setNewName('');
            setNewImage(null);
            if(fileInputRef.current) fileInputRef.current.value = '';
        } else {
            alert('Please provide a name and an image.');
        }
    };

    const handleOpenCamera = () => {
        setNewImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        startCamera();
        setCameraActive(true);
    };

    const handleCloseCamera = () => {
        stopCamera();
        setCameraActive(false);
    };

    const handleCapture = () => {
        const image = captureFrame();
        if (image) {
            setNewImage(image);
        }
        handleCloseCamera();
    };

    const renderAddNewBox = () => {
        if (isCameraActive) {
            return (
                <div className="relative flex flex-col justify-center items-center w-full aspect-square rounded-md border-2 border-dashed border-primary bg-secondary overflow-hidden">
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        onCanPlay={handleCanPlay}
                        className="w-full h-full object-cover" 
                    />
                     {!isCameraReady && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-black bg-opacity-50">
                            <p>Starting camera...</p>
                        </div>
                    )}
                    <div className="absolute bottom-2 inset-x-0 flex justify-center gap-2">
                         <Button onClick={handleCapture} disabled={!isCameraReady} size="sm">Capture</Button>
                         <Button onClick={handleCloseCamera} variant="secondary" size="sm">Cancel</Button>
                    </div>
                </div>
            );
        }

        if (newImage) {
            return (
                 <div className="relative group flex flex-col justify-center items-center w-full aspect-square rounded-md border-2 border-dashed border-border">
                    <img src={newImage} alt="New Reference Preview" className="object-contain h-full w-full rounded-md p-1" />
                     <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="destructive" size="icon" className="h-6 w-6 rounded-full" 
                            onClick={() => {
                                setNewImage(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            aria-label="Clear image"
                        >
                            <TrashIcon className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-col justify-center items-center w-full aspect-square rounded-md border-2 border-dashed border-border">
                <div className="text-center text-muted-foreground p-2 space-y-4">
                    <p className="text-sm font-semibold">Add New Reference</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                           <UploadIcon className="h-4 w-4 mr-2"/> Upload
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleOpenCamera}>
                           <CameraIcon className="h-4 w-4 mr-2"/> Camera
                        </Button>
                    </div>
                </div>
                 <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage References</CardTitle>
                <CardDescription>Add or remove people for the <span className="font-semibold text-primary">{selectedClass.name}</span> class.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedClass.references.map(ref => (
                        <div key={ref.id} className="relative group aspect-square">
                           <img src={ref.imageBase64} alt={ref.name} className="object-cover w-full h-full rounded-md" />
                           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity rounded-md p-2">
                                <p className="text-white text-sm font-semibold text-center break-all">{ref.name}</p>
                                <Button variant="destructive" size="sm" className="mt-2" onClick={() => onDeleteReference(selectedClass.id, ref.id)}>
                                    <TrashIcon className="h-4 w-4 mr-1" /> Delete
                                </Button>
                           </div>
                        </div>
                    ))}
                    {renderAddNewBox()}
                </div>
            </CardContent>
             <CardFooter className="flex flex-col sm:flex-row gap-2 mt-6 pt-6 border-t">
                <Input
                    placeholder="New Reference Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1"
                />
                <Button onClick={handleAddReference} disabled={!newName.trim() || !newImage} className="w-full sm:w-auto">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Reference
                </Button>
            </CardFooter>
            <canvas ref={canvasRef} className="hidden"></canvas>
        </Card>
    );
};

export default ReferenceManager;