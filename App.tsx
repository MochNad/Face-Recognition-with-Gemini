import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/Button';
import ClassManager from './components/ClassManager';
import SessionManager from './components/SessionManager';
import ReferenceManager from './components/ReferenceManager';
import CameraCapture from './components/CameraCapture';
import AttendanceView from './components/AttendanceView';
import ApiKeyManager from './components/ApiKeyManager';
import type { ClassRecord, Reference, SessionRecord, ApiKey, AttendanceEntry } from './types';
import { ComparisonStatus } from './types';
import { exportToExcel } from './lib/utils';

const BackIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
    </svg>
);


function App() {
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([{ id: `key_${Date.now()}`, value: '' }]);
  
  const [comparisonStatus, setComparisonStatus] = useState<ComparisonStatus>(ComparisonStatus.Idle);
  const [comparisonMessage, setComparisonMessage] = useState<string>('');

  useEffect(() => {
    try {
      const savedClasses = localStorage.getItem('facial-rec-classes');
      if (savedClasses) {
        setClasses(JSON.parse(savedClasses));
      }
    } catch (error) {
      console.error("Failed to load classes from localStorage:", error);
      setClasses([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('facial-rec-classes', JSON.stringify(classes));
    } catch (error) {
      console.error("Failed to save classes to localStorage:", error);
    }
  }, [classes]);

  const handleAddApiKey = () => {
    setApiKeys(prev => [...prev, { id: `key_${Date.now()}`, value: '' }]);
  };

  const handleRemoveApiKey = (idToRemove: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== idToRemove));
  };

  const handleApiKeyChange = (id: string, value: string) => {
    setApiKeys(prev => prev.map(key => key.id === id ? { ...key, value } : key));
  };


  const handleAddClass = (name: string) => {
    if (name.trim() === '') return;
    const newClass: ClassRecord = {
      id: `class_${Date.now()}`,
      name,
      references: [],
      sessions: [],
    };
    setClasses(prev => [...prev, newClass]);
  };

  const handleDeleteClass = (classId: string) => {
    setClasses(prev => prev.filter(c => c.id !== classId));
    if (selectedClassId === classId) {
      setSelectedClassId(null);
      setSelectedSessionId(null);
    }
  };

  const handleSelectClass = (classId: string) => {
    setComparisonStatus(ComparisonStatus.Idle);
    setComparisonMessage('');
    setSelectedClassId(classId);
    setSelectedSessionId(null);
  };
  
  const handleSelectSession = (sessionId: string) => {
    setComparisonStatus(ComparisonStatus.Idle);
    setComparisonMessage('');
    setSelectedSessionId(sessionId);
  }

  const handleStartNewSession = (classId: string) => {
    const newSession: SessionRecord = {
      id: `session_${Date.now()}`,
      name: `Session - ${new Date().toLocaleString()}`,
      date: Date.now(),
      attendance: [],
    };
    setClasses(prev => prev.map(c => 
      c.id === classId
        ? { ...c, sessions: [newSession, ...c.sessions] }
        : c
    ));
    setSelectedSessionId(newSession.id);
  }

  const handleDeleteSession = (classId: string, sessionId: string) => {
    setClasses(prev => prev.map(c => 
        c.id === classId
        ? { ...c, sessions: c.sessions.filter(s => s.id !== sessionId) }
        : c
    ));
    if (selectedSessionId === sessionId) {
        setSelectedSessionId(null);
    }
  }

  const handleAddReference = (classId: string, referenceName: string, imageBase64: string) => {
    const newReference: Reference = {
      id: `ref_${Date.now()}`,
      name: referenceName,
      imageBase64,
    };
    setClasses(prev => prev.map(c => 
      c.id === classId 
        ? { ...c, references: [...c.references, newReference] }
        : c
    ));
  };
  
  const handleDeleteReference = (classId: string, referenceId: string) => {
    setClasses(prev => prev.map(c => 
      c.id === classId
        ? { 
            ...c, 
            references: c.references.filter(r => r.id !== referenceId),
            // Also remove attendance entries for this reference from all sessions
            sessions: c.sessions.map(s => ({
                ...s,
                attendance: s.attendance.filter(a => a.referenceId !== referenceId)
            }))
          }
        : c
    ));
  };

  const handleStatusChange = (status: ComparisonStatus, message: string = '') => {
    setComparisonStatus(status);
    setComparisonMessage(message);
  }

  const handleMatchFound = (matchedReferences: Reference[]) => {
    if (!selectedClassId || !selectedSessionId) return;

    const classToUpdate = classes.find(c => c.id === selectedClassId);
    const sessionToUpdate = classToUpdate?.sessions.find(s => s.id === selectedSessionId);
    if (!sessionToUpdate) return;
    
    const currentAttendanceIds = new Set(sessionToUpdate.attendance.map(a => a.referenceId));
    const newEntries: AttendanceEntry[] = [];
    const namesOfNewlyMatched: string[] = [];
    const namesOfAlreadyPresent: string[] = [];

    matchedReferences.forEach(ref => {
        if (currentAttendanceIds.has(ref.id)) {
            namesOfAlreadyPresent.push(ref.name);
        } else {
            namesOfNewlyMatched.push(ref.name);
            newEntries.push({
                referenceId: ref.id,
                timestamp: Date.now(),
            });
        }
    });

    if (newEntries.length > 0) {
        setClasses(prevClasses => prevClasses.map(c => {
            if (c.id !== selectedClassId) return c;
            return {
                ...c,
                sessions: c.sessions.map(s => {
                    if (s.id !== selectedSessionId) return s;
                    return {
                        ...s,
                        attendance: [...s.attendance, ...newEntries]
                    };
                })
            };
        }));
    }

    let messageParts: string[] = [];
    if (namesOfNewlyMatched.length > 0) {
        messageParts.push(`Marked ${namesOfNewlyMatched.join(', ')} as present.`);
    }
    if (namesOfAlreadyPresent.length > 0) {
        messageParts.push(`${namesOfAlreadyPresent.join(', ')} already present.`);
    }
    
    if (messageParts.length > 0) {
        handleStatusChange(ComparisonStatus.Match, messageParts.join(' '));
    } else {
         handleStatusChange(ComparisonStatus.NoMatch, 'No new attendance to mark.');
    }
  }
  
  const handleExportSession = (classId: string, sessionId: string) => {
      const classToExport = classes.find(c => c.id === classId);
      const sessionToExport = classToExport?.sessions.find(s => s.id === sessionId);
      if (classToExport && sessionToExport) {
          exportToExcel(classToExport.name, sessionToExport, classToExport.references);
      } else {
          alert('Error: Could not find class or session to export.');
      }
  };


  const selectedClass = classes.find(c => c.id === selectedClassId);
  const selectedSession = selectedClass?.sessions.find(s => s.id === selectedSessionId);

  const renderContent = () => {
    if (selectedClass && selectedSession) {
      return (
        <div>
          <Button variant="outline" onClick={() => { setSelectedSessionId(null); }} className="mb-6">
            <BackIcon className="w-5 h-5 mr-2" />
            Back to Class Details for {selectedClass.name}
          </Button>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
                <AttendanceView 
                    references={selectedClass.references}
                    session={selectedSession}
                />
            </div>
            <div className="lg:col-span-1">
               <CameraCapture
                  references={selectedClass.references}
                  apiKeys={apiKeys.map(k => k.value).filter(Boolean)}
                  status={comparisonStatus}
                  statusMessage={comparisonMessage}
                  onStatusChange={handleStatusChange}
                  onMatchFound={handleMatchFound}
              />
            </div>
          </div>
        </div>
      );
    }
    
    if (selectedClass) {
        return (
            <div className="space-y-8">
                <Button variant="outline" onClick={() => setSelectedClassId(null)}>
                    <BackIcon className="w-5 h-5 mr-2" />
                    Back to All Classes
                </Button>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <SessionManager 
                        selectedClass={selectedClass}
                        onStartNewSession={() => handleStartNewSession(selectedClass.id)}
                        onSelectSession={handleSelectSession}
                        onDeleteSession={(sessionId) => handleDeleteSession(selectedClass.id, sessionId)}
                        onExportSession={(sessionId) => handleExportSession(selectedClass.id, sessionId)}
                    />
                    <ReferenceManager
                        selectedClass={selectedClass}
                        onAddReference={handleAddReference}
                        onDeleteReference={handleDeleteReference}
                    />
                </div>
            </div>
        );
    }

    return (
       <div className="space-y-8">
            <ClassManager
                classes={classes}
                onAddClass={handleAddClass}
                onDeleteClass={handleDeleteClass}
                onSelectClass={handleSelectClass}
            />
            <ApiKeyManager 
              apiKeys={apiKeys}
              onApiKeyChange={handleApiKeyChange}
              onAddApiKey={handleAddApiKey}
              onRemoveApiKey={handleRemoveApiKey}
              disabled={comparisonStatus === ComparisonStatus.Checking}
            />
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/50">
      <main className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            Facial Recognition Attendance System
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage classes, run attendance sessions, and export reports.
          </p>
        </header>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;