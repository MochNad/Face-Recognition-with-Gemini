import React from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/Card';
import { ClassRecord } from '../types';

interface SessionManagerProps {
  selectedClass: ClassRecord;
  onStartNewSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onExportSession: (sessionId: string) => void;
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

const ExportIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
        <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
    </svg>
);


const SessionManager: React.FC<SessionManagerProps> = ({ selectedClass, onStartNewSession, onSelectSession, onDeleteSession, onExportSession }) => {
    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <CardTitle>Manage Sessions</CardTitle>
                        <CardDescription>Start a new session or manage an existing one for <span className="font-semibold text-primary">{selectedClass.name}</span>.</CardDescription>
                    </div>
                </div>
            </CardHeader>
             <CardContent>
                {selectedClass.sessions.length > 0 ? (
                    <div className="space-y-4">
                        {selectedClass.sessions.map(session => (
                            <div key={session.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h3 className="font-semibold">{session.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Attended: {session.attendance.length} / {selectedClass.references.length}
                                    </p>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <Button onClick={() => onSelectSession(session.id)}>Manage Attendance</Button>
                                    <Button variant="secondary" onClick={() => onExportSession(session.id)}>
                                        <ExportIcon className="w-5 h-5 mr-2"/>
                                        Export
                                    </Button>
                                    <Button variant="destructive" size="icon" onClick={() => onDeleteSession(session.id)} aria-label={`Delete session ${session.name}`}>
                                        <TrashIcon className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
                        <p>No sessions found for this class.</p>
                        <p className="text-sm">Click "Start New Session" to begin.</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                 <Button onClick={onStartNewSession} className="w-full">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Start New Session
                </Button>
            </CardFooter>
        </Card>
    );
};

export default SessionManager;